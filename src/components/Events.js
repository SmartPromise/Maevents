import React, { useEffect, useState } from 'react';

function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      const response = await fetch("http://localhost:5000/getAllEvents");
      const data = await response.json();
      setEvents(data); // Set events in state
      setLoading(false);
    }

    fetchEvents();
  }, []);

  

  return (
    <div>
      {/* No events or event list */}
      <ul>
        {events.map(event => (
          <li key={event._id}>{event.name} - {new Date(event.date).toLocaleDateString()} - {event.location}</li>
        ))}
      </ul>
    </div>
  );
}

export default Events;
