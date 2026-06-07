# 💸 SpendWise — Personal Expense Tracker

A full-stack personal expense tracker with authentication, CRUD operations, and beautiful analytics.

**Stack:** React + Vite · Node.js + Express · PostgreSQL · Prisma ORM · Recharts

---

## ✨ Features

- 🔐 **Auth** — Register & login with JWT (tokens persist across sessions)
- ➕ **Add Expenses** — Title, amount, category, date, optional notes
- 📋 **Expense List** — Filter by category, month, year; paginated table
- ✏️ **Edit & Delete** — Full CRUD with confirmation dialogs
- 📊 **Analytics** — Monthly bar chart + category pie chart with % breakdown
- 📱 **Responsive** — Mobile-friendly with bottom nav and drawer sidebar

### Categories
Food & Dining · Bills & Utilities · Entertainment · Shopping · Transport · Healthcare · Education · Travel · Fitness · Personal Care · Investments · Other

---

## 🚀 Setup

### 1. Prerequisites
- Node.js 18+
- PostgreSQL 14+ running locally

### 2. Clone & Install
```bash
git clone <repo>
cd expense-tracker
npm install             # root (concurrently)
npm run install:all     # installs server + client deps
```

### 3. Configure Environment

**Server** — copy `.env.example` to `.env`:
```bash
cp server/.env.example server/.env
```

Edit `server/.env`:
```env
DATABASE_URL="postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/expense_tracker"
JWT_SECRET="change-this-to-a-long-random-string"
PORT=5000
CLIENT_URL="http://localhost:5173"
```

**Client** — create `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Create Database
```bash
# In PostgreSQL
createdb expense_tracker

# OR in psql
psql -U postgres -c "CREATE DATABASE expense_tracker;"
```

### 5. Run Migrations
```bash
npm run db:setup
```
This runs `prisma generate` + `prisma db push` to create tables.

### 6. Start Development
```bash
npm run dev
```
- API: http://localhost:5000
- App: http://localhost:5173

---

## 📁 Project Structure

```
expense-tracker/
├── server/
│   ├── prisma/
│   │   └── schema.prisma       # DB schema (User, Expense)
│   └── src/
│       ├── index.js             # Express app entry
│       ├── lib/prisma.js        # Prisma client
│       ├── middleware/auth.js   # JWT middleware
│       └── routes/
│           ├── auth.js          # POST /register, /login, GET /me
│           ├── expenses.js      # Full CRUD /expenses
│           └── analytics.js    # /monthly, /categories, /summary
└── client/
    └── src/
        ├── api/client.js        # Axios instance with interceptors
        ├── context/AuthContext  # Auth state + helpers
        ├── components/
        │   ├── Sidebar.jsx      # Nav sidebar + mobile drawer
        │   ├── ExpenseModal.jsx # Add/Edit modal
        │   └── ProtectedRoute
        ├── pages/
        │   ├── Login.jsx
        │   ├── Register.jsx
        │   ├── Dashboard.jsx    # Summary stats + recent
        │   ├── Expenses.jsx     # Table with filters + CRUD
        │   └── Analytics.jsx   # Bar chart + pie chart
        └── utils/constants.js  # Categories, formatters
```

---

## 🔌 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/expenses` | List expenses (filter: category, month, year) |
| POST | `/api/expenses` | Create expense |
| PUT | `/api/expenses/:id` | Update expense |
| DELETE | `/api/expenses/:id` | Delete expense |
| GET | `/api/analytics/summary` | This month / last month totals |
| GET | `/api/analytics/monthly` | Monthly totals for last N months |
| GET | `/api/analytics/categories` | Category breakdown for a month |

All `/expenses` and `/analytics` routes require `Authorization: Bearer <token>` header.

---

## 🏗️ Production Build

```bash
cd client && npm run build     # outputs to client/dist/
```