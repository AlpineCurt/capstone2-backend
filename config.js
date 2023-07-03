/** Shared config settings for application.
 * Can be required many places.
 */

require("colors");
require("dotenv").config();

const SECRET_KEY = process.env.SECRET_KEY || "secret-dev";

const PORT = +process.env.PORT || 3001;

const SCORE_MULTIPLIER = process.env.SCORE_MULTIPLIER || 5;

const TIMEOUT_PENALTY = process.env.TIMEOUT_PENALTY || 20;

const TIMER_LENGTH = process.env.TIMER_LENGTH || 20; // seconds

const QUESTION_COUNT = process.env.QUESTION_COUNT || 10;

const MAX_PLAYERS = process.env.MAX_PLAYERS || 9;

const PAUSE_BETWEEN_QESTIONS = process.env.PAUSE_BETWEEN_QESTIONS || 5000; // in miliseconds

// Use dev database, testing database, or via env var, production database
function getDatabaseUri() {
    return (process.env.NODE_ENV === "test")
        ? "postgresql:///trivia_test"
        : process.env.DATABASE_URL || "postgresql:///trivia_game";
  }

console.log("Trivia Config:".green);
console.log("SECRET_KEY:".yellow, SECRET_KEY);
console.log("PORT:".yellow, PORT.toString());
console.log("Database:".yellow, getDatabaseUri());
console.log("---");

module.exports = {
    SECRET_KEY,
    PORT,
    getDatabaseUri,
    SCORE_MULTIPLIER,
    TIMEOUT_PENALTY,
    TIMER_LENGTH,
    QUESTION_COUNT,
    MAX_PLAYERS,
    PAUSE_BETWEEN_QESTIONS
}