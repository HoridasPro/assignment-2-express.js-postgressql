 # Project Name : DevPulse - Issue Tracker API
 
---

## Live URL

https://express-a2-postgressql.vercel.app

---

## Features

## Authentication & Authorization
- User signup & login
- JWT-based authentication
- Role-based access control (RBAC)
  - contributor
  - maintainer

---

## Issue Management
- Create new issues (bug / feature request)
- View all issues
- Update issues (maintainer only)
- Delete issues (maintainer only)
- Change issue status workflow (maintainer only)

---

## Security
- JWT authentication
- Password hashing using bcrypt
- Role-based route protection
- Global error handling
- Clean API response structure

---

## System Features
- Maintainer-only metrics endpoint
- Structured and consistent API responses
- PostgreSQL relational database design

---

## Tech Stack

- Node.js
- Express.js
- TypeScript
- PostgreSQL (Neon)
- JWT Authentication
- bcrypt
- node-postgres (pg)
- MVC + Service Layer Architecture
- Deployment: Vercel

---

## Setup Instructions

devDependencies": {
    "@types/express": "^5.0.6",
    "@types/jsonwebtoken": "^9.0.10",
    "@types/node": "^25.9.1",
    "@types/pg": "^8.20.0",
    "typescript": "^6.0.3"
  },
  "dependencies": {
    "bcryptjs": "^3.0.3",
    "dotenv": "^17.4.2",
    "express": "^5.2.1",
    "jsonwebtoken": "^9.0.3",
    "pg": "^8.21.0",
    "tsup": "^8.5.1",
    "tsx": "^4.22.3"
  }

 
  ## API Endpoint List (Issues Module)

- POST   /api/issues        → Create issue (auth required)
- GET    /api/issues        → Get all issues (public)
- GET    /api/issues/:id    → Get single issue (public)
- PUT    /api/issues/:id    → Update issue (auth required)
- DELETE /api/issues/:id    → Delete issue (auth required)
- GET /api/issues?sort=newest

- ## Database Schema Summary

The project uses PostgreSQL as the database to store users and issue data in a relational structure.

---

###  Users Table

Stores user account information and roles.

```sql id="db2"
id SERIAL PRIMARY KEY
name VARCHAR NOT NULL
email VARCHAR UNIQUE NOT NULL
password VARCHAR NOT NULL
role VARCHAR DEFAULT 'contributor'
created_at TIMESTAMP DEFAULT NOW()

 
