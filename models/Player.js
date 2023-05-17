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

    /** Handle messages from client */
    handleMessage(data) {
        //logic here
    }
}

module.exports = Player;