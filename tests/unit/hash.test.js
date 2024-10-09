const hash = require('../../src/hash');

describe('hash()', () => {
  const email = 'user1@example.com';

  test('email addresses should get hashed using sha256 to hex strings', () => {
    const hashedEmail = 'b36a83701f1c3191e19722d6f90274bc1b5501fe69ebf33313e440fe4b0fe210';
    expect(hash(email)).toEqual(hashedEmail);
  });

  test('hashing should always return the same value for a given string', () => {
    const email = 'user1@example.com';
    expect(hash(email)).toEqual(hash(email));
  });
});