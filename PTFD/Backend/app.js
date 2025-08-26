console.log("Starting PTFD Backend...");
// vQSVBzYWHfOo7wa5
const express = require("express");
const mongoose = require("mongoose");
const router = require("./Route/ProjectRoutes"); 

const app = express();
const cors = require("cors");

// Middleware
app.use(express.json()); // Parse JSON bodies
app.use(cors({ origin: "*" })); // Enable CORS for all routes
app.use("/projects", router); 

app.get("/test", (req, res) => {
  res.json({ message: "Test route working" });
});

// Connect to MongoDB
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


