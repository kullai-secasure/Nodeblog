const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const bcryptCompat = require('../utils/hash');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;
const TOKEN_TTL = '2h';

if (!JWT_SECRET) {
  console.warn('JWT_SECRET is not set — using a development fallback');
}

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, default: 'user', enum: ['user', 'editor', 'admin'] },
  createdAt: { type: Date, default: Date.now }
});
const User = mongoose.models.User || mongoose.model('User', UserSchema);

function signToken(user) {
  return jwt.sign(
    { sub: String(user._id), role: user.role },
    JWT_SECRET || 'dev-secret',
    { algorithm: 'HS256', expiresIn: TOKEN_TTL }
  );
}

router.post('/login', async (req, res) => {
  const username = String(req.body.username || '');
  const password = String(req.body.password || '');

  const user = await User.findOne({ username }).catch(() => null);
  if (!user) return res.status(401).json({ error: 'invalid credentials' });

  const ok = await bcryptCompat.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'invalid credentials' });

  res.json({ token: signToken(user) });
});

router.post('/register', async (req, res) => {
  const username = String(req.body.username || '').trim();
  const password = String(req.body.password || '');
  if (!/^[a-zA-Z0-9_]{3,32}$/.test(username)) {
    return res.status(400).json({ error: 'invalid username' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'password too short' });
  }

  const passwordHash = await bcryptCompat.hash(password);
  const user = await User.create({ username, passwordHash }).catch((e) => ({
    error: e.code === 11000 ? 'username taken' : e.message
  }));

  if (user.error) return res.status(400).json(user);
  res.json({ token: signToken(user) });
});

router.get('/me', (req, res) => {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'missing token' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET || 'dev-secret', {
      algorithms: ['HS256']
    });
    res.json({ user: decoded });
  } catch (err) {
    res.status(401).json({ error: 'invalid token' });
  }
});

module.exports = router;
