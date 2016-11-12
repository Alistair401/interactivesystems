var express = require('express');
var path = require('path');
var actions = [];
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

// Serve static files from the public folder
app.use(express.static('public'));

// Serve index.html when the root URL is accessed
app.get('/', function (req, res) {
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
    res.sendFile('project_select.html', {
        root: __dirname
    });
});

// Create a new sqlite3 database if none exist
var db = new sqlite3.Database('cc.sqlite3');
db.run("CREATE TABLE if not exists user (username TEXT PRIMARY KEY, password TEXT, email TEXT)");
db.run("CREATE TABLE if not exists session (id INTEGER PRIMARY KEY AUTOINCREMENT, chathistory BLOB, settings BLOB, title TEXT)");
db.run("CREATE TABLE if not exists user_session (username TEXT, session_id INTEGER)");


// Delete this row if you want to see debug messages
//io.set('log level', 1);

io.sockets.on('connection', function (socket) {

    io.to(socket.id).emit("actions", actions);



    socket.on('tool', function (data) {
        if (data.drawing) {
            actions.push(data);
        }
        socket.broadcast.emit('moving', data);
    });
    socket.on('eraser', function (data) {
        if (data.erasing) {
            actions.push(data);
        }
        socket.broadcast.emit('eraser', data);
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
        io.emit('chat-message', data);
    })
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

});


http.listen(8000, function () {
    console.log('Listening on *:8000');
});
