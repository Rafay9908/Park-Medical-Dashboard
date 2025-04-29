const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

const userRoutes = require('./routes/userRoutes');
const slotRoutes = require('./routes/slotRoutes');

dotenv.config();
connectDB();

const app = express();
app.use(cors());

// ✅ If you want to restrict it to a specific origin (optional)
app.use(cors({
  origin: 'http://localhost:3000',  // change to your frontend domain
  credentials: true
}));
app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/slots', slotRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
