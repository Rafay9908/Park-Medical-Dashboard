const express = require('express');
const connectDB = require('./config/db');
const slotRoutes = require('./routes/slotRoutes');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger/swagger.json');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Connect DB
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());

// API routes
app.use('/api/slots', slotRoutes);

// Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

//Clinics
const clinicRoutes = require('./routes/clinicRoutes');
app.use('/api/clinics', clinicRoutes);

