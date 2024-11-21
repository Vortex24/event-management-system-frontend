// src/utils/socket.js
import { io } from 'socket.io-client';

let socket = null;

export const initializeSocket = () => {
    if (!socket) {
        socket = io('https://event-management-system-backend-pu9z.onrender.com'); // Connect without token or userId

        socket.on('connect', () => {
            console.log('Socket connected!');
        });

        socket.on('disconnect', () => {
            console.log('Socket disconnected!');
        });

        // Any other global event listeners can go here
        socket.on('serverMessage', (message) => {
            console.log('Message from server:', message);
        });
    }
    return socket;
};

export const getSocket = () => {
    if (!socket) {
        console.error('Socket has not been initialized. Call initializeSocket first.');
    }
    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
        console.log('Socket disconnected and reset!');
    }
};
