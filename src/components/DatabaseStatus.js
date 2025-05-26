import React, { useState, useEffect } from 'react';
import { query } from '../utils/db';

/**
 * A component that checks and displays the database connection status
 */
const DatabaseStatus = () => {
    const [status, setStatus] = useState('checking');
    const [message, setMessage] = useState('Checking database connection...');

    useEffect(() => {
        const checkDatabaseConnection = async () => {
            try {
                // Try to query a simple test
                await query('SELECT 1');
                setStatus('connected');
                setMessage('Database connection successful');
            } catch (error) {
                console.error('Database connection error:', error);
                setStatus('error');
                setMessage(`Database connection failed: ${error.message}`);
            }
        };

        checkDatabaseConnection();
    }, []);

    return (
        <div className={`p-3 rounded-md mb-4 ${status === 'checking' ? 'bg-gray-100' :
                status === 'connected' ? 'bg-green-100' :
                    'bg-red-100'
            }`}>
            <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-2 ${status === 'checking' ? 'bg-gray-500' :
                        status === 'connected' ? 'bg-green-500' :
                            'bg-red-500'
                    }`}></div>
                <span className={
                    status === 'checking' ? 'text-gray-700' :
                        status === 'connected' ? 'text-green-700' :
                            'text-red-700'
                }>
                    {message}
                </span>
            </div>
        </div>
    );
};

export default DatabaseStatus; 