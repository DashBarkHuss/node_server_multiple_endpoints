let http = require('http');
let fs = require('fs');
let {database} = require('./api');

database.create();

const ip = '127.0.0.1';
const port = 3000;

http.createServer(function(request,response){
  let file;
  if (request.url === '/') file = 'index.html'
  else file = request.url.slice(1, request.url.length);
  fs.readFile(file, function(error, content){
    if(error){
      if (error.code='ENOENT'){
        fs.readFile('/404.html', function(error, content){
          response.writeHead(200, {'Content-Type': 'text/html'});
          response.end(content, 'utf-8')
        });
      } else {
        response.writeHead(500);
        response.end('Error: ' + error.code + '\n');
      }
    } else {
      response.writeHead(200, {'Content-Type': 'text/html'})
      response.end(content, 'utf-8');
    };
  });

}).listen(port, ip);

console.log('Running at http://' + ip + ":" + port + "/");