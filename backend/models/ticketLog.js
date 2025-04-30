const mongoose = require('mongoose');
 
const ticketLogSchema = new mongoose.Schema({
  user: { type: String, required: true },
  eventId: { type: String, required: true },
  ticketId: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});
 
module.exports = mongoose.model('ticketLog', ticketLogSchema);