// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const eventRoutes = require('./routes/events');  // Ensure this is correctly imported

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware setup
app.use(cors());
app.use(bodyParser.json());  // To parse JSON request bodies

// MongoDB connection (ensure your URI is correct)
const uri = "mongodb+srv://oalser1234:xn61KBNxCCl9mgR5@cluster0.yrwcfdy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Connect to MongoDB
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.log('MongoDB connection error:', err));

// Register API routes
app.use('/api/events', eventRoutes);  // Ensure routes are correctly handled for /api/events

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
