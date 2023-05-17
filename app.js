/** Express app for Capstone 2 */

const express = require("express");
const cors = require("cors");

const { NotFoundError } = require("./expressError.js");
const Player = require("./models/Player.js")

const app = express();

const wsExpress = require("express-ws")(app);

app.use(cors());
app.use(express.json());


/** WebSocket connection to /games/:gameId */

app.ws("/games/:gameId", (ws, req, next) => {
    try {
        const user = new Player(
            ws.send.bind(ws), // function to send messages to this player
            req.params.gameId
        );

        ws.on("message", (data) => {
            try {
                user.handleMessage(data);
            } catch (err) {
                console.log(err);
            }
        });
    } catch (err) {
        console.log(err);
    }
});


/** Handle 404 Errors */
app.use((req, res, next) => {
    return next(new NotFoundError());
});

/** Generic error handler; anything unhandled gets caught here. */
app.use(function (err, req, res, next) {
    if (process.env.NODE_ENV !== "test") console.error(err.stack);
    const status = err.status || 500;
    const message = err.message;

    return res.status(status).json({
        error: { message, status },
    });
});
  
module.exports = app;