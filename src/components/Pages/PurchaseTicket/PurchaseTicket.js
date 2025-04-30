// src/Pages/PurchaseTicket/PurchaseTicket.js
import React, { useState } from 'react';

const PurchaseTicket = ({ eventId, ticketPrice }) => {
  const [buyer, setBuyer] = useState('');
  const [message, setMessage] = useState('');

  const handlePurchase = async () => {
    const ticketData = {
      eventId,
      buyer,
      ticketPrice
    };

    try {
      const response = await fetch('http://localhost:5000/api/tickets/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticketData)
      });

      const data = await response.json();
      if (response.ok) {
        setMessage('Ticket purchased successfully!');
      } else {
        setMessage(`Error: ${data.message}`);
      }
    } catch (error) {
      setMessage('Error purchasing ticket');
    }
  };

  return (
    <div>
      <h2>Purchase Ticket</h2>
      <input
        type="text"
        placeholder="Enter your buyer information (e.g., wallet address)"
        value={buyer}
        onChange={(e) => setBuyer(e.target.value)}
      />
      <button onClick={handlePurchase}>Purchase Ticket</button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default PurchaseTicket;
