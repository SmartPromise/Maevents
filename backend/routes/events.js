// backend/routes/events.js
const express = require('express');
const Event = require('../models/Event'); // Ensure this is the correct model
const router = express.Router();

// Create Event
router.post('/', async (req, res) => {
  try {
    const {
        name,
        description,
        imageUrl, // Added
        date, // Expecting Unix timestamp (Number)
        totalTickets, // Added
        ticketPrice, // Added (expecting String)
        location, // Optional, if you keep it in the model
        transactionHash // From the blockchain transaction
      } = req.body;

    // Log the incoming data to verify it's being sent correctly
    console.log('Received Event Data:', req.body);

    // Create a new event
    const newEvent = new Event({
      name,
      description,
      imageUrl,
      date,
      totalTickets,
      ticketPrice,
      location,
      tickets: [],
      transactionHash, // Storing the blockchain transaction hash
    });

    // Save the event to MongoDB
    const savedEvent = await newEvent.save();

    // Log the saved event for debugging
    console.log('Event saved:', savedEvent);

    // Send the saved event as a response
    res.status(201).json(savedEvent);
  } catch (err) {
    console.error('Error saving event:', err); // Log the error for debugging
    res.status(400).json({ message: err.message }); // Send error message if any
  }
});

// Get All Events
router.get('/', async (req, res) => {
  try {
    const events = await Event.find(); // Fetch all events from MongoDB
    res.status(200).json(events); // Return the events as a response
  } catch (err) {
    res.status(500).json({ message: err.message }); // Error if fetching events fails
  }
});

// Close Event (Update Status in DB)
router.patch('/:eventId/close', async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    event.isOpen = false; // Set status to closed
    const updatedEvent = await event.save();
    res.status(200).json(updatedEvent);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
