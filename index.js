const express = require("express");
const app = express()
// const PORT = process.env.PORT || 3001;
const http = require("http").createServer(app)
const io = require("socket.io")(http, { cors: { origin: "*" }})


app.set("view engine", "ejs")
app.use(express.static(__dirname + '/public'));
console.log("Yup worked")

app.get("/", (req, res) => {
    res.render("index")
})

http.listen(process.env.PORT || 3001, function(){
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
  });

io.on("connection", function(socket) {
    socket.on('event', function(msg){
        io.emit('event', msg)
    })
    console.log("user conncted" + socket.id);
})
