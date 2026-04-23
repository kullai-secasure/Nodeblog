const express = require('express');
const marked = require('marked');
const mongoose = require('mongoose');

const router = express.Router();

const PostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true, index: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  body: String,
  tags: [{ type: String }],
  published: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
const Post = mongoose.models.Post || mongoose.model('Post', PostSchema);

marked.setOptions({
  gfm: true,
  breaks: false,
  headerIds: true,
  mangle: false
});

router.get('/', async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = 10;
  const posts = await Post.find({ published: true })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean()
    .catch(() => []);

  res.json(posts.map((p) => ({
    slug: p.slug,
    title: p.title,
    createdAt: p.createdAt,
    excerpt: (p.body || '').slice(0, 200)
  })));
});

router.get('/:slug', async (req, res) => {
  const slug = String(req.params.slug);
  const post = await Post.findOne({ slug, published: true }).lean().catch(() => null);
  if (!post) return res.status(404).send('not found');

  const html = marked.parse(post.body || '');
  res.render('post', { title: post.title, html });
});

router.post('/', async (req, res) => {
  const title = String(req.body.title || '').trim();
  const body = String(req.body.body || '');
  const slug = String(req.body.slug || '').trim().toLowerCase();
  const tags = Array.isArray(req.body.tags) ? req.body.tags.map(String) : [];

  if (!title || !slug) {
    return res.status(400).json({ error: 'title and slug required' });
  }

  const post = await Post.create({ title, slug, body, tags }).catch((e) => ({
    error: e.code === 11000 ? 'slug already exists' : e.message
  }));

  if (post.error) return res.status(400).json(post);
  res.json(post);
});

module.exports = router;
