console.log("Starting PTFD Backend...");
// vQSVBzYWHfOo7wa5

require('dotenv').config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

// Import Routes
const projectRoutes = require("./Route/ProjectRoutes");
const timelineRoutes = require("./Route/TimelineRoutes"); // 👈 add timeline
const projectTimelineRoutes = require("./Route/ProjectTimelineRts"); // 👈 add project timeline
const financialDashboardRoutes = require("./Route/FinancialDashboardRts"); // 👈 add financial dashboard
const chatbotRoutes = require("./Route/ChatBotRts"); // 👈 add chatbot routes
const userRoutes = require("./Route/UserRoutes"); // 👈 add user routes
const projectReqRoutes = require("./Route/ProjectReqRoutes"); // 👈 add project request routes

// Import ChatBot controller for initialization
const { initializeKnowledgeBase } = require('./Controllers/ChatBotCtrl');

const app = express();

// Middleware
app.use(express.json({ limit: '50mb' })); // Parse JSON bodies with larger limit for images
app.use(express.urlencoded({ limit: '50mb', extended: true })); // Parse URL-encoded bodies
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
})); // Enable CORS with specific configuration

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/projects", projectRoutes);
app.use("/timelines", timelineRoutes); // 👈 mount timeline CRUD
app.use("/project-timelines", projectTimelineRoutes); // 👈 mount project timeline CRUD
app.use("/financial-dashboard", financialDashboardRoutes); // 👈 mount financial dashboard CRUD
app.use("/chatbot", chatbotRoutes); // 👈 mount chatbot CRUD
app.use("/api/users", userRoutes); // 👈 mount user routes
app.use("/project-requests", projectReqRoutes); // 👈 mount project request routes

// Test route
app.get("/test", (req, res) => {
  res.json({ message: "Test route working" });
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || "mongodb+srv://Kavishka:vQSVBzYWHfOo7wa5@cluster0.6vdnmh3.mongodb.net/test?retryWrites=true&w=majority")
  .then(async () => {
    console.log("Connected to MongoDB");
    
    // Initialize ChatBot knowledge base
    await initializeKnowledgeBase();

    // Start the server
    app.listen(5050, "0.0.0.0", () => {
      console.log("Server is running on port 5050");
      console.log("🤖 ChatBot AI Assistant is ready!");
    });
  })
  .catch(err => {
    console.error("Error connecting to MongoDB:", err);
  });

