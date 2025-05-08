import React, { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { registrationAPI } from '../api/registration';
import { useAuth } from './AuthContext';

const InscriptionContext = createContext();

export function InscriptionProvider({ children }) {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRegistrations = async () => {
    if (!user?._id) return;
    setIsLoading(true);
    try {
      const response = await registrationAPI.getRegistrations(); 
      setRegistrations(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch registrations');
    } finally {
      setIsLoading(false);
    }
  };

  const createRegistration = async (eventId) => {
    setIsLoading(true);
    try {
      const response = await registrationAPI.createRegistration(eventId);
      setRegistrations(prev => [...prev, response.data]);
      setError(null);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const cancelRegistration = async (registrationId) => {
    setIsLoading(true);
    try {
      await registrationAPI.cancelRegistration(registrationId);
      setRegistrations(prev => prev.filter(r => r._id !== registrationId));
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Cancellation failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const isRegistered = (eventId) => {
    return registrations.some(reg => reg.eventId._id === eventId);
  };

  useEffect(() => {
    fetchRegistrations();
  }, [user]);

 

  return (
    <InscriptionContext.Provider value={{
      registrations,
      isLoading,
      error,
      fetchRegistrations,
      createRegistration,
      cancelRegistration,
      isRegistered,
    }}>
      {children}
    </InscriptionContext.Provider>
  );
}

InscriptionProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useInscriptions = () => useContext(InscriptionContext);
