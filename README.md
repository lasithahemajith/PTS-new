# 🎓 EIT Practicum Tracking System

A full-stack web application designed to streamline practicum tracking, feedback management, and performance evaluation for students, mentors, and tutors at the Eastern Institute of Technology (EIT).

---

## 🧭 Overview

This system helps EIT's School of Computing manage practicum activities for Mental Health & Addiction students.
It allows students to log practicum hours, mentors to verify logs and provide feedback, and tutors to monitor overall student progress — all in one central dashboard.

---

## 🧩 Project Structure

```
PTS-new/
├── BE/                    # Backend (Node.js + Express + Mongoose + MongoDB)
│   ├── src/
│   │   ├── app.js         # Express entry point
│   │   ├── config/        # Database configuration
│   │   ├── controllers/   # Business logic
│   │   ├── middlewares/   # Auth & role middleware
│   │   ├── models/        # Mongoose models
│   │   ├── routes/        # API endpoints
│   │   ├── seeds/         # Database seeding scripts
│   │   ├── services/      # Service layer
│   │   └── utils/         # JWT utilities
│   ├── uploads/           # File upload storage
│   ├── .env.example       # Environment variable template
│   ├── Dockerfile
│   └── package.json
│
├── FE/                    # Frontend (React + Vite + TailwindCSS)
│   ├── src/
│   │   ├── api/           # Axios setup & interceptors
│   │   ├── components/    # Reusable UI components
│   │   ├── context/       # Auth context (Tutor / Mentor / Student)
│   │   ├── pages/         # All main pages
│   │   └── App.jsx        # Root app
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml
└── README.md
```

---

## ⚙️ Tech Stack

### Backend
- **Node.js + Express.js**
- **MongoDB** with **Mongoose ODM** (single database for all data)
- **JWT Authentication**
- **bcryptjs** for password hashing
- **dotenv**, **multer** for env config and file uploads
- **exceljs** / **json2csv** for report exports

### Frontend
- **React + Vite**
- **TailwindCSS**
- **Framer Motion**
- **Axios**
- **React Router v7**
- **Zustand** for state management

---

## 🗄️ Database Architecture (MongoDB Only)

All data is stored in a single MongoDB database with the following collections:

| Collection | Purpose |
|------------|---------|
| `users` | User accounts (Students, Mentors, Tutors) |
| `mentorstudentmaps` | Mentor ↔ Student assignments |
| `attendances` | Class & Practicum attendance records |
| `logpapers` | Practicum activity logs with file attachments |
| `mentorfeedbacks` | Mentor feedback on log papers |
| `tutorfeedbacks` | Tutor evaluations on log papers |

---

## 🧠 Core Features

| Role | Features |
|------|-----------|
| **Student** | Submit practicum logs, view feedback, track hours, record attendance |
| **Mentor** | Review & verify logs, comment, view assigned students' attendance |
| **Tutor (Admin)** | Manage users, assign mentors, view reports, export data |

---

## 🚀 Local Setup Guide

### 📌 1. Prerequisites

Install the following before running the project:

- **Node.js (LTS)** → https://nodejs.org/
- **Git** → https://git-scm.com/
- **MongoDB Community Edition** → https://www.mongodb.com/try/download/community

Verify installations:
```bash
node -v
npm -v
git --version
mongod --version
```

---

### 📥 2. Clone the Repository

```bash
git clone <your-repository-url>
cd PTS-new
```

---

### 🍃 3. MongoDB Setup

MongoDB is the **only** database used in this project.

**Start MongoDB service:**

**Windows:**
```
Win + R → services.msc → Ensure "MongoDB" service is running
```
Or manually:
```bash
net start MongoDB
```

**macOS / Linux:**
```bash
brew services start mongodb-community
# or
sudo systemctl start mongod
```

**Verify MongoDB is running:**
```bash
mongosh
```
MongoDB will automatically create the `practicum` database when first used.

---

### 🧱 4. Backend Setup (`/BE`)

**Step 1 — Navigate to backend:**
```bash
cd BE
```

**Step 2 — Install dependencies:**
```bash
npm install
```

**Step 3 — Configure environment variables:**

Create a `.env` file inside `/BE`:
```env
PORT=5000
JWT_SECRET=your_jwt_secret_here
MONGODB_URI=mongodb://127.0.0.1:27017/practicum
UPLOAD_PATH=uploads/logpapers
SUPERADMIN_EMAIL=admin@eit.ac.nz
SUPERADMIN_PASSWORD=Admin@123
```

> See `.env.example` for the template.

**Step 4 — Create uploads directory:**
```bash
mkdir -p uploads/logpapers
```

**Step 5 — Seed the super admin account:**
```bash
npm run seed
```

This creates the default admin account:
- **Email:** `admin@eit.ac.nz`
- **Password:** `Admin@123`

**Step 6 — Start the backend:**
```bash
npm run dev
```

Backend runs at: **http://localhost:5000**

---

### 🖥️ 5. Frontend Setup (`/FE`)

Open a new terminal:

**Step 1 — Navigate to frontend:**
```bash
cd FE
```

**Step 2 — Install dependencies:**
```bash
npm install
```

**Step 3 — Configure frontend environment:**

Create a `.env` file inside `/FE`:
```env
VITE_API_URL=http://localhost:5000
```

**Step 4 — Start the frontend:**
```bash
npm run dev
```

Frontend runs at: **http://localhost:5173**

---

### 🔐 Default Login Credentials

| Field | Value |
|-------|-------|
| Email | `admin@eit.ac.nz` |
| Password | `Admin@123` |

---

## 🐳 Docker Deployment

To run the entire stack with Docker:

```bash
# Ensure ./BE/.env exists and is configured
docker-compose up --build
```

Services started:
- **MongoDB** on port `27017`
- **Backend** on port `5000`
- **Frontend** on port `80`

---

## 🧹 Git Hygiene

These files should **not** be committed (already in `.gitignore`):
```
node_modules/
.env
uploads/
```

---

## 🚨 Common Issues & Fixes

### ❌ MongoDB Not Connecting
- Ensure MongoDB service is running
- Check `MONGODB_URI` in `.env`
- Default port is `27017`

### ❌ Port 5000 Already in Use

Find and stop the process using port 5000 in your OS task manager or terminal.

### ❌ Upload Folder Missing
```bash
mkdir -p BE/uploads/logpapers
```

### ❌ Seed fails
- Ensure `MONGODB_URI` is set in `.env`
- Ensure MongoDB is running before seeding

---

## 💡 MySQL Migration Note

This project was migrated from a hybrid MySQL + MongoDB architecture to **MongoDB-only**.
If you have existing data in MySQL, you can export it with:

```bash
mysqldump -u root -p practicum > practicum_backup.sql
```

Then manually migrate the following records to MongoDB:

| MySQL Table | MongoDB Collection |
|-------------|-------------------|
| `User` | `users` |
| `MentorStudentMap` | `mentorstudentmaps` |
| `Attendance` | `attendances` |

You can use **MongoDB Compass** or write a one-off migration script to import the data.
Note that user IDs change from integers to ObjectId strings after migration —
update any foreign key references accordingly.

---

## ✅ Setup Checklist

- [ ] Node.js installed
- [ ] MongoDB running
- [ ] `.env` file configured in `/BE`
- [ ] `npm install` run in `/BE`
- [ ] `npm run seed` run to create super admin
- [ ] Uploads folder created (`BE/uploads/logpapers`)
- [ ] Backend running (`http://localhost:5000`)
- [ ] `.env` file configured in `/FE` (`VITE_API_URL=http://localhost:5000`)
- [ ] `npm install` run in `/FE`
- [ ] Frontend running (`http://localhost:5173`)

Your PTS system should now be running locally 🎉
