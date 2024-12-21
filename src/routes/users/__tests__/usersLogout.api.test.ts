import request from 'supertest';
import app from '../../../app';

const date = Date.now();

describe('POST /users/logout', () => {
    it('should logout successfully', async () => {
        // First, register the user
        await request(app)
            .post('/users/register')
            .send({
                username: `testUserLogout-${date}`,
                email: 'testUserLogout@example.com',
                password: 'Passw0rd!',
            });

        // Then, login with the same credentials
        const loginResponse = await request(app)
            .post('/users/login')
            .send({
                username: `testUserLogout-${date}`,
                password: 'Passw0rd!',
            });

        // Extract the cookie from the login response
        const cookie = loginResponse.headers['set-cookie'][0];

        // Then, logout using the cookie
        const logoutResponse = await request(app)
            .post('/users/logout')
            .set('Cookie', cookie);

        expect(logoutResponse.status).toBe(200);
        expect(logoutResponse.body.message).toBe('Logout successful');
    });
});
