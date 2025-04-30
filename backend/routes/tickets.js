// backend/routes/tickets.js
const express = require('express');
const Ticket = require('../models/Ticket');
const Event = require('../models/Event');
const router = express.Router();

// Create Ticket (for purchasing)
router.post('/purchase', async (req, res) => {
  try {
    const { eventId, buyer, ticketPrice } = req.body;

    // Find the event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if tickets are available (using backend data)
    if (event.ticketsSold >= event.totalTickets || !event.isOpen) {
      // Note: This check is now duplicated (also exists in smart contract). Decide where the source of truth should be.
      return res.status(400).json({ message: 'No more tickets available or event is closed' });
    }

    // Create a new ticket for the event
    const newTicket = new Ticket({
      event: eventId,
      buyer,
      ticketPrice
    });

    // Save the ticket to the database
    const savedTicket = await newTicket.save();

    // Increment ticketsSold count on the event and save
    event.ticketsSold += 1;
    await event.save();

    // Respond with the ticket information
    res.status(201).json(savedTicket);
  } catch (err) {
    console.error('Error purchasing ticket:', err);
    res.status(400).json({ message: err.message });
  }
});

// Get all tickets for an event
router.get('/event/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;

    // Find all tickets for the event
    const tickets = await Ticket.find({ event: eventId });

    res.status(200).json(tickets);
  } catch (err) {
    console.error('Error fetching tickets:', err);
    res.status(400).json({ message: err.message });
  }
});

// Update ticket status (e.g., mark as used)
router.put('/use/:ticketId', async (req, res) => {
  try {
    const { ticketId } = req.params;

    // Find the ticket by ID
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Update ticket status
    ticket.status = 'used';
    await ticket.save();

    res.status(200).json(ticket);
  } catch (err) {
    console.error('Error updating ticket:', err);
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
