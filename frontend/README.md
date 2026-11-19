# Waste2Value

React and Vite frontend for the Waste2Value recycling marketplace.

## Run locally

Start MongoDB, then configure and start the backend:

```powershell
cd backend
Copy-Item .env.example .env
npm install
npm run dev
```

Set `MONGO_URI` to the MongoDB connection string and replace `JWT_SECRET` in `backend/.env`. The backend listens on port 5000 by default.

In a second terminal, start the frontend:

```powershell
cd frontend
npm install
npm run dev
```

Vite serves the app at `http://localhost:5173`. Its `/api` proxy reads `PORT` from `backend/.env` and targets `127.0.0.1` on that port (5000 by default). To override the backend origin, set `VITE_BACKEND_URL`; to bypass the proxy, set `VITE_API_URL` to the full API base URL, including `/api`.

The backend can serve `/api/health`, `/api/meta/rates`, and `/api/listings/estimate` without MongoDB. Other API routes return HTTP 503 until `MONGO_URI` points to a running MongoDB instance. Authentication routes also require `JWT_SECRET`.

## Dashboard and API coverage

- Users and businesses can create listings, review and filter their own listings, reschedule or cancel open and accepted pickups, and view their private or public Waste Passport.
- Collectors can set their service area, review nearby requests, accept pickups, and confirm actual weights to complete them.
- Admins can review marketplace statistics and verify or revoke collector verification.
- Profile settings use the existing authenticated profile update endpoint.

The backend currently has no APIs for general user management, admin listing CRUD, user listing discovery, rejecting pickups, transaction history, complaints, or pagination. The frontend does not present those actions.

## Production build

```powershell
cd frontend
npm run build
```
