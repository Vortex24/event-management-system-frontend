import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import EventList from './components/Events/EventList';
import EventCreate from './components/Events/EventCreate';
import { SocketProvider, useSocket } from './context/SocketContext';
import NotificationPopup from './components/NotificationPopup';
import UserRSVP from './components/RSVP/userRSVP';

const ProtectedRoute = ({ token, children }) => {
    if (!token) {
        return <Navigate to="/login" />;
    }
    return children;
};

const AppContent = () => {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const { socketConnected } = useSocket();

    if (!socketConnected) {
        return <div>Connecting to server...</div>;
    }

    return (
        <Router>
            <NotificationPopup />
            <Routes>
                <Route
                    path="/"
                    element={token ? <Navigate to="/events" /> : <Navigate to="/login" />}
                />
                <Route path="/login" element={<Login setToken={setToken} />} />
                <Route path="/register" element={<Register setToken={setToken} />} />
                <Route
                    path="/events"
                    element={
                        <ProtectedRoute token={token}>
                            <EventList />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/events/create"
                    element={
                        <ProtectedRoute token={token}>
                            <EventCreate />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/user/rsvps"
                    element={
                        <ProtectedRoute token={token}>
                            <UserRSVP />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </Router>
    );
};

const App = () => (
    <SocketProvider>
        <AppContent />
    </SocketProvider>
);

export default App;
