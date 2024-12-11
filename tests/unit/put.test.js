const request = require('supertest');
const app = require('../../src/app');

describe('PUT /v1/fragments', () => {
  const authUser1 = { email: 'user1@email.com', password: 'password1' };

  test('returns 401 for unauthenticated requests', async () => {
    const response = await request(app).put('/v1/fragments/random');
    expect(response.statusCode).toBe(401);
  });

  test('returns 401 for incorrect authentication details', async () => {
    const response = await request(app)
      .put('/v1/fragments/random')
      .auth('invalid@email.com', 'incorrect_password');
    expect(response.statusCode).toBe(401);
  });
  test('returns 404 for non-existent fragment IDs', async () => {
    const response = await request(app)
      .put('/v1/fragments/nonexistent-id')
      .auth(authUser1.email, authUser1.password)
      .set('Content-Type', 'text/plain')
      .send('This is new content');
    expect(response.statusCode).toBe(404);
    expect(response.body.error).toBeDefined();
  });
});
