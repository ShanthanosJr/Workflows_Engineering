console.log("Starting PTFD Backend...");
// vQSVBzYWHfOo7wa5
const express = require("express");
const mongoose = require("mongoose");
const router = require("./Route/ProjectRoutes"); 

const app = express();
const cors = require("cors");

// Middleware
app.use(express.json()); // Parse JSON bodies
app.use(cors()); // Enable CORS for all routes
app.use("/projects", router); 

// Connect to MongoDB
mongoose.connect("mongodb+srv://Kavishka:vQSVBzYWHfOo7wa5@cluster0.6vdnmh3.mongodb.net/")
  .then(() => {
    console.log("Connected to MongoDB");

    // Start the server
    app.listen(5000, () => {
      console.log("Server is running on port 5000");
    });
  })
  .catch(err => {
    console.error("Error connecting to MongoDB:", err);
  });
