/** Game class that contains game logic and state.
 *  Broadcasts to players.
 */

const e = require("express");

const { TriviaApi } = require("../api.js");

// in-memory storage of Game instances
const GAMES = new Map();

class Game {

    constructor(gameId) {
        this.id = gameId;
        this.players = [];
        this.acceptingNewPlayers = true;
        this.state = {
            phase: "lobby",
            choosingCategories: false,
            question: "",
            answers: [],
            roundFinished: false
        }
        this.questions = [];
        this.questionCount = 0;
        this.token = "";
        this.currQuesIdx = 0;
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

    /** Check if player in gameId.
     * Returns Player object if true,
     * false otherwise
    */
    static playerInGameId(username, gameId) {
        const game = this.get(gameId);
        for (let player of game.players) {
            if (player.name === username) return player;
        }
        return false;
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

        const players = new Set(
            this.players.map((player) => player.name)
        );
        if (!players.has(player.name) && this.acceptingNewPlayers) {
            this.players.push(player);
            if (this.players.length === 1) {
                player.isHost = true;
            }
        }
        this.stateUpdate();
    }

    /** player leaving a game */
    leave(player) {
        if (this.acceptingNewPlayers) {
            this.players = this.players.filter((p) => p !== player);
            if (this.players.length) this.players[0].isHost = true;
        }
        
        //this.playersUpdate();
        this.stateUpdate();
    }

    close() {
        this.players[0].isHost = true;
        //this.playersUpdate();
        this.stateUpdate();
    }

    /** Host selects Begin Game in Lobby */
    async beginGame() {
        this.acceptingNewPlayers = false;
        this.state.choosingCategories = true;
        this.state.phase = "inGame";
        try {
            this.token = await TriviaApi.getToken();
            this.questions = await TriviaApi.getQuestions(10, this.token);
            this.prepareQuestion();
        } catch (err) {
            console.log(err);
        }
        this.players.forEach((player) => player.status = "");
        this.stateUpdate();
    }

    prepareQuestion() {

        // Reset for next question
        for (let player of this.players) {
            player.didAnswer = false;
            player.status = "";
        }
        this.state.roundFinished = false;
        this.state.question = this.questions[this.currQuesIdx].question;
        this.state.answers = this.questions[this.currQuesIdx].incorrect_answers;
        const randIdx = Math.floor(Math.random() * 4);
        this.state.answers.splice(randIdx, 0, this.questions[this.currQuesIdx].correct_answer);
    }

    playerAnswered() {
        const playersAnswered = this.players.filter((player) => player.didAnswer);
        if (playersAnswered.length === this.players.length) {
            this.checkAnswers();
            this.state.roundFinished = true;
        }
        this.stateUpdate();
    }

    /** Checks each players' answer, awards points */
    checkAnswers() {
        for (let player of this.players) {
            if (player.answer === this.questions[this.currQuesIdx].correct_answer) {
                player.score += 100;
                player.status = "Correct!";
            } else {
                player.status = "Wrong!";
            }
        }
        this.currQuesIdx += 1;
    }

    nextQuestion() {
        this.prepareQuestion();
        this.stateUpdate();
    }

    /** Broadcasts an updated gameState to current players.
     * This will be the primary method of updating game state.
     */
    stateUpdate() {
        this.broadcast({
            type: "gameStateUpdate",
            state: this.state,
            players: this.players.map(player => ({
                name: player.name,
                isHost: player.isHost,
                score: player.score,
                status: player.status
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