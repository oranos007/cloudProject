import { useEvents } from './context/EventContext';
import EventCard from './Events/EventCard';
import { React, useEffect, useState, useRef } from 'react';
import './Home.css';

const Home = () => {
  const { events, isLoading, error, fetchAllEvents } = useEvents();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [searchSubmitted, setSearchSubmitted] = useState(false);
  const eventsSectionRef = useRef(null);

  useEffect(() => {
    fetchAllEvents();
  }, []);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      setSearchSubmitted(true);
      if (eventsSectionRef.current) {
        eventsSectionRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const filteredEvents = events.filter(event => {
    const searchLower = searchTerm.toLowerCase();
    return (
      event.name.toLowerCase().includes(searchLower) ||
      `${event.userId?.firstName} ${event.userId?.lastName}`.toLowerCase().includes(searchLower)
    );
  });

  const sortedEvents = [...filteredEvents].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.date) - new Date(a.date);
    }
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="home-container">
      <section className="hero-section">
        <div className="hero-overlay">
          <div className="hero-content">
            <h1>Discover Amazing Events</h1>
            <p>Find and participate in exciting events near you</p>
            <div className="search-sort-container">
              <input
                type="text"
                placeholder="Search events or organizers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                className="search-input"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="featured-events" ref={eventsSectionRef}>
        <h2>Upcoming Events</h2>
        <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
              >
                <option value="date">Sort by Date</option>
                <option value="name">Sort by Name</option>
              </select>
              
        {isLoading && <p className="loading">Loading events...</p>}
        {error && <p className="error">{error}</p>}
        <div className="events-grid">
          {sortedEvents.slice(0, 6).map(event => (
            <EventCard key={event._id} event={event} />
          ))}
        </div>
        {!isLoading && sortedEvents.length === 0 && searchSubmitted && (
          <p className="no-events">No events found matching your search</p>
        )}
      </section>
    </div>
  );
};

export default Home;