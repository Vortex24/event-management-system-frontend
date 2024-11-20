import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [events, setEvents] = useState([]); // State for events

    useEffect(() => {
        const token = localStorage.getItem('token'); // Use token to connect socket
        const userId = localStorage.getItem('userId'); // userId is stored in localStorage after login

        if (token && userId) {
            // Establish socket connection
            const newSocket = io('https://event-management-system-backend-pu9z.onrender.com');

            // Listen for notifications
            newSocket.on('rsvpNotification', (data) => {
                // Show the notification if it’s for the current logged-in user
                if (data.recipientId === userId) {
                    setNotifications((prev) => [...prev, data]);

                    // Remove notification after 5 seconds
                    setTimeout(() => {
                        setNotifications((prevNotifications) =>
                            prevNotifications.filter((notification) => notification.eventId !== data.eventId)
                        );
                    }, 3500);
                }
            });

            // Listen for real-time updates to "interestedCount"
            newSocket.on('updateInterestedCount', (data) => {
                // Use the functional form of setState to ensure we have the latest state
                setEvents((prevEvents) => {
                    // Map over the previous events to update the interested count for the specific event
                    const updatedEvents = prevEvents.map((event) =>
                        event._id === data.eventId
                            ? { ...event, interestedCount: data.interestedCount }
                            : event
                    );

                    // Return the updated events array
                    return updatedEvents;
                });
            });

            setSocket(newSocket);

            return () => newSocket.close();
        }
    }, []);

    return (
        <SocketContext.Provider
            value={{
                socket,
                notifications,
                events, // Provide events to be updated in components
                setEvents, // Allow direct updates to events from components
                removeNotification: (index) => {
                    setNotifications((prev) => prev.filter((_, i) => i !== index));
                },
            }}
        >
            {children}
        </SocketContext.Provider>
    );
};
