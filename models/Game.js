/** Game class that contains game logic and state.
 *  Broadcasts to players.
 */

const e = require("express");

// in-memory storage of Game instances
const GAMES = new Map();

class Game {

    constructor(gameId) {
        this.id = gameId;
        //this.players = new Set();
        this.players = [];
        this.phase = "lobby";
    }

    /** Get Game object by gameId, creating if nonexistent */
    static get(gameId) {
        if (!GAMES.has(gameId)) {
            GAMES.set(gameId, new Game(gameId));
        }

        return GAMES.get(gameId);
    }

    /** Check if gameId exists */
    static exists(gameId) {
        return GAMES.has(gameId);
    }

    static makeGameId() {
        const letters = "abcdefghijklmnopqrstuvwxyz";
        while (true) {
            let gameId = "";
            for (let i = 0; i < 5; i++) {
                let randletter = Math.floor(Math.random() * 26);
                gameId += letters[randletter];
            }
            if (!this.exists(gameId)) return gameId;
        }
    }

    /** player joining a game */
    join(player) {
        //this.players.add(player);
        this.players.push(player);
        this.playersUpdate();
        // this.broadcast({
        //     type: "playerUpdate",
        //     players: this.players.map(player => ({
        //         name: player.name
        //     }))
        // });
    }

    /** player leaving a game */
    leave(player) {
        //this.players.delete(player);
        this.players = this.players.filter((p) => p !== player);
        this.playersUpdate();
    }

    /** Broadcasts an updated list of current players
     * If we need to add additional player data (i.e. avatars)
     * do it here.
    */
    playersUpdate() {
        this.broadcast({
            type: "playerUpdate",
            players: this.players.map(player => ({
                name: player.name
            }))
        });
    }

    /** Send message to all players in the game */
    broadcast(data) {
        for (let player of this.players) {
            player.send(JSON.stringify(data));
        }
    }
}

module.exports = Game;