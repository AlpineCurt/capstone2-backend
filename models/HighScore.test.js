"use strict";

const db = require("../db.js");
const { HighScore } = require("./HighScore.js");

beforeAll(async () => {
    await db.query("DELETE FROM high_scores");

    await db.query(`INSERT INTO high_scores(username, score)
        VALUES ('BBB', 90), ('DDD', 70), ('CCC', 80), ('AAA', 100), ('III', 20),
        ('EEE', 60), ('GGG', 40), ('FFF', 50), ('HHH', 30), ('JJJ', 10)`);
})

beforeEach(async () => {
    await db.query("BEGIN");
})

afterEach(async () => {
    await db.query("ROLLBACK");
});

afterAll(() => {
    db.end();
});

describe("create", () => {
    test("works", async () => {
        const score = await HighScore.create("testPlayer1", 300);
        expect(score).toEqual({
            username: "testPlayer1",
            score: 300
        });

        const result = await db.query(`SELECT * FROM high_scores`);
        expect(result.rows[10]).toEqual(
            {
                id: expect.any(Number),
                username: "testPlayer1",
                score: 300
            }
        );
    });
});

describe("get10thHighScore", () => {
    test("works", async () => {
        const result = await HighScore.get10thHighScore();
        expect(result).toEqual(10);
    });
});

describe("topTen", () => {
    test("works", async () => {
        const result = await HighScore.topTen();
        expect(result).toEqual([
            {
                username: "AAA",
                score: 100
            },
            {
                username: "BBB",
                score: 90
            },
            {
                username: "CCC",
                score: 80
            },
            {
                username: "DDD",
                score: 70
            },
            {
                username: "EEE",
                score: 60
            },
            {
                username: "FFF",
                score: 50
            },
            {
                username: "GGG",
                score: 40
            },
            {
                username: "HHH",
                score: 30
            },
            {
                username: "III",
                score: 20
            },
            {
                username: "JJJ",
                score: 10
            }
        ]);
    });
})