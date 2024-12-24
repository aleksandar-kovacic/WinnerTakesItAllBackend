import request from 'supertest';
import app from '../../../app';
import fs from 'fs';
import path from 'path';

const date = Date.now();

describe('test ban functionality', () => {
    it('register and login user and ban user', async () => {
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

        //Convert jpg to base64
        const idFrontImage = fs.readFileSync(path.resolve(__dirname, '../../../../test_utils/idFrontImageExample.jpg')).toString('base64');
        const personImage = fs.readFileSync(path.resolve(__dirname, '../../../../test_utils/personImageExample.jpg')).toString('base64');

        //Verify the user
        const verification = await request(app)
        .post('/verification/verify')
        .send({ idFrontImage: idFrontImage, personImage: personImage })
        .set('Cookie', responseLogin.headers['set-cookie'][0]);
        expect(verification.status).toBe(204);

        // Ban the user
        const ban = await request(app)
            .post('/ban/oasis-ban')
            .send({ name: `testUser-${date}` })
            .set('Cookie', responseLogin.headers['set-cookie'][0]);
        expect(ban.status).toBe(204);
        
        // Let the user pay so that he participates in the game 
        const payment = await request(app)
            .post('/payments/pay')
            .send({ paymentMethod: 'Paypal' })
            .set('Cookie', responseLogin.headers['set-cookie']);
        expect(payment.status).toBe(400);
        
        // Unban the user
        const unban = await request(app)
            .post('/ban/oasis-unban')
            .send({ name: `testUser-${date}` })
            .set('Cookie', responseLogin.headers['set-cookie'][0]);
        expect(unban.status).toBe(204);
            
        // Let the user pay so that he participates in the game
        const payment2 = await request(app)
            .post('/payments/pay')
            .send({ paymentMethod: 'Paypal' })
            .set('Cookie', responseLogin.headers['set-cookie'][0]);
        expect(payment2.status).toBe(200);
    });
});
