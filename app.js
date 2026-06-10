const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cookieParser = require("cookie-parser");
const responseTime = require("response-time");
const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require("multer");
const router = require("./routes/route");
const { globalRateLimit, authRateLimit } = require("./helpers/ExpressRateLimit.js");
const Authenticate = require("./utils/Authenticate.js");

const PUBLIC_ROUTES = [
  { method: "POST", path: "/api/v1/login" },
  { method: "POST", path: "/api/v1/auth/refresh" },
  { method: "POST", path: "/api/v1/auth/logout" },
  { method: "POST", path: "/api/v1/forgot-password" },
  { method: "POST", path: "/api/v1/forgot-password/request-otp" },
  { method: "POST", path: "/api/v1/forgot-password/resend-otp" },
  { method: "POST", path: "/api/v1/forgot-password/verify-otp" },
  { method: "POST", path: "/api/v1/sync/startup" },
  { method: "GET", path: "/api/v1/health" },
];

const apiV1DefaultDeny = (req, res, next) => {
  const requestPath = req.baseUrl + (req.path === "/" ? "" : req.path);
  const isPublic = PUBLIC_ROUTES.some(
    (r) => r.method === req.method && requestPath === r.path
  );
  if (isPublic) return next();
  return Authenticate(req, res, next);
};


// Initialize Express app
const app = express();

// Create HTTP server and Socket.IO instance
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://13.126.152.135",
      "http://13.126.152.135:3000",
      "http://13.126.152.135:3001",
      "https://13.126.152.135",
      "https://13.126.152.135:3000",
      "https://13.126.152.135:3001",
      "http://sieiitm.org",
      "https://sieiitm.org",
      "http://www.sieiitm.org",
      "https://www.sieiitm.org"
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Middleware Configuration
const upload = multer({ dest: "uploads/" });

// FIXED CORS Configuration
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://13.126.152.135",
  "http://13.126.152.135:3000",
  "http://13.126.152.135:3001",
  "https://13.126.152.135",
  "https://13.126.152.135:3000",
  "https://13.126.152.135:3001",
  "http://sieiitm.org",
  "https://sieiitm.org",
  "http://www.sieiitm.org",
  "https://www.sieiitm.org"
];
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests, Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log(`CORS blocked origin: ${origin}`);
      callback(new Error(`Not allowed by CORS policy. Origin: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'X-HTTP-Method-Override'
  ],
  exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar'],
  maxAge: 86400, // 24 hours
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
};
// Apply CORS middleware FIRST
app.use(cors(corsOptions));
// Handle preflight requests explicitly
app.options('*', cors(corsOptions));
// Additional CORS headers for complex requests
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, X-HTTP-Method-Override');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Length, X-Foo, X-Bar');
  res.setHeader('Access-Control-Max-Age', '86400');
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});
app.use(cookieParser());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));
app.use(responseTime());

app.use("/api/v1/login", authRateLimit);
app.use("/api/v1/auth/refresh", authRateLimit);
app.use("/api/v1/forgot-password", authRateLimit);
app.use("/api/v1/", globalRateLimit);

// File upload routes (uncomment if using S3)
// app.get('/images/:key', (req, res) => {
//   const fileKey = req.params.key;
//   const readStream = getFileStream(fileKey);
//   readStream.pipe(res);
// });
// app.post('/imagess', upload.single('image'), async (req, res) => {
//   try {
//     const file = req.file;
//     console.log(file);
//     const result = await uploadFile(file);
//     console.log(result);
//     res.send({ imagePath: `/images/${result.Key}` });
//   } catch (error) {
//     console.error('Upload error:', error);
//     res.status(500).send({ error: 'Upload failed' });
//   }
// });
// API Routes — default-deny auth before each router mount
app.use("/api/v1", apiV1DefaultDeny);
app.use("/api/v1", router);
// Legacy path prefixes — same router, full route table mirrored under these bases
app.use("/api/v1/work", apiV1DefaultDeny);
app.use("/api/v1/work", router);
app.use("/api/v1/resume", apiV1DefaultDeny);
app.use("/api/v1/resume", router);
// Test route
app.get("/profile", (req, res) => {
  res.json({
    message: "API Working - Profile endpoint",
    timestamp: new Date().toISOString(),
    origin: req.headers.origin
  });
});
// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    origin: req.headers.origin
  });
});

// Socket.IO configuration
let onlineUsers = [];

const addNewUser = (username, socketId) => {
  const userExists = onlineUsers.some((user) => user.username === username);
  if (!userExists) {
    onlineUsers.push({ username, socketId });
    console.log(`User ${username} added. Online users: ${onlineUsers.length}`);
  }
};

const removeUser = (socketId) => {
  const initialLength = onlineUsers.length;
  onlineUsers = onlineUsers.filter((user) => user.socketId !== socketId);
  if (onlineUsers.length < initialLength) {
    console.log(`User disconnected. Online users: ${onlineUsers.length}`);
  }
};
const getUser = (username) => {
  return onlineUsers.find((user) => user.username === username);
};
// Socket.IO event handlers
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);
  socket.on("newUser", (username) => {
    if (username) {
      addNewUser(username, socket.id);
      socket.emit("userConnected", { username, socketId: socket.id });
    }
  });
  socket.on("sendText", ({ senderName, receiverName, text }) => {
    const receiver = getUser(receiverName);
    if (receiver) {
      io.to(receiver.socketId).emit("getText", {
        senderName,
        text,
        timestamp: new Date().toISOString(),
      });
    } else {
      socket.emit("userNotFound", { receiverName });
    }
  });
  socket.on("getOnlineUsers", () => {
    socket.emit(
      "onlineUsers",
      onlineUsers.map((user) => user.username)
    );
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    removeUser(socket.id);
  });

  // Handle connection errors
  socket.on("error", (error) => {
    console.error("Socket error:", error);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  // Handle CORS errors specifically
  if (err.message && err.message.includes('CORS')) {
    return res.status(403).json({
      error: "CORS Policy Error",
      message: err.message,
      origin: req.headers.origin
    });
  }
  
  res.status(500).json({
    error: "Something went wrong!",
    message: process.env.NODE_ENV === "development" ? err.message : "Internal server error",
  });
});

// Handle 404 routes
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl,
  });
});

// Server configuration
const EXPRESS_PORT = process.env.EXPRESS_PORT || 3003;
const SOCKET_PORT = process.env.SOCKET_PORT || 5000;

// Start Express server
app.listen(EXPRESS_PORT, '0.0.0.0', () => {
  console.log(`Express server running on http://0.0.0.0:${EXPRESS_PORT}`);
  console.log(`Server accessible at http://localhost:${EXPRESS_PORT}`);
  console.log(`Allowed origins: ${allowedOrigins.join(', ')}`);
});

// Start Socket.IO server
server.listen(SOCKET_PORT, '0.0.0.0', () => {
  console.log(`Socket.IO server listening on http://0.0.0.0:${SOCKET_PORT}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

module.exports = app;