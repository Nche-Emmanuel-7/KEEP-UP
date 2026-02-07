import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../api/api';
import '../styles/App.css';

function Signup() {
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',
        confirm_password: ''
    });
    const [message, setMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setIsSuccess(false);

        if (formData.password !== formData.confirm_password) {
            setMessage("Passwords do not match!");
            return;
        }

        if (!formData.full_name || !formData.email || !formData.password) {
            setMessage("All fields are required");
            return;
        }

        try {
            setLoading(true);
            const res = await registerUser({
                full_name: formData.full_name,
                email: formData.email,
                password: formData.password
            });

            if (res.message === 'Registration successful') {
                setIsSuccess(true);
                setMessage("Registration successful! Redirecting to login...");
                setTimeout(() => {
                    navigate('/');
                }, 2000);
            } else {
                setMessage(res.message || res.error || "Registration failed");
            }
        } catch (err) {
            setMessage(err.message || "Error signing up. Please try again.");
            console.error('Signup error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <form onSubmit={handleSubmit}>
                <h2>Sign Up</h2>
                <input 
                    type="text" 
                    name="full_name" 
                    placeholder="Full Name" 
                    value={formData.full_name} 
                    onChange={handleChange} 
                    required 
                />
                <input 
                    type="email" 
                    name="email" 
                    placeholder="Email" 
                    value={formData.email} 
                    onChange={handleChange} 
                    required 
                />
                <input 
                    type="password" 
                    name="password" 
                    placeholder="Password" 
                    value={formData.password} 
                    onChange={handleChange} 
                    required 
                />
                <input 
                    type="password" 
                    name="confirm_password" 
                    placeholder="Confirm Password" 
                    value={formData.confirm_password} 
                    onChange={handleChange} 
                    required 
                />
                <button type="submit" disabled={loading}>
                    {loading ? "Signing Up..." : "Sign Up"}
                </button>
                {message && <p style={{color: isSuccess ? 'green' : 'red'}}>{message}</p>}
            </form>
            <p>
                Already have an account? <Link to="/">Login</Link>
            </p>
        </div>
    );
}

export default Signup;
