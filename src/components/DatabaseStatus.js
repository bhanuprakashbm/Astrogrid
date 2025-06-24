import React, { useState, useEffect } from 'react';
import API from '../services/apiClient';

/**
 * A component that checks and displays the database connection status
 */
const DatabaseStatus = () => {
    const [status, setStatus] = useState('checking');
    const [error, setError] = useState(null);

    useEffect(() => {
        const checkStatus = async () => {
            try {
                const result = await API.checkDatabaseConnection();
                setStatus(result.status);
                setError(null);
            } catch (err) {
                setStatus('error');
                setError(err.message);
            }
        };

        checkStatus();
    }, []);

    if (status === 'checking') {
        return (
            <div className="mb-4 p-3 bg-gray-800/50 border border-gray-700/50 rounded-lg">
                <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                    <span className="ml-2 text-gray-300">Checking database connection...</span>
                </div>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="mb-4 p-3 bg-red-900/50 border border-red-700/50 rounded-lg">
                <div className="flex items-center">
                    <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="ml-2 text-red-400">Database connection error: {error}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="mb-4 p-3 bg-green-900/50 border border-green-700/50 rounded-lg">
            <div className="flex items-center">
                <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="ml-2 text-green-400">Database connected</span>
            </div>
        </div>
    );
};

export default DatabaseStatus; 