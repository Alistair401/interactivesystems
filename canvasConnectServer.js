var express = require('express');
var path = require('path');

var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var sqlite3 = require('sqlite3').verbose();
var session = require('express-session')({
    secret: "BernieForPres2020",
    resave: true,
    saveUninitialized: true
});
var sharedsession = require("express-socket.io-session");

app.use(session);

io.use(sharedsession(session, {
    autoSave: true
}));

// Create a new sqlite3 database if none exist
var db = new sqlite3.Database('cc.sqlite3');
db.run("CREATE TABLE if not exists user (username TEXT PRIMARY KEY, password TEXT, email TEXT)");
db.run("CREATE TABLE if not exists session (id INTEGER PRIMARY KEY AUTOINCREMENT, chathistory BLOB, settings BLOB, title TEXT, image BLOB)");
db.run("CREATE TABLE if not exists user_session (username TEXT, session_id INTEGER)");

// Store each room and its actions here to avoid constantly querying the database
var rooms = {};

// Invite keys
var keys = {};
var lastKey = 0;
// Serve static files from the public folder
app.use(express.static('public'));

app.get('/session/:slug', function (req, res) {
    if (!req.session.user){
        res.redirect('/login');
    }
    console.log("User: " + req.session.user + " Joined room: " + req.params.slug);
    req.session.room = req.params.slug;
    req.session.save();
    res.redirect('/');
});

app.get('/join/:slug', function (req, res) {
    var sess = req.session;
    var key = req.params.slug;
    if (!sess.user){
        sess.invite = key;
        sess.save();
        res.redirect('/login');
    }
    if (key in keys){
        console.log("User: " + sess.user + " Joined project: " + keys[key]);
        sess.room = keys[key];
        sess.save();
        db.get("SELECT session_id FROM user_session WHERE session_id = ? AND username = ? ",[keys[key],sess.user],function(err,row){
            if (!row){
                db.run("INSERT INTO user_session (username, session_id) VALUES ( ? , ? )", [sess.user,keys[key]]);
            }
        });
        
    }
    res.redirect('/');
});

// Serve index.html when the root URL is accessed
app.get('/', function (req, res) {
    if (!req.session.user){
         res.redirect('/login');
    }
    res.sendFile('index.html', {
        root: __dirname
    });
});

// Serve login.html when /login is accessed
app.get('/login', function (req, res) {
  
    res.sendFile('login.html', {
        root: __dirname
    });
});

// Serve project_select.html when /project is accessed
app.get('/project', function (req, res) {
    var sess = req.session;
    if (!sess.user){
         res.redirect('/login');
    }
    if (sess.invite){
        key = sess.invite
        if (key in keys){
            console.log("User: " + sess.user + " Joined project: " + keys[key]);
            sess.room = keys[key];
            sess.invite = null;
            sess.save();
            db.get("SELECT session_id FROM user_session WHERE session_id = ? AND username = ? ",[keys[key],sess.user],function(err,row){
            if (!row){
                db.run("INSERT INTO user_session (username, session_id) VALUES ( ? , ? )", [sess.user,keys[key]]);
            }
        });
        }
        res.redirect('/');
    }
    res.sendFile('project_select.html', {
        root: __dirname
    });
});




io.sockets.on('connection', function (socket) {

    
    
    socket.on('load_actions',function(){
        var room = socket.handshake.session.room;
        socket.join(room);
        db.get("SELECT id, title, image FROM session WHERE id = ? ",[room],function(err,row){
            var saveData;
            if(!(room in rooms)){
                console.log("Room created: "+ room);   
                rooms[room] = [];
            }
            saveData = {src: row.image}
            io.to(room).emit("actions", {actions: rooms[room], save: saveData});
        });
        
    });

    socket.on("get_invite_key",function(){
        var room = socket.handshake.session.room;
        keys[lastKey] = room;
        socket.emit('rec_invite_key',lastKey);
        lastKey++;
    });
    
    socket.on('tool', function (data) {
        var room = socket.handshake.session.room;
        if (room){
            if (data.drawing) {
                rooms[room].push(data);
            }
        io.to(room).emit('moving', data);
        }
    });
    socket.on('eraser', function (data) {
        var room = socket.handshake.session.room;
        if(room){
            if (data.erasing) {
                rooms[room].push(data);
            }
        }
        io.to(room).emit('eraser', data);
    });
    socket.on('register_user', function (data) {
        db.run(
            "INSERT INTO user VALUES ( ? , ? , ? )", [data.username, data.password, data.email],
            function (err, rows) {
                if (err) {
                    socket.emit('register_fail');
                } else {
                    socket.emit('register_success');
                }
            }
        );
    });

    socket.on('login', function (data) {
        db.all("SELECT username, password FROM user WHERE username='" + data.username + "'", function (err, rows) {
            if (rows.length > 0) {
                if (rows[0].password == data.password) {
                    socket.handshake.session.user = data.username;
                    socket.handshake.session.save();
                    socket.emit('login_success');
                } else {
                    socket.emit('login_failure');
                }
            }
        });

    });
    socket.on('chat-message', function (data) {
        data.user = socket.handshake.session.user;
        var room = socket.handshake.session.room;
        io.to(room).emit('chat-message', data);
    });
    socket.on('get_projects', function () {
        var sess = socket.handshake.session;
        db.all("SELECT * FROM session INNER JOIN user_session ON session.id = user_session.session_id WHERE username = '" + sess.user + "'", function (err, rows) {
            socket.emit('list_projects', rows);
        });
    });
    socket.on('add_project', function (data) {
        var sess = socket.handshake.session;
        var newID;
        var failure;
        db.run("INSERT INTO session (title) VALUES ( ? )", [data.title], function (err) {
            if (err) {
                console.log("error inserting new session");
                return;
            }
            newID = this.lastID;
            db.run("INSERT INTO user_session (username, session_id) VALUES ( ? , ? )", [sess.user, newID], function (err) {
                if (err) {
                    console.log("error inserting new many to many relationship");
                    failure = err;
                    return;
                }
                socket.emit('add_project_success');
            });
        });


    });
    socket.on('save_canvas', function(data) {
        var room = socket.handshake.session.room;
        if (room){
            if (room in rooms){
                // Save the canvas contents to the database
                var contents = data.imagedata;
                db.run("UPDATE session SET image = ? WHERE id = ?",[contents,room],function(err){
                    if (err){
                        console.log("Error saving canvas");
                    } else {
                        rooms[room] = [];
                    }
                });
                
            }
        }
    });




});


http.listen(8000, function () {
    console.log('Listening on *:8000');
});
