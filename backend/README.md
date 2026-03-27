# WinnerTakesItAll Backend

## Prerequisites

- Node.js (v23.3.0)
- npm (v10.9.0)
- ArangoDB (running instance)
- Redis (running instance)

## Installation

1. **Clone the repository:**
   ```sh
   git clone https://github.com/aleksandar-kovacic/WinnerTakesItAll.git
   cd WinnerTakesItAll
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

3. **Configure environment variables:**
   - Copy the example file and fill in required values:
     ```sh
     cp .env.example .env
     ```

4. **Start the server (compiles TypeScript and runs the app):**
   ```sh
   npm start
   ```

## Database Bootstrap

To initialize the database with default collections and sample data:

1. **Build the project:**
   ```sh
   npm run build
   ```

2. **Run the bootstrap script:**
   ```sh
   node bootstrapDB.js
   ```

This sets up the `users`, `games`, and `users2games` collections, and inserts initial users and a game. Ensure your .env is configured and the target database exists in ArangoDB.

## Testing

- **Run all tests:**
  ```sh
  npm test
  ```

- **Run a specific test file:**
  ```sh
  npm test path/to/testfile.js
  ```

## Project Structure

- src — Main source code
  - `routes/` — API endpoints (users, games, payments, verification, ban)
  - `database/` — ArangoDB and Redis setup
  - `middleware/` — Authentication and session middleware
  - `jobs/` — Scheduled jobs (game scheduler)
  - `config/` — Configuration files (env, swagger)
- test_utils — Test utilities
- bootstrapDB.js — Database bootstrap script

## API Documentation

The API is documented using OpenAPI/Swagger. After starting the server, visit `/api-docs` for interactive documentation.