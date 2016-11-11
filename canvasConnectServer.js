var express = require('express');
var path = require('path');
var actions = [];
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var sqlite3 = require('sqlite3').verbose();

// Serve static files from the public folder
app.use(express.static('public'));

// Serve index.html when the root URL is accessed
app.get('/', function(req, res){
  res.sendFile('index.html', { root: __dirname });
});

// Serve login.html when /login is accessed
app.get('/login', function(req, res){
  res.sendFile('login.html', { root: __dirname });
});

// Create a new sqlite3 database if none exist
var db = new sqlite3.Database('cc.sqlite3');
db.run("CREATE TABLE if not exists user (username TEXT PRIMARY KEY, password TEXT, email TEXT)");
db.run("CREATE TABLE if not exists session (id INTEGER PRIMARY KEY, chathistory BLOB, settings BLOB)");
db.run("CREATE TABLE if not exists user_session (username TEXT, session_id INTEGER)");


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
    socket.on('register_user',function(data) {
        console.log("register received");
        db.run(
            "INSERT INTO user VALUES ( ? , ? , ? )",[data.username,data.password,data.email]
        ); 
    });
    socket.on('chat-message', function(data) {
        console.log(data.text);
        io.emit('chat-message',data);
    })
});

http.listen(8000, function(){
  console.log('Listening on *:8000');
});
