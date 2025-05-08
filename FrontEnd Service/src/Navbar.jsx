import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import './Navbar.css'; 

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        
        <Link to="/" className="navbar-brand">
          EventHub
        </Link>

      
        <div className="nav-links">
          <NavLink 
            to="/" 
            className="nav-link" 
            exact="true"
          >
            Home
          </NavLink>
          {user &&
          <NavLink 
            to="/events" 
            className="nav-link"
          >
            Events
          </NavLink>
          }
          {user && (
            <NavLink 
              to="/my-registrations" 
              className="nav-link"
            >
              My Registrations
            </NavLink>
          )}
        </div>

      
        <div className="auth-section">
          {user ? (
            <div className="profile-dropdown">
              <button className="profile-btn">
                <span className="profile-name">{user.firstName}</span>
                <span className="material-icons">⬇️</span>
              </button>
              <div className="dropdown-menu">
                <Link to="/profile" className="dropdown-item">
                  Profile
                </Link>
                <button onClick={logout} className="dropdown-item">
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="auth-link login">
                Login
              </Link>
              <Link to="/register" className="auth-link register">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
