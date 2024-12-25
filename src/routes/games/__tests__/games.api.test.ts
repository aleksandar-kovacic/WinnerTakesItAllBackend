import dotenv from 'dotenv';
dotenv.config();
import request from 'supertest';
import app from '../../../app';
import fs from 'fs';
import path from 'path';
import { payoutAndStartNewGame } from '../../../jobs/gameScheduler';

const date = Date.now();

describe('Create three users, let them participate in the game and return the game information', () => {
  it('Create three users, let them play, return game information', async () => {
    
    // Close the current game and start a new one
    await payoutAndStartNewGame();
    
    // Create three users and let them participate in the game
    for (let i = 1; i <= 3; i++) {
      const username = `testUser-${date}-${i}`;

      await request(app)
        .post('/users/register')
        .send({
          username,
          email: `testUser${i}@example.com`,
          password: 'Passw0rd!',
        });
      const response = await request(app)
        .post('/users/login')
        .send({
          username,
          password: 'Passw0rd!',
        });
      expect(response.status).toBe(200);
      expect(response.headers['set-cookie'][0].length).toBeGreaterThan(1);

      //Convert jpg to base64
    const idFrontImage = fs.readFileSync(path.resolve(__dirname, '../../../../test_utils/idFrontImageExample.jpg')).toString('base64');
    const personImage = fs.readFileSync(path.resolve(__dirname, '../../../../test_utils/personImageExample.jpg')).toString('base64');

      //Verify the user
      const verification = await request(app)
        .post('/verification/verify')
        .send({ idFrontImage: idFrontImage, personImage: personImage })
        .set('Cookie', response.headers['set-cookie'][0]);
      expect(verification.status).toBe(204);

      // Let the user pay so that he participates in the game 
      const payment = await request(app)
      .post('/payments/pay')
      .send({ paymentMethod: 'Paypal' })
      .set('Cookie', response.headers['set-cookie'][0]);
      expect(payment.status).toBe(200);
    }

    const gameInformation = await request(app)
        .get('/games/information');
    expect(gameInformation.status).toBe(200);
    expect(gameInformation.body.prizePool).toBe(3);
    //Check that the endDate is e.g. next Friday 10pm
    const nextScheduledDay = new Date();
    const gameStartDay = parseInt(String(process.env.GAME_START_DAY));
    const gameStartHour = parseInt(String(process.env.GAME_START_HOUR));
    nextScheduledDay.setDate(nextScheduledDay.getDate() + (gameStartDay - nextScheduledDay.getDay() + 7) % 7);
    nextScheduledDay.setHours(gameStartHour, 0, 0, 0);
    const nextScheduledTime = nextScheduledDay.getTime();
    expect(gameInformation.body.endDate).toBe(nextScheduledTime);

    // Close the current game and start a new one
    await payoutAndStartNewGame();
  });
});
