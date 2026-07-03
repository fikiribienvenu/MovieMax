# 🎬 CineMax Backend — Node.js REST API

A production-ready REST API for the CineMax movie streaming platform, built with **Node.js**, **Express**, and **MongoDB**.

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 18+ |
| Framework | Express 4 |
| Database | MongoDB + Mongoose |
| Auth | JWT + httpOnly Cookies |
| Password | bcryptjs |
| Validation | express-validator + Zod |
| Email | Nodemailer (HTML templates) |
| Payments | Stripe (mock integration) |
| File Upload | Multer + Cloudinary |
| Logging | Winston |
| Security | Helmet, CORS, Rate Limiting, Mongo Sanitize |

---

## 📁 Project Structure

```
src/
├── server.js                  # Entry point — starts HTTP server
├── app.js                     # Express app — middleware & routes
│
├── config/
│   └── database.js            # MongoDB connection
│
├── controllers/
│   ├── auth.controller.js     # signup, login, logout, forgot/reset password
│   ├── user.controller.js     # profile, watchlist, watch history
│   ├── movie.controller.js    # CRUD movies, search, stream URL
│   ├── subscription.controller.js  # subscribe, cancel, billing
│   ├── review.controller.js   # CRUD reviews, helpful votes
│   └── admin.controller.js    # dashboard stats, user/movie management
│
├── middleware/
│   ├── auth.middleware.js     # protect, restrictTo, requireSubscription
│   ├── errorHandler.js        # global error handler
│   ├── notFound.js            # 404 handler
│   ├── validate.js            # express-validator rules
│   └── upload.middleware.js   # Multer image/video upload
│
├── models/
│   ├── User.model.js          # User schema (auth, subscription, watchlist)
│   ├── Movie.model.js         # Movie schema (metadata, video, text search)
│   ├── Subscription.model.js  # Subscription schema (payments, billing)
│   └── Review.model.js        # Review schema (ratings, helpful votes)
│
├── routes/
│   ├── auth.routes.js
│   ├── user.routes.js
│   ├── movie.routes.js
│   ├── subscription.routes.js
│   ├── review.routes.js
│   └── admin.routes.js
│
└── utils/
    ├── AppError.js            # Custom operational error class
    ├── asyncHandler.js        # Async route wrapper
    ├── ApiFeatures.js         # Filter, sort, paginate, search helper
    ├── jwt.js                 # Token sign/verify/cookie helpers
    ├── email.js               # Nodemailer HTML email service
    ├── logger.js              # Winston logger
    └── seeder.js              # Database seed script
```

---

## 🚀 Getting Started

### 1. Install dependencies

```bash
cd cinemax-backend
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your values (MongoDB URI, JWT secret, etc.)
```

Minimum required:
```env
MONGO_URI=mongodb://localhost:27017/cinemax
JWT_SECRET=your-secret-key-min-32-characters
CLIENT_URL=http://localhost:3000
PORT=5000
```

### 3. Seed the database

```bash
npm run seed
```

This creates:
- 12 movies with full metadata
- Admin user: `admin@cinemax.com` / `Admin@1234`
- Regular user: `alex@example.com` / `Alex@1234` (Premium subscriber)
- Sample reviews

### 4. Start the server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Server runs at: `http://localhost:5000/api/v1`

---

## 📡 API Reference

### Base URL
```
http://localhost:5000/api/v1
```

### Authentication
All protected routes require:
```
Authorization: Bearer <token>
```
Or the `jwt` httpOnly cookie (set automatically on login).

---

### 🔐 Auth Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/auth/signup` | Public | Register new account |
| `POST` | `/auth/login` | Public | Login |
| `POST` | `/auth/logout` | Public | Logout (clears cookie) |
| `GET` | `/auth/me` | 🔒 | Get current user |
| `POST` | `/auth/forgot-password` | Public | Send reset email |
| `PATCH` | `/auth/reset-password/:token` | Public | Reset password |
| `PATCH` | `/auth/update-password` | 🔒 | Change password |
| `POST` | `/auth/refresh-token` | 🔒 | Refresh JWT |

**Signup Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass1",
  "confirmPassword": "SecurePass1"
}
```

**Login Request:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass1"
}
```

---

### 👤 User Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/users/me` | 🔒 | Get my profile |
| `PATCH` | `/users/me` | 🔒 | Update profile |
| `DELETE` | `/users/me` | 🔒 | Deactivate account |
| `GET` | `/users/me/subscription` | 🔒 | Get subscription status |
| `GET` | `/users/me/watchlist` | 🔒 | Get watchlist |
| `POST` | `/users/me/watchlist/:movieId` | 🔒 | Add to watchlist |
| `DELETE` | `/users/me/watchlist/:movieId` | 🔒 | Remove from watchlist |
| `GET` | `/users/me/history` | 🔒 | Get watch history |
| `PATCH` | `/users/me/history/:movieId/progress` | 🔒 | Save progress |
| `DELETE` | `/users/me/history` | 🔒 | Clear history |

---

### 🎬 Movie Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/movies` | Optional | Get all movies (filter, sort, paginate) |
| `GET` | `/movies/featured` | Optional | Get featured movie |
| `GET` | `/movies/trending` | Optional | Get trending movies |
| `GET` | `/movies/top-rated` | Optional | Get top-rated movies |
| `GET` | `/movies/latest` | Optional | Get latest movies |
| `GET` | `/movies/search?q=&category=` | Optional | Search movies |
| `GET` | `/movies/category/:category` | Optional | Movies by category |
| `GET` | `/movies/:id` | Optional | Get single movie |
| `GET` | `/movies/:id/stream` | 🔒 + 💎 | Get secure stream URL |
| `POST` | `/movies/:id/like` | 🔒 | Like / unlike movie |
| `POST` | `/movies` | 🔒 Admin | Create movie |
| `PATCH` | `/movies/:id` | 🔒 Admin | Update movie |
| `DELETE` | `/movies/:id` | 🔒 Admin | Soft-delete movie |

**Query Parameters for `/movies`:**
```
?page=1&limit=20
?sort=-rating         (prefix - for descending)
?category=Action
?search=batman
?year[gte]=2020
?rating[gte]=8
?fields=title,poster,rating
```

---

### 💳 Subscription Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/subscriptions/plans` | Public | Get all plans + pricing |
| `POST` | `/subscriptions` | 🔒 | Subscribe to a plan |
| `GET` | `/subscriptions/my` | 🔒 | Get my subscription |
| `PATCH` | `/subscriptions/cancel` | 🔒 | Cancel subscription |
| `PATCH` | `/subscriptions/reactivate` | 🔒 | Reactivate subscription |
| `GET` | `/subscriptions/billing` | 🔒 | Get billing history |
| `POST` | `/subscriptions/webhook` | Public | Stripe webhook |

**Subscribe Request:**
```json
{
  "plan": "premium",
  "paymentMethodId": "pm_mock_12345"
}
```

**Available Plans:** `basic` ($8/mo) · `premium` ($15/mo) · `annual` ($99/yr)

---

### ⭐ Review Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/movies/:movieId/reviews` | Optional | Get movie reviews |
| `GET` | `/movies/:movieId/reviews/mine` | 🔒 | Get my review |
| `POST` | `/movies/:movieId/reviews` | 🔒 | Create review |
| `PATCH` | `/reviews/:id` | 🔒 | Edit review |
| `DELETE` | `/reviews/:id` | 🔒 | Delete review |
| `POST` | `/reviews/:id/vote` | 🔒 | Vote helpful/not_helpful |

**Create Review:**
```json
{
  "rating": 9.5,
  "title": "Absolutely stunning",
  "body": "One of the best films of the decade...",
  "containsSpoilers": false
}
```

---

### 🛡️ Admin Endpoints

All require: `🔒 + role: admin`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/admin/dashboard` | Stats, revenue, top movies |
| `GET` | `/admin/users` | List all users (search, filter) |
| `GET` | `/admin/users/:id` | Get user + subscriptions |
| `PATCH` | `/admin/users/:id` | Update user |
| `DELETE` | `/admin/users/:id` | Deactivate user |
| `GET` | `/admin/movies` | List all movies (incl. inactive) |
| `PATCH` | `/admin/movies/:id/featured` | Toggle featured |
| `PATCH` | `/admin/movies/:id/trending` | Toggle trending |
| `GET` | `/admin/subscriptions` | List all subscriptions |
| `GET` | `/admin/reviews` | List all reviews |
| `PATCH` | `/admin/reviews/:id/approve` | Approve review |

---

## 🔒 Auth & Security

- **JWT** — signed HS256, stored in httpOnly cookie + Bearer token
- **bcryptjs** — passwords hashed with salt rounds 12
- **Helmet** — HTTP security headers
- **CORS** — configured for frontend URL only
- **Rate Limiting** — 100 req/15min global, 10 req/15min on auth routes
- **Mongo Sanitize** — prevents NoSQL injection
- **Input Validation** — express-validator on all mutation endpoints
- **Soft Delete** — users and movies are deactivated, not hard-deleted

---

## 💳 Stripe Integration

Currently uses **mock payment** — no real charges. To enable real Stripe:

1. Set `STRIPE_SECRET_KEY` in `.env`
2. In `subscription.controller.js`, replace the mock block with:

```js
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const paymentIntent = await stripe.paymentIntents.create({
  amount: planConfig.price,
  currency: planConfig.currency,
  payment_method: paymentMethodId,
  confirm: true,
  automatic_payment_methods: { enabled: true, allow_redirects: "never" },
});
```

---

## 📧 Email Setup

Uses Nodemailer. For Gmail:
1. Enable 2FA on your Google account
2. Generate an App Password
3. Set `EMAIL_USER` and `EMAIL_PASS` in `.env`

Templates included:
- Welcome email (on signup)
- Password reset email (10-min expiry link)
- Subscription confirmation email

---

## 🔗 Connecting to the Frontend

Update your Next.js frontend's `src/lib/api.ts`:

```ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export const api = {
  signup: (data) => fetch(`${API_BASE}/auth/signup`, { method: "POST", body: JSON.stringify(data), credentials: "include" }),
  login:  (data) => fetch(`${API_BASE}/auth/login`,  { method: "POST", body: JSON.stringify(data), credentials: "include" }),
  movies: (params) => fetch(`${API_BASE}/movies?${new URLSearchParams(params)}`),
  subscribe: (plan) => fetch(`${API_BASE}/subscriptions`, { method: "POST", body: JSON.stringify({ plan }), credentials: "include" }),
};
```

---

## 🧪 Test Credentials (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@cinemax.com` | `Admin@1234` |
| User (Premium) | `alex@example.com` | `Alex@1234` |

---

## 🚢 Deployment

### Environment variables for production:
```env
NODE_ENV=production
MONGO_URI=mongodb+srv://...
JWT_SECRET=<strong-random-64-char-string>
CLIENT_URL=https://yourdomain.com
```

### Deploy options:
- **Railway** — `railway up`
- **Render** — connect GitHub repo, set env vars
- **Heroku** — `git push heroku main`
- **DigitalOcean App Platform** — Docker or Node buildpack
- **VPS** — PM2 + Nginx reverse proxy

---

## 📄 License

MIT — use freely for personal and commercial projects.
