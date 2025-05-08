
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEvents } from '../context/EventContext';
import { userAPI } from '../api/users';
import {React, useEffect, useState } from 'react';
import PropTypes from 'prop-types';

const EventCard = ({ event, showOwner = true }) => {
  const { user } = useAuth();
  const { deleteEvent } = useEvents();
  const [organizer, setOrganizer] = useState(null);
  const [loadingOrganizer, setLoadingOrganizer] = useState(true);


  useEffect(() => {
    const fetchOrganizer = async () => {
      try {
        const response = await userAPI.getUserById(event.userId);
        setOrganizer(response.data);
      } catch (error) {
        console.error('Error fetching organizer:', error);
      } finally {
        setLoadingOrganizer(false);
      }
    };

    if (showOwner) {
      fetchOrganizer();
    }
  }, [event.userId, showOwner]);

  
  const isOwner = user?._id === event.userId.toString();

  return (
    <div className="event-card">
      <div className="card-header">
        <h3>{event.name}</h3>
      </div>
      <div className="card-body">
        <div className="card-meta">
          <span className="meta-item date">
            {new Date(event.date).toLocaleDateString()}
          </span>
          <span className="meta-item location">
            {event.location}
          </span>
          <span className="meta-item capacity">
            {event.capacity} spots
          </span>
        </div>

        {showOwner && (
          <div className="event-organizer">
            {loadingOrganizer ? (
              <span>Loading...</span>
            ) : organizer ? (
              <span>{organizer.firstName} {organizer.lastName}</span>
            ) : (
              <span>Organizer</span>
            )}
          </div>
        )}

        <div className="event-actions">
          <Link to={`/events/${event._id}`} className="details-btn">
            View Details
          </Link>
          
          {isOwner && (
            <>
              <Link to={`/events/edit/${event._id}`} className="modify-btn">
                Modify
              </Link>
              <button 
                className="delete-btn"
                onClick={() => deleteEvent(event._id)}
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

EventCard.propTypes = {
  event: PropTypes.shape({
    userId: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired,
    capacity: PropTypes.number.isRequired,
    _id: PropTypes.string.isRequired,
  }).isRequired,
  showOwner: PropTypes.bool,
};
export default EventCard;
