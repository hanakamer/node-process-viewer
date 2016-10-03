var http  = require('http')
var fs = require('fs');
var shellParser = require('node-shell-parser');
var child = require('child_process');
var procmon = require('process-monitor');
var check = false;
var _pid;

function getData(callback){
  var process = child.spawn('ps',['-A']);
  var shellOutput = '';
  process.stdout.on('data',function(chunk){
    shellOutput += chunk;
  });
  process.stdout.on('end', function () {
    var parsed = shellParser(shellOutput);
    callback(parsed);
  });
}
function getDetail(cb,pidd){

  this.pid = pidd;
  procmon.monitor({pid: this.pid, interval: 400}).start()
  .on('stats', function(stats) {
    cb(stats);
  });



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
  }, 4000);

  socket.on('kill', function(pid){

  })
  socket.on('detail', function(pid){
    getDetail(function(data){
      socket.emit('detail',data)
    },pid);
  })
});



server.listen(3000);

 // top -pid 3461 -stats "pid,command,cpu" -l 1 | tail -n 1 | tr -s ' ' | cut -d' ' -f 3
