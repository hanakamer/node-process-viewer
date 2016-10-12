var http  = require('http')
var fs = require('fs');
var child = require('child_process');
var psTree = require('ps-tree');
var Parser = require('table-parser/lib/index');
var debug = require('debug')('app');



var kill = function (pid, signal, callback) {
    signal   = signal || 'SIGKILL';
    callback = callback || function () {};
    var killTree = true;
    console.log(pid);
    if(killTree) {
        psTree(pid, function (err, children) {
            [pid].concat(
                children.map(function (p) {
                    return p.PID;
                })
            ).forEach(function (tpid) {
                try { process.kill(tpid, signal) }
                catch (ex) { console.log(ex); }
            });
            callback();
        });
    } else {
        try {
          console.log(pid, signal);
          process.kill(pid, signal)
        }
        catch (ex) { console.log(ex) }
        callback();
    }
};
function getData(callback){
  var process = child.exec('ps aux');
  var shellOutput = '';
  if(process.stdout !== undefined){
    process.stdout.on('data',function(chunk){
      shellOutput += chunk;
    });
    process.stdout.on('end', function () {
      var parsedData = Parser.parse(shellOutput);
      callback(parsedData);
    });
  } else {
    getData(callback);
  }

}

var server = http.createServer(function(req, res){
  res.writeHead(200);
  res.end("hello");
});


var io = require('socket.io').listen(server);

io.sockets.on('connection', function(socket){

  console.log('a client is connected');
    setInterval(function () {
      getData(function(data){
          socket.emit('data',data);
      })
  }, 800);

  socket.on('kill', function(process){
    var exec = require('child_process').exec;
    var child = exec( 'pgrep -P ' + process.PID );
    kill(process.PID);
    var msg = 'no I wont kill ' + process.PID;
    socket.emit('msg',msg)
    console.log('no I wont');
  })

});
server.listen(3000);
