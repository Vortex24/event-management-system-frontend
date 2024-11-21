import axios from 'axios';

const API_URL = 'https://event-management-system-backend-pu9z.onrender.com/api'; // Adjust based on your backend URL

// Axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' },
});

// Add Token to Request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export const registerUser = (data) => api.post('/auth/register', data);
export const loginUser = (data) => api.post('/auth/login', data);
export const getEvents = () => api.get('/events');
export const createEvent = (data) => api.post('/events', data);
export const deleteEvent = (id) => api.delete(`/events/${id}`);
export const rsvpEvent = (id, data) => api.post(`/rsvp/${id}/rsvp`, data);
// filter based search
export const getUserRSVPs = (status) => api.get(`/rsvp/user-rsvps?status=${status}`);

export default api;
