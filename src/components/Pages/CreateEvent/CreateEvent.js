import React, { useState } from 'react';
import './CreateEvent.css';
import { createEvent } from '../../services/EventTicketingService'; // Assuming EventTicketingService is in /services
import { ethers } from 'ethers'; // Import ethers for Wei conversion

const CreateEvent = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    const eventData = {
      name,
      description,
      date,
      location,
    };

    try {
      // --- Data Conversion for Smart Contract ---
      // 1. Convert date string (YYYY-MM-DD) to Unix timestamp (seconds)
      // Make sure the date input is not empty and valid before parsing
      if (!date) {
        throw new Error("Please select a valid date.");
      }
      // Creates date object at UTC midnight for the selected day. Adjust if timezone is critical.
      const unixDateTimestamp = Math.floor(new Date(date).getTime() / 1000);

      // 2. Convert ticket price (assuming 0.1 ETH here) to Wei
      // IMPORTANT: Replace "0.1" with the actual desired price, potentially from another form input.
      const ticketPriceInWei = ethers.utils.parseEther("0.1");
      const totalTickets = 100; // IMPORTANT: Replace with actual total tickets, potentially from another form input.

      // Call the createEvent function from EventTicketingService to interact with MetaMask and Blockchain
      console.log("Calling smart contract createEvent..."); // Log before contract call
      const transactionHash = await createEvent(name, description, "", unixDateTimestamp, totalTickets, ticketPriceInWei);
      console.log("Smart contract call finished. Transaction Hash:", transactionHash); // Log after contract call

      if (transactionHash) {
        console.log("Transaction hash received. Attempting to call backend API..."); // Log before fetch

        // Send the event data + transaction hash to the backend
        const response = await fetch('http://localhost:5000/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...eventData, transactionHash }),
        });

        console.log("Backend API response status:", response.status); // Log response status
        const data = await response.json();
        console.log("Backend API response data:", data); // Log response data

        if (response.ok) {
          setSuccessMessage('Event created successfully!');
          // Clear the form
          setName('');
          setDescription('');
          setDate('');
          setLocation('');
          // *** TODO: Add logic here to refresh the event list in your UI ***
          // This might involve:
          // - Calling a function passed via props (e.g., props.onEventCreated())
          // - Using a state management library (Context API, Redux) to refetch events
          // - Triggering a state update in a parent component
        } else {
          // Handle backend error (e.g., validation error like date in the past)
          console.error("Backend API error:", data); // Log backend error
          setErrorMessage(data.message || 'Error saving event details to backend.');
        }
      } else {
        // This case might be less likely if createEvent throws an error on failure
        console.error("No transaction hash received from smart contract call."); // Log if hash is missing
        setErrorMessage('Blockchain transaction failed or was cancelled.');
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error); // Log any caught errors
      setErrorMessage(error.message || 'An error occurred during event creation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-event-container">
      <h2>Create Event</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Event Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="date">Date</label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="location">Location</label>
          <input
            type="text"
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Creating Event...' : 'Create Event'}
        </button>
      </form>

      {errorMessage && <p className="error">{errorMessage}</p>}
      {successMessage && <p className="success">{successMessage}</p>}
    </div>
  );
};

export default CreateEvent;
