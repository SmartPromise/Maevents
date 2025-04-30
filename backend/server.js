const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
 
const ticketLog = require('./models/ticketLog');
 
const app = express();
const PORT = process.env.PORT || 5000;
 
app.use(cors());
app.use(express.json());
 
// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));
 
// Routes
app.get('/', (req, res) => {
  res.send('MaEvents API is live with MongoDB!');
});
 
app.post('/log-ticket', async (req, res) => {
  try {
    const { user, eventId, ticketId } = req.body;
    const log = new TicketLog({ user, eventId, ticketId });
    await log.save();
    res.status(200).json({ success: true, message: 'Ticket logged to database.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to log ticket' });
  }
});
 
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});