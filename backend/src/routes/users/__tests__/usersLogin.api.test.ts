import request from 'supertest';
import app from '../../../app';

const date = Date.now();

describe('POST /users/login', () => {
    it('should login successfully with correct credentials', async () => {
        // First, register the user
        await request(app)
            .post('/users/register')
            .send({
                username: `testUser-${date}`,
                email: 'testUser@example.com',
                password: 'Passw0rd!',
            });

        // Then, login with the same credentials
        const response = await request(app)
            .post('/users/login')
            .send({
                username: `testUser-${date}`,
                password: 'Passw0rd!',
            });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Login successful');
        expect(response.headers['set-cookie'][0].length).toBeGreaterThan(1);

        // Check if the user is logged in
        const loggedInResponse = await request(app)
            .get('/users/auth/status')
            .set('Cookie', response.headers['set-cookie'][0]);
        expect(loggedInResponse.status).toBe(200);
        expect(loggedInResponse.body.loggedIn).toBe(true);
    });

    it('should return 400 if required fields are missing', async () => {
        const response = await request(app)
            .post('/users/login')
            .send({
                username: `testUser-${date}`,
            });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('All fields are required.');
    });

    it('should return 401 if credentials are incorrect', async () => {
        const response = await request(app)
            .post('/users/login')
            .send({
                username: `testUser-${date}`,
                password: 'WrongPassword!',
            });

        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Invalid username or password');
    });

    it('check if /auth/status returns false if user is not logged in', async () => {
        const response = await request(app)
            .get('/users/auth/status');

        expect(response.status).toBe(200);
        expect(response.body.loggedIn).toBe(false);
    });
});
