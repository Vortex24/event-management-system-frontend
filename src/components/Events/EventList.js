import React, { useEffect, useState } from 'react';
import { getEvents, rsvpEvent, deleteEvent } from '../../services/api';
import { Link, useNavigate } from 'react-router-dom'; 
import '../../styles.css';
import { useSocket } from '../../context/SocketContext';

const EventList = () => {
    const [events, setEvents] = useState([]);
    const navigate = useNavigate();
    // eslint-disable-next-line
    const { events: socketEvents, setEvents: setSocketEvents, socket, socketConnected } = useSocket();

    const isAdmin = localStorage.getItem('role') === 'admin';

    // Fetch events when socket is connected
    useEffect(() => {
        if (socketConnected) {
            const fetchEvents = async () => {
                try {
                    const { data } = await getEvents();
                    setEvents(data.data); // Initialize with fetched event data
                    setSocketEvents(data.data); // Set events in socket context
                } catch (error) {
                    console.error('Error fetching events:', error.response?.data?.message || error.message);
                }
            };
            fetchEvents();
        }
    }, [socketConnected, setSocketEvents]);

    useEffect(() => {
        if (!socketConnected || !socket) return;

        socket.on('updateInterestedCount', (data) => {
            setEvents((prevEvents) =>
                prevEvents.map((event) =>
                    event._id === data.eventId
                        ? { ...event, interestedCount: data.interestedCount }
                        : event
                )
            );
        });

        socket.on('rsvpStatusUpdated', (data) => {
            setEvents((prevEvents) =>
                prevEvents.map((event) =>
                    event._id === data.eventId
                        ? { ...event, userRSVP: data.status }
                        : event
                )
            );
        });

        return () => {
            socket.off('updateInterestedCount');
            socket.off('rsvpStatusUpdated');
        };
    }, [socket, socketConnected]);

    const handleRSVP = async (id, status) => {
        try {
            setEvents((prevEvents) =>
                prevEvents.map((event) =>
                    event._id === id ? { ...event, userRSVP: status } : event
                )
            );
            await rsvpEvent(id, { status });
            alert('RSVP updated!');
        } catch (error) {
            console.error('RSVP failed:', error.response?.data?.message || error.message);
            alert('RSVP failed!');
            setEvents((prevEvents) =>
                prevEvents.map((event) =>
                    event._id === id ? { ...event, userRSVP: null } : event
                )
            );
        }
    };

    const handleDelete = async (eventId) => {
        try {
            await deleteEvent(eventId);
            setEvents((prevEvents) => prevEvents.filter((event) => event._id !== eventId));
            alert('Event deleted!');
        } catch (error) {
            console.error('Error deleting event:', error.response?.data?.message || error.message);
            alert('Failed to delete event.');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('role');
        navigate('/login');
    };

    if (!socketConnected) {
        return <div>Connecting to the server...</div>; // Show loading state until socket is ready
    }

    return (
        <div className="container">
            <h2>Events</h2>
            <div className="logout-container">
                <button onClick={handleLogout} className="logout-btn">Logout</button>
            </div>
            <div className="button-container">
                <Link to="/user/rsvps">
                    <button className="btn">View My RSVPs</button>
                </Link>
                <Link to="/events/create">
                    <button className="btn">Create Event</button>
                </Link>
            </div>
            {events.length > 0 ? (
                events.map((event) => (
                    <div className="card" key={event._id}>
                        <h3>{event.title}</h3>
                        <p>{event.location}</p>
                        <p>{new Date(event.dateTime).toLocaleString()}</p>
                        <div className="interested-count">
                            <strong>
                                {event.interestedCount > 0
                                    ? `${event.interestedCount} user(s) are interested`
                                    : 'No one has shown interest yet'}
                            </strong>
                        </div>
                        {event.userRSVP ? (
                            <p>
                                <strong>RSVP Status: </strong>
                                {event.userRSVP}
                            </p>
                        ) : (
                            <p>
                                <strong>No RSVP yet.</strong>
                            </p>
                        )}
                        <div>
                            <button
                                onClick={() => handleRSVP(event._id, 'interested')}
                                style={{
                                    backgroundColor: event.userRSVP === 'interested' ? '#007bff' : '#ccc',
                                    color: event.userRSVP === 'interested' ? '#fff' : '#000',
                                }}
                            >
                                Interested
                            </button>
                            <button
                                onClick={() => handleRSVP(event._id, 'maybe')}
                                style={{
                                    backgroundColor: event.userRSVP === 'maybe' ? '#ffc107' : '#ccc',
                                    color: event.userRSVP === 'maybe' ? '#fff' : '#000',
                                }}
                            >
                                Maybe
                            </button>
                            <button
                                onClick={() => handleRSVP(event._id, 'ignore')}
                                style={{
                                    backgroundColor: event.userRSVP === 'ignore' ? '#dc3545' : '#ccc',
                                    color: event.userRSVP === 'ignore' ? '#fff' : '#000',
                                }}
                            >
                                Ignore
                            </button>
                        </div>
                        {isAdmin && (
                            <button
                                onClick={() => handleDelete(event._id)}
                                className="delete-btn"
                                title="Delete Event"
                            >
                                🗑️
                            </button>
                        )}
                    </div>
                ))
            ) : (
                <p>No events available.</p>
            )}
        </div>
    );
};

export default EventList;
