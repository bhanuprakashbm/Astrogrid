import React from 'react';

// This component shows the database status
const DatabaseStatus = () => {
    return (
        <div className="p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded">
            <h3 className="font-bold mb-2">Database Status</h3>
            <p>
                The application is using MySQL database for data storage.
            </p>
        </div>
    );
};

export default DatabaseStatus; 