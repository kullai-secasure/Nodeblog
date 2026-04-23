const crypto = require('crypto');

const KEY_LEN = 64;
const COST = 16384;

function hash(password) {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16);
    crypto.scrypt(password, salt, KEY_LEN, { N: COST }, (err, derived) => {
      if (err) return reject(err);
      resolve(`scrypt$${COST}$${salt.toString('hex')}$${derived.toString('hex')}`);
    });
  });
}

function compare(password, stored) {
  return new Promise((resolve) => {
    if (typeof stored !== 'string') return resolve(false);
    const parts = stored.split('$');
    if (parts.length !== 4 || parts[0] !== 'scrypt') return resolve(false);
    const cost = parseInt(parts[1], 10);
    const salt = Buffer.from(parts[2], 'hex');
    const expected = Buffer.from(parts[3], 'hex');
    crypto.scrypt(password, salt, expected.length, { N: cost }, (err, derived) => {
      if (err) return resolve(false);
      resolve(crypto.timingSafeEqual(expected, derived));
    });
  });
}

module.exports = { hash, compare };
