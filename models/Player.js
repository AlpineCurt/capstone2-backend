/** Player class.   */

const Game = require("./Game");

/** Player class handles communication between an
 *  individual player and the server */

class Player {

    constructor(send, gameId) {
        
        /* function to send messages to this user.
        created by server when instantiating Player class*/
        this._send = send;

        /* Access to Game object to which this Player will belong */
        this.game = Game.get(gameId);

        this.name = null;
    }

    send(data) {
        try {
            this._send(data);
        } catch {
            // ignore if anything fails
        }
    }

    /** handle a chat message: broadchast to Game */
    handleChat(text) {
        this.game.broadcast({
            name: this.name,
            type: "chat",
            text: text
        });
    }

    /** handle joining game:  add to Game members, annouce to other players */
    handleJoin(name) {
        this.name = name;
        this.game.join(this);
        // need to broadcast to other players.
    }

    /** Connection was closed:  leave game, send message to other players */
    handleClose() {
        this.game.leave(this);
    }

    /** Prepares and returns "data" object on current state of Game
     *  This will be a generic handler for Game state updates
    */
    stateRequest() {
        let data = {
            type: "stateReq"
        };
        data.players = this.game.players.map(player => ({
            name: player.name
        }))
        return JSON.stringify(data);
    }

    /** Handle messages from client */
    handleMessage(jsonData) {
        const msg = JSON.parse(jsonData);
        if (msg.type === "chat") this.handleChat(msg.data);
        else if (msg.type === "selfjoin") this.handleJoin(msg.data);
        else if (msg.type === "selfleave") this.handleClose();
        else if (msg.type === "stateReq") this.send(this.stateRequest());
    }
}

module.exports = Player;