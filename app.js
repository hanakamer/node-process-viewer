var http  = require('http')
var fs = require('fs');
var shellParser = require('node-shell-parser');
var child = require('child_process');
var process = child.spawn('ps',['-aef']);
var shellOutput = '';

var server = http.createServer(function(req, res){
  fs.readFile('./index.html', 'utf-8', function(error, content) {
        res.writeHead(200, {"Content-Type": "text/html"});
        res.end(content);
    });
});

var io = require('socket.io').listen(server);


io.sockets.on('connection', function(socket){
  console.log('a client is connected');
  process.stdout.on('data',function(chunk){
    shellOutput += chunk;
  });
  process.stdout.on('end', function () {
    socket.emit('data',shellParser(shellOutput));
  });
});

server.listen(3000)
