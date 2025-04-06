import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import session from "express-session";
import pg from "pg";
import pgSession from "connect-pg-simple";
import pool from "./db.js";
import authRoutes from "./routes/auth.js";
import path from "path";

const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.resolve(); // ES Modules

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// Enhanced PostgreSQL Session Store configuration
const PgSession = pgSession(session);
const sessionStore = new PgSession({
  pool: pool,
  tableName: "session",
  schemaName: "public",
  pruneSessionInterval: 60, // Check for expired sessions every 60 minutes
  ttl: 3600, // Session TTL in seconds (1 hour)
  errorLog: (...args) => console.error("Session store error:", ...args),
});

// Enhanced session middleware
app.use(
  session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET || "my_super_secure_session_key",
    resave: false,
    saveUninitialized: false,
    rolling: true, // Reset maxAge on every request
    proxy: true, // Trust reverse proxy if using one
    cookie: {
      secure: false,
      httpOnly: true,
      sameSite: "lax", // CSRF protection
      maxAge: 1000 * 60 * 60, // 1 hour expiration
    },
    name: "app.sid", // Custom cookie name
  })
);

// Enhanced CORS middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["set-cookie"],
  })
);
app.use(
  "/uploads",
  (req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
    next();
  },
  express.static(path.join(__dirname, "uploads"))
);

// Rest of your middleware and routes remain the same
app.use(express.json());
app.use("/auth", authRoutes);

// Health check endpoints
app.get("/", (req, res) => {
  res.send("🚀 Express Server with Session-Based Authentication is Running!");
});

app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ message: "✅ Database Connected!", time: result.rows[0] });
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    res.status(500).json({ error: "Database connection failed" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
