var http  = require('http')
var fs = require('fs');
var shellParser = require('node-shell-parser');
var child = require('child_process');
var kill = require('tree-kill');


function getData(callback){
  var process = child.exec('ps aux');
  var shellOutput = '';
  if(process.stdout !== undefined){
    process.stdout.on('data',function(chunk){
      shellOutput += chunk;
    });
    process.stdout.on('end', function () {
      var parsed = shellParser(shellOutput);
      callback(parsed);
    });
  } else {
    getData(callback);
  }

}
var server = http.createServer(function(req, res){
  fs.readFile('./index.html', 'utf-8', function(error, content) {
        res.writeHead(200, {"Content-Type": "text/html"});
        res.end(content);
    });
});

var io = require('socket.io').listen(server);

io.sockets.on('connection', function(socket){

  console.log('a client is connected');
    setInterval(function () {
      getData(function(data){
          socket.emit('data',data);
      })
  }, 800);

  socket.on('kill', function(pid){
    kill(pid)

  })

});



server.listen(3000);

 // top -pid 3461 -stats "pid,command,cpu" -l 1 | tail -n 1 | tr -s ' ' | cut -d' ' -f 3
