const express = require('express');
const xml2js = require('xml2js');
const axios = require('axios');

const router = express.Router();

const parser = new xml2js.Parser({
  explicitArray: false,
  trim: true,
  normalizeTags: true
});

function extractUrls(parsed) {
  const set = parsed && parsed.urlset;
  if (!set || !set.url) return [];
  const urls = Array.isArray(set.url) ? set.url : [set.url];
  return urls
    .map((u) => (typeof u === 'string' ? u : u.loc))
    .filter(Boolean);
}

router.post('/import', (req, res) => {
  const xml = String(req.body.xml || '');
  if (!xml) return res.status(400).json({ error: 'xml body required' });

  parser.parseString(xml, (err, result) => {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ urls: extractUrls(result) });
  });
});

const TRUSTED_HOSTS = new Set(
  (process.env.SITEMAP_HOSTS || 'nodeblog.example.com,docs.example.com')
    .split(',')
    .map((h) => h.trim())
);

router.post('/fetch', async (req, res) => {
  const url = String(req.body.url || '');
  let parsed;
  try {
    parsed = new URL(url);
  } catch (e) {
    return res.status(400).json({ error: 'invalid url' });
  }
  if (!TRUSTED_HOSTS.has(parsed.host)) {
    return res.status(400).json({ error: 'host not allowed' });
  }

  try {
    const resp = await axios.get(parsed.toString(), { timeout: 5000 });
    parser.parseString(resp.data, (err, result) => {
      if (err) return res.status(400).json({ error: err.message });
      res.json({ urls: extractUrls(result) });
    });
  } catch (e) {
    res.status(502).json({ error: 'upstream fetch failed' });
  }
});

module.exports = router;
