# URL Shortener — Backend

RESTful API service powering the URL Shortener — handles user authentication, short-code generation, and redirect resolution.

---

## Demo / Architecture

```
                        ┌──────────────────────────────────────┐
                        │             Express App               │
                        │                                       │
  Client                │  /auth  ──► AuthRouter                │
    │                   │               └── AuthController       │
    │ HTTP requests      │                   ├── signup()        │
    └──────────────────►│  /shorten ──► Shorten Router          │
                        │               └── shorten()           │
                        │                                       │
                        │  /:shortUrl ──► redirect handler      │
                        │  /urls/:email ► list handler          │
                        │                                       │
                        │  Middlewares: Auth.js, AuthValidation │
                        └──────────────────┬───────────────────┘
                                           │ Mongoose
                                    ┌──────▼──────┐
                                    │   MongoDB    │
                                    │  users, urls │
                                    └─────────────┘
```

---

## Why I Built This

URL shortening services need a reliable backend that can:
1. authenticate users so every short link is accountable,
2. generate short codes that are both unique and URL-safe,
3. resolve those codes to the original URL in milliseconds.

This backend solves all three using well-established Node.js libraries and a simple but effective MongoDB schema.

---

## Key Technical Highlights

- **Stateless JWT auth** — tokens are signed with a secret and expire after 24 hours; the `ensureAuthenticated` middleware validates them on every protected route without a database hit.
- **Collision-safe IDs via nanoid** — `nanoid(6)` produces ~56 billion possible codes from a URL-safe alphabet, minimising collision probability even at scale.
- **URL de-duplication** — before saving, the shorten handler checks whether the `originalUrl` already exists and reuses the existing short code instead of creating a duplicate document.
- **Schema-level validation** — Joi schemas run as Express middleware, rejecting malformed payloads before they ever reach controller functions.
- **Layered architecture** — routing, validation, business logic, and data access are each in their own layer, making it easy to unit-test or swap any single piece.

---

## Tech Stack

| Concern | Library / Tool | Version |
|---|---|---|
| Web framework | Express | 5.x |
| Database ODM | Mongoose | 8.x |
| Authentication | jsonwebtoken | 9.x |
| Password hashing | bcrypt | 5.x |
| Short-code generation | nanoid | 5.x |
| Payload validation | Joi | 17.x |
| Environment config | dotenv | 16.x |
| Dev server | nodemon | 3.x |

---

## How to Run Locally

### Prerequisites
- Node.js ≥ 18
- MongoDB running locally or a connection string from [MongoDB Atlas](https://www.mongodb.com/atlas)

### Steps

```bash
# 1. Install dependencies
cd backend
npm install

# 2. Create the environment file
cat > .env << 'EOF'
PORT=8080
MONGO_URI=mongodb://localhost:27017/urlshortener
JWT_SECRET=replace_with_a_long_random_secret
EOF

# 3. Start the development server
npm start
```

The server listens on `http://localhost:8080` by default.

Verify it is running:
```bash
curl http://localhost:8080/api
# API is working!
```

---

## API Reference

### Authentication

#### `POST /auth/signup`
Register a new account.

**Body**
```json
{ "name": "Alice", "email": "alice@example.com", "password": "s3cr3t" }
```
**Response `201`**
```json
{ "message": "User registered successfully", "success": true }
```

---

#### `POST /auth/login`
Authenticate and receive a JWT.

**Body**
```json
{ "email": "alice@example.com", "password": "s3cr3t" }
```
**Response `201`**
```json
{
  "message": "login successfully",
  "success": true,
  "jwtToken": "<token>",
  "email": "alice@example.com",
  "name": "Alice"
}
```

---

### URL Shortening

#### `POST /shorten`
Create a short URL.

**Body**
```json
{ "originalUrl": "https://very-long-url.example.com/path", "email": "alice@example.com" }
```
**Response `201`**
```json
{ "message": "url shortened successfully", "shortUrl": "aB3xYz" }
```

---

#### `GET /:shortUrl`
Redirect to the original URL.

```
GET /aB3xYz  →  302  Location: https://very-long-url.example.com/path
```

---

#### `GET /urls/:email`
Return all shortened URLs belonging to a user.

**Response `200`**
```json
[
  {
    "originalUrl": "https://example.com",
    "shortUrl": "aB3xYz",
    "clicks": 5,
    "email": "alice@example.com"
  }
]
```

---

### Protected (demo)

#### `GET /products`
Requires `Authorization: <jwtToken>` header.

---

## Architecture Overview

```
backend/
├── index.js              # App entry: wires Express, CORS, body-parser, and all routers
│
├── Routers/
│   ├── AuthRouter.js     # POST /auth/signup  •  POST /auth/login
│   ├── Shorten.js        # POST /shorten
│   └── ProductRouter.js  # GET /products  (protected demo route)
│
├── Controllers/
│   └── AuthController.js # Business logic: signup, login, shorten
│
├── Middlewares/
│   ├── Auth.js           # JWT verification — sets req.user on success
│   └── AuthValidation.js # Joi schemas: signupValidation, loginValidation
│
└── Models/
    ├── db.js             # Mongoose.connect() using MONGO_URI env var
    ├── User.js           # Schema: { name, email, password }
    └── Url.js            # Schema: { originalUrl, shortUrl, clicks, email }
```

### Data models

**User**

| Field | Type | Constraints |
|---|---|---|
| name | String | required |
| email | String | required, unique |
| password | String | required (bcrypt hash) |

**Url**

| Field | Type | Constraints |
|---|---|---|
| originalUrl | String | required |
| shortUrl | String | required, unique |
| clicks | Number | default: 0 |
| email | String | required |

---

## Known Limitations / What I'd Improve

| Limitation | Planned improvement |
|---|---|
| Click counter never incremented | Add `UrlModel.findOneAndUpdate({ shortUrl }, { $inc: { clicks: 1 } })` in the redirect handler |
| No retry on short-code collision | Wrap nanoid generation in a `do-while` loop that checks DB uniqueness |
| `JWT_SECRET` is undefined if `.env` is missing | Validate required env vars at startup (`process.exit(1)` if absent) |
| No rate limiting on `/shorten` | Add `express-rate-limit` middleware |
| CORS wildcard (`*`) in development | Restrict `origin` to the frontend domain in production |
| No request logging | Add `morgan` middleware for structured HTTP access logs |
| No test suite | Add Jest + Supertest integration tests for each endpoint |
