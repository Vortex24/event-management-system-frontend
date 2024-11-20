import React, { useEffect, useState } from 'react';
import { useSocket } from '../context/SocketContext'; // Import the socket context

const NotificationPopup = () => {
    const { notifications, removeNotification } = useSocket(); // Add function to remove notification
    const [visibleNotifications, setVisibleNotifications] = useState([]);

    useEffect(() => {
        if (notifications.length > 0) {
            // Add new notifications to the visible list
            setVisibleNotifications((prev) => [...prev, ...notifications]);

            // Automatically remove each notification after 5 seconds
            notifications.forEach((notification, index) => {
                setTimeout(() => {
                    setVisibleNotifications((prev) =>
                        prev.filter((_, i) => i !== index)
                    );
                    removeNotification(index); // Remove notification from context
                }, 5000);
            });
        }
    }, [notifications, removeNotification]);

    return (
        <div style={notificationContainerStyle}>
            {visibleNotifications.length > 0 &&
                visibleNotifications.map((notification, index) => (
                    <div key={index} style={popupStyles}>
                        <p>{notification.message}</p>
                    </div>
                ))}
        </div>
    );
};

// Simple styling for the notification popup
const popupStyles = {
    position: 'fixed',
    top: '10px',
    right: '10px',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    color: '#fff',
    padding: '15px',
    borderRadius: '5px',
    zIndex: 9999,
    marginBottom: '10px', // Spacing between popups
};

const notificationContainerStyle = {
    position: 'fixed',
    top: '0',
    right: '0',
    zIndex: 9999,
};

export default NotificationPopup;
