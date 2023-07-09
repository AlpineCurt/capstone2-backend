"use strict";

const { Game, GAMES} = require("./Game.js");
const Player = require("./Player.js");
const db = require("../db.js");

afterEach(() => {
    GAMES.clear();
});

afterAll(() => {
    db.end();
});

describe("Game.get(gameId)", () => {
    test("Games.get(gameId)", () => {
        Game.get("abcde");
        expect(GAMES.get("abcde")).toBeInstanceOf(Game);
    });
});

describe("Game.exists", () => {
    test("returns true when game exists", () => {
        Game.get("abcde");
        expect(Game.exists("abcde")).toBe(true);
        expect(Game.exists("fghij")).toBe(false);
    });

    test("returns false when game does not exist", () => {
        Game.get("abdce");
        expect(Game.exists("fghij")).toBe(false);
    });
});

describe("Game.playerInGameId", () => {
    test("returns true when Player object not in Game.players", () => {
        Game.get("abcde");
        const testPlayer = new Player();
        testPlayer.name = "testPlayer";
        Game.get("abcde").players.push(testPlayer);
        expect(Game.playerInGameId("testPlayer", "abcde")).toBeInstanceOf(Player);
    });

    test("returns true when gameId is found, but player missing", () => {
        Game.get("abcde");
        console.log(GAMES.has("abcde"));
        expect(Game.playerInGameId("testPlayer", "abcde")).toBe(true);
    });

    test("returns false if gameId not found", () => {
        Game.get("abcde");
        expect(Game.playerInGameId("testPlayer", "fghij")).toBe(false);
    });
})

describe("Game.makeGameId", () => {
    test("returns five character string", () => {
        const gameId = Game.makeGameId();
        expect(gameId).toEqual(expect.any(String));
        expect(gameId.length).toBe(5);
    });
});

describe("Game.gameCheck", () => {
    test("gameCheck.full is true when room is NOT available", () => {
        // process.env.MAX_PLAYERS is 9 by default
        Game.get("abcde");
        for (let i = 0; i < 9; i++) {
            Game.get("abcde").players.push(new Player);
        }
        const gameCheck = Game.gameCheck("testPlayer", "abcde");
        expect(gameCheck.full).toBe(true);
    });

    test("gameCheck.full is false when room IS available", () => {
        // process.env.MAX_PLAYERS is 9 by default
        Game.get("abcde");
        for (let i = 0; i < 3; i++) {
            Game.get("abcde").players.push(new Player);
        }
        const gameCheck = Game.gameCheck("testPlayer", "abcde");
        expect(gameCheck.full).toBe(false);
    });
});