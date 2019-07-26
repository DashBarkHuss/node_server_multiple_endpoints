const mysql = require('mysql');
const md5 = require('md5');

class database {
  constructor() {}
  static create(){
    let message = "Creating mysql connection...";
    this.connection = mysql.createConnection({
      host: process.env.HOST,
      user: process.env.DBUSER,
      password: process.env.PASSWORD,
      database: process.env.DATABASE
    })
    this.connection.connect();
    console.log(message + 'ok');
  }
}

function action_butt_add(request, payload){
  console.log("payload:", payload);
  return new Promise((resolve, reject)=> {
    if (!request || !request.headers || !payload)
      reject("error, missing request or payload")
    let q = `INSERT INTO butts (owner,shape) VALUES ('${payload.owner}', '${payload.shape}');`
    database.connection.query(q, (error, results)=>{
      if(error)
        throw error;
      resolve(JSON.stringify({success: true}));
    })
  });
}

function action_butt_find(request, payload){
  return new Promise((resolve, reject)=>{
    if (!request || !request.headers || !payload)
      reject("error, missing request or payload")
    let q = `select owner from butts where shape = '${payload.shape}'`
    database.connection.query(q, (error, results)=>{
      if (error)
        throw error;
      results.push({success: true});
      resolve(JSON.stringify(results));
    })
  });
}

function identify(a,b){
  return API.parts[1] === a && API.parts[2] === b;
}
function json(chunks){
  return JSON.parse( Buffer.concat (chunks).toString());
}
function respond (response, content){
  console.log("responding = ", [ content ]);
  const jsontype = "{ 'content-Type': 'application/json' }";
  response.writeHead(200, jsontype);
  console.log(content);
  response.end(content, 'utf-8');
}

class API {
  constructor(){}
  static exec(request, response){
    console.log("method: ", request.method);
    if (request.method == 'POST') {
      request.url[0] === '/'? request.url = request.url.substring(1, request.url.length) : null;
      console.log("url: ", request.url);
      request.parts = request.url.split('/');
      request.chunks = [];

      request.on('data', segment =>{
        if (segment.length > 1e6)
        response.writeHead(413, {'Content-Type': 'text/plain'}).end()
        else 
        request.chunks.push(segment);
      });
    }
    request.on('end', ()=>{
      API.parts = request.parts;

      if (identify("butt", "find")){
        console.log("chunks: ", json(request.chunks));
        action_butt_find(request, json(request.chunks))
        .then( content => respond( response, content) );
      }
      if (identify("butt", "add")){
        action_butt_add(request, json(request.chunks))
        .then( content => respond( response, content) );;
      }
    })
  }

  static catchAPIrequest(request){
    request[0] == "/" ? request = request.substring(1, request.length) : null;
    if (request.constructor === String){
      if (request.split('/')[0] == "api") {
        API.parts = request.split('/');
        console.log("API.parts ", API.parts);
        return true;
      }
      return false;
    }
  }
}

module.exports = {API, database};