import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../../services/api';
import '../../styles.css';

const Login = ({ setToken }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const { data } = await loginUser({ email, password });
            
            // Save token and other details in localStorage
            localStorage.setItem('token', data.data.token);
            localStorage.setItem('userId', data.data.user._id);
            localStorage.setItem('role', data.data.user.role);

            // Update token state in App.js
            setToken(data.data.token);

            // Navigate to the events page
            navigate('/events');
        } catch (error) {
            console.error(error.response?.data?.message || 'An error occurred');
            alert('Login failed!');
        }
    };

    return (
        <div>
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">Login</button>
                <a href="/register" className="link">
                    Don't have an account? Register
                </a>
            </form>
        </div>
    );
};

export default Login;
