import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEvents } from '../context/EventContext';
import { useInscriptions } from '../context/InscriptionContext';
import './events.css';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getEventById, isLoading: eventLoading } = useEvents();
  const {
    registrations,
    isRegistered,
    createRegistration,
    cancelRegistration,
    error: registrationError
  } = useInscriptions();
  const [event, setEvent] = useState(null);
  const [registrationStatus, setRegistrationStatus] = useState(false);
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const eventData = await getEventById(id);
        setEvent(eventData);

        if (user) {
          const registered = await isRegistered(id);
          setRegistrationStatus(registered);
        }
      } catch (error) {
        console.error('Error fetching event:', error);
        navigate('/events');
      }
    };
    fetchEventData();
  }, [id, user, registrations]); 

  const handleRegistration = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setLocalError('');

    try {
      if (registrationStatus) {
        await cancelRegistration(id);
      } else {
        if (event.capacity <= 0) {
          setLocalError('Event is already full');
          return;
        }

      
        if (registrations.some(reg => reg.eventId._id === id)) {
          setLocalError('You are already registered for this event');
          return;
        }

        await createRegistration(id);
      }

     
      const updatedEvent = await getEventById(id);
      setEvent(updatedEvent);
      setRegistrationStatus(!registrationStatus);

    } catch (error) {
      console.error('Registration error:', error);
      setLocalError(
        error.response?.data?.error ||
        error.message ||
        'Registration failed. Please try again.'
      );
    }
  };

  if (eventLoading) return <div className="loading">Loading event details...</div>;

  return (
    <div className="event-details-container">
      {event && (
        <>
          <div className="event-header">
            <button 
              onClick={() => navigate('/events')}
              className="return-button"
            >
              ← Back to Events
            </button>
            <h1>{event.name}</h1>
            <div className="event-meta">
              <p className="date-location">
                {new Date(event.date).toLocaleDateString()} • {event.location}
              </p>
            </div>
          </div>

          <div className="event-body">
            {localError && (
              <div className="error-message">
                {localError.includes("full") ? "⛔ " : "⚠️ "}
                {localError}
              </div>
            )}

            <div className="description-section">
              <h2>About the Event</h2>
              <p className="description">{event.description}</p>
            </div>

            <div className="action-section">
              <div className="capacity-status">
                <span className="capacity-label">Available Spots:</span>
                <span className="capacity-value">{event.capacity}</span>
              </div>

              <button
                onClick={handleRegistration}
                className={`registration-btn ${registrationStatus ? 'registered' : ''}`}
                disabled={!user || event.capacity <= 0 || registrationStatus}
              >
                {!user ? 'Login to Register' :
                  registrationStatus ? 'Registered ✓' :
                    event.capacity > 0 ? 'Register Now' : 'Event Full'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default EventDetails;
