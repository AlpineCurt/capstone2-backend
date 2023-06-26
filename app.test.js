const request = require("supertest");
const requestws = require("superwstest");
//import request from "superwstest";
const app = require("./app.js");
const Game = require("./models/Game.js");
const Player = require("./models/Player.js");
//const Game = require("./models/Game.js");

// beforeAll(() => {
    
// });

describe("GET /games/new", () => {

    // beforeEach((done) => {
    //     app.listen(0, "localhost", done);
    // })

    // afterEach((done) => {
    //     app.close(done);
    // })

    test("works", async () => {
        const resp = await request(app).get("/games/new");
        expect(resp.body).toEqual({
            gameId: expect.any(String)
        });
    });
});

describe("WebSocket Connection", () => {

    beforeEach((done) => {
        //app.listen(0, "localhost", done);
        app.listen(1234);
    })

    afterEach((done) => {
        app.close(done);
    })

    test("Can open websocket connection", async () => {
        await requestws(app).ws("/games/abcde");
    });
});

// describe("GET /games/:gameid", () => {
    
//     beforeEach(() => {
//         Game.get("abcde");
//         const testPlayer = Player()
//     });
// });