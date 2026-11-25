require('dotenv').config();

const http = require('http');
const express = require('express');
const { Server } = require('socket.io');

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const noteRoutes = require('./routes/noteRoutes');
const { getAdminDashboard } = require('./controllers/authController');
const { authenticateToken, authorizeRoles } = require('./middleware/authMiddleware');
const setupSocket = require('./socket/chat');

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Parse incoming JSON bodies
app.use(express.json());

// Health check route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Secure Connect API is running.',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.get('/api/admin/dashboard', authenticateToken, authorizeRoles('admin'), getAdminDashboard);
app.use('/api/notes', noteRoutes);

// Handle unknown API routes
app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found.',
  });
});

// Initialize Socket.IO chat
setupSocket(io);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
