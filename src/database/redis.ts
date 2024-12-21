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
