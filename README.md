# Global Chat Demo

An intentionally simple public chat for educational purposes. It stores display names and messages in MySQL. There is **no authentication, password, moderation, rate limiting, or privacy protection**.

## Run locally

1. Install Node.js 20+ and MySQL.
2. Create the schema: `mysql -u root -p < schema.sql`
3. Copy `.env.example` to `.env` and set the MySQL password.
4. Install and start: `npm install && npm start`
5. Open `http://localhost:3000`.

## Deploy to Railway

Create a Railway project, add a MySQL service, and deploy this repository as a service. Railway provides `MYSQLHOST`, `MYSQLPORT`, `MYSQLUSER`, `MYSQLPASSWORD`, and `MYSQLDATABASE` to linked services. Run `schema.sql` once against that database, then generate a public domain for the app service. The included `railway.json` uses `npm start`.

This repository cannot log into your Railway account, create a project, provision a database, or generate a domain on your behalf.
