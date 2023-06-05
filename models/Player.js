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
        this.isHost = false;
        this.score = 0;
        this.status = "";
        this.didAnswer = false;
        this.answer = ""
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

    /** Host has clicked Begin Game */
    handleBeginGame() {
        if (this.isHost) {
            this.game.beginGame();
            // this.player.game.acceptingNewPlayers = false;
            // this.players.game.state.choosingCategories = true;
        }
    }

    handleAnswer(data) {
        this.didAnswer = true;
        this.answer = data;
        this.status = "Answered!";
        this.game.playerAnswered();
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
     *  This is if an individual Player connection needs an update.
    */
    stateRequest() {
        let data = {
            type: "stateReq"
        };
        data.players = this.game.players.map(player => ({
            name: player.name,
            isHost: player.isHost,
            score: player.score,
            status: player.status
        }));
        data.data = this.game.state;
        return JSON.stringify(data);
    }

    /** Handle messages from client */
    handleMessage(jsonData) {
        const msg = JSON.parse(jsonData);
        if (msg.type === "chat") this.handleChat(msg.data);
        else if (msg.type === "selfjoin") this.handleJoin(msg.data);
        else if (msg.type === "selfleave") this.handleClose();
        else if (msg.type === "stateReq") this.send(this.stateRequest());
        else if (msg.type === "begingame") this.handleBeginGame();
        else if (msg.type === "answer") this.handleAnswer(msg.data);
        else if (msg.type === "nextQuestion") this.game.nextQuestion();
    }
}

module.exports = Player;