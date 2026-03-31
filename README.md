# URL Shortener — Full-Stack URL shortening service with user authentication

A web application that lets registered users shorten long URLs, track their links, and redirect visitors via short codes — built with Node.js/Express on the backend and a MongoDB database.

---

## Demo / Architecture

```
┌─────────────┐       POST /auth/signup          ┌───────────────────┐
│             │ ──────────────────────────────►  │                   │
│   Client    │       POST /auth/login            │  Express REST API │
│  (Browser)  │ ──────────────────────────────►  │  (Node.js)        │
│             │       POST /shorten               │                   │
│             │ ──────────────────────────────►  └────────┬──────────┘
│             │       GET  /:shortUrl  (redirect)          │
│             │ ◄─────────────────────────────── redirect  │ Mongoose ODM
│             │       GET  /urls/:email                    │
│             │ ──────────────────────────────►  ┌────────▼──────────┐
└─────────────┘                                   │     MongoDB        │
                                                  │  (users + urls)   │
                                                  └───────────────────┘
```

---

## Why I Built This

Long URLs are hard to share, especially on social media or in printed material.  
This project provides a clean API that:
- ties every short link to a registered user (accountability),
- enables click tracking per link,
- and redirects visitors seamlessly without any frontend framework overhead.

It also serves as a practical exercise in building a secure JWT-authenticated REST API with MongoDB.

---

## Key Technical Highlights

- **JWT Authentication** — stateless auth using signed tokens (24 h expiry); each protected route verifies the token via middleware before any business logic runs.
- **Collision-safe short codes** — [nanoid](https://github.com/ai/nanoid) generates cryptographically random 6-character IDs; existing long URLs are de-duplicated before a new document is saved.
- **Per-user URL ownership** — every shortened URL stores the owner's e-mail, enabling per-user dashboards and audit trails.
- **Click tracking** — the `clicks` counter on each URL document is ready to be incremented on every redirect hit.
- **Input validation layer** — all incoming payloads are validated with [Joi](https://joi.dev/) schemas before they reach the controller, keeping controller logic clean.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Web framework | Express 5 |
| Database | MongoDB |
| ODM | Mongoose 8 |
| Authentication | JSON Web Tokens (`jsonwebtoken`) |
| Password hashing | bcrypt |
| Short-code generation | nanoid |
| Payload validation | Joi |
| Environment config | dotenv |
| Dev server reload | nodemon |

---

## How to Run Locally

### Prerequisites
- Node.js ≥ 18
- A running MongoDB instance (local or [MongoDB Atlas](https://www.mongodb.com/atlas))

### 1 — Clone the repository

```bash
git clone https://github.com/deepgodhani/URL-Shortener.git
cd URL-Shortener
```

### 2 — Set up the backend

```bash
cd backend
npm install
```

Create a `.env` file inside `backend/`:

```env
PORT=8080
MONGO_URI=mongodb://localhost:27017/urlshortener
JWT_SECRET=your_super_secret_key
```

Start the server:

```bash
npm start        # uses nodemon for auto-reload
```

The API will be available at `http://localhost:8080`.

---

## API Overview

| Method | Endpoint | Auth required | Description |
|--------|----------|:---:|---|
| `POST` | `/auth/signup` | ✗ | Register a new user |
| `POST` | `/auth/login` | ✗ | Log in and receive a JWT |
| `POST` | `/shorten` | ✗ | Shorten a URL (pass `email` in body) |
| `GET` | `/:shortUrl` | ✗ | Redirect to the original URL |
| `GET` | `/urls/:email` | ✗ | List all URLs for a user |
| `GET` | `/products` | ✔ | Protected sample route |

### Example — shorten a URL

```bash
curl -X POST http://localhost:8080/shorten \
  -H "Content-Type: application/json" \
  -d '{"originalUrl":"https://example.com/very/long/path","email":"user@example.com"}'
```

Response:
```json
{
  "message": "url shortened successfully",
  "shortUrl": "aB3xYz"
}
```

Visit `http://localhost:8080/aB3xYz` to be redirected to the original URL.

---

## Architecture Overview

```
backend/
├── index.js              # Express app entry point — mounts all routers
├── Routers/
│   ├── AuthRouter.js     # /auth/signup  and  /auth/login
│   ├── Shorten.js        # POST /shorten
│   └── ProductRouter.js  # GET /products (protected demo route)
├── Controllers/
│   └── AuthController.js # signup, login, shorten business logic
├── Middlewares/
│   ├── Auth.js           # JWT verification middleware
│   └── AuthValidation.js # Joi validation middleware for each route
└── Models/
    ├── db.js             # Mongoose connection
    ├── User.js           # User schema (name, email, password)
    └── Url.js            # URL schema (originalUrl, shortUrl, clicks, email)
```

**Request flow (shorten a URL):**

```
Client → POST /shorten
       → AuthController.shorten()
         ├── Check if originalUrl already exists in DB
         ├── Generate nanoid(6) short code if new
         ├── Save UrlModel document
         └── Return { shortUrl }
```

**Request flow (redirect):**

```
Client → GET /:shortUrl
       → UrlModel.findOne({ shortUrl })
       → 302 redirect to originalUrl
```

---

## Known Limitations / What I'd Improve

| Limitation | Planned improvement |
|---|---|
| Short URL collisions are not retried | Wrap nanoid generation in a retry loop and check DB uniqueness before saving |
| Click counter is never incremented | Increment `clicks` in the `GET /:shortUrl` handler on every successful redirect |
| No frontend yet | Build a React/Next.js dashboard showing all user links with click stats |
| No rate limiting | Add `express-rate-limit` to protect `/shorten` from abuse |
| bcrypt salt rounds use the library default (10) | Review and increase rounds based on target hardware for production workloads |
| `JWT_SECRET` falls back to undefined in dev | Validate required env vars at startup and refuse to start if missing |
| No HTTPS enforcement | Add HSTS headers or deploy behind a TLS-terminating reverse proxy |
