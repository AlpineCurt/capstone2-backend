/** Game class that contains game logic and state.
 *  Broadcasts to players.
 */

const e = require("express");

const { TriviaApi } = require("../api.js");

// in-memory storage of Game instances
const GAMES = new Map();

const SCORE_MULTIPLIER = 5;
/* SCORE_MULTIPLIER * seconds remaining = points awarded */
const TIMEOUT_PENALTY = 20; // points
const TIMER_LENGTH = 20; // seconds
const QUESTION_COUNT = 3;
const MAX_PLAYERS = 9; // Maximum number of players per game
const PAUSE_BETWEEN_QESTIONS = 5000;

class Game {

    constructor(gameId) {
        this.id = gameId;
        this.players = [];
        this.avatarsInUse = new Set();
        this.acceptingNewPlayers = true;
        this.state = {
            phase: "lobby",
            choosingCategories: false,
            question: "",
            answers: [],
            roundStarted: false,
            roundFinished: false,
            questionBegins: false,
            timerLength: TIMER_LENGTH,
            timeRemaining: TIMER_LENGTH,
            reason: "",
            correct_answer: ""
        }
        this.questions = [];
        this.questionCount = QUESTION_COUNT;
        this.token = null;
        this.currQuesIdx = 0;
        this.newQuestion = true;
        this.inProgress = false;
        this.host = null;
        this.roundTimeRemaining = TIMER_LENGTH;
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

    /** check if username available in gameId */
    static nameAvailable(username, gameId) {
        return GAMES.get(gameId).players.has(username);
    }

    /** Check if player in gameId.
     * Returns Player object if player found.
     * Returns true if game found, but no player.
     * false otherwise
    */
    static playerInGameId(username, gameId) {
        if (GAMES.has(gameId)) {
            let game = Game.get(gameId);
            for (let player of game.players) {
                if (player.name === username) return player;
            }
            return true;
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

    static gameCheck (username, gameId) {
        let gameCheck = {
            exists: false,
            usernameAvailable: true,
            full: false
        };
    
        // Does gameId exist?
        gameCheck.exists = Game.exists(gameId);
    
        // Is this username taken?
        const playerCheck = Game.playerInGameId(username, gameId);
        if (playerCheck instanceof Object && !playerCheck.game.inProgress) {
            gameCheck.usernameAvailable = false;
        }
    
        // Is there room in the game?
        if (gameCheck.exists) {
            const game = Game.get(gameId);
            if (game.players.length === MAX_PLAYERS) {
                gameCheck.full = true;
            }
        }
    
        return gameCheck;
    }

    /** player joining a game */
    join(player) {
        // Check if name in use and assign host
        const players = new Set(
            this.players.map((player) => player.name)
        );
        if (!players.has(player.name) && this.acceptingNewPlayers) {
            this.players.push(player);
            if (this.players.length === 1) {
                player.isHost = true;
                this.host = player;
            }
        }

        // Assign avatar to player
        if (!player.avatarId) {
            while(true) {
                let avatarId = Math.floor(Math.random() * 9);
                if (!this.avatarsInUse.has(avatarId)) {
                    this.avatarsInUse.add(avatarId);
                    player.avatarId = avatarId;
                    break;
                }
            }
        }

        if (!this.inProgress) {
            this.state.reason = "player joined";
            this.stateUpdate();
        } else {
            // player is rejoining, send state update to only this player
            let altState = {...this.state};
            if (!player.didAnswer) {
                if (this.roundTimeRemaining - 5 > 0) {
                    if (this.roundTimeRemaining === 30) {
                        altState.timeRemaining = 30;
                    } else {
                        altState.timeRemaining = this.roundTimeRemaining - 5;
                    }
                } else {
                    altState.timeRemaining = 1;
                }
                
            }
            const data = {
                type: "gameStateUpdate",
                state: altState,
                players: this.players.map(player => ({
                    name: player.name,
                    isHost: player.isHost,
                    score: player.score,
                    status: player.status,
                    avatarId: player.avatarId
                }))
            }
            player.send(JSON.stringify(data));
        }
    }

    /** player leaving a game */
    leave(player) {
        if (!this.players.length) {
            GAMES.delete(player.game.id);
        } else {
            if (player.isHost){
                for (let p of this.players) {
                    if (!p.isHost) {
                        this.host = p;
                        p.isHost = true;
                        player.isHost = false;
                        break;
                    }
                }
            }
            if (this.acceptingNewPlayers) {
                this.players = this.players.filter((p) => p !== player);
                this.avatarsInUse.delete(player.avatarId);
                this.state.reason = "player left";
                this.stateUpdate();
            }
            player.active = false;
            player.status = "Disconnected";
        }
    }

    /** Host selects Begin Game in Lobby */
    async beginGame() {
        this.acceptingNewPlayers = false;
        this.state.choosingCategories = true;
        this.state.phase = "inGame";
        this.inProgress = true;
        try {
            if (!this.token) {
                this.token = await TriviaApi.getToken();
            }
            this.questions = await TriviaApi.getQuestions(this.questionCount, this.token);
            this.prepareQuestion();
        } catch (err) {
            console.log(err);
        }
        this.state.reason = "begin game";
        this.stateUpdate();
    }

    /** Host selects New Game from Results page */
    resetGame() {
        this.players = this.players.filter((p) => p.active); // remove disconnected players
        this.players.forEach((p) => {
            p.score = 0;
            p.status = "";
            p.didAnswer = false;
            p.answer = "";
        });
        this.state.phase = "lobby";
        this.acceptingNewPlayers = true;
        this.state.roundStarted = false;
        this.state.roundFinished = false;
        this.inProgress = false;
        this.questionBegins = false;
        this.timeRemaining = TIMER_LENGTH;
        this.timerLength = TIMER_LENGTH;
        this.state.question = "";
        this.state.answers = [];
        this.questions = [];
        this.roundTimeRemaining = TIMER_LENGTH;
        this.currQuesIdx = 0;

        this.stateUpdate();
    }

    prepareQuestion() {
        // Reset for next question
        for (let player of this.players) {
            player.didAnswer = false;
            if (player.active) player.status = "";
        }
        this.state.roundFinished = false;
        this.state.questionBegins = true;
        this.state.timeRemaining = this.state.timerLength;
        this.state.correct_answer = "";

        // get next question
        if (this.currQuesIdx === this.questions.length) {
            // all questions complete, move to results phase
            this.host.status = "Host";
            this.state.phase = "results";
            this.state.reason = "game ended, show results";
        } else {
            this.state.question = this.questions[this.currQuesIdx].question;
            this.state.answers = [...this.questions[this.currQuesIdx].incorrect_answers];
            const randIdx = Math.floor(Math.random() * 4);
            this.state.answers.splice(randIdx, 0, this.questions[this.currQuesIdx].correct_answer);
            this.state.newQuestion = true;
        }
    }

    /** Handler for when a player submits an answer */
    playerAnswered() {
        const playersAnswered = this.players.filter((player) => player.didAnswer);
        const activePlayers = this.players.filter((player) => player.active);
        if (playersAnswered.length >= activePlayers.length) {
            this.checkAnswers();
            this.state.roundFinished = true;
            setTimeout(() => this.nextQuestion(), PAUSE_BETWEEN_QESTIONS);

        }
        this.state.reason = "player answered";
        this.state.newQuestion = false;
        this.state.questionBegins = false;
        this.stateUpdate();
    }

    /** Checks each players' answer, awards points */
    checkAnswers() {
        for (let player of this.players) {
            if (player.answer === this.questions[this.currQuesIdx].correct_answer) {
                player.score += player.timeScore * SCORE_MULTIPLIER;
                if (player.active) player.status = "Correct!";
            } else {
                if (player.answer === "timeOut-33" || !player.active) {
                    player.score -= TIMEOUT_PENALTY;
                }
                if (player.active) player.status = "Wrong!";
            }
        }
        this.state.newQuestion = false;
        this.state.correctAnswer = this.questions[this.currQuesIdx].correct_answer;
        this.currQuesIdx += 1;
    }

    nextQuestion() {
        this.prepareQuestion();
        this.state.reason = "new question";
        this.stateUpdate();
        this.state.newQuestion = false;
    }

    timerUpdate(time) {
        this.roundTimeRemaining = time;
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
                status: player.status,
                avatarId: player.avatarId
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