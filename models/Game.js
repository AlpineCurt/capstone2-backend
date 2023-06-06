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
            roundFinished: false,
            timerLength: 20,
            timeRemaining: 10,
            reason: ""
        }
        this.questions = [];
        this.questionCount = 0;
        this.token = "";
        this.currQuesIdx = 0;
        this.newQuestion = true;
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
        const letters = "bcdfghjklmnpqrstvwxyz";
        while (true) {
            let gameId = "";
            for (let i = 0; i < 5; i++) {
                let randletter = Math.floor(Math.random() * 21);
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
        this.state.reason = "player joined";
        this.stateUpdate();
    }

    /** player leaving a game */
    leave(player) {
        if (this.acceptingNewPlayers) {
            this.players = this.players.filter((p) => p !== player);
            if (this.players.length) this.players[0].isHost = true;
        }
        this.state.reason = "player left";
        this.stateUpdate();
    }

    close() {
        // i dont' think this is ever used...
        this.players[0].isHost = true;
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
        this.state.reason = "begin game";
        this.stateUpdate();
    }

    prepareQuestion() {
        // Reset for next question
        for (let player of this.players) {
            player.didAnswer = false;
            player.status = "";
        }
        this.state.roundFinished = false;
        this.state.timeRemaining = this.state.timerLength;

        // get next question
        this.state.question = this.questions[this.currQuesIdx].question;
        this.state.answers = [...this.questions[this.currQuesIdx].incorrect_answers];
        const randIdx = Math.floor(Math.random() * 4);
        this.state.answers.splice(randIdx, 0, this.questions[this.currQuesIdx].correct_answer);
        this.state.newQuestion = true;
    }

    playerAnswered() {
        const playersAnswered = this.players.filter((player) => player.didAnswer);
        if (playersAnswered.length === this.players.length) {
            this.checkAnswers();
            this.state.roundFinished = true;
        }
        this.state.reason = "player answered";
        this.state.newQuestion = false;
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
        this.state.newQuestion = false;
        this.currQuesIdx += 1;
    }

    nextQuestion() {
        this.prepareQuestion();
        this.state.reason = "new question";
        this.stateUpdate();
        this.state.newQuestion = false;
    }

    timerUpdate(data) {
        this.state.timeRemaining = data;
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