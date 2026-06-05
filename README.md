# DevPulse - Internal Tech Issue & Feature Tracker

## Live API

Live URL: https://assignment-2-pi-sable.vercel.app/

## Project Overview

DevPulse is a collaborative issue tracking platform designed for software development teams. It allows team members to report bugs, suggest feature requests, track issue progress, and manage issue workflows through role-based access control.

## Features

### Authentication & Authorization

* User Registration (Contributor / Maintainer)
* User Login with JWT Authentication
* Secure Password Hashing using bcrypt
* Role-Based Access Control (RBAC)

### Issue Management

* Create New Issues
* View All Issues
* View Single Issue Details
* Update Issues
* Delete Issues (Maintainer Only)

### Filtering & Sorting

* Filter by Issue Type

  * bug
  * feature_request
* Filter by Status

  * open
  * in_progress
  * resolved
* Sort Issues

  * newest
  * oldest

### Security Features

* JWT Protected Routes
* Password Encryption
* Authorization Middleware
* Role Verification

---

## Technology Stack

### Backend

* Node.js
* TypeScript
* Express.js

### Database

* PostgreSQL
* pg (Native PostgreSQL Driver)

### Authentication

* bcrypt
* jsonwebtoken (JWT)

### Deployment

* Vercel

---

## Project Structure

```bash
src/
│
├── modules/
│   ├── auth/
│   ├── user/
│   └── issue/
│
├── middleware/
│   └── auth.middleware.ts
│
├── config/
├── db/
├── types/
├── app.ts
└── server.ts
```

---

## Installation & Setup

### 1. Clone Repository

```bash
git clone https://github.com/protap1100/level-2-Assignment-2.git
cd level-2-Assignment-2
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create Environment Variables

Create a `.env` file in the root directory.

```env
PORT=5000

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=devpulse

JWT_SECRET=your_secret_key
```

### 4. Run Development Server

```bash
npm run dev
```

### 5. Build Project

```bash
npm run build
```

### 6. Start Production Server

```bash
npm start
```

---

## Database Schema Summary

### Users Table

| Field      | Type                     |
| ---------- | ------------------------ |
| id         | SERIAL PRIMARY KEY       |
| name       | VARCHAR                  |
| email      | VARCHAR UNIQUE           |
| password   | VARCHAR                  |
| role       | contributor / maintainer |
| created_at | TIMESTAMP                |
| updated_at | TIMESTAMP                |

### Issues Table

| Field       | Type                          |
| ----------- | ----------------------------- |
| id          | SERIAL PRIMARY KEY            |
| title       | VARCHAR(150)                  |
| description | TEXT                          |
| type        | bug / feature_request         |
| status      | open / in_progress / resolved |
| reporter_id | INTEGER                       |
| created_at  | TIMESTAMP                     |
| updated_at  | TIMESTAMP                     |

---

## API Endpoints

### Authentication

#### Register User

```http
POST /api/auth/signup
```

#### Login User

```http
POST /api/auth/login
```

---

### Issues

#### Create Issue

```http
POST /api/issues
```

Protected Route

#### Get All Issues

```http
GET /api/issues
```

Query Parameters:

```http
?sort=newest
?sort=oldest
?type=bug
?type=feature_request
?status=open
?status=in_progress
?status=resolved
```

#### Get Single Issue

```http
GET /api/issues/:id
```

#### Update Issue

```http
PATCH /api/issues/:id
```

Protected Route

#### Delete Issue

```http
DELETE /api/issues/:id
```

Maintainer Only

---

## Authorization Rules

### Contributor

* Create Issues
* View Issues
* Update Own Issue (Only when status is open)

### Maintainer

* All Contributor Permissions
* Update Any Issue
* Delete Any Issue
* Manage Issue Workflow

---

## API Response Format

### Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error description",
  "errors": "Error details"
}
```
---
## Author

Protap Biswas

## Repository

GitHub Repository:
https://github.com/protap1100/level-2-Assignment-2