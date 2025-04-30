// src/api.js

import axios from 'axios';
 
const API_URL = 'http://localhost:5000';
 
export const logTicketPurchase = async (user, eventId, ticketId) => {

  try {

    const res = await axios.post(`${API_URL}/log-ticket`, {

      user,

      eventId,

      ticketId,

    });

    console.log(res.data.message);

  } catch (err) {

    console.error('Failed to log ticket:', err);

  }

};

 