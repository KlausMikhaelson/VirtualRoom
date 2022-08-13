const express = require("express");
const app = express()
// const PORT = process.env.PORT || 3001;
const server = require("http").createServer(app)
const io = require("socket.io")(server, { cors: { origin: "*" }})


app.set("view engine", "ejs")
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded ({ extended: true }))
console.log("Yup worked")
const rooms = {}
const users = {}

app.get("/", (req, res) => {
    res.render("index", { rooms: rooms })
})

app.post("/room", (req, res) => {
  if(rooms[req.body.room] != null) {
    return res.redirect('/')
  }
  rooms[req.body.room] = { users: {} }
  res.redirect(req.body.room)
  // new room was created
  io.emit('room-created', req.body.room)
})

app.get("/:room", (req, res) => {
  if(rooms[req.params.room] == null) {
    return res.redirect('/')
  }
  res.render("room", { roomName: req.params.room })
})

server.listen(process.env.PORT || 3001, function(){
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
  });


  io.on('connection', socket => {
    socket.on('new-user', (room, name) => {
      socket.join(room)
      rooms[room].users[socket.id] = name
      socket.to(room).emit('user-connected', name)
    })
    socket.on("event", function(msg) {
      io.emit("event", msg)
    })
    socket.on('send-chat-message', (room, message) => {
      socket.to(room).emit('chat-message', { message: message, name: rooms[room].users[socket.id] })
    })
    socket.on('disconnect', () => {
      getUserRooms(socket).forEach(room => {
        socket.to(room).emit('user-disconnected', rooms[room].users[socket.id])
        delete rooms[room].users[socket.id]
      })
    })
  })
  
  function getUserRooms(socket) {
    return Object.entries(rooms).reduce((names, [name, room]) => {
      if (room.users[socket.id] != null) names.push(name)
      return names
    }, [])
  }
