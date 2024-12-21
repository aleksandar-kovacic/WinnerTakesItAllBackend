import { redisClient } from './dist/database/redis.js';

/* Disconnect from redis after every test, since
redis leaves open handles if not properly closed */
afterAll(async () => {
    await redisClient.disconnect();
});
