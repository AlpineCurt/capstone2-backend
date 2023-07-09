"use strict";

const { Game, GAMES} = require("../models/Game.js");
const Player = require("../models/Player.js");
const db = require("../db.js");
const request = require("supertest");
const app = require("../app.js");

afterEach(() => {
    GAMES.clear();
});

afterAll(() => {
    db.end();
});

describe("GET /games/new", () => {
    test("works", async () => {
        const resp = await request(app).get("/games/new");
        expect(resp.body).toEqual({
            "gameId": expect.any(String)
        });
    });
});


describe("GET /games/:gameId", () => {
    test("works", async () => {
        Game.get("abcde");
        const testPlayer1 = new Player();
        testPlayer1.name = "testPlayer1";
        testPlayer1.game = Game.get("abcde");
        const testPlayer2 = new Player();
        testPlayer2.name = "testPlayer2";
        testPlayer2.game = Game.get("abcde");
        Game.get("abcde").players.push(testPlayer1);
        Game.get("abcde").players.push(testPlayer2);

        const resp1 = await request(app).get("/games/aaaaa?username=testPlayer1");
        expect(resp1.body).toEqual({
            gameCheck: {
                exists: false,
                usernameAvailable: true,
                full: false
            }
        });

        const resp2 = await request(app).get("/games/abcde?username=testPlayer1");
        expect(resp2.body).toEqual({
            gameCheck: {
                exists: true,
                usernameAvailable: false,
                full: false
            }
        });

        const resp3 = await request(app).get("/games/abcde?username=tesetPlayer3");
        expect(resp3.body).toEqual({
            gameCheck: {
                exists: true,
                usernameAvailable: true,
                full: false
            }
        });
    });
})