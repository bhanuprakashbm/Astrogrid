import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const LoginForm = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError('');
        setLoading(true);

        try {
            await login(formData.email, formData.password);
            navigate('/dashboard');
        } catch (error) {
            setError(error.message || 'Failed to log in');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-800 p-6 rounded-lg shadow-md w-full max-w-md">
            <h2 className="text-2xl font-bold text-white mb-6">Log In</h2>

            {error && (
                <div className="bg-red-600 text-white p-3 rounded mb-4">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
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

                <div className="mb-6">
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

                <button
                    type="submit"
                    className={`w-full py-2 px-4 rounded font-bold ${loading
                            ? 'bg-gray-500 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700'
                        } text-white transition duration-200`}
                    disabled={loading}
                >
                    {loading ? 'Logging In...' : 'Log In'}
                </button>
            </form>

            <div className="mt-4 text-center">
                <p className="text-gray-400">
                    Don't have an account?{' '}
                    <button
                        onClick={() => navigate('/register')}
                        className="text-blue-400 hover:text-blue-300"
                    >
                        Register
                    </button>
                </p>
            </div>

            <div className="mt-2 text-center">
                <button
                    className="text-blue-400 hover:text-blue-300 text-sm"
                    onClick={() => navigate('/forgot-password')}
                >
                    Forgot Password?
                </button>
            </div>
        </div>
    );
};

export default LoginForm; 