const express = require("express");
const app = express()
// const PORT = process.env.PORT || 3001;
const server = require("http").createServer(app)
const io = require("socket.io")(server, { cors: { origin: "*" }})


app.set("view engine", "ejs")
app.use(express.static(__dirname + '/public'));
console.log("Yup worked")
const users = {}


app.get("/", (req, res) => {
    res.render("index")
})

server.listen(process.env.PORT || 3001, function(){
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
  });

io.on("connection", function(socket) {
    socket.on('event', function(msg){
        io.emit('event', msg)
    })
    console.log("user conncted" + socket.id);
})

io.on('connection', socket => {
    socket.on('new-user', name => {
      users[socket.id] = name
      socket.broadcast.emit('user-connected', name)
    })
    socket.on('send-chat-message', message => {
      socket.broadcast.emit('chat-message', { message: message, name: users[socket.id] })
    })
    socket.on('disconnect', () => {
      socket.broadcast.emit('user-disconnected', users[socket.id])
      delete users[socket.id]
    })
})