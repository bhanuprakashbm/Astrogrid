import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
    const { signup } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [role, setRole] = useState('Observer');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            return setError('Passwords do not match');
        }

        try {
            setError('');
            setLoading(true);

            console.log('Attempting to sign up with:', { email, name, role });
            await signup(email, password, name, role);

            setSuccess(true);
            setTimeout(() => {
                navigate('/');
            }, 2000);
        } catch (error) {
            console.error('Registration error:', error);
            setError('Failed to create an account: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-900 p-4">
            <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
                <h1 className="text-3xl font-bold text-space-blue-500 mb-6 text-center">Join AstroGrid</h1>

                {error && (
                    <div className="bg-red-900 text-white p-3 rounded mb-4">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="bg-green-900 text-white p-3 rounded mb-4">
                        Account created successfully! Redirecting to dashboard...
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-300 mb-1">Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-gray-700 text-white border border-gray-600 rounded p-2"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-300 mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-gray-700 text-white border border-gray-600 rounded p-2"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-300 mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-gray-700 text-white border border-gray-600 rounded p-2"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-300 mb-1">Confirm Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full bg-gray-700 text-white border border-gray-600 rounded p-2"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-300 mb-1">Role</label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full bg-gray-700 text-white border border-gray-600 rounded p-2"
                        >
                            <option value="Observer">Observer</option>
                            <option value="Controller">Controller</option>
                            <option value="Admin">Admin</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-space-blue-700 hover:bg-space-blue-600 text-white font-bold py-2 px-4 rounded"
                    >
                        {loading ? 'Creating Account...' : 'Register'}
                    </button>
                </form>

                <div className="mt-4 text-center text-gray-400">
                    Already have an account? <Link to="/login" className="text-space-blue-500 hover:text-space-blue-400">Log In</Link>
                </div>
            </div>
        </div>
    );
};

export default Register; 