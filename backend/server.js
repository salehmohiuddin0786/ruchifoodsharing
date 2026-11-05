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
const PORT = process.env.PORT || 5001;

// CORS configuration supporting all 3 frontend portals
const allowedOrigins = [
  'http://localhost:3000', // Customer Portal (www.ruchi.com)
  'http://localhost:3001', // Admin Portal (admin.ruchi.com)
  'http://localhost:3002', // Cook / Donor Partner Portal (partner.ruchi.com)
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:3002',
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
        customer: 'http://localhost:3000 (www.ruchi.com)',
        admin: 'http://localhost:3001 (admin.ruchi.com)',
        partner: 'http://localhost:3002 (partner.ruchi.com)',
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
  console.log(`   - Customer Portal: http://localhost:3000`);
  console.log(`   - Admin Portal:    http://localhost:3001`);
  console.log(`   - Partner Portal:  http://localhost:3002`);
  console.log(`=======================================================`);

  // Start background cutoff & expiry cron worker
  startCutoffWorker();
  // Start background dish poll expiry & auto-closure worker
  startPollWorker();
});
