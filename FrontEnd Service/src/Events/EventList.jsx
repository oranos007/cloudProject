import React, { useEffect } from 'react';
import { useEvents } from '../context/EventContext';
import EventCard from './EventCard';
import { useAuth } from '../context/AuthContext';
import { Link, Navigate } from 'react-router-dom';
import './events.css';

const EventList = () => {
  const { user } = useAuth();
  const { events, isLoading, error, fetchUserEvents } = useEvents();

  useEffect(() => {
    if (user?._id) {
      fetchUserEvents(user._id);
    }
  }, [user]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="events-list-container">
    <div className="create-event-container">
      <Link to="/create-event" className="create-event-btn">
        + Create New Event
      </Link>
    </div>
    <div className="main-content">
        <div className="list-header">
          <h1>My Events</h1>
        </div>

      {isLoading && <div className="loading">Loading your events...</div>}
      {error && <div className="error-message">{error}</div>}

      <div className="events-grid compact-view">
        {events.length > 0 ? (
          events.map(event => (
            <EventCard key={event._id} event={event} showOwner={false} />
          ))
        ) : (
          !isLoading && (
            <div className="no-events">
              <p>No events found. Create your first event!</p>
            </div>
          )
        )}
      </div>
    </div>
    </div>
    
  );
};

export default EventList;