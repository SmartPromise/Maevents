// backend/models/Ticket.js
const mongoose = require('mongoose');

// Ticket Schema
const TicketSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',  // Reference to the Event the ticket belongs to
    required: true
  },
  buyer: {
    type: String,  // Store the buyer's address or email
    required: true
  },
  ticketPrice: {
    type: Number,
    required: true
  },
  purchaseDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    default: 'active',  // Ticket status (e.g., 'active', 'used', 'cancelled')
    enum: ['active', 'used', 'cancelled']
  }
});

// Create Ticket model from schema
const Ticket = mongoose.model('Ticket', TicketSchema);
module.exports = Ticket;
