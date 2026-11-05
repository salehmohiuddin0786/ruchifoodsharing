const express = require('express');
const cors = require('cors');
require('dotenv').config();

const db = require('./config/db');
const { startCutoffWorker } = require('./cron/cutoffWorker');
const { startPollWorker } = require('./cron/pollWorker');

const path = require('path');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const partnerRoutes = require('./routes/partners');
const customerRoutes = require('./routes/customers');
const preorderRoutes = require('./routes/preorders');
const donationRoutes = require('./routes/donations');
const notificationRoutes = require('./routes/notifications');
const uploadRoutes = require('./routes/upload');
const curryRiceRoutes = require('./routes/curry_rice');
const pollRoutes = require('./routes/polls');

const app = express();
const PORT = process.env.PORT || 7001;

// CORS configuration supporting all 3 frontend portals
const allowedOrigins = [
  'http://localhost:4004', // Customer Portal
  'http://localhost:4005', // Admin Portal
  'http://localhost:4006', // Cook / Donor Partner Portal
  'http://127.0.0.1:4004',
  'http://127.0.0.1:4005',
  'http://127.0.0.1:4006',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static file serving for uploaded dish images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Request logging in development
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// Primary Shared REST API Endpoints for the 3 Portals
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/partners', partnerRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/preorders', preorderRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/curry-rice', curryRiceRoutes);
app.use('/api/polls', pollRoutes);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.json({
      status: 'healthy',
      database: 'connected (MySQL via XAMPP localhost:3306)',
      service: 'RUCHI Shared Backend API',
      port: PORT,
      timestamp: new Date().toISOString(),
      portals: {
        customer: 'http://localhost:4004 (Customer Portal)',
        admin: 'http://localhost:4005 (Admin Portal)',
        partner: 'http://localhost:4006 (Partner Portal)',
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message,
    });
  }
});

// Start Server with Socket.IO HTTP Server
const http = require('http');
const { initSocket } = require('./socket');

const server = http.createServer(app);
const io = initSocket(server);

server.listen(PORT, async () => {
  console.log(`=======================================================`);
  console.log(`🚀 RUCHI Node.js + Express Backend running on port ${PORT}`);
  console.log(`🌐 Local API Base: http://localhost:${PORT}/api`);
  console.log(`⚡ Socket.IO Real-time Engine initialized`);
  console.log(`🐬 Database: MySQL through XAMPP (ruchi_db on localhost:3306)`);
  console.log(`👥 Portals Supported:`);
  console.log(`   - Customer Portal: http://localhost:4004`);
  console.log(`   - Admin Portal:    http://localhost:4005`);
  console.log(`   - Partner Portal:  http://localhost:4006`);
  console.log(`=======================================================`);

  // Start background cutoff & expiry cron worker
  startCutoffWorker();
  // Start background dish poll expiry & auto-closure worker
  startPollWorker();
});
