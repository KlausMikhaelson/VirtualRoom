const express = require("express");
const app = express();
// const PORT = process.env.PORT || 3001;
const server = require("http").createServer(app);
const io = require("socket.io")(server, { cors: { origin: "*" } });

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(express.urlencoded({ extended: true }));
console.log("Yup worked");
const rooms = {};
const users = [];

app.get("/", (req, res) => {
  res.render("index", { rooms: rooms });
});

app.post("/room", (req, res) => {
  if (rooms[req.body.room] != null) {
    return res.redirect("/");
  }
  rooms[req.body.room] = { users: [] };
  res.redirect(req.body.room);
  // new room was created
  io.emit("room-created", req.body.room);
  console.log("Room Created", req.body.room);
});

app.get("/:room", (req, res) => {
  if (rooms[req.params.room] == null) {
    return res.redirect("/");
  }
  res.render("room", { roomName: req.params.room });
});

server.listen(process.env.PORT || 3001, function () {
  console.log(
    "Express server listening on port %d in %s mode",
    this.address().port,
    app.settings.env
  );
});

io.on('connection', socket => {
  socket.on('new-user', (room, name) => {
    socket.join(room);
    socket.to(room).emit('user-connected', name);
    users.push(name);
    
    if (!rooms[room]) {
      rooms[room] = { users: {} };
    }
    
    rooms[room].users[socket.id] = name;
  });

  socket.on("event", (msg) => {
    // Emit the event message only to the room that the user is in
    const userRooms = getUserRooms(socket);
    userRooms.forEach(room => {
      io.to(room).emit("event", msg);
    });

    console.log("Event Sent", msg);
  });

  socket.on('send-chat-message', (room, message) => {
    socket.to(room).emit('chat-message', { message: message, name: users.length > 1 ? rooms[room].users[socket.id] : users[0] });
    console.log("Message Sent", users.length > 1 ? rooms[room].users[socket.id] : users[0]);
  });

  socket.on('disconnect', () => {
    getUserRooms(socket).forEach(room => {
      socket.to(room).emit('user-disconnected', rooms[room].users[socket.id]);
      delete rooms[room].users[socket.id];
    });
  });
});

function getUserRooms(socket) {
  return Object.keys(rooms).filter((room) => {
    return Object.keys(rooms[room].users).includes(socket.id);
  });
}
