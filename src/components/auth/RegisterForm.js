import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const RegisterForm = () => {
    const { signup } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'Observer' // Default role
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Reset state
        setError('');
        setLoading(true);
        setSuccess(false);

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            setLoading(false);
            return;
        }

        try {
            // Register the user
            await signup(
                formData.email,
                formData.password,
                formData.name,
                formData.role
            );

            setSuccess(true);

            // Redirect to dashboard after successful registration
            setTimeout(() => {
                navigate('/dashboard');
            }, 1500);

        } catch (error) {
            setError(error.message || 'Failed to create an account');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-800 p-6 rounded-lg shadow-md w-full max-w-md">
            <h2 className="text-2xl font-bold text-white mb-6">Create an Account</h2>

            {error && (
                <div className="bg-red-600 text-white p-3 rounded mb-4">
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-green-600 text-white p-3 rounded mb-4">
                    Account created successfully! Redirecting to dashboard...
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-gray-300 mb-2" htmlFor="name">
                        Full Name
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        className="w-full bg-gray-700 text-white border border-gray-600 rounded py-2 px-3 focus:outline-none focus:border-blue-500"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-300 mb-2" htmlFor="email">
                        Email Address
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        className="w-full bg-gray-700 text-white border border-gray-600 rounded py-2 px-3 focus:outline-none focus:border-blue-500"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-300 mb-2" htmlFor="password">
                        Password
                    </label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        className="w-full bg-gray-700 text-white border border-gray-600 rounded py-2 px-3 focus:outline-none focus:border-blue-500"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-300 mb-2" htmlFor="confirmPassword">
                        Confirm Password
                    </label>
                    <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        className="w-full bg-gray-700 text-white border border-gray-600 rounded py-2 px-3 focus:outline-none focus:border-blue-500"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="mb-6">
                    <label className="block text-gray-300 mb-2" htmlFor="role">
                        Role
                    </label>
                    <select
                        id="role"
                        name="role"
                        className="w-full bg-gray-700 text-white border border-gray-600 rounded py-2 px-3 focus:outline-none focus:border-blue-500"
                        value={formData.role}
                        onChange={handleChange}
                    >
                        <option value="Observer">Observer</option>
                        <option value="Controller">Controller</option>
                        <option value="Admin">Administrator</option>
                    </select>
                </div>

                <button
                    type="submit"
                    className={`w-full py-2 px-4 rounded font-bold ${loading
                            ? 'bg-gray-500 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700'
                        } text-white transition duration-200`}
                    disabled={loading}
                >
                    {loading ? 'Creating Account...' : 'Register'}
                </button>
            </form>

            <div className="mt-4 text-center">
                <p className="text-gray-400">
                    Already have an account?{' '}
                    <button
                        onClick={() => navigate('/login')}
                        className="text-blue-400 hover:text-blue-300"
                    >
                        Log In
                    </button>
                </p>
            </div>
        </div>
    );
};

export default RegisterForm; 