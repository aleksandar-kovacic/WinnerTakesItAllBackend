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

## Testing

Run tests:
   ```
   npm test
   ```

To run a specific test file:
   ```
   npm test users.api.test.js
   ```
