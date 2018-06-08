var express = require("express");
var path = require("path");

var app = express();
app.use(express.static(path.join(__dirname, "./static")));
app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist/'));
app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist/'));
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');

app.get('/', function(req, res) {
    res.render("index");
});

var server = app.listen(8000, function() {
    console.log("listening on port 8000");
});

var io = require('socket.io').listen(server);   
var querystring = require('querystring');

var users = {};
var messages = [];

io.sockets.on('connection', function (socket) {

    console.log("Client/socket is connected!");
    console.log("Client/socket id is: ", socket.id);

    socket.on("login", function(data) {
        users[socket.id] = data.username;
        socket.broadcast.emit('new_user', `${data.username} logged in to chat.`)
        socket.emit("messages", {message: messages});
    });

    socket.on("disconnect", function() {
        //Make sure to store username first so that deletion does not affect data sent. -- not sure this totally works. Another issue is that if the server restarts, of course, information about users is lost, so any disconnecting clients will not be found in the dictionary.
        var username = users[socket.id];
        socket.broadcast.emit('logout', `${username} left the chat.`);
        delete users[socket.id]
    });

    socket.on('message_sent', function(message) {
        messages.push(message);
        console.log("messages:", messages);
        io.emit('message_received', message);
    })
        
});