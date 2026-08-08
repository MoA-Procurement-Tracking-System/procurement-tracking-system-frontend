# MoA Procurement Tracking System Frontend

Next.js frontend for the Ministry of Agriculture procurement planning,
tracking, and reporting system.

## Local setup

1. Install dependencies:

   ```bash
   npm ci
   ```

2. Copy `.env.example` to `.env.local` and set the authentication API URL and
   paths for your backend.

3. Start the development server:

   ```bash
   npm run dev
   ```

Open <http://localhost:3000>.

## Authentication configuration

The sign-in form sends `{ email, password }` to the configured login endpoint.
Password recovery sends `{ email }` to the configured reset endpoint.

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_AUTH_LOGIN_PATH=/Auth/login
NEXT_PUBLIC_AUTH_PASSWORD_RESET_PATH=/Auth/forgot-password
```

## Quality checks

```bash
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
```
