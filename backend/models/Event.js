// backend/models/Event.js
const mongoose = require('mongoose');

// Event Schema
const EventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String }, // Added imageUrl
  date: { type: Number, required: true }, // Store as Unix timestamp (Number) like the contract
  location: { type: String }, // Keep location if you need it for other purposes, otherwise remove
  totalTickets: { type: Number, required: true }, // Added totalTickets
  ticketPrice: { type: String, required: true }, // Added ticketPrice (String to handle large numbers like Wei)
  tickets: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket'
    }
  ],
  transactionHash: { type: String },  // Store the blockchain transaction hash
  ticketsSold: { type: Number, default: 0 }, // Added ticketsSold
  isOpen: { type: Boolean, default: true }, // Added isOpen status
  // Mongoose automatically adds _id, which can serve as the DB identifier
  // We might store the blockchain eventId if needed, e.g.:
  // blockchainEventId: { type: Number }
});

// Pre-save hook to validate the event date
// Validation can be done in the route or frontend now, as the date is a timestamp
// EventSchema.pre('save', function (next) {
//   if (this.date < Math.floor(Date.now() / 1000)) {
//     return next(new Error('Event date must be in the future'));
//   }
//   next();
// });

const Event = mongoose.model('Event', EventSchema);
module.exports = Event;
