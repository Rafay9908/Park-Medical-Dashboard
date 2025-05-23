const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

const userRoutes = require('./routes/userRoutes');
const slotRoutes = require('./routes/slotRoutes');
const clinicRoutes = require('./routes/clinicRoutes');
const clinicianRoutes = require('./routes/clinicianRoutes');
const rotaRoutes = require('./routes/rotaRoutes');
// const rotaRoutes = require('./routes/rotaRoutes');


dotenv.config();
connectDB();

const app = express();
app.use(cors());

app.use(cors({
  origin: 'http://localhost:5173',  
  credentials: true
}));
app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/slots', slotRoutes);
app.use('/api/clinics', clinicRoutes);
app.use('/api/clinicians', clinicianRoutes);
app.use('/rota', rotaRoutes);

app.use('/api/rota',rotaRoutes)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));