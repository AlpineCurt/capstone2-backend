# Super Amazing Trivia Game!  Wow!
---

## About

[Super Amazing Trivia Game](https://super-amazing-trivia-game.onrender.com/) is a live, multi-player trivia game.  Grab a friend or co-worker (or two, or three, or eight; it supports up to 9 players!) and see who knows more random trivia!

You are looking at the repository for the **Back End**.  The front end can be found at [https://github.com/AlpineCurt/capstone2-frontend](https://github.com/AlpineCurt/capstone2-frontend).

## Features
### Live Multi-player

Using websockets, a each player maintains a constant connection to the server to send and receive game data.  The amount of updates being sent and received during a game is too much for a RESTful API, and with the addition of both client and server side timers, websockets are a better tool.

### Trivia Database

Using the [Open Trivia DB](https://opentdb.com/), the game provides over 4,000 multiple-choice questions.  If users play more than one game together, a token is used to ensure they don't get the same questions again.

### Chatting

Multi-player games need a way for users to communicate, and chatting is provided in game by speech bubbles from their avatar.

### High Scores

High scores are kept using a PostgreSQL database.  When a player achieves a new high score, they're added to the database. 

## Commands

```npm run start``` - Start the server in produciton mode.  
```npm run start:debug``` - Start the server in development mode.  
```npm run test``` - Run all unit and integration tests. 

## User Flow

Please see the repository for the [front end](https://github.com/AlpineCurt/capstone2-frontend) for game flow.

## Tech Stack  

**Express** - primary web app framework.  
**express-ws** - handles websocket endpoints.  
**Axios** - handles external API calls to OpenTDB.  
**PostgreSQL** - high scores are kept in a Postgres database.  
**pg** - handles communication with the Postgres database.  
**jsonschema** - used to validate POST request data  