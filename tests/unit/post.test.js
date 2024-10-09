const request = require('supertest');
// const hash = require('../../src/hash');
const app = require('../../src/app');

describe('POST /v1/fragments', () => {
  test('unauthenticated requests are denied', () => request(app).post('/v1/fragments').expect(401));

  test('incorrect credentials are denied', () =>
    request(app).post('/v1/fragments').auth('invalid@email.com', 'incorrect_password').expect(401));

  // test('authenticated users can create fragments', async () => {
  //   const res = await request(app)
  //     .post('/v1/fragments')
  //     .auth('user1@email.com', 'password1')
  //     .send('Some data String') // Ensure this is sent as a string
  //     .set('Content-Type', 'text/plain'); // Set content type correctly
  //   expect(res.statusCode).toBe(201);
  //   expect(res.body.status).toBe('ok');
  //   expect(res.body.fragment.ownerId).toEqual(hash('user1@email.com'));
  //   expect(res.body.fragment.type).toEqual('text/plain');
  //   expect(res.body.fragment.created).toBeDefined();
  //   expect(res.body.fragment.updated).toBeDefined();
  //   expect(res.body.fragment.size).toEqual(Buffer.byteLength('Some data String'));
  // });

  // test('expecting location URL in response header', async () => {
  //   const res = await request(app)
  //     .post('/v1/fragments')
  //     .auth('user1@email.com', 'password1')
  //     .send('Some data String')
  //     .set('Content-Type', 'text/plain');
  //   expect(res.statusCode).toBe(201);
  //   expect(res.headers).toHaveProperty('location');
  // });
  // // For JSON data test
  // test('expecting 201 with JSON data since it is supported fragment data', async () => {
  //   const res = await request(app)
  //     .post('/v1/fragments')
  //     .auth('user1@email.com', 'password1')
  //     .send({ data: 'Some json data' }) // Send valid JSON object
  //     .set('Content-Type', 'application/json'); // Set content type correctly
  //   expect(res.statusCode).toBe(201);
  //   expect(res.body.fragment.type).toEqual('application/json');
  // });
  test('expecting 415 error code for unsupported fragment type', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .send('Invalid type data')
      .set('Content-Type', 'application/png'); // Use a supported type if you want this to pass
    expect(res.statusCode).toBe(415);
    //expect(res.body.error.message).toEqual('Unsupported content type');
  });
  
});
