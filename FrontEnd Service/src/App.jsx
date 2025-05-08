import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './Authentification/login';
import Register from './Authentification/register';
import EventList from './Events/EventList';
import EventDetails from './Events/EventDetails';
import CreateEvent from './Events/CreateEvent';
import EditEvent from './Events/EditeEvent';
import MyRegistrations from './MyRegistrations';
import EditProfile from './EditProfile';
import Home from './Home';
import SearchEvents from './Events/SearchEvents';
import Navbar from './Navbar';
import { useAuth } from './context/AuthContext';


const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};

const AppLayout = () => {
  const { user } = useAuth();

  return (
    <>
      <Navbar />
      <main>
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
          {/* User Routes */}
          <Route path="/profile" element={user ? <EditProfile /> : <Navigate to="/login" />} />

          {/* Events Routes */}
          <Route path="/events" element={<EventList />} />
          <Route path="/events/:id" element={<EventDetails />} />
          <Route path="/create-event" element={user ? <CreateEvent /> : <Navigate to="/login" />} />
          <Route path="/events/edit/:id" element={user ? <EditEvent /> : <Navigate to="/login" />} />

          {/* Register Routes */}
          <Route path="/my-registrations" element={user ? <MyRegistrations /> : <Navigate to="/login" />} />

          {/* Search */}
          <Route path="/search" element={<SearchEvents />} />

          {/*Home */}
          <Route path="/" element={<Home />} />

          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </>
  );
};

export default AppLayout;