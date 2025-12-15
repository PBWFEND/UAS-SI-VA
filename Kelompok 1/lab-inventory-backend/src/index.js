require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require('helmet');

const authRoutes = require('./routes/auth');
const inventoryRoutes = require('./routes/inventory');

const app = express();

// middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// routes
app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes); // <-- diperbaiki di sini

// health check
app.get('/api', (req, res) => res.json({ status: 'ok' }));

// server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
