const express = require("express");
const app = express()
// const PORT = process.env.PORT || 3001;
const server = require("http").createServer(app)
const io = require("socket.io")(server, { cors: { origin: "*" }})


app.set("view engine", "ejs")
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded ({ extended: true }))
console.log("Yup worked")
const rooms = []
const users = []

app.get("/", (req, res) => {
    res.render("index", { rooms: rooms })
})

app.post("/room", (req, res) => {
  
  //room name
  const room = req.body.room

  //check if room exists
  rooms.filter(roomm=> roomm === room).length === 0?

  //if room doesn't exist insert the room in the rooms' array and redirect to the route of that room
  rooms.push(room) && res.redirect(room)

  //else redirect to the route of that room
  :res.redirect(room)

  //new room is created
  io.emit('room-created',room)
})

app.get("/:room", (req, res) => {
  
  //room name
  const room = req.params.room
  
  //check if the room exists
  rooms.filter(roomm => roomm === room).length === 0?

  // if room doesn't exist redirect to home page
  res.redirect('/')

  //else render the room data
  :res.render("room", { roomName: room })
})

server.listen(process.env.PORT || 3001, function(){
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
  });


  io.on('connection', socket => {
    socket.on('new-user', (room, name) => {

      //check if the user already exists
      users.filter(user=> user.socketId === socket.id).length === 0 ? 

      //if the user doesn't exist then insert it in the users' array and join the room
      users.push({socketId: socket.id, username: name}) && socket.join(room)
      
      //else join the room
      : socket.join(room)

      //it sends the userdata to the room when a user is connected
      socket.to(room).emit('user-connected', name)

    })
    socket.on("event", (msg) => {
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
