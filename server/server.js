require("dotenv").config();

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error("FATAL: JWT_SECRET missing or too short (min 32 chars).");
  process.exit(1);
}

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const aiRoutes = require("./routes/aiRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

const isProduction = process.env.NODE_ENV === "production";

// Hosting platform (Render, Railway, Nginx) ke peeche sahi IP ke liye
app.set("trust proxy", 1);

// ===============================
// SECURITY + PERFORMANCE
// ===============================
app.use(helmet());
app.use(compression());

// ===============================
// CORS CONFIGURATION
// ===============================
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",").map((url) => url.trim())
  : ["http://localhost:5173", "http://localhost:4173"];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// ===============================
// BODY PARSER
// ===============================
app.use(express.json({ limit: "1mb" }));

// ===============================
// RATE LIMITING
// ===============================
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests. Please try again later." },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many attempts. Please try again later." },
});

app.use("/api", apiLimiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

// ===============================
// ROUTES
// ===============================
app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/admin", adminRoutes);

// ===============================
// TEST + HEALTH ROUTES
// ===============================
app.get("/", (req, res) => {
  res.send("CareerAI Backend is Running!");
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// ===============================
// 404 HANDLER
// ===============================
app.use((req, res) => {
  res.status(404).json({ message: "Route not found." });
});

// ===============================
// GLOBAL ERROR HANDLER
// ===============================
app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err);

  res.status(err.status || 500).json({
    message: isProduction
      ? "Something went wrong. Please try again later."
      : err.message,
  });
});

// ===============================
// CONNECT DATABASE
// ===============================
connectDB();

// ===============================
// START SERVER
// ===============================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
