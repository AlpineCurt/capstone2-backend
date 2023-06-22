/** Express app for Capstone 2 */

const express = require("express");
const cors = require("cors");

const { NotFoundError } = require("./expressError.js");
const Player = require("./models/Player.js")
const Game = require("./models/Game.js");

const app = express();

const wsExpress = require("express-ws")(app);

app.use(cors());
app.use(express.json());

//const { gameCheck } = require("./helperFunctions.js");


/** Request new valid gameId */

app.get("/games/new", (req, res, next) => {
    try {
        const gameId = Game.makeGameId();
        return res.json({gameId});
    } catch (err) {
        return next(err);
    }
});

/** Check if gameId exists, username available,
 *  and/or space in game for new player */

app.get("/games/:gameId", (req, res, next) => {
    const {gameId} = req.params;
    const {username} = req.query;
    try {
        const gameCheck = Game.gameCheck(username, gameId);
        return res.json({gameCheck});
    } catch (err) {
        return next(err);
    }
});

/** WebSocket connection to /games/:gameId */

app.ws("/games/:gameId", (ws, req, next) => {
    try {
        let user;

        if (req.query.username) {
            // Attempt to reconnect if user already exists
            const player = Game.playerInGameId(req.query.username, req.params.gameId);
            if (player instanceof Player) {
                user = player;
                user.send = ws.send.bind(ws);  // re-bind the new ws connection to Player send method
            } else {
                user = new Player(
                    ws.send.bind(ws), // function to send messages to this player
                    req.params.gameId
                );
            }
        } else {
            user = new Player(
                ws.send.bind(ws), // function to send messages to this player
                req.params.gameId
            );
        }

        ws.on("message", (data) => {
            try {
                user.handleMessage(data);
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