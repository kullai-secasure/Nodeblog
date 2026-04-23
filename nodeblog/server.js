const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const path = require('path');

const authRouter = require('./routes/auth');
const postsRouter = require('./routes/posts');
const adminRouter = require('./routes/admin');
const sitemapRouter = require('./routes/sitemap');
const dbConfig = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.json({ limit: '1mb' }));
app.use(bodyParser.urlencoded({ extended: false, limit: '1mb' }));
app.use(cookieParser(process.env.COOKIE_SECRET || 'dev-secret'));
app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect(dbConfig.uri, dbConfig.options).catch((err) => {
  console.warn('MongoDB connection failed:', err.message);
});

app.use('/auth', authRouter);
app.use('/posts', postsRouter);
app.use('/admin', adminRouter);
app.use('/sitemap', sitemapRouter);

app.get('/', (req, res) => {
  res.render('index', { title: 'NodeBlog' });
});

app.listen(PORT, () => {
  console.log(`NodeBlog listening on :${PORT}`);
});

module.exports = app;
