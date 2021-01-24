//core modules
const path = require("path");
const http = require("http"); 
// used http module to create server because we will be using socket.io
// difference between HTTP protocol and Websocket protocol is HTTP is one directional. client sends req, server sends resp.
// server doesn't send resp if there is no req from client
// in case of WebSocket protocol client and server relation is bi-directional (duplex)

//installed modules
const express = require("express");
const socketio = require("socket.io");
const Filter = require("bad-words");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const publicDirectoryPath = path.join(__dirname, "./public");

app.use(express.static(publicDirectoryPath));

//let count = 0;
let welcomeMsg = "Welcome";

//connection event is built in for socket.io
io.on("connection", (socket) => {
    console.log("New WebSocket connection");

    socket.emit("message", welcomeMsg);

    // socket emit will emit this event only for that connection (socket), on a different browser this updated value will not b available
    // socket.emit("countUpdated", count);
    // io emit will emit this event for all the connections, so on all browsers the updated count value will be reflected

    // socket broadcast emit- emits the message to all clients other than that particular client
    // so if we open it in one browser tab - other than that particular tab every other tab will get this msg
    socket.broadcast.emit("message", "A new user has joined");

    socket.on("sendMessage", (msg, callback) => {
        const filter = new Filter();

        if (filter.isProfane(msg)) {
            return callback("Profanity not allowed!");
        }
        io.emit("message", msg); 
        // sent acknowledgement msg - "delivered"
        // callback("delivered");

        callback();
    });

    socket.on("disconnect", () => {
        // we don't need to use socket.broadcast.emit because the user already disconnected, so (s)he will not receive it
        io.emit("message", "A user has left"); 
    });

    socket.on("sendLocation", (location, cb) => {
        io.emit("message", `https://google.com/maps?q=${location.latitude},${location.longitude}`); 
        cb();
    })

    // socket.on("incrementCount", () => {
    // count++;
    
    // io.emit("countUpdated", count);
    // })
})

server.listen(5007, () => console.log("app is running on port 5007"));