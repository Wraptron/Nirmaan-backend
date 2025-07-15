const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cookieParser = require("cookie-parser");
const responseTime = require("response-time");
const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const app = express();
const server = http.createServer(app);

// ==================== SECURITY MIDDLEWARE ====================
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later",
  },
});
app.use(limiter);

// ==================== CORS CONFIGURATION ====================
const corsOptions = {
  origin: [
    "https://nirmaan-frontend.pages.dev",
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "http://127.0.0.1:3002",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
    "Access-Control-Allow-Origin",
    "Access-Control-Allow-Headers",
    "Access-Control-Allow-Methods",
    "X-HTTP-Method-Override",
  ],
  exposedHeaders: ["Content-Length", "X-Total-Count"],
  maxAge: 86400,
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// ==================== SOCKET.IO CONFIGURATION ====================
const io = new Server(server, {
  cors: {
    origin: corsOptions.origin,
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
  pingTimeout: 60000,
  pingInterval: 25000,
});

// ==================== MIDDLEWARE SETUP ====================
app.use(responseTime());
app.use(cookieParser());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

// Enhanced request logging
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const userAgent = req.headers["user-agent"] || "Unknown";
  console.log(
    `[${timestamp}] ${req.method} ${req.path} - Origin: ${
      req.headers.origin || "None"
    } - User-Agent: ${userAgent.substring(0, 50)}...`
  );
  next();
});

// ==================== FILE UPLOAD CONFIGURATION ====================
// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Only images and documents are allowed"));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: fileFilter,
});

// Serve static files with proper headers
app.use(
  "/uploads",
  express.static(uploadsDir, {
    maxAge: "1d",
    etag: true,
  })
);

// ==================== UTILITY FUNCTIONS ====================
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const sendResponse = (res, statusCode, success, message, data = null) => {
  res.status(statusCode).json({
    success,
    message,
    data,
    timestamp: new Date().toISOString(),
  });
};

// ==================== HEALTH CHECK ROUTES ====================
app.get("/health", (req, res) => {
  const healthCheck = {
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV || "development",
    message: "Backend server is running successfully",
  };

  sendResponse(res, 200, true, "Health check passed", healthCheck);
});

// app.get("/health", (req, res) => {
//   sendResponse(res, 200, true, "CORS is working correctly", {
//     origin: req.headers.origin,
//     userAgent: req.headers["user-agent"],
//     method: req.method,
//   });
// });

// app.get("/", (req, res) => {
//   sendResponse(res, 200, true, "Welcome to Nirmaan Backend API", {
//     version: "1.0.0",
//     documentation: "/api/docs",
//     endpoints: {
//       health: "/health",
//       cors_test: "/test-cors",
//       api_base: "/api/v1",
//     },
//   });
// });

// ==================== AUTHENTICATION ROUTES ====================
app.post(
  "/api/v1/login",
  asyncHandler(async (req, res) => {
    const { user_mail, user_password, email, password } = req.body;

    // Support both field names for flexibility
    const loginEmail = user_mail || email;
    const loginPassword = user_password || password;

    console.log("📧 Login attempt for:", loginEmail);
    console.log("🔒 Password provided:", loginPassword ? "Yes" : "No");

    if (!loginEmail || !loginPassword) {
      return sendResponse(res, 400, false, "Email and password are required");
    }

    // TODO: Replace with actual authentication logic
    // For now, returning mock success response
    if (
      loginEmail === "manager.ie@imail.iitm.ac.in" &&
      loginPassword === "qwerty223344"
    ) {
      const mockUser = {
        id: 1,
        email: loginEmail,
        name: "Manager",
        role: "admin",
        token: "mock-jwt-token-" + Date.now(),
      };

      console.log("✅ Login successful for:", loginEmail);
      sendResponse(res, 200, true, "Login successful", {
        user: mockUser,
        token: mockUser.token,
      });
    } else {
      console.log("❌ Login failed for:", loginEmail);
      sendResponse(res, 401, false, "Invalid credentials");
    }
  })
);

app.post(
  "/api/v1/register",
  asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return sendResponse(
        res,
        400,
        false,
        "Name, email, and password are required"
      );
    }

    console.log("📝 Register request:", { name, email, password: "***", role });

    // TODO: Add registration logic here
    sendResponse(res, 201, true, "Registration successful", {
      user: {
        id: Date.now(),
        name,
        email,
        role: role || "user",
        created_at: new Date().toISOString(),
      },
    });
  })
);

app.post(
  "/api/v1/forgot-password",
  asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
      return sendResponse(res, 400, false, "Email is required");
    }

    console.log("🔄 Forgot password request:", email);

    // TODO: Add forgot password logic here
    sendResponse(res, 200, true, "Password reset email sent successfully", {
      email,
    });
  })
);

// ==================== CONNECTION ROUTES ====================
app.post(
  "/api/v1/add-connections",
  asyncHandler(async (req, res) => {
    const { connection_type, from_user, to_user, message } = req.body;

    if (!connection_type || !from_user || !to_user) {
      return sendResponse(
        res,
        400,
        false,
        "Missing required fields: connection_type, from_user, to_user"
      );
    }

    console.log("🔗 Add connections request:", req.body);

    sendResponse(res, 201, true, "Connection added successfully", {
      id: Date.now(),
      ...req.body,
      created_at: new Date().toISOString(),
    });
  })
);

app.get(
  "/api/v1/viewconnections",
  asyncHandler(async (req, res) => {
    const { user_id, status, limit = 10, offset = 0 } = req.query;

    console.log("👀 View connections request:", req.query);

    sendResponse(res, 200, true, "Connections fetched successfully", {
      connections: [],
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: 0,
      },
    });
  })
);

// ==================== MENTOR ROUTES ====================
app.post(
  "/api/v1/mentor/add",
  upload.single("profile_image"),
  asyncHandler(async (req, res) => {
    const { name, email, expertise, experience, bio } = req.body;

    if (!name || !email || !expertise) {
      return sendResponse(
        res,
        400,
        false,
        "Missing required fields: name, email, expertise"
      );
    }

    console.log("👨‍🏫 Add mentor request:", req.body);

    const mentorData = {
      id: Date.now(),
      name,
      email,
      expertise,
      experience,
      bio,
      profile_image: req.file ? `/uploads/${req.file.filename}` : null,
      created_at: new Date().toISOString(),
    };

    sendResponse(res, 201, true, "Mentor added successfully", mentorData);
  })
);

app.get(
  "/api/v1/get-mentor-details",
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, search, expertise } = req.query;

    console.log("📋 Get mentor details request:", req.query);

    sendResponse(res, 200, true, "Mentors fetched successfully", {
      mentors: [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: 0,
        totalPages: 0,
      },
    });
  })
);

// ==================== SOCKET.IO EVENTS ====================
const connectedUsers = new Map();

io.on("connection", (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  socket.on("authenticate", (data) => {
    const { userId, token } = data;
    connectedUsers.set(socket.id, { userId, socketId: socket.id });
    socket.emit("authenticated", { success: true });
  });

  socket.on("disconnect", () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
    connectedUsers.delete(socket.id);
  });
});

// ==================== ERROR HANDLING ====================
app.use((req, res) => {
  sendResponse(
    res,
    404,
    false,
    `Endpoint not found: ${req.method} ${req.path}`
  );
});

app.use((err, req, res, next) => {
  console.error("❌ Global error handler:", err);

  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return sendResponse(
        res,
        400,
        false,
        "File too large. Maximum size is 10MB"
      );
    }
    return sendResponse(res, 400, false, `File upload error: ${err.message}`);
  }

  const isDevelopment = process.env.NODE_ENV === "development";
  sendResponse(
    res,
    500,
    false,
    "Internal server error",
    isDevelopment ? err.message : null
  );
});

// ==================== GRACEFUL SHUTDOWN ====================
const gracefulShutdown = (signal) => {
  console.log(`Received ${signal}. Shutting down gracefully...`);

  server.close(() => {
    console.log("HTTP server closed");
    process.exit(0);
  });

  setTimeout(() => {
    console.error(
      "Could not close connections in time, forcefully shutting down"
    );
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// ==================== SERVER STARTUP ====================
const PORT = process.env.PORT || 3003; // Changed to 3003 to match frontend
const HOST = process.env.HOST || "0.0.0.0";

server.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on http://${HOST}:${PORT}`);
  console.log(`🌍 External access: http://3.109.48.163:${PORT}`);
  console.log(`📱 Frontend URL: https://10252b81.nirmaan-frontend.pages.dev`);
  console.log(`🔌 Socket.IO enabled on same port`);
  console.log(`📁 Uploads directory: ${uploadsDir}`);
  console.log(`🛡️  Security middleware enabled`);
  console.log(`⚡ Environment: ${process.env.NODE_ENV || "development"}`);
});

// Export for testing
module.exports = { app, server, io };
