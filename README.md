# WinnerTakesItAll
WinnerTakesItAll

## Description
WinnerTakesItAll

## Prerequisites
- Node.js (version v23.3.0)
- npm (version 10.9.0)
- A running instance of ArangoDB
- A running instance of Redis

## Installation
1. Clone the repository:
   ```sh
   git clone https://github.com/aleksandar-kovacic/WinnerTakesItAll.git
   cd WinnerTakesItAll

2. Install all packages and dependencies:
   ```
   npm install
   ```

3. Setup the .env file. A .env.example file is provided in the root directory. Copy it and fill in the required values:
   ```
   cp .env.example .env
   ```

4. Start the server. This also includes compilation of TypeScript to JavaScript files.
   ```
   npm start
   ```

## Bootstrap Database
Run this command to setup the initial database structure and values. This includes the collections "users" and "games" and the edge collection "users2games". "users" is filled with three initial users (bootstrapUser1, bootstrapUser2 and bootstrapUser3). "games" is filled with the first active game. "users2games" represents the participation of the three users in the game by connecting every user to the game.

Set the password of the users in the .env file. Make sure that the database you provided in the .env file exists in the ArangoDB instance.
   ```
   node node bootstrapDB.js
   ```

## Testing

Run tests:
   ```
   npm test
   ```

To run a specific test file:
   ```
   npm test users.api.test.js
   ```
