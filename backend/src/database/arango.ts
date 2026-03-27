import * as dotenv from 'dotenv';
dotenv.config();

import { Database } from "arangojs";

const url = process.env.ARANGODB_URL ?? "http://127.0.0.1:8529"
const databaseName = process.env.ARANGODB_NAME ?? "WinnerTakesItAll"
const username = process.env.ARANGODB_USERNAME ?? "root"

export const db = new Database({
    url: url,
    databaseName: databaseName,
    auth: { 
        username: username,
        password: process.env.ARANGODB_PASSWORD
    }
  });
