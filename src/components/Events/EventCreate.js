import React, { useState } from 'react';
import { createEvent } from '../../services/api';
import { useNavigate } from 'react-router-dom'; // Import useNavigate from react-router-dom
import '../../styles.css';

const EventCreate = () => {
    const [formData, setFormData] = useState({ title: '', dateTime: '', location: '' });
    const navigate = useNavigate(); // Initialize the navigate function

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            // Attempt to create the event
            await createEvent(formData);
            alert('Event created!');

            // After success, navigate back to the event list page
            navigate('/events'); // Adjust the path to your events list page
        } catch (error) {
            // Check if the error is a 403 (Access Denied)
            if (error.response && error.response.status === 403) {
                alert('Access Denied! You are not authorized to create an event.');
                navigate('/events'); // Navigate back to the event list page
            } else {
                console.error(error.response?.data?.message || error.message);
                alert('Event creation failed!');
            }
        }
    };

    return (
        <div>
            <h2>Create Event</h2>
            <form onSubmit={handleCreate}>
                <input
                    type="text"
                    placeholder="Title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                />
                <input
                    type="datetime-local"
                    value={formData.dateTime}
                    onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })}
                    required
                />
                <input
                    type="text"
                    placeholder="Location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                />
                <button type="submit">Create</button>
            </form>
        </div>
    );
};

export default EventCreate;
