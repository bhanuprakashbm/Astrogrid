import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './SatellitesList.css';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/apiClient';

const SatellitesList = () => {
    const [satellites, setSatellites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { currentUser, userRole } = useAuth();
    const isAdmin = userRole === 'Admin';
    const isEngineer = userRole === 'Engineer' || isAdmin;

    useEffect(() => {
        fetchSatellites();
    }, []);

    const fetchSatellites = async () => {
        try {
            setLoading(true);
            console.log('Fetching satellites...');
            const response = await API.satellites.getAll();
            console.log('Received satellites data:', response);
            const satellitesArray = Array.isArray(response) ? response : [response];
            setSatellites(satellitesArray);
            console.log('Updated satellites state:', satellitesArray);
        } catch (err) {
            console.error('Error fetching satellites:', err);
            setError('Failed to fetch satellites. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-space-blue"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Error! </strong>
                <span className="block sm:inline">{error}</span>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-white">Satellites</h1>
                <Link
                    to="/satellites/new"
                    className="bg-space-blue hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
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
                                        <div className="text-sm font-medium text-gray-900">
                                            {satellite.name}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">
                                            {satellite.type}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">
                                            {satellite.launch_date ? new Date(satellite.launch_date).toLocaleDateString() : 'N/A'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">
                                            {satellite.mass || 'N/A'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">
                                            {satellite.orbit || 'N/A'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            satellite.status === 'Operational' ? 'bg-green-100 text-green-800' :
                                            satellite.status === 'Non-operational' ? 'bg-red-100 text-red-800' :
                                            satellite.status === 'In Development' ? 'bg-yellow-100 text-yellow-800' :
                                            satellite.status === 'Retired' ? 'bg-gray-100 text-gray-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                            {satellite.status || 'Unknown'}
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