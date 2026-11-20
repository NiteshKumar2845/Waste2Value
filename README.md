# ♻️ Waste2Value — Smart Waste Exchange Platform

Users list recyclable / e-waste, nearby verified collectors accept it, the collector verifies the weight on site, and the user is rewarded with both cash payout and **Waste Coins** (redeemable via simulated UPI transfer). Every user also gets a shareable **Waste Passport** (kg recycled, estimated impact, earnings, Green Score).

**Stack:** Node.js + Express + MongoDB (Mongoose) · React + Vite · JWT auth                                                 

**Stack:** Node.js + Express + MongoDB (Mongoose) · React + Vite · JWT auth

## Folder structure

```
waste2value/
├── backend/
│   ├── server.js              # app entry
│   ├── .env / .env.example    # config (port, DB, JWT secret, commission %)
│   ├── config/db.js           # MongoDB connection
│   ├── models/                # User, Listing, Transaction (+ GeoJSON point schema)
│   ├── controllers/           # auth, listing, passport, collector, admin, meta
│   ├── routes/                # one router per controller
│   ├── middleware/            # auth (JWT + roles), error handling
│   ├── utils/                 # rate card, impact + Green Score maths, helpers
│   └── scripts/seed.js        # demo accounts
└── frontend/
    ├── index.html, vite.config.js, .env
    └── src/
        ├── main.jsx, App.jsx, api.js, styles.css
        ├── context/AuthContext.jsx
        ├── components/        # Navbar, ProtectedRoute, PassportCard, StatusBadge
        ├── pages/             # Home, Login, Register, Dashboard, NewListing, Passport, PublicPassport
        └── pages/dashboards/  # User, Collector, Admin
```

## Run it locally

You need Node 18+ and a MongoDB instance (local `mongod` or a free MongoDB Atlas cluster — put its URI in `backend/.env`).

```bash
# Terminal 1 - API
cd backend
npm install
npm run seed      # optional: creates demo admin / collector / user
npm run dev       # http://localhost:5000

# Terminal 2 - Web app
cd frontend
npm install
npm run dev       # http://localhost:5173
```

Demo logins (after `npm run seed`):

| Role      | Email               | Password       |
|-----------|---------------------|----------------|
| User      | user@w2v.test       | User@123       |
| Collector | collector@w2v.test  | Collector@123  |
| Admin     | admin@w2v.test      | Admin@123      |

The seeded collector is in Ghaziabad (28.6692, 77.4538, 15 km radius). When you create a listing as the demo user, use coordinates near there (or "Use my location" if you're nearby) so the collector sees it.

## The flow

1. **User** posts a listing (categories + approx kg + address + location + preferred time). The form shows an instant value estimate and how many verified collectors are nearby.
2. **Collector** (admin-verified) sees open listings inside their service radius (MongoDB `2dsphere` geo query) and accepts one. Acceptance is atomic, so two collectors can't take the same pickup.
3. **User** can reschedule or cancel until the pickup is done.
4. **Collector** weighs on site, enters actual kg → value is recalculated from the rate card.
5. Wallet is credited, a `Transaction` row stores gross value and the platform commission (`COMMISSION_PERCENT`, charged to the collector).
6. The **Waste Passport** is recomputed from completed pickups. `/passport/<id>` is a public, shareable page that hides earnings.

## API summary

| Method | Route | Who |
|---|---|---|
| POST | `/api/auth/register`, `/api/auth/login` | public |
| GET / PUT | `/api/auth/me`, `/api/auth/profile` | logged in |
| GET | `/api/meta/rates` | public |
| POST | `/api/listings/estimate` | public |
| POST / GET | `/api/listings`, `/api/listings/mine` | user, business |
| PATCH | `/api/listings/:id/schedule`, `/:id/cancel` | owner |
| GET | `/api/listings/nearby`, `/api/listings/assigned` | collector |
| PATCH | `/api/listings/:id/accept` | verified collector |
| POST | `/api/listings/:id/verify` | assigned collector (weights → payout) |
| GET | `/api/collectors/nearby?lat&lng&radius` | logged in |
| GET | `/api/passport/me`, `/api/passport/public/:passportId` | user / public |
| GET / PATCH | `/api/admin/stats`, `/api/admin/collectors`, `/api/admin/collectors/:id/verify` | admin |

## Things to know before going further

- **Rates and impact factors are placeholders** (`backend/utils/wasteConfig.js`). Replace the ₹/kg rates with real local scrap prices, and the CO₂ factors with a cited source (e.g. EPA WARM) before showing impact numbers publicly.
- **The wallet is a ledger only.** Real payouts (UPI / Razorpay / bank transfer) are not implemented.
- **Verification & fraud:** collector verification is a manual admin toggle for now. Real KYC, photo proof of weighing, ratings and dispute handling are natural next steps.
- Payout + wallet credit are two separate writes; wrap them in a MongoDB transaction (needs a replica set, which Atlas gives you) before handling real money.
- Before deploying: set a long random `JWT_SECRET`, `NODE_ENV=production`, `CLIENT_URL` to your site, and `VITE_API_URL` in the frontend.

## Ideas for next steps

Photo upload (Cloudinary/S3), map view (Leaflet), email/SMS/WhatsApp notifications, ratings, an admin-editable rate card, a corporate dashboard (ESG report PDF, subscription plans), and recycler commission billing.
