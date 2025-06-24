import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/apiClient';
import './SatellitesList.css';

const SatellitesList = () => {
    const [satellites, setSatellites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchSatellites();
    }, []);

    const fetchSatellites = async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('Fetching satellites...');
            const data = await API.satellites.getAll();
            console.log('Received satellites:', data);
            if (!Array.isArray(data)) {
                throw new Error('Received invalid data format from API');
            }
            setSatellites(data);
        } catch (err) {
            console.error('Error fetching satellites:', err);
            console.error('Error details:', {
                message: err.message,
                response: err.response,
                stack: err.stack
            });
            setError('Failed to fetch satellites. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    // Log state changes
    useEffect(() => {
        console.log('Current satellites state:', satellites);
    }, [satellites]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-900">
                <div className="text-white">Loading satellites...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-900">
                <div className="text-red-500">{error}</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 bg-gray-900">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-white">Satellites ({satellites.length})</h1>
                <Link
                    to="/satellites/add"
                    className="bg-space-blue hover:bg-blue-700 text-white px-4 py-2 rounded-md transition duration-300"
                >
                    Add New Satellite
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Launch Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mass (kg)</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orbit</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {satellites.map((satellite) => (
                                <tr key={satellite.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{satellite.name}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">{satellite.type}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">
                                            {new Date(satellite.launch_date).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">{satellite.mass || 'N/A'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">{satellite.orbit}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            satellite.status === 'Operational' ? 'bg-green-100 text-green-800' :
                                            satellite.status === 'Non-operational' ? 'bg-red-100 text-red-800' :
                                            'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {satellite.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <Link
                                            to={`/satellites/${satellite.id}`}
                                            className="text-space-blue hover:text-blue-900"
                                        >
                                            View Details
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SatellitesList; 