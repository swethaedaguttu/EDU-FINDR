# EDU‑FINDR

A mini Next.js + MySQL app to add and browse schools with image uploads, validation, search and pagination.

Live : https://edu-findr.onrender.com

## Features
- Add School form using `react-hook-form` with client/server validation
- Image upload + compression (Sharp), stored in `public/schoolImages`
- Schools listing with search, filters, and pagination (3 cards/page)
- Responsive UI with a clean, modern design and brand logo
- MySQL connection via `mysql2/promise`

## Stack
- Next.js (Pages Router)
- React, SWR
- MySQL (`mysql2/promise`)
- Formidable (multipart parsing)
- Sharp (image processing)

## Prerequisites
- Node.js 18+
- MySQL/MariaDB running locally (default port 3306)

## Quick Start
```bash
# 1) Install deps
npm install

# 2) Create env file
copy .env.local.example .env.local
# then edit .env.local if needed

# 3) Create database + table
# Open MySQL client and run schema.sql

# 4) Start dev server
npm run dev
# App: http://localhost:3000
```

```

### Database Schema
See `schema.sql` or run:
```sql
CREATE DATABASE IF NOT EXISTS `schools_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `schools_db`;

CREATE TABLE IF NOT EXISTS `schools` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` TEXT NOT NULL,
  `address` TEXT NOT NULL,
  `city` TEXT NOT NULL,
  `state` TEXT NOT NULL,
  `contact` BIGINT NOT NULL,
  `image` TEXT NOT NULL,
  `email_id` TEXT NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;

-- Optional: prevent duplicate emails
ALTER TABLE `schools` ADD UNIQUE KEY `uniq_email` (`email_id`(191));
```

## Scripts
```bash
npm run dev     # start Next dev server
npm run build   # production build
npm start       # run production build
```

## Project Structure
```
pages/
  index.js          # homepage (hero + feature cards)
  addSchool.jsx     # add school form
  showSchools.jsx   # schools listing (search, filters, pagination)
  api/schools/      # GET(list) + POST(create with image)
lib/db.js           # MySQL pool
public/schoolImages # uploaded images (served statically)
styles/globals.css  # global styling
```

## API
### POST /api/schools
Multipart form fields: `name, address, city, state, contact, email_id, image`

### GET /api/schools
Query params: `page, limit, q, city, sort`

## File Uploads
- Temp files go to `public/temp` during processing
- Final images saved as JPEG in `public/schoolImages`

## Troubleshooting
- Port already in use: stop the other Next dev server or use the alternate port it suggests (e.g., 3001)
- MySQL auth errors: ensure user uses `mysql_native_password`; create a dedicated user if needed
- Large images: server compresses; client accepts common image types

## Git Hygiene
`.gitignore` excludes `node_modules/`, `.next/`, `public/temp/`, logs, and env files

---
Made with ❤️ for the EDU‑FINDR assignment.
