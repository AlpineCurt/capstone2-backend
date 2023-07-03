const db = require("../db");

class HighScore {
    /** Create HighScore, update db, return new HighScore data.
     *  data should be { username, high_score }
     *  Returns { username, high_score }
     *  Multiple score entries from the same username are allowed.
    */
   
    static async create(username, score) {
        const result = await db.query(
            `INSERT INTO high_scores
            (username, score)
            VALUES ($1, $2)
            RETURNING username, score`,
            [username, score]
        );
        const newScore = result.rows[0];

        return newScore;
    }

    /* Returns the 10th highest high_score score value
    Used by results to determine if new high score was achieved */
    static async get10thHighScore() {
        //debugger;
        const query = await db.query(
            `SELECT score FROM high_scores ORDER BY score DESC LIMIT 1 OFFSET 9`
        );
        return query.rows[0].score;
    }

    /* Get top 10 high scores */
    static async topTen() {
        const query = await db.query(
            `SELECT username, score FROM high_scores ORDER BY score DESC LIMIT 10`
        )
        return query.rows;
    }
}

module.exports = { HighScore };