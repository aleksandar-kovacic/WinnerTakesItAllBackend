import request from 'supertest';
import app from '../../../app';
import { getUserKeyFromSession } from '../../../database/redis';
import fs from 'fs';
import path from 'path';
import { payoutAndStartNewGame } from '../../../jobs/gameScheduler';

const date = Date.now();

describe('test verification functionality', () => {
    it('register and login user and verify user', async () => {
        // Close the current game and start a new one
        await payoutAndStartNewGame();

        // First, register the user
        await request(app)
            .post('/users/register')
            .send({
                username: `testUser-${date}`,
                email: 'testUser@example.com',
                password: 'Passw0rd!',
            });

        // Then, login with the same credentials
        const responseLogin = await request(app)
            .post('/users/login')
            .send({
                username: `testUser-${date}`,
                password: 'Passw0rd!',
            });
        expect(responseLogin.status).toBe(200);
        expect(responseLogin.headers['set-cookie'][0].length).toBeGreaterThan(1);

        // Get the user key from the session cookie
        const userKey = await getUserKeyFromSession(responseLogin.headers['set-cookie'][0]);

        // Check that the user is not verified yet.
        const verificationResponse = await request(app)
            .get('/verification/status')
            .set('Cookie', responseLogin.headers['set-cookie'][0]);
        expect(verificationResponse.status).toBe(200);
        expect(verificationResponse.body.verified).toBe(false);

        //Convert jpg to base64
        const idFrontImage = fs.readFileSync(path.resolve(__dirname, '../../../../test_utils/idFrontImageExample.jpg')).toString('base64');
        const personImage = fs.readFileSync(path.resolve(__dirname, '../../../../test_utils/personImageExample.jpg')).toString('base64');

        //Verify the user
        const verification = await request(app)
        .post('/verification/verify')
        .send({ idFrontImage: idFrontImage, personImage: personImage })
        .set('Cookie', responseLogin.headers['set-cookie'][0]);
        expect(verification.status).toBe(204);

        // Check that the user is verified now.
        const verificationResponse2 = await request(app)
            .get('/verification/status')
            .set('Cookie', responseLogin.headers['set-cookie'][0]);
        expect(verificationResponse2.status).toBe(200);
        expect(verificationResponse2.body.verified).toBe(true);

        // Close the current game and start a new one
        await payoutAndStartNewGame();
    });
});
