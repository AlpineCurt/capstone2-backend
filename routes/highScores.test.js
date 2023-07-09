"use strict";

const db = require("../db.js");
const request = require("supertest");
const app = require("../app.js");

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

describe("POST /scores/new", () => {
    test("works with correct body", async () => {
        const resp = await request(app)
        .post("/scores/new")
        .send({
            username: "testPlayer1",
            score: 77
        });
        expect(resp.statusCode).toBe(201);
        expect(resp.body).toEqual({
            newHighScore: {
                username: "testPlayer1",
                score: 77
            }
        })
    });

    test("returns 400 with missing input", async () => {
        const resp = await request(app)
        .post("/scores/new")
        .send({
            username: "testPlayer1",
        });
        expect(resp.statusCode).toBe(400);
    });
});

describe("GET /scores/10thhighscore", () => {
    test("works", async () => {
        const resp = await request(app).get("/scores/10thHighscore");
        expect(resp.body).toEqual({score: 10});
    });
});

describe("GET /scores/topten", () => {
    test("works", async () => {
        const resp = await request(app).get("/scores/topten");
        expect(resp.body).toEqual({
            topTen: [
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
            ]
        });
    });
});