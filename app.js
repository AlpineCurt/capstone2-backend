/** Express app for Capstone 2 */

const express = require("express");
const cors = require("cors");

const { NotFoundError } = require("./expressError.js");
const Player = require("./models/Player.js")
const { Game } = require("./models/Game.js");
const gameRoutes = require("./routes/games.js");
const highScoreRoutes = require("./routes/highScores.js");

const app = express();

const wsExpress = require("express-ws")(app);

app.use(cors());
app.use(express.json());

app.use("/games", gameRoutes);
app.use("/scores", highScoreRoutes);


/** WebSocket connection to /games/:gameId */
app.ws("/games/:gameId", (ws, req, next) => {
    try {
        let user;

        if (req.query.username) {
            // Attempt to reconnect if user already exists
            user = Game.playerInGameId(req.query.username, req.params.gameId);
            if (user instanceof Player) {
                user._send = ws.send.bind(ws);  // re-bind the new ws connection to Player send method
                user.active = true;
                user.status = "";
            } else {
                user = new Player()
                user._send = ws.send.bind(ws);
                user.game = Game.get(req.params.gameId);
            }
        } else {
            user = new Player(
                ws.send.bind(ws), // function to send messages to this player
                req.params.gameId
            );
        }

        ws.on("message", (data) => {
            try {
                if (data === "hello") {
                    console.log("RECEIVED TEST MESSAGE");  // this gets logged.
                    // user.send("message") does not work. WHY?
                    ws.send("response from server!!");
                } else {
                    user.handleMessage(data);
                }
                
            } catch (err) {
                console.log(err);
            }
        });

        ws.on("close", () => {
            try {
                user.handleClose();
            } catch (err) {
                console.error(err);
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