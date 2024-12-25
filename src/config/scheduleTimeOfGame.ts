/* This function calculates the start date of the game.
Based on the current date, it calculates the last scheduled day of the game.
E.g. if the game starts every Friday at 10pm, and today is Monday, the last scheduled day would be the previous Friday at 10pm. */
export const getStartDateOfGame = (date: Date) => {
    const dayOfWeek = parseInt(String(process.env.GAME_START_DAY));
    const hourOfDay = parseInt(String(process.env.GAME_START_HOUR));
    const lastScheduledDay = new Date(date);
    lastScheduledDay.setDate(date.getDate() - (date.getDay() + 7 - dayOfWeek) % 7);
    lastScheduledDay.setHours(hourOfDay, 0, 0, 0);
    return lastScheduledDay.getTime();
};

/* This function calculates the end date of the game.
Based on the current date, it calculates the next scheduled day of the game.
E.g. if the game starts every Friday at 10pm, and today is Monday, the next scheduled day would be the upcoming Friday at 10pm. */
export const getEndDateOfGame = (date: Date) => {
    const dayOfWeek = parseInt(String(process.env.GAME_START_DAY));
    const hourOfDay = parseInt(String(process.env.GAME_START_HOUR));
    const nextScheduledDay = new Date(date);
    nextScheduledDay.setDate(date.getDate() + (dayOfWeek - date.getDay() + 7) % 7);
    nextScheduledDay.setHours(hourOfDay, 0, 0, 0);
    return nextScheduledDay.getTime();
};
