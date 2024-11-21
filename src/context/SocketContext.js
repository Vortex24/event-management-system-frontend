import React, { createContext, useContext, useState, useEffect } from 'react';
import { initializeSocket, getSocket } from '../utils/socket';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const [socketConnected, setSocketConnected] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [events, setEvents] = useState([]);
    const [userId, setUserId] = useState(localStorage.getItem('userId')); // Reactive userId

    // Immediately initialize the socket
    const socket = initializeSocket();

    // Keep userId updated if `localStorage` changes
    useEffect(() => {
        const handleStorageChange = () => {
            setUserId(localStorage.getItem('userId'));
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    // Set up event listeners directly
    useEffect(() => {
        socket.on('connect', () => setSocketConnected(true));
        socket.on('disconnect', () => setSocketConnected(false));

        // Example of handling notifications or custom events
        socket.on('rsvpNotification', (data) => {
            if (data.recipientId === userId) {
                setNotifications((prev) => [...prev, data]);

                // Remove notification after 3.5 seconds
                setTimeout(() => {
                    setNotifications((prevNotifications) =>
                        prevNotifications.filter((notification) => notification.eventId !== data.eventId)
                    );
                }, 3500);
            }
        });

        socket.on('updateInterestedCount', (data) => {
            setEvents((prevEvents) => {
                const updatedEvents = prevEvents.map((event) =>
                    event._id === data.eventId
                        ? { ...event, interestedCount: data.interestedCount }
                        : event
                );
                return updatedEvents;
            });
        });

        // Clean up listeners on unmount
        return () => {
            socket.off('rsvpNotification');
            socket.off('updateInterestedCount');
        };
    }, [socket, userId]); // Re-run listeners if userId changes

    const removeNotification = (index) => {
        setNotifications((prev) => prev.filter((_, i) => i !== index));
    };

    return (
        <SocketContext.Provider
            value={{
                socket: getSocket(),
                notifications,
                removeNotification,
                events,
                setEvents,
                socketConnected,
            }}
        >
            {children}
        </SocketContext.Provider>
    );
};
