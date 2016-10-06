var https  = require('https')
var fs = require('fs');
var shellParser = require('node-shell-parser');
var child = require('child_process');
var psTree = require('ps-tree');

var kill = function (pid, signal, callback) {
    signal   = signal || 'SIGKILL';
    callback = callback || function () {};
    var killTree = true;
    if(killTree) {
        psTree(pid, function (err, children) {
            [pid].concat(
                children.map(function (p) {
                    return p.PID;
                })
            ).forEach(function (tpid) {
                try { process.kill(tpid, signal) }
                catch (ex) { }
            });
            callback();
        });
    } else {
        try { process.kill(pid, signal) }
        catch (ex) { }
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
      var parsed = shellParser(shellOutput);
      callback(parsed);
    });
  } else {
    getData(callback);
  }

}
var server = https.createServer(function(req, res){
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

  socket.on('kill', function(process){
    var exec = require('child_process').exec;
    var child = exec( 'pgrep -P ' + process.PID );
    // kill(process.PID);
    var msg = 'no I wont kill ' + process.PID;
    socket.emit('msg',msg)
    console.log('no I wont');
  })

});
server.listen(3000);
