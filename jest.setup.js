import { redisClient } from './dist/database/redis.js';
import { stopPayoutAndStartNewGameJob } from './dist/jobs/gameScheduler.js';

/* Disconnect from redis and cron job after every test, since
they leave open handles in the Jest tests if not properly closed. */
afterAll(async () => {
    await redisClient.disconnect();
    await stopPayoutAndStartNewGameJob();
});
