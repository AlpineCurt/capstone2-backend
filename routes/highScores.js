/** Routes for high scores */

const jsonschema = require("jsonschema");

const express = require("express");
const { HighScore } = require("../models/HighScore");
const { BadRequestError } = require("../expressError");
const highScoreNewSchema = require("../schemas/highScoreNew.json");

const router = express.Router();

/** Request 10th highest score */
router.get("/10thhighscore", async (req, res, next) => {
    try {
        const score = await HighScore.get10thHighScore();
        return res.json({score});
    } catch (err) {
        return next(err);
    }
});

/** Get top ten high scores */
router.get("/topten", async (req, res, next) => {
    try {
        const topTen = await HighScore.topTen();
        return res.json({topTen});
    } catch (err) {
        return next(err);
    }
});

/** Add a new high score */
router.post("/new", async (req, res, next) => {
    try {
        const validator = jsonschema.validate(req.body, highScoreNewSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }
        const newHighScore = await HighScore.create(req.body);
        return res.status(201).json({newHighScore});
    } catch (err) {
        return next(err);
    }
});

module.exports = router;