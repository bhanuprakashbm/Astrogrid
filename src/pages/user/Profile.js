import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const Profile = () => {
    const { currentUser, userData, updateUserProfile, updateUserEmail, updateUserPassword } = useAuth();

    const [name, setName] = useState(userData?.name || '');
    const [email, setEmail] = useState(currentUser?.email || '');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            // Update profile data
            await updateUserProfile({ name });

            // Update email if changed
            if (email !== currentUser.email) {
                await updateUserEmail(email);
            }

            // Update password if provided
            if (password) {
                if (password !== confirmPassword) {
                    setMessage({ type: 'error', text: 'Passwords do not match' });
                    setLoading(false);
                    return;
                }
                await updateUserPassword(password);
                setPassword('');
                setConfirmPassword('');
            }

            setMessage({ type: 'success', text: 'Profile updated successfully' });
        } catch (error) {
            console.error('Error updating profile:', error);
            let errorMessage = 'Error updating profile. Please try again.';

            if (error.code === 'auth/requires-recent-login') {
                errorMessage = 'For security reasons, please log out and log back in to change your email or password.';
            } else if (error.code === 'auth/email-already-in-use') {
                errorMessage = 'This email is already in use by another account.';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Invalid email format.';
            } else if (error.code === 'auth/weak-password') {
                errorMessage = 'Password is too weak. It should be at least 6 characters.';
            }

            setMessage({ type: 'error', text: errorMessage });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-lg mx-auto bg-gray-800 p-8 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold text-white mb-6">User Profile</h2>

                {message.text && (
                    <div className={`mb-4 p-3 rounded ${message.type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                            Full Name
                        </label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="appearance-none block w-full px-3 py-2 border border-gray-700 bg-gray-700 placeholder-gray-400 text-white rounded-md focus:outline-none focus:ring-space-blue focus:border-space-blue"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                            Email Address
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="appearance-none block w-full px-3 py-2 border border-gray-700 bg-gray-700 placeholder-gray-400 text-white rounded-md focus:outline-none focus:ring-space-blue focus:border-space-blue"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                            New Password (leave blank to keep current)
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="appearance-none block w-full px-3 py-2 border border-gray-700 bg-gray-700 placeholder-gray-400 text-white rounded-md focus:outline-none focus:ring-space-blue focus:border-space-blue"
                        />
                    </div>

                    <div className="mb-6">
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                            Confirm New Password
                        </label>
                        <input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="appearance-none block w-full px-3 py-2 border border-gray-700 bg-gray-700 placeholder-gray-400 text-white rounded-md focus:outline-none focus:ring-space-blue focus:border-space-blue"
                        />
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full px-4 py-2 bg-space-blue text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                            {loading ? 'Updating...' : 'Update Profile'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Profile; 