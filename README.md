# RUCHI - Food Sharing & Homemade Food Pre-Orders

> **Brand Vision**: *"Share Food. Spread Happiness."*  
> **Initial Launch Market**: Hyderabad, Telangana, India  
> **Technology Stack**: Next.js (JavaScript / JSX) + Node.js (Express.js) + MySQL (via XAMPP)

---

## 🌟 Overview

RUCHI uniquely unites two distinct community services within one cohesive local platform:
1. **Free Surplus-Food Sharing / Donation**: Eliminating edible food waste at zero charge (₹0). Donors (caterers, banquets, restaurants, individuals) post surplus meals with strict safe collection deadlines and temperature handling notes.
2. **Homemade Food Pre-Orders**: Giving certified local home cooks a predictable advance booking system. Customers pre-book limited portions before cooking begins.

---

## 🔒 Strict Core Business Rules (Server & Database Enforced)

1. **The Four-Customer-Order Rule**:
   - Each cooking post can accept a maximum of **4 distinct customer bookings/orders**.
   - Each customer can order multiple plates (e.g., 2, 3, or more plates), bounded only by the remaining plate capacity.
   - Once 4 separate customers have placed confirmed bookings, the post is automatically locked and set to `SOLD_OUT`—even if plates remain—to protect the home cook from being overwhelmed and ensure consistent culinary quality.
2. **Automatic 30-Minute Cutoff**:
   - Formula: `order_closes_at = cooking_starts_at - 30 minutes` (calculated in `Asia/Kolkata` IST).
   - The Node.js Express backend and MySQL row locks strictly reject incoming orders once current server time reaches the cutoff.
   - Background worker checks every 30 seconds to transition expired posts to `CLOSED` and notify cooks.
3. **Mandatory Separation**:
   - Free Food Sharing is visually distinguished in Forest Green (`#174D36`) with ₹0 transparent booking.
   - Paid Pre-Orders are badged in Warm Orange (`#F5A623`) with pricing in INR (₹) and FSSAI compliance disclaimers.

---

## 📁 Project Architecture

```
Ruchi Food sharing/
├── backend/                  # Node.js + Express REST API (JavaScript)
│   ├── config/
│   │   └── db.js            # MySQL connection pool (XAMPP localhost:3306)
│   ├── cron/
│   │   └── cutoffWorker.js  # Scheduled job for 30m cutoff & donation expiry
│   ├── routes/
│   │   ├── auth.js          # Facebook OAuth & Phone OTP login
│   │   ├── preorders.js     # Concurrency-safe transactional booking
│   │   ├── donations.js     # Free food post creation and claiming
│   │   ├── notifications.js # Nearby alerts & order updates
│   │   └── admin.js         # Trust & safety, moderation & metrics
│   ├── scripts/
│   │   └── init_db.js       # Auto-creates ruchi_db, runs schema and seeds
│   ├── .env                 # Environment variables
│   ├── package.json
│   └── server.js            # Express server (Port 5000)
│
├── frontend/                 # Next.js App Router (JavaScript / JSX only)
│   ├── src/
│   │   ├── app/
│   │   │   ├── globals.css  # RUCHI branding colors & typography
│   │   │   ├── layout.jsx   # Root layout with AppProvider
│   │   │   └── page.jsx     # Main feed with responsive dual-service tabs
│   │   ├── components/
│   │   │   ├── Header.jsx   # Navigation, Hyderabad picker, notifications
│   │   │   ├── HeroBanner.jsx # Search, radius filters (2/5/10 km), diet tags
│   │   │   ├── PreOrderCard.jsx # 4-Customer slot visualizer & cutoff countdown
│   │   │   ├── FreeFoodCard.jsx # Free food portions & safe expiry timer
│   │   │   ├── OrderModal.jsx   # Atomic booking modal with UPI/Cash options
│   │   │   ├── CreatePreOrderModal.jsx # Cook post with auto 30m cutoff
│   │   │   ├── CreateDonationModal.jsx # Surplus food post form
│   │   │   ├── DashboardView.jsx # Customer & Cook order tracking
│   │   │   ├── AdminView.jsx    # Moderation & emergency controls
│   │   │   ├── AuthModal.jsx    # Facebook login & OTP fallback
│   │   │   └── SafetyModal.jsx  # FSSAI compliance & guidelines
│   │   ├── context/
│   │   │   └── AppContext.jsx   # State, role switching, and API hooks
│   │   └── lib/
│   │       ├── api.js           # REST API client
│   │       └── constants.js     # Hyderabad pilot areas & categories
│   ├── tailwind.config.js
│   ├── jsconfig.json
│   └── package.json
│
└── database/
    ├── ruchi_schema.sql     # Complete MySQL DDL (17 tables with constraints)
    └── seed.sql             # Hyderabad pilot seed data
```

---

## 🚀 How to Run Locally

### 1. Ensure XAMPP MySQL is Running
1. Open **XAMPP Control Panel**.
2. Start the **MySQL** module (default port `3306`).
3. You can verify and manage databases via **phpMyAdmin** at `http://localhost/phpmyadmin`.

### 2. Initialize Database
From the project root:
```bash
cd backend
npm run db:init
```
*(This automatically creates `ruchi_db` and loads the schema and pilot seeds).*

### 3. Start Backend API
```bash
cd backend
npm start
```
- API Base URL: `http://localhost:5000/api`
- Health Check: `http://localhost:5000/api/health`

### 4. Start Tri-Portals
In separate terminals:
```bash
# Customer Portal (Port 4004)
npm --prefix customer-portal run dev

# Admin Portal (Port 4005)
npm --prefix admin-portal run dev

# Partner / Cook Portal (Port 4006)
npm --prefix partner-portal run dev

# Backend API & Socket.IO (Port 7001)
node backend/server.js
```
- Customer Web App: `http://localhost:4004`
- Admin Ops Portal: `http://localhost:4005`
- Partner Cook Portal: `http://localhost:4006`
- Backend REST API: `http://localhost:7001/api`

---

## 🎨 Branding & Visual Palette

| Element | Hex Code | Purpose |
| :--- | :--- | :--- |
| **Primary** | `#174D36` | Forest Green (Freshness, Trust & Community) |
| **Secondary** | `#65A878` | Fresh Green (Free food badges & verification) |
| **Accent** | `#F5A623` | Warm Orange (Cook pre-orders & urgent cutoffs) |
| **Background** | `#FFF9EE` | Warm Cream (Friendly, accessible background) |

---

## 🧪 Testing Checklist Included

- [x] **Facebook OAuth & Phone OTP**: Instant simulated Facebook login and SMS OTP fallback.
- [x] **Four-Customer Booking Limit**: Real-time slot progress meter (● ● ○ ○) and strict backend rejection of the 5th customer.
- [x] **Automatic 30-Minute Cutoff**: Live countdown timer, automatic transition to `CLOSED`, and backend rejection after cutoff.
- [x] **Free Surplus Food Reservation**: Zero-fee claim with safe consumption deadline and handling notes.
- [x] **Cook Status Stepper**: `Confirmed` $\rightarrow$ `Preparing` $\rightarrow$ `Ready for Pickup` $\rightarrow$ `Collected`.
- [x] **Admin Trust & Safety**: Real-time pilot metrics, user grievance queue, and emergency post pause.
