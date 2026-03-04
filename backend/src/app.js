const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");
const rateLimit = require("express-rate-limit");
const path = require("path");

const { swaggerUi, swaggerSpec } = require("./config/swagger");
const { errorHandler, notFound } = require("./middlewares/errorHandler");
const logger = require("./utils/logger");

// ── Route Imports ─────────────────────────────────────────
const v1Routes = require("./api/v1/routes");

const app = express();

// ── Security Middlewares ──────────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow frontend to load images/files
  })
);
app.use(mongoSanitize());

// ── CORS ──────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ── Rate Limiting ─────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500,
  message: { success: false, message: "Too many requests, please try again later." },
});
app.use("/api", limiter);

// ── General Middlewares ───────────────────────────────────
app.use(compression());
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(morgan("combined", { stream: { write: (msg) => logger.http(msg.trim()) } }));

// ── Static Files (Uploads) ────────────────────────────────
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"), {
    setHeaders: (res) => {
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    },
  })
);

// ── Swagger API Docs ──────────────────────────────────────
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ── Health Check ──────────────────────────────────────────
app.get("/health", (req, res) => {
  res.status(200).json({ success: true, message: "Server is healthy 🟢", timestamp: new Date() });
});

// ── API Routes ────────────────────────────────────────────
app.use("/api/v1", v1Routes);

// ── 404 & Error Handlers ──────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
