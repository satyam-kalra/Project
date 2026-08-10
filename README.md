# SpareSeat

SpareSeat is a peer to peer ride sharing platform for Newfoundland and Labrador.
It is built around cost sharing and route focused matching.

## MVP scope

- Create rider and driver accounts with phone verification state
- Driver verification record with license upload path
- Ride posting with route based contribution cap
- Scheduled ride search by route and date
- Ride Now request capture
- Mutual ratings and issue reporting
- Moderation queue view for trust and safety review
- Server rendered About, FAQ, and Trust pages
- Mobile web app metadata with installable manifest

## Quick start

1. Install dependencies
2. Run Prisma migration
3. Start the app

```bash
npm install
npx prisma migrate dev --name init
npm run dev
```

## Validation commands

```bash
npm run lint
npm run build
```
