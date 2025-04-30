import "./App.css";
import React, { useState, useEffect, useCallback } from 'react'; // Import useCallback
import axios from 'axios';
import { ethers } from 'ethers'; // Import ethers to format price if needed
// Import ABI implementation
import { createEvent, purchaseTicket, enterEvent, closeEvent, withdrawFunds, updateEventDetails } from './services/EventTicketingService';
import Navbar from './components/Header/Navbar'
import Footer from './components/Footer/Footer'

import { BrowserRouter as Router } from 'react-router-dom';
import Alert from './components/Alert/CustomAlerts'; // Assuming you have this component

// Define your backend API base URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function App() {
  const [alert, setAlert] = useState(null);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  // Example state for inputs - expand as needed
  const [eventIdInput, setEventIdInput] = useState('1');
  const [ticketPriceInput, setTicketPriceInput] = useState('10');
  const [ticketIdInput, setTicketIdInput] = useState('1');

  // Function to show alerts and automatically hide them
  const showAlert = (message, type = 'info', duration = 3000) => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), duration);
  };

  // --- Blockchain/Backend Interaction Functions ---
  async function performCreateEvent() {
    // Example: Use state or prompt for real values
    const name = prompt("Enter event name:", "My Test Event");
    const description = prompt("Enter description:", "Awesome event description");
    const imageUrl = prompt("Enter image URL:", "http://example.com/image.jpg");
    // Get date input (consider using a date picker component for better UX)
    const dateString = prompt("Enter event date (YYYY-MM-DD HH:MM):", "2024-12-31 18:00");
    const totalTickets = prompt("Enter total tickets:", "100");
    const ticketPrice = prompt("Enter ticket price (in Wei):", "10000000000000000"); // 0.01 ETH

    if (!name || !totalTickets || !ticketPrice || !dateString) {
        showAlert("All fields are required.", 'warning');
        return;
    }

    const dateTimestamp = Math.floor(new Date(dateString).getTime() / 1000);
    if (isNaN(dateTimestamp) || dateTimestamp <= Math.floor(Date.now() / 1000)) {
        showAlert("Invalid or past date.", 'warning');
        return;
    }

    setIsLoading(true);
    try {
      // 1. Create event on the blockchain
      const tx = await createEvent(name, description, imageUrl, dateTimestamp, parseInt(totalTickets), ticketPrice);
      console.log('Create Event Transaction:', tx);
      const receipt = await tx.wait(); // Wait for transaction confirmation
      console.log('Create Event Transaction Mined!');

      // 2. Save event details to the backend database
      await axios.post(`${API_URL}/events`, {
          name,
          description,
          imageUrl,
          date: dateTimestamp, // Send timestamp
          totalTickets: parseInt(totalTickets),
          ticketPrice: ticketPrice.toString(), // Send price as string
          transactionHash: receipt.transactionHash // Include the tx hash
      });
      console.log('Event saved to backend DB');

      showAlert(`Event "${name}" created successfully!`, 'success');
      performGetAllEvents(); // Refresh list
    } catch (error) {
      console.error("Create Event Error:", error);
      showAlert(`Error creating event: ${error.message || error}`, 'error');
    } finally {
      setIsLoading(false);
    }
  }

  async function performPurchaseTicket() {
    setIsLoading(true);
    try {
      // 1. Perform blockchain transaction
      const tx = await purchaseTicket(eventIdInput, ticketPriceInput);
      const receipt = await tx.wait();
      // Note: Extracting return value (ticketId) requires event parsing or more complex setup
      console.log('Purchase Ticket Transaction Mined:', receipt.transactionHash);

      // 2. Notify backend API (using the MongoDB _id for the event)
      // !! IMPORTANT: You need the MongoDB _id of the event, not the blockchain eventIdInput !!
      // You'll need to fetch the event from the backend first or pass the _id around.
      // For DEMO purposes, let's assume you have the MongoDB ID in a variable `mongoEventId`
      // You would typically get this when displaying the event list or selecting an event.
      // Example (replace with actual logic to get mongoEventId):
      // const mongoEventId = events.find(e => e.blockchainEventId === parseInt(eventIdInput))?._id;
      // if (mongoEventId) {
      //   await axios.post(`${API_URL}/tickets/purchase`, { eventId: mongoEventId, buyer: 'USER_ADDRESS', ticketPrice: ticketPriceInput }); // Adjust buyer/price as needed
      // }
      showAlert(`Ticket purchased successfully for event ${eventIdInput}! Tx: ${receipt.transactionHash}`, 'success');
      performGetAllEvents(); // Refresh event details (like ticketsSold)
    } catch (error) {
      console.error("Purchase Ticket Error:", error);
      showAlert(`Error purchasing ticket: ${error.message || error}`, 'error');
    } finally {
      setIsLoading(false);
    }
  }

  async function performEnterEvent() {
    setIsLoading(true);
    try {
      const tx = await enterEvent(ticketIdInput);
      await tx.wait();
      showAlert(`Ticket ${ticketIdInput} marked as entered!`, 'success');
      // Potentially refresh specific ticket status if displayed
    } catch (error) {
      console.error("Enter Event Error:", error);
      showAlert(`Error entering event: ${error.message || error}`, 'error');
    } finally {
      setIsLoading(false);
    }
  }

  async function performCloseEvent() {
    // Similar try/catch/finally structure as above...
    setIsLoading(true);
    try {
      // 1. Perform blockchain transaction
      const tx = await closeEvent(eventIdInput);
      await tx.wait();
      console.log('Close Event Transaction Mined!');

      // 2. Notify backend API to update the status
      // !! IMPORTANT: Again, you need the MongoDB _id !!
      // Example (replace with actual logic to get mongoEventId):
      // const mongoEventId = events.find(e => e.blockchainEventId === parseInt(eventIdInput))?._id;
      // if (mongoEventId) {
      //    await axios.patch(`${API_URL}/events/${mongoEventId}/close`);
      // }
      showAlert(`Event ${eventIdInput} closed.`, 'success');
      performGetAllEvents(); // Refresh list
    } catch (error) {
      console.error("Close Event Error:", error);
      showAlert(`Error closing event: ${error.message || error}`, 'error');
    } finally {
      setIsLoading(false);
    }
  }

  async function performWithdrawFunds() {
    setIsLoading(true);
    try {
      const tx = await withdrawFunds(eventIdInput);
      await tx.wait();
      showAlert(`Funds withdrawn for event ${eventIdInput}.`, 'success');
      // Optionally refresh event data if balance is displayed
    } catch (error) {
      console.error("Withdraw Funds Error:", error);
      showAlert(`Error withdrawing funds: ${error.message || error}`, 'error');
    } finally {
      setIsLoading(false);
    }
  }

  async function performUpdateEventDetails() {
    // Similar try/catch/finally structure as above... Use inputs for values
    await updateEventDetails(eventIdInput, "Updated Name", "Updated Desc", "newUrl", Math.floor((Date.now() + 86400000 * 2) / 1000), 5, 20);
  }

  const performGetAllEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch events from the backend API
      const response = await axios.get(`${API_URL}/events`);
      const fetchedEvents = response.data;

      console.log('Fetched Events Data from Backend:', fetchedEvents);
      setEvents(fetchedEvents || []); // Ensure it's an array
      // showAlert(`Fetched ${fetchedEvents?.length || 0} events.`, 'info'); // Optional: less noisy
    } catch (error) {
      console.error("Get All Events Error:", error);
      showAlert(`Error fetching events: ${error.message || error}`, 'error');
      setEvents([]); // Clear events on error
    } finally {
      setIsLoading(false);
    }
  }, [showAlert]); // Add showAlert as a dependency for useCallback

  // Fetch events on component mount
  useEffect(() => {
    performGetAllEvents();
  }, [performGetAllEvents]); // Now performGetAllEvents is stable due to useCallback


  // Return
  return (
   <Router>
     <div className="App">
     {alert && <Alert message={alert.message} type={alert.type} />} {/* Uncommented Alert */}

      {/* <Navbar /> */}
      {/* <div className=""> */}
        {/* DESCRIPTION  */}
        <div className="description">
          <h1>Welcome to Maevents</h1>
          <h3>An event ticketing platform foucsed on preventing ticket fraud.</h3>
        </div>

        {/* Example Inputs */}
        <div className="inputs">
             <label>
                 Event ID:
                 <input type="text" value={eventIdInput} onChange={(e) => setEventIdInput(e.target.value)} />
             </label>
             <label>
                 Ticket Price (Wei):
                 <input type="text" value={ticketPriceInput} onChange={(e) => setTicketPriceInput(e.target.value)} />
             </label>
              <label>
                 Ticket ID:
                 <input type="text" value={ticketIdInput} onChange={(e) => setTicketIdInput(e.target.value)} />
             </label>
        </div>

        {/* BUTTONS - Fetch and Set */}
        <div className="custom-buttons">
          <button onClick={performGetAllEvents} disabled={isLoading}>
            Get All Events
          </button>
          <button onClick={performCreateEvent} disabled={isLoading}>
            Create Event
          </button>
          <button onClick={performPurchaseTicket} disabled={isLoading}>
            Purchase Ticket
          </button>
          <button onClick={performEnterEvent} disabled={isLoading}>
            Enter Event
          </button>
          <button onClick={performCloseEvent} disabled={isLoading}>
            Close Event
          </button>
          <button onClick={performWithdrawFunds} disabled={isLoading}>
            Withdraw Funds
          </button>  
          <button onClick={performUpdateEventDetails} disabled={isLoading}>
            Edit Event
          </button>
        </div>

        {/* Display Events */}
        <div className="event-list">
            <h2>Available Events</h2>
            {isLoading && <p>Loading events...</p>}
            {events.length === 0 && !isLoading && <p>No events found.</p>}
            {events.map((event, index) => (
                // Display using data from backend model
                // Use event._id from MongoDB as the key for stability
                <div key={event._id || index} className="event-item">
                    <h4>{event.name}</h4>
                    <p>{event.description}</p>
                    {/* Format timestamp to readable date */}
                    <p>Date: {new Date(event.date * 1000).toLocaleString()}</p>
                    <p>Price: {event.ticketPrice != null ? ethers.utils.formatEther(event.ticketPrice) : 'N/A'} ETH</p> {/* Format Wei to ETH, handle null/undefined */}
                    {/* Now using data from the backend model */}
                    <p>Total Tickets: {event.totalTickets?.toString()}</p>
                    <p>Tickets Sold: {event.ticketsSold?.toString()}</p>
                    <p>Status: {event.isOpen ? 'Open' : 'Closed'}</p> {/* Should now reflect DB status */}
                </div>
            ))}
        </div>
      </div>
      {/* <Footer/> */}
    {/* </div> */}
   </Router>
  );
}

export default App;
