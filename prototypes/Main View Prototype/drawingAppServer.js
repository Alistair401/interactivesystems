var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var actions = [];

app.get('/drawingAppClient.js', function(req, res){
  res.sendFile('drawingAppClient.js', { root: __dirname });
});

app.get('/drawingApp.css', function(req, res){
  res.sendFile('drawingApp.css', { root: __dirname });
});

app.get('/Logo.svg', function(req, res){
  res.sendFile('Logo.svg', { root: __dirname });
});

app.get('/', function(req, res){
  res.sendFile('drawingApp.html', { root: __dirname });
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
        socket.broadcast.emit('eraser', data);
    });
});

http.listen(8000, function(){
  console.log('Listening on *:8000');
});
