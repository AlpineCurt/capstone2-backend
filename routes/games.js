/** Routes for games */

const express = require("express");
const Game = require("../models/Game");

const router = express.Router();

/** Request new valid gameId */
router.get("/new", (req, res, next) => {
    try {
        const gameId = Game.makeGameId();
        return res.json({gameId});
    } catch (err) {
        return next(err);
    }
});

/** Check if gameId exists, username available,
 *  and/or space in game for new player */
router.get("/:gameId", (req, res, next) => {
    const {gameId} = req.params;
    const {username} = req.query;
    try {
        const gameCheck = Game.gameCheck(username, gameId);
        return res.json({gameCheck});
    } catch (err) {
        return next(err);
    }
});

module.exports = router;