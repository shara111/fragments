const request = require('supertest');

const app = require('../../src/app');


describe('404 Handler', () => {
    test('should return HTTP 404 response', async () => {
        const res = await request(app).get('/non-existent-route');
        expect(res.statusCode).toBe(404);
    });
})