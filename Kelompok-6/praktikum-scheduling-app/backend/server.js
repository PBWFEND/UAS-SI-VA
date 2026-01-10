// backend/server.js - PERBAIKAN LENGKAP
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const path = require("path");
const SQLiteStore = require("connect-sqlite3")(session); // Untuk session store yang lebih baik
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// ===== MIDDLEWARE SETUP =====
// CORS Configuration
app.use(
  cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// Handle preflight requests
app.options("*", cors());

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session Configuration - FIXED
app.use(
  session({
    store: new SQLiteStore({
      dir: path.join(__dirname, "sessions"),
      db: "sessions.db",
      table: "sessions",
    }),
    secret:
      process.env.SESSION_SECRET || "praktikum-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set true jika HTTPS
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 jam
      sameSite: "lax",
    },
    name: "praktikum.sid", // Nama cookie session
  })
);

// Static files
app.use(express.static(path.join(__dirname, "../frontend")));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// ===== API ROUTES =====
const apiRoutes = require("./routes/api");
app.use("/api", apiRoutes);

// ===== HTML ROUTES =====
// Serve HTML pages
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/login.html"));
});

app.get("/login", (req, res) => {
  res.redirect("/");
});

app.get("/dashboard", (req, res) => {
  if (!req.session.userId) {
    return res.redirect("/");
  }
  res.sendFile(path.join(__dirname, "../frontend/dashboard.html"));
});

app.get("/scheduling", (req, res) => {
  if (!req.session.userId) {
    return res.redirect("/");
  }
  res.sendFile(path.join(__dirname, "../frontend/scheduling.html"));
});

app.get("/attendance", (req, res) => {
  if (!req.session.userId) {
    return res.redirect("/");
  }
  res.sendFile(path.join(__dirname, "../frontend/attendance.html"));
});

app.get("/reports", (req, res) => {
  if (!req.session.userId) {
    return res.redirect("/");
  }
  res.sendFile(path.join(__dirname, "../frontend/reports.html"));
});

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
    }
    res.clearCookie("praktikum.sid");
    res.redirect("/");
  });
});

// ===== ERROR HANDLING =====
// 404 handler
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "../frontend/404.html"));
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err.stack);
  res.status(500).json({
    success: false,
    error: "Internal server error",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// ===== START SERVER =====
app.listen(PORT, () => {
  console.log("=".repeat(50));
  console.log(`🚀 SERVER BERJALAN DI: http://localhost:${PORT}`);
  console.log("=".repeat(50));
  console.log("📁 Frontend: " + path.join(__dirname, "../frontend"));
  console.log("💾 Database: " + path.join(__dirname, "database.sqlite"));
  console.log("🔐 Session: " + path.join(__dirname, "sessions/sessions.db"));
  console.log("=".repeat(50));
  console.log("👤 USER DEFAULT UNTUK LOGIN:");
  console.log("  1. Username: admin | Password: admin123");
  console.log("  2. Username: asisten | Password: asisten123");
  console.log("  3. Username: dosen | Password: dosen123");
  console.log("=".repeat(50));
  console.log("⚠️  JIKA TIDAK BISA LOGIN:");
  console.log("  1. Check console untuk error");
  console.log("  2. Clear browser cookies");
  console.log("  3. Restart server dengan: npm start");
  console.log("=".repeat(50));
});
