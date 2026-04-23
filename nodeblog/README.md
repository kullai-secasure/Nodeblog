# NodeBlog

A small Node.js + Express blog platform. Stores posts as markdown in MongoDB,
renders them to HTML on request, supports JWT-based auth, email template
previews, and XML sitemap imports.

## Requirements

- Node.js ≥ 16
- MongoDB (optional — the app starts without it for local dev)

## Install

```bash
npm install
```

## Run

```bash
npm start           # production
npm run dev         # with nodemon auto-reload
```

The server listens on `:3000` by default. Override with `PORT`.

## Environment

| Variable         | Default                                | Purpose                       |
|------------------|----------------------------------------|-------------------------------|
| `PORT`           | `3000`                                 | HTTP port                     |
| `MONGO_URI`      | `mongodb://localhost:27017/nodeblog`   | MongoDB connection string     |
| `JWT_SECRET`     | `dev-secret`                           | Secret used to sign JWTs      |
| `COOKIE_SECRET`  | `dev-secret`                           | Secret used to sign cookies   |
| `SITE_NAME`      | `NodeBlog`                             | Displayed in email templates  |
| `SITEMAP_HOSTS`  | `nodeblog.example.com,docs.example.com`| Comma-separated allowlist     |

## API

| Method | Path                                | Description                          |
|--------|-------------------------------------|--------------------------------------|
| POST   | `/auth/register`                    | Create a user                        |
| POST   | `/auth/login`                       | Issue a JWT                          |
| GET    | `/auth/me`                          | Decode the caller's JWT              |
| GET    | `/posts`                            | List published posts (paged)         |
| GET    | `/posts/:slug`                      | Render a single post                 |
| POST   | `/posts`                            | Create a post                        |
| GET    | `/admin/templates/:key/render`      | Render an email template             |
| GET    | `/admin/stats`                      | Basic site stats                     |
| POST   | `/sitemap/import`                   | Parse a raw XML sitemap              |
| POST   | `/sitemap/fetch`                    | Fetch and parse an allowlisted URL   |

## Project layout

```
nodeblog/
├── server.js
├── package.json
├── config/db.js
├── routes/
│   ├── auth.js
│   ├── posts.js
│   ├── admin.js
│   └── sitemap.js
├── utils/hash.js
├── views/
│   ├── index.ejs
│   └── post.ejs
└── public/
```

## License

MIT.
