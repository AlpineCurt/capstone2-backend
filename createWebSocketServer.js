// This is from the blog post I found.  I'm not using this and 
// instead using my app.js I've already made.

const WebSocket = require("ws");

function createWebSocketServer(server) {
    const wss = new WebSocket.Server({ server });
    wss.on("connection", function (webSocket) {
        webSocket.on("message", function (message) {
            webSocket.send(message);
        });
    });
}

module.exports = {createWebSocketServer}