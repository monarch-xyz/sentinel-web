# Megabat Web App Auth Context

## Model
- Megabat is the control plane and canonical account system.
- The web app uses browser session auth through Megabat.
- Programmatic clients use Megabat API keys.
- Both resolve to the same Megabat owner id.

## Frontend Boundaries
- Browser calls this app on same-origin `/api/*`.
- This app acts as a thin proxy to Megabat `/api/v1/*`.
- The frontend does not call Delivery directly.
- The frontend never stores or handles user API keys.

## Auth Flow
1. `POST /api/auth/siwe/nonce`
2. `POST /api/auth/siwe/verify`
3. Megabat returns and sets `megabat_session`
4. App boot uses `GET /api/auth/me`
5. Logout uses `POST /api/auth/logout`

## Product Routes
- Signals use Megabat `/signals`
- Simulations use Megabat `/simulate/*`
- Telegram settings use Megabat `/me/integrations/telegram*`

## Environment
```env
NEXT_PUBLIC_TELEGRAM_BOT_HANDLE=sentinel_beta_bot
MEGABAT_API_BASE_URL=http://localhost:3000/api/v1
DELIVERY_BASE_URL=http://localhost:3100
```

## Non-Goals
- No Supabase auth or profile layer
- No wallet-cookie fallback session model
- No Delivery-side linking from the frontend
- No per-user API-key storage in this app
