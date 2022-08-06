const express = require("express");
const app = express()
// const PORT = process.env.PORT || 3001;
const server = require("http").createServer(app)
const io = require("socket.io")(server, { cors: { origin: "*" }})


app.set("view engine", "ejs")
app.use(express.static(__dirname + '/public'));
console.log("Yup worked")

app.get("/", (req, res) => {
    res.render("index")
})

server.listen(process.env.PORT || 3001, function(){
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
  });

io.on("connection", function(socket) {
    socket.on('playEvent', function(msg){
        console.log(msg)
    })
    console.log("user conncted" + socket.id);
})
