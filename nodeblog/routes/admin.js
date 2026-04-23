const express = require('express');
const _ = require('lodash');
const mongoose = require('mongoose');

const router = express.Router();

const TemplateSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  subject: String,
  body: String,
  updatedAt: { type: Date, default: Date.now }
});
const Template = mongoose.models.Template || mongoose.model('Template', TemplateSchema);

const DEFAULT_TEMPLATES = {
  welcome: {
    subject: 'Welcome to <%= siteName %>',
    body: 'Hi <%= user.username %>,\n\nThanks for joining <%= siteName %>!'
  },
  'post-published': {
    subject: 'New post: <%= post.title %>',
    body: '<%= user.username %>, your post "<%= post.title %>" is live.'
  }
};

async function getTemplate(key) {
  const stored = await Template.findOne({ key }).lean().catch(() => null);
  return stored || DEFAULT_TEMPLATES[key] || null;
}

router.get('/templates/:key/render', async (req, res) => {
  const tpl = await getTemplate(req.params.key);
  if (!tpl) return res.status(404).json({ error: 'template not found' });

  const context = {
    siteName: process.env.SITE_NAME || 'NodeBlog',
    user: { username: 'preview-user' },
    post: { title: 'Sample Post' }
  };

  const subject = _.template(tpl.subject || '')(context);
  const body = _.template(tpl.body || '')(context);

  res.json({ subject, body });
});

router.get('/stats', async (req, res) => {
  const Post = mongoose.models.Post;
  const User = mongoose.models.User;

  const [postCount, userCount] = await Promise.all([
    Post ? Post.countDocuments({}) : Promise.resolve(0),
    User ? User.countDocuments({}) : Promise.resolve(0)
  ]).catch(() => [0, 0]);

  const summary = _.pick(
    { postCount, userCount, uptime: process.uptime() },
    ['postCount', 'userCount', 'uptime']
  );
  res.json(summary);
});

module.exports = router;
