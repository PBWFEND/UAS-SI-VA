const express = require('express');
const cors = require('cors');

const app = express();

/**
 * ===== CORS CONFIG =====
 */
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

/**
 * ===== BODY PARSER =====
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * ===== DEBUG REQUEST  =====
 */
app.use((req, res, next) => {
  console.log('='.repeat(40));
  console.log(`${req.method} ${req.originalUrl}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  console.log('='.repeat(40));
  next();
});

/**
 * ===== ROOT =====
 */
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'API is running',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      borrowings: '/api/borrowings'
    }
  });
});

/**
 * ===== ROUTES =====
 */
console.log('Loading routes...');

app.use('/api/auth', require('./src/routes/authRoutes'));
console.log('✓ authRoutes mounted');

app.use('/api/users', require('./src/routes/userRoutes'));
console.log('✓ userRoutes mounted');

app.use('/api/borrowings', require('./src/routes/borrowingRoutes'));
console.log('✓ borrowingRoutes mounted');

/**
 * ===== 404 HANDLER =====
 */
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found'
  });
});

/**
 * ===== GLOBAL ERROR HANDLER =====
 */
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal server error'
  });
});

module.exports = app;
