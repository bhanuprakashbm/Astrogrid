import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DatabaseStatus from '../../components/DatabaseStatus';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [resetEmailSent, setResetEmailSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [resetLoading, setResetLoading] = useState(false);
    const [showTest, setShowTest] = useState(false);
    const { login, resetPassword } = useAuth();
    const navigate = useNavigate();

    console.log('Login component rendered');

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Login form submitted');
        console.log('Email:', email);
        console.log('Password length:', password.length);

        try {
            setError('');
            setLoading(true);
            console.log('Attempting to log in...');
            const userCredential = await login(email, password);
            console.log('Login successful:', userCredential);
            navigate('/');
        } catch (error) {
            console.error('Login error:', error);
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);

            let errorMessage = 'Failed to log in. Please check your credentials.';
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                errorMessage = 'Invalid email or password';
            } else if (error.code === 'auth/configuration-not-found') {
                errorMessage = 'Authentication service is unavailable. Please try again later.';
            } else if (error.code === 'auth/too-many-requests') {
                errorMessage = 'Too many failed login attempts. Please try again later.';
            } else if (error.code === 'auth/network-request-failed') {
                errorMessage = 'Network error. Please check your internet connection.';
            }
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordReset = async (e) => {
        e.preventDefault();
        console.log('Password reset requested for:', email);

        if (!email) {
            setError('Please enter your email address to reset your password');
            return;
        }

        try {
            setResetLoading(true);
            setError('');
            console.log('Sending password reset email...');
            await resetPassword(email);
            console.log('Password reset email sent successfully');
            setResetEmailSent(true);
        } catch (error) {
            console.error('Password reset error:', error);
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);

            let errorMessage = 'Failed to send password reset email';
            if (error.code === 'auth/user-not-found') {
                errorMessage = 'No account found with this email address';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Invalid email address format';
            }
            setError(errorMessage);
        } finally {
            setResetLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-900">
            <div className="m-auto bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 p-8 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-3xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                    Sign In to AstroGrid
                </h2>

                <DatabaseStatus />

                {error && (
                    <div className="bg-red-900/50 border border-red-700/50 text-red-400 px-4 py-3 rounded relative mb-4" role="alert">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-300 text-sm font-medium mb-2" htmlFor="email">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-gray-900/50 border border-gray-700/50 rounded-lg py-2 px-3 text-gray-300 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-gray-300 text-sm font-medium mb-2" htmlFor="password">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-gray-900/50 border border-gray-700/50 rounded-lg py-2 px-3 text-gray-300 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        />
                    </div>

                    <div className="flex items-center justify-between mb-6">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors duration-200 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </div>

                    <div className="text-center">
                        <button
                            type="button"
                            onClick={handlePasswordReset}
                            disabled={resetLoading}
                            className="text-blue-400 hover:text-blue-500 text-sm"
                        >
                            Forgot Password?
                        </button>
                    </div>

                    <div className="mt-6 text-center text-gray-400">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-blue-400 hover:text-blue-500">
                            Sign up
                        </Link>
                    </div>
                </form>

                {resetEmailSent && (
                    <div className="mt-4 bg-green-900/50 border border-green-700/50 text-green-400 px-4 py-3 rounded relative" role="alert">
                        <span className="block sm:inline">Password reset email sent! Check your inbox.</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Login; 