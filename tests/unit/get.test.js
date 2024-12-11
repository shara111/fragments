const request = require('supertest');
const app = require('../../src/app');

// Helper function for authenticated requests
const authRequest = (method, url, email = 'user1@email.com', password = 'password1') =>
  request(app)[method](url).auth(email, password);

describe('Fragments API Tests', () => {
  describe('GET /v1/fragments', () => {
    test('unauthenticated requests are denied', () => {
      return request(app).get('/v1/fragments').expect(401);
    });

    test('incorrect credentials are denied', () => {
      return authRequest('get', '/v1/fragments', 'invalid@email.com', 'incorrect_password').expect(401);
    });

    test('authenticated users get a fragments array', async () => {
      const res = await authRequest('get', '/v1/fragments');
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(Array.isArray(res.body.fragments)).toBe(true);
    });

    test('returns 404 for non-existent fragment', async () => {
      const res = await authRequest('get', '/v1/fragments/c07bf87b-bfdd-4cb3-8b71-b21c77e73a000');
      expect(res.statusCode).toBe(404);
    });
  });

  describe('POST /v1/fragments', () => {
    test('unauthenticated requests are denied', () => {
      return request(app).post('/v1/fragments').send('This is a fragment').expect(401);
    });

    test('authenticated users can create a plain text fragment', async () => {
      const res = await authRequest('post', '/v1/fragments')
        .send('This is a fragment')
        .set('Content-Type', 'text/plain');

      expect(res.statusCode).toBe(201);
      expect(res.body.fragment).toMatchObject({
        type: 'text/plain',
        ownerId: '11d4c22e42c8f61feaba154683dea407b101cfd90987dda9e342843263ca420a',
      });
    });

    test('POST response includes a Location header', async () => {
      const res = await authRequest('post', '/v1/fragments')
        .send('This is another fragment')
        .set('Content-Type', 'text/plain');

      expect(res.statusCode).toBe(201);
      expect(res.headers).toHaveProperty('location');
      const fragmentId = res.body.fragment.id;
      expect(res.headers.location).toBe(`http://localhost:8080/v1/fragments/${fragmentId}`);
    });

    test('unsupported fragment type returns 415', async () => {
      const res = await authRequest('post', '/v1/fragments')
        .send('Unsupported type')
        .set('Content-Type', 'application/xml');

      expect(res.statusCode).toBe(415);
    });
  });

  describe('GET /v1/fragments/:id/info', () => {
    test('successfully retrieves fragment info with valid ID', async () => {
      const resPost = await authRequest('post', '/v1/fragments')
        .send('This is a fragment')
        .set('Content-Type', 'text/plain');
      const id = resPost.body.fragment.id;

      const res = await authRequest('get', `/v1/fragments/${id}/info`);
      expect(res.status).toBe(200);
    });

    test('returns 404 for invalid fragment ID', async () => {
      const res = await authRequest('get', '/v1/fragments/999/info');
      expect(res.status).toBe(404);
    });
  });
});
