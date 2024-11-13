const request = require('supertest');
// const hash = require('../../src/hash');
const app = require('../../src/app');

describe('POST /v1/fragments', () => {
  test('unauthenticated requests are denied', () => request(app).post('/v1/fragments').expect(401));

  test('incorrect credentials are denied', () =>
    request(app).post('/v1/fragments').auth('invalid@email.com', 'incorrect_password').expect(401));

  test('expecting 415 error code for unsupported fragment type', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .send('Invalid type data')
      .set('Content-Type', 'application/png'); // Use a supported type if you want this to pass
    expect(res.statusCode).toBe(415);
  });

  // Test for creating a text/plain fragment
  test('creates a text/plain fragment and returns 201 status', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .send('Hello, world!')
      .set('Content-Type', 'text/plain') ;
      
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('created');
  });
  
  test('returns 400 for unsupported Content-Type', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .set('Authorization', 'Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==')
      .set('Content-Type', 'unsupported/type')
      .send('Unsupported content type test');

      // Update to expect 415 instead of 400
      expect(res.statusCode).toBe(415);
  });
});
