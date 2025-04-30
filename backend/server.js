const express = require('express');
const cors = require('cors');
require('dotenv').config();
 
const app = express();
const PORT = process.env.PORT || 5000;
 
app.use(cors());
app.use(express.json());
 
// Test endpoint
app.get('/', (req, res) => {
  res.send('MaEvents API is up!');
});
 
// Log ticket purchase
app.post('/log-ticket', (req, res) => {
  const { user, eventId, ticketId } = req.body;
  console.log(`[LOG] User ${user} bought Ticket ${ticketId} for Event ${eventId}`);
  res.status(200).json({ success: true, message: 'Ticket purchase logged.' });
});
 
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});