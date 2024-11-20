import React, { useEffect, useState } from 'react';
import { getUserRSVPs } from '../../services/api'; // Assuming you'll create this service
import '../../styles.css';

const UserRSVP = () => {
    const [rsvps, setRsvps] = useState([]);
    const [filter, setFilter] = useState('all'); // 'all', 'interested', 'maybe', 'ignore'

    useEffect(() => {
        const fetchUserRSVPs = async () => {
            try {
                const { data } = await getUserRSVPs(filter); // Pass filter value
                setRsvps(data.data); // Set the filtered RSVP data
            } catch (error) {
                console.error('Error fetching RSVP data:', error.response?.data?.message || error.message);
            }
        };

        fetchUserRSVPs();
    }, [filter]); // Re-fetch on filter change

    const handleFilterChange = (e) => {
        setFilter(e.target.value); // Set filter value to change the status filter
    };

    return (
        <div className="container">
            <h2>Your RSVPs</h2>
            
            {/* Filter options */}
            <div className="filter-bar">
                <label htmlFor="status-filter" className="filter-label">Filter by Status: </label>
                <select id="status-filter" value={filter} onChange={handleFilterChange} className="filter-select">
                    <option value="all">All</option>
                    <option value="interested">Interested</option>
                    <option value="maybe">Maybe</option>
                    <option value="ignore">Ignore</option>
                </select>
            </div>

            <div className="rsvp-list">
                {rsvps.length === 0 ? (
                    <p>No RSVPs found.</p>
                ) : (
                    rsvps.map((rsvp) => (
                        <div className="card" key={rsvp.event._id}>
                            <h3>{rsvp.event.title}</h3>
                            <p>{rsvp.event.location}</p>
                            <p>{new Date(rsvp.event.dateTime).toLocaleString()}</p>
                            <p>
                                <strong>Your Status: </strong>{rsvp.status}
                            </p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default UserRSVP;
