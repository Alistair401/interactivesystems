var express = require('express');
var path = require('path');
var actions = [];
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static('public'));

app.get('/canvasConnectClient.js', function(req, res){
  res.sendFile('canvasConnectClient.js', { root: __dirname });
});

app.get('/Logo.svg', function(req, res){
  res.sendFile('Logo.svg', { root: __dirname });
});

app.get('/', function(req, res){
  res.sendFile('index.html', { root: __dirname });
});

// Delete this row if you want to see debug messages
//io.set('log level', 1);

io.sockets.on('connection', function (socket) {

  io.to(socket.id).emit("actions",actions);

	socket.on('pencil', function (data) {
    if(data.drawing){
      actions.push(data);  
    }
		socket.broadcast.emit('moving', data);
	});
    socket.on('eraser', function (data) {
        if(data.erasing){
          actions.push(data);
        }
        socket.broadcast.emit('eraser', data);
    });
});

http.listen(8000, function(){
  console.log('Listening on *:8000');
});
