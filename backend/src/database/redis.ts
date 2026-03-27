import * as dotenv from 'dotenv';
dotenv.config();
import { RedisStore } from "connect-redis"
import { createClient } from "redis"

export const redisClient = createClient({
    socket: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
    }
});

redisClient.connect().catch(console.error)

export const redisStore = new RedisStore({
    client: redisClient,
    prefix: "WinnerTakesItAll:",
})

//This interface allows you to declare additional properties on your session object. The default session object only has a views property.
declare module 'express-session' {
    interface SessionData {
      userKey: string;
    }
  }

// Redis helper functions: extract session ID from redis database
function extractSessionId(cookie: string): string {
    const match = cookie.match(/connect\.sid=s%3A([^\.]+)\./);
    return match ? match[1] : '';
}

// Redis helper functions: get user key from session
export async function getUserKeyFromSession(cookie: string): Promise<string> {
    const sessionId = extractSessionId(cookie);

    const redisObject = await redisClient.get(`WinnerTakesItAll:${sessionId}`);
    if (redisObject) {
        const userKey = JSON.parse(redisObject).userKey;
        return userKey;
    } else {
        throw new Error('Redis object is null');
    }
}
