import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import EventList from './components/Events/EventList';
import EventCreate from './components/Events/EventCreate';
import { SocketProvider } from './context/SocketContext';
import NotificationPopup from './components/NotificationPopup';
import UserRSVP from './components/RSVP/userRSVP';

const App = () => {
  // Check if the token exists (you can modify this to check for your preferred method of token storage)
  const token = localStorage.getItem('token');

  return (
    <SocketProvider>
      <Router>
        <NotificationPopup />
        <Routes>
          {/* Default route: redirect to login page if no token exists */}
          <Route path="/" element={token ? <Navigate to="/events" /> : <Navigate to="/login" />} />
          
          {/* Login route */}
          <Route path="/login" element={<Login />} />
          
          {/* Register route */}
          <Route path="/register" element={<Register />} />
          
          {/* If token exists, allow navigation to events page */}
          <Route path="/events" element={token ? <EventList /> : <Navigate to="/login" />} />
          
          {/* If token exists, allow navigation to create event page */}
          <Route path="/events/create" element={token ? <EventCreate /> : <Navigate to="/login" />} />

          {/* New route for the UserRSVP page */}
          <Route path="/user/rsvps" element={token ? <UserRSVP /> : <Navigate to="/login" />} />
        </Routes>
      </Router>
    </SocketProvider>
  );
};

export default App;
