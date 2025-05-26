const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Express
const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*', // Allow all origins for now
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/slots', require('./routes/slotRoutes'));
app.use('/api/clinics', require('./routes/clinicRoutes'));
app.use('/api/clinicians', require('./routes/clinicianRoutes'));
app.use('/api/rota', require('./routes/rotaRoutes'));

// Health check route
app.get('/', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// Fallback error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server running on port ${PORT}`));
