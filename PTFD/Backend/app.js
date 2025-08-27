console.log("Starting PTFD Backend...");
// vQSVBzYWHfOo7wa5

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// Import Routes
const projectRoutes = require("./Route/ProjectRoutes");
const timelineRoutes = require("./Route/TimelineRoutes"); // 👈 add timeline

const app = express();

// Middleware
app.use(express.json()); // Parse JSON bodies
app.use(cors({ origin: "*" })); // Enable CORS for all routes

// Routes
app.use("/projects", projectRoutes);
app.use("/timelines", timelineRoutes); // 👈 mount timeline CRUD

// Test route
app.get("/test", (req, res) => {
  res.json({ message: "Test route working" });
});

// MongoDB Connection
mongoose.connect("mongodb+srv://Kavishka:vQSVBzYWHfOo7wa5@cluster0.6vdnmh3.mongodb.net/test?retryWrites=true&w=majority")
  .then(() => {
    console.log("Connected to MongoDB");

    // Start the server
    app.listen(5050, "0.0.0.0", () => {
      console.log("Server is running on port 5050");
    });
  })
  .catch(err => {
    console.error("Error connecting to MongoDB:", err);
  });

