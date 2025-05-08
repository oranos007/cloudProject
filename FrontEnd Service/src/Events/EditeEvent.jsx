import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEvents } from '../context/EventContext';
import { useAuth } from '../context/AuthContext';
import './events.css';

const ModifyEvent = () => {
  const { id } = useParams();
  const { updateEvent, getEventById } = useEvents();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    date: '',
    location: '',
    capacity: ''
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadEvent = async () => {
      try {
        const event = await getEventById(id);
        if (event.userId.toString() !== user._id) {
          navigate('/unauthorized');
          return;
        }
        setFormData({
          name: event.name,
          description: event.description,
          date: new Date(event.date).toISOString().slice(0, 16),
          location: event.location,
          capacity: event.capacity.toString()
        });
      } catch (error) {
        setStatus({ type: 'error', message: 'Failed to load event details' });
        console.error('Loading error:', error);
      }
    };
    loadEvent();
  }, [id, user._id, navigate, getEventById]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await updateEvent(id, {
        ...formData,
        capacity: Number(formData.capacity),
        date: new Date(formData.date).toISOString()
      });
      setStatus({ type: 'success', message: 'Event updated successfully!' });
      setTimeout(() => navigate('/events'), 1500);
    } catch (error) {
      setStatus({ type: 'error', message: 'Failed to update event. Please try again.' });
      console.error('Update failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="event-form-container">
      <h2 className="modify-event-header">Modify Event</h2>
      
      {status.message && (
        <div className={`update-status ${status.type}`}>
          {status.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="event-form">
        <div className="form-group">
          <label>Event Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Date & Time</label>
            <input
              type="datetime-local"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Capacity</label>
            <input
              type="number"
              min="1"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            onClick={() => navigate(-1)} 
            className="cancel-btn"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="submit-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="button-loading">
                <span className="spinner"></span>
                Saving...
              </span>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ModifyEvent;