# The Kabwe Spa

Mobile app for Zarah's Massage Spa Kabwe (Highridge, Kabwe).

## Structure

- `app/` — the mobile app (Expo / React Native + TypeScript)
- `server/` — the backend API (Express, JSON file storage) that holds accounts, prices, appointments, transactions and promo codes

## Running it locally

**1. Start the backend**

```bash
cd server
npm install
copy .env.example .env
npm start
```

The API runs on `http://localhost:4000`. Default admin login is `admin` / `KabweAdmin2026` — change it from Admin → Change Admin Password after first sign-in, or edit `server/.env` before first start.

**2. Start the app**

```bash
cd app
npm install
npm start
```

This opens Expo dev tools — press `w` for web, or scan the QR code with Expo Go on your phone.

If you're testing on a **physical phone**, the app needs your computer's LAN IP (not `localhost`) to reach the backend. Update `LOCAL_HOST` fallback in `app/src/api/client.ts` or set it to your machine's IP (e.g. `192.168.1.20`).

## Accounts

- Guests sign up with a username and password from the app itself.
- Staff use the "Staff login" link on the sign-in screen to reach the admin dashboard, where prices, photos, takings/expenses, bookings and promo codes are managed.

## Contact details shown in the app

- Center: +26077686722
- WhatsApp: +260974068912, +260772180359
- Location: Highridge, Kabwe
