/** Game class that contains game logic and state.
 *  Broadcasts to players.
 */

// in-memory storage of Game instances

const GAMES = new Map();

class Game {

    constructor(gameId) {
        this.id = gameId;
        this.players = new Set();
        this.phase = "lobby";
    }

    /** Get Game object by gameId, creating if nonexistent */
    static get(gameId) {
        if (!GAMES.has(gameId)) {
            GAMES.set(gameId, new Game(gameId));
        }

        return GAMES.get(gameId);
    }

    /** player joining a game */
    join(player) {
        this.players.add(player);
    }

    /** player leaving a game */
    leave(player) {
        this.players.delete(player);
    }

    /** Send message to all players in the game */
    broadcast(data) {
        for (let player of this.players) {
            player.send(JSON.stringify(data));
        }
    }
}

module.exports = Game;