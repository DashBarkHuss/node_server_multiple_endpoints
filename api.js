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

function butt(request, payload){
  return new Promise((resolve, reject)=>{
    if (!request || !request.headers || !payload)
    reject("error")
    console.log("23");
    resolve(`{"success": true}`)
  })

}

function respond ( response, content ) {
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
      if (API.parts[0] == 'api' && API.parts[1] == "butt")
        console.log("chunks: ", JSON.parse(Buffer.concat (request.chunks)));
        butt(request, JSON.parse( Buffer.concat ( request.chunks).toString())).then( content => respond(response, content) );;
      //butt(request, JSON.parse( Buffer.concat ( request.chunks).toString())).then(data => console.log(data));
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