import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { useInscriptions } from './context/InscriptionContext';
import { Link } from 'react-router-dom';
import './MyRegistrations.css';

const MyRegistrations = () => {
  const { user } = useAuth();
  const {
    registrations,
    isLoading,
    error,
    cancelRegistration,
    fetchRegistrations
  } = useInscriptions();

  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  useEffect(() => {
    if (user) {
      fetchRegistrations();
    }
  }, [user]);

  const handleUnregister = async (registrationId, eventId) => {
    if (window.confirm('Are you sure you want to cancel this registration?')) {
      await cancelRegistration(registrationId);
      await fetchRegistrations();
    }
  };

  const filteredRegistrations = registrations.filter(reg => {
    const eventDate = new Date(reg.eventId.date);
    const now = new Date();

    if (filter === 'upcoming') return eventDate > now;
    if (filter === 'past') return eventDate <= now;
    return true;
  });

  const sortedRegistrations = [...filteredRegistrations].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(a.eventId.date) - new Date(b.eventId.date);
    }
    return a.eventId.name.localeCompare(b.eventId.name);
  });

  if (isLoading) return <div className="loading">Loading your registrations...</div>;

  return (
    <div className="my-registrations-container">
      <div className="controls">
        <h1>My Event Registrations</h1>

        <div className="filters">
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Events</option>
            <option value="upcoming">Upcoming Events</option>
            <option value="past">Past Events</option>
          </select>

          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="date">Sort by Date</option>
            <option value="name">Sort by Name</option>
          </select>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {sortedRegistrations.length === 0 ? (
        <div className="no-registrations">
          <p>No registrations found</p>
          <Link to="/events" className="browse-events">
            Browse Events
          </Link>
        </div>
      ) : (
        <div className="registrations-list">
          {sortedRegistrations.map(registration => (
            <div key={registration._id} className="registration-card">
              <div className="event-info">
                <h3>{registration.eventId.name}</h3>
                <p className="event-date">
                  {new Date(registration.eventId.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
                <p className="event-location">📍 {registration.eventId.location}</p>
                <p className="registration-date">
                  Registered on: {new Date(registration.registrationDate).toLocaleDateString()}
                </p>
              </div>

              <div className="actions">
                <Link
                  to={`/events/${registration.eventId._id}`}
                  className="view-event-button"
                >
                  View Event
                </Link>
                <button
                  onClick={() => handleUnregister(registration._id, registration.eventId._id)}
                  className="unregister-button"
                  disabled={new Date(registration.eventId.date) < new Date()}
                >
                  {new Date(registration.eventId.date) < new Date()
                    ? 'Event Ended'
                    : 'Cancel Registration'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyRegistrations;