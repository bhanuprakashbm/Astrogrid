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
        <div className="flex min-h-screen bg-gray-100">
            <div className="m-auto bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Sign In to AstroGrid</h2>

                <DatabaseStatus />

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            required
                        />
                    </div>
                    <div className="flex items-center justify-between mb-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
                        >
                            {loading ? 'Signing In...' : 'Sign In'}
                        </button>
                    </div>
                    <div className="text-center">
                        <Link to="/forgot-password" className="text-sm text-blue-500 hover:text-blue-700">
                            Forgot Password?
                        </Link>
                    </div>
                </form>
                <hr className="my-6 border-gray-300" />
                <div className="text-center">
                    <p className="text-sm text-gray-600">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-blue-500 hover:text-blue-700">
                            Register
                        </Link>
                    </p>
                </div>
                <div className="mt-6 text-xs text-gray-500 text-center">
                    <p>Sample Accounts:</p>
                    <p>admin@astronet.io / spaceadmin2025 (Admin)</p>
                    <p>mission@astronet.io / mission2025ctrl (Controller)</p>
                    <p>user@astronet.io / viewonly2025 (Observer)</p>
                </div>
            </div>
        </div>
    );
};

export default Login; 