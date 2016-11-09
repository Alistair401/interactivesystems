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

app.get('/bootstrap-colorpicker.min.css', function(req, res){
  res.sendFile('colorpicker/dist/css/bootstrap-colorpicker.min.css', { root: __dirname });
});

app.get('/bootstrap-colorpicker.min.js', function(req, res){
  res.sendFile('colorpicker/dist/js/bootstrap-colorpicker.min.js', { root: __dirname });
});

app.get('/img/bootstrap-colorpicker/alpha.png', function(req, res){
  res.sendFile('colorpicker/dist/img/bootstrap-colorpicker/alpha.png', { root: __dirname });
});

app.get('/img/bootstrap-colorpicker/hue.png', function(req, res){
  res.sendFile('colorpicker/dist/img/bootstrap-colorpicker/hue.png', { root: __dirname });
});

app.get('/img/bootstrap-colorpicker/alpha.png', function(req, res){
  res.sendFile('colorpicker/dist/img/bootstrap-colorpicker/saturation.png', { root: __dirname });
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
	socket.on('pencil', function (data) {
		socket.broadcast.emit('moving', data);
	});
    socket.on('eraser', function (data) {
        socket.broadcast.emit('eraser', data);
    });
});

http.listen(8000, function(){
  console.log('Listening on *:8000');
});
