const { Server } = require('socket.io');

let io = null;

const allowedOrigins = [
  'http://localhost:4004',
  'http://localhost:4005',
  'http://localhost:4006',
  'http://127.0.0.1:4004',
  'http://127.0.0.1:4005',
  'http://127.0.0.1:4006',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
];

function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
  });

  io.on('connection', (socket) => {
    // Client joins their personal user room for direct notifications
    socket.on('join_user', (userId) => {
      if (userId) {
        socket.join(`user_${userId}`);
      }
    });

    socket.on('leave_user', (userId) => {
      if (userId) {
        socket.leave(`user_${userId}`);
      }
    });

    socket.on('disconnect', () => {
      // Disconnected cleanly
    });
  });

  return io;
}

function getIO() {
  return io;
}

module.exports = {
  initSocket,
  getIO,
};
