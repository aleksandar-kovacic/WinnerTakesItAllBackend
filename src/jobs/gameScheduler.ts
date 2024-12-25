import dotenv from 'dotenv';
dotenv.config();
import cron from 'node-cron';
import {
    getWinnerAndActiveGame,
    markActiveGameInactiveBy,
    startNewGameBy,
    GameSchema
} from './gameSchedulerQueries';

// This function calculates the start date of the game. Based on the current date, it calculates the last scheduled day of the game.
export const getStartDateOfGame = (date: Date) => {
    const dayOfWeek = parseInt(String(process.env.GAME_START_DAY));
    const hourOfDay = parseInt(String(process.env.GAME_START_HOUR));
    const lastScheduledDay = new Date(date);
    lastScheduledDay.setDate(date.getDate() - (date.getDay() + 7 - dayOfWeek) % 7);
    lastScheduledDay.setHours(hourOfDay, 0, 0, 0);
    return lastScheduledDay.getTime();
};

// This function calculates the end date of the game. Based on the current date, it calculates the next scheduled day of the game.
export const getEndDateOfGame = (date: Date) => {
    const dayOfWeek = parseInt(String(process.env.GAME_START_DAY));
    const hourOfDay = parseInt(String(process.env.GAME_START_HOUR));
    const nextScheduledDay = new Date(date);
    nextScheduledDay.setDate(date.getDate() + (dayOfWeek - date.getDay() + 7) % 7);
    nextScheduledDay.setHours(hourOfDay, 0, 0, 0);
    return nextScheduledDay.getTime();
};

export async function payoutAndStartNewGame() {
    const winnerAndActiveGame = await getWinnerAndActiveGame() as GameSchema;

    // Pay out the prize pool to the winner.
    // If there are no participants in the game,
    // there is no winner and the prize pool is not paid out. 
    if (winnerAndActiveGame.winner) {
        await payOutPrize(winnerAndActiveGame.winner, winnerAndActiveGame.activeGame.prizePool);
    }
    // Mark the current game as inactive
    await markActiveGameInactiveBy(winnerAndActiveGame.activeGame._key);

    // Create a new game
    const now = new Date();
    await startNewGameBy(getStartDateOfGame(now), getEndDateOfGame(now));
}

// TODO: Implement payOutPrize function
export async function payOutPrize(winner: string, prizePool: number): Promise<boolean> {
    // Implement the logic to pay out the prize pool to the winner
    // This could involve updating the user's balance, sending a notification, etc.
    console.log(`Paying out ${prizePool}€ to ${winner}`);
    return true;
}

// Schedule the job to run every Friday 10pm
export const cronJob = cron.schedule(`0 ${process.env.GAME_START_HOUR} * * ${process.env.GAME_START_DAY}`, payoutAndStartNewGame, {
    timezone: "Europe/Berlin"
});

cronJob.start();
