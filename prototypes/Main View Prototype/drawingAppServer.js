var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');

app.get('/drawingAppClient.js', function(req, res){
  res.sendFile('drawingAppClient.js', { root: __dirname });
});

app.get('/drawingApp.css', function(req, res){
  res.sendFile('drawingApp.css', { root: __dirname });
});

app.get('/fontawesome/css/font-awesome.min.css', function(req, res){
  res.sendFile('font-awesome.min.css', { root: path.join(__dirname, 'fontawesome/css') });
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
	socket.on('mousemove', function (data) {
		socket.broadcast.emit('moving', data);
	});
});

http.listen(8000, function(){
  console.log('Listening on *:8000');
});