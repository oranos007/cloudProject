import React, { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { eventsAPI } from '../api/events';

const EventContext = createContext();

export function EventProvider({ children }) {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

 

const fetchAllEvents = async () => {
  setIsLoading(true);
  try {
    const response = await eventsAPI.getAll();
    setEvents(response.data);
    setError(null);
  } catch (err) {
    setError(err.response?.data?.error || 'Failed to fetch events');
  } finally {
    setIsLoading(false);
  }
};

const fetchUserEvents = async (userId) => {
  setIsLoading(true);
  try {
    const response = await eventsAPI.getByUser(userId);
    setEvents(response.data);
    setError(null);
  } catch (err) {
    setError(err.response?.data?.error || 'Failed to fetch your events');
  } finally {
    setIsLoading(false);
  }
};

  const createEvent = async (eventData) => {
    setIsLoading(true);
    try {
      const response = await eventsAPI.create(eventData);
      setEvents(prev => [...prev, response.data]);
      setError(null);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create event');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateEvent = async (id, updatedData) => {
    setIsLoading(true);
    try {
      const response = await eventsAPI.update(id, updatedData);
      setEvents(prev =>
        prev.map(event => event._id === id ? response.data : event)
      );
      setError(null);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update event');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteEvent = async (id) => {
    setIsLoading(true);
    try {
      await eventsAPI.delete(id);
      setEvents(prev => prev.filter(event => event._id !== id));
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete event');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getEventById = async (id) => {
    setIsLoading(true);
    try {
      const response = await eventsAPI.getById(id);
      setError(null);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch event');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };


 

  return (
    <EventContext.Provider value={{
      events,
      isLoading,
      error,
      fetchAllEvents,
      fetchUserEvents,
      getEventById,
      createEvent,
      updateEvent,
      deleteEvent, 
    }}>
      {children}
    </EventContext.Provider>
  );
}

EventProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useEvents = () => useContext(EventContext);
