const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cookieParser = require("cookie-parser");
const responseTime = require("response-time");
const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require("multer");

// Import all route controllers
const LoginController = require("./routes/route");
const WorkRequestController = require("./routes/route");
const ResumeController = require("./routes/route");
const GetAllResumeController = require("./routes/route");
const ResumeUpload = require("./routes/route");
const Resumedata = require("./routes/route");
const ApporvalRequest = require("./routes/route");
const ForgotRequest = require("./routes/route");
const Profile = require("./routes/route");
const DeleteResume = require("./routes/route");
const AddMentor = require("./routes/route");
const Settings = require("./routes/route");
const AddMessage = require("./routes/route");
const ViewMessage = require("./routes/route");
const AddConnections = require("./routes/route");
const AddStartup = require("./routes/route");
const ViewConnections = require("./routes/route");
const Job = require("./routes/route");
const Report = require("./routes/route");
const EstablishConnection = require("./routes/route");
const TeamMember = require("./routes/route");
const RaiseRequest = require("./routes/route");
const FetchDataMentor = require("./routes/route");
const Founder = require("./routes/route");
const AddMentorHour = require("./routes/route");
const AddJob = require("./routes/route");
const ViewNotification = require("./routes/route");
const DeleteConnection = require("./routes/route");
const FetchMentorData = require("./routes/route");
const MentorCount = require("./routes/route");
const DeleteMentorData = require("./routes/route");
const DeleteStartupData = require("./routes/route");
const CreateEvents = require("./routes/route");
const FetchEvents = require("./routes/route");
const RequestSpeaker = require("./routes/route");
const FetchStartupDatainNumbers = require("./routes/route");
const FetchStartupData = require("./routes/route");
const AddFunding = require("./routes/route");
const ScheduleMentorMeeting = require("./routes/route");
const UpdateStatus = require("./routes/route");
const IndividualStartups = require("./routes/route");
const IPdataUpload = require("./routes/route");
const TopStartupsSectorsCont = require("./routes/route");
const UpdateStartupAbout = require("./routes/route");
const UpdateStartupDetails = require("./routes/route");
const UpdateStartupMentorDetails = require("./routes/route");
const AddAward = require("./routes/route");
const FetchAwardData = require("./routes/route");
const ProfilePhoto = require("./routes/route");
const TeamDocuments = require("./routes/route");

// Import utilities
const Authenticate = require("./utils/Authenticate");
// const {uploadFile, getFileStream} = require('./utils/s3');
// const {RateLimitMiddleware} = require("./helpers/ExpressRateLimit");

// Initialize Express app
const app = express();

// Create HTTP server and Socket.IO instance
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Middleware Configuration
const upload = multer({ dest: "uploads/" });

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://866a157c.nirmaan-frontend.pages.dev/",
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));
app.use(responseTime());
// app.use(RateLimitMiddleware);

// File upload routes (uncomment if using S3)
/*
app.get('/images/:key', (req, res) => {
  const fileKey = req.params.key;
  const readStream = getFileStream(fileKey);
  readStream.pipe(res);
});

app.post('/imagess', upload.single('image'), async (req, res) => {
  try {
    const file = req.file;
    console.log(file);
    const result = await uploadFile(file);
    console.log(result);
    res.send({ imagePath: `/images/${result.Key}` });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).send({ error: 'Upload failed' });
  }
});
*/

// API Routes
app.use("/api/v1/", LoginController);
app.use("/api/v1/", ForgotRequest);
app.use("/api/v1/", Profile);
app.use("/api/v1/", Settings);
app.use("/api/v1/", AddMentor);
app.use("/api/v1/", AddMessage);
app.use("/api/v1/", ViewMessage);
app.use("/api/v1/", AddConnections);
app.use("/api/v1/", AddStartup);
app.use("/api/v1/", ViewConnections);
app.use("/api/v1/", Job);
app.use("/api/v1/", Report);
app.use("/api/v1/", EstablishConnection);
app.use("/api/v1/", TeamMember);
app.use("/api/v1/", RaiseRequest);
app.use("/api/v1/", FetchDataMentor);
app.use("/api/v1/", Founder);
app.use("/api/v1/", AddMentorHour);
app.use("/api/v1/", AddJob);
app.use("/api/v1/", ViewNotification);
app.use("/api/v1/", DeleteConnection);
app.use("/api/v1/", FetchMentorData);
app.use("/api/v1/", MentorCount);
app.use("/api/v1/", DeleteMentorData);
app.use("/api/v1/", DeleteStartupData);
app.use("/api/v1/", CreateEvents);
app.use("/api/v1/", FetchEvents);
app.use("/api/v1/", RequestSpeaker);
app.use("/api/v1/", FetchStartupDatainNumbers);
app.use("/api/v1/", FetchStartupData);
app.use("/api/v1/", AddFunding);
app.use("/api/v1/", ScheduleMentorMeeting);
app.use("/api/v1/", UpdateStatus);
app.use("/api/v1/", IndividualStartups);
app.use("/api/v1/", IPdataUpload);
app.use("/api/v1/", TopStartupsSectorsCont);
app.use("/api/v1/", UpdateStartupAbout);
app.use("/api/v1/", UpdateStartupDetails);
app.use("/api/v1/", UpdateStartupMentorDetails);
app.use("/api/v1/", AddAward);
app.use("/api/v1/", FetchAwardData);
app.use("/api/v1/", ProfilePhoto);
app.use("/api/v1/", TeamDocuments);

// Resume related routes
app.use("/api/v1/work", WorkRequestController);
app.use("/api/v1/resume", ResumeController);
app.use("/api/v1/resume", GetAllResumeController);
app.use("/api/v1/resume", ResumeUpload);
app.use("/api/v1/resume", Resumedata);
app.use("/api/v1/resume", ApporvalRequest);
app.use("/api/v1/resume", DeleteResume);

// Test route
app.get("/profile", (req, res) => {
  res.send("API Working - Profile endpoint");
});

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
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
  res.status(500).json({
    error: "Something went wrong!",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal server error",
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
app.listen(EXPRESS_PORT, () => {
  console.log(`Express server running on http://localhost:${EXPRESS_PORT}`);
});

// Start Socket.IO server
server.listen(SOCKET_PORT, () => {
  console.log(`Socket.IO server listening on http://localhost:${SOCKET_PORT}`);
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
