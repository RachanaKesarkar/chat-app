var express = require("express");

var app = express();

var http = require("http");
var mongo = require("./utils/mongo");

var server = http.createServer(app);
var messages = [];
mongo.connect();

var io = require("socket.io")(server);

io.on("connection", client =>{
    console.log("New client connected...", client.id);
    client.emit("acknowledge", {data : "Connected"});

    client.on("msgToServer", (chatterName, msg) => {
        console.log(chatterName + " says : " + msg);
        client.broadcast.emit("msgToClient", chatterName , msg);
        client.emit("msgToClient", 'Me', msg);
        messages.push(chatterName + " : " + msg);
    })

    client.on("disconnect", (msg)=>{
        console.log("Client disconnected." + client.id);
        //Save data into DB
        let chat = {
            clientId: client.id,
            content: messages
        }
        mongo.create(chat);
        //res.send({ msg: "Creating..." })
        console.log("created !!!");
    })

})

app.get("/", (req, res)=>{
    res.sendFile(__dirname + '/public/socket-client.html');
})

server.listen(3000, ()=>{
    console.log("Socket server running on port 3000");
})