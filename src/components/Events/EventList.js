import React, { useEffect, useState } from 'react';
import { getEvents, rsvpEvent, deleteEvent } from '../../services/api'; // Import deleteEvent API
import { Link, useNavigate } from 'react-router-dom'; 
import '../../styles.css';
import { useSocket } from '../../context/SocketContext';

const EventList = () => {
    const [events, setEvents] = useState([]); // Local state to hold events
    const navigate = useNavigate();
    // eslint-disable-next-line
    const { events: socketEvents, setEvents: setSocketEvents, socket } = useSocket(); // Using socket context

    // Check if the user is an admin
    const isAdmin = localStorage.getItem('role') === 'admin'; // Assuming 'role' is stored in localStorage

    // Fetch events from API when component mounts
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const { data } = await getEvents();
                setEvents(data.data); // Initialize with fetched event data
                setSocketEvents(data.data); // Set events for socket context too
            } catch (error) {
                console.error('Error fetching events:', error.response?.data?.message || error.message);
            }
        };
        fetchEvents();
    }, [setSocketEvents]);

    // Handle real-time updates from socket for RSVP and event updates
    useEffect(() => {
        if (!socket) return;

        // Listen for real-time updates to "interestedCount" or event status changes
        socket.on('updateInterestedCount', (data) => {
            // Update the events list with the new interested count
            setEvents((prevEvents) =>
                prevEvents.map((event) =>
                    event._id === data.eventId
                        ? { ...event, interestedCount: data.interestedCount } // Update only the affected event
                        : event
                )
            );
        });

        socket.on('rsvpStatusUpdated', (data) => {
            // Update the RSVP status for the event
            setEvents((prevEvents) =>
                prevEvents.map((event) =>
                    event._id === data.eventId
                        ? { ...event, userRSVP: data.status } // Update the RSVP status
                        : event
                )
            );
        });

        return () => {
            socket.off('updateInterestedCount');
            socket.off('rsvpStatusUpdated');
        };
    }, [socket]);

    // Handle RSVP updates for a user
    const handleRSVP = async (id, status) => {
        try {
            await rsvpEvent(id, { status });

            // Update the RSVP status for the event in the state
            setEvents((prevEvents) =>
                prevEvents.map((event) =>
                    event._id === id ? { ...event, userRSVP: status } : event
                )
            );

            alert('RSVP updated!');
        } catch (error) {
            console.error('RSVP failed:', error.response?.data?.message || error.message);
            alert('RSVP failed!');
        }
    };

    // Handle event deletion
    const handleDelete = async (eventId) => {
        try {
            await deleteEvent(eventId); // Call delete API
            setEvents((prevEvents) => prevEvents.filter((event) => event._id !== eventId)); // Remove deleted event from state
            alert('Event deleted!');
        } catch (error) {
            console.error('Error deleting event:', error.response?.data?.message || error.message);
            alert('Failed to delete event.');
        }
    };

    const handleLogout = () => {
        // Remove token from localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('role'); // Remove role as well

        // Redirect to login page
        navigate('/login');
    };

    return (
        <div className="container">
            <h2>Events</h2>
            <div className="logout-container">
                <button onClick={handleLogout} className="logout-btn">Logout</button>
            </div>

            {/* Button Links for RSVPs Page and Create Event */}
            <div className="button-container">
                <Link to="/user/rsvps">
                    <button className="btn">View My RSVPs</button>
                </Link>
                <Link to="/events/create">
                    <button className="btn">Create Event</button>
                </Link>
            </div>

            {/* Render list of events */}
            {events.length > 0 ? (
                events.map((event) => (
                    <div className="card" key={event._id}>
                        <h3>{event.title}</h3>
                        <p>{event.location}</p>
                        <p>{new Date(event.dateTime).toLocaleString()}</p>

                        {/* Show the number of interested users */}
                        <div className="interested-count">
                            <strong>
                                {event.interestedCount > 0
                                    ? `${event.interestedCount} user(s) are interested`
                                    : 'No one has shown interest yet'}
                            </strong>
                        </div>

                        {/* Show RSVP status and change options */}
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

                        {/* Options to update RSVP */}
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

                        {/* Delete button for admin */}
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
                <p>Loading events...</p>
            )}
        </div>
    );
};

export default EventList;
