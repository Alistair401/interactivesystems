var express = require('express');
var path = require('path');
var actions = [];
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var sqlite3 = require('sqlite3').verbose();

// Serve static files from the public folder
app.use(express.static('public'));

// Server index.html when the root URL is accessed
app.get('/', function(req, res){
  res.sendFile('index.html', { root: __dirname });
});

// Create a new sqlite3 database if none exist
var db = new sqlite3.Database('cc.sqlite3');
//TODO



// Delete this row if you want to see debug messages
//io.set('log level', 1);

io.sockets.on('connection', function (socket) {

  io.to(socket.id).emit("actions",actions);

  socket.on('tool', function (data) {
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
    socket.on('chat-message', function(data) {
        console.log(data.text);
        io.emit('chat-message',data);
    })
});

http.listen(8000, function(){
  console.log('Listening on *:8000');
});
