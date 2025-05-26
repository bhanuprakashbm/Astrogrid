import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCollection, deleteDocument } from '../services/database-adapter';
import { useAuth } from '../context/AuthContext';

const GroundStations = () => {
    const [groundStations, setGroundStations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const { currentUser } = useAuth();

    useEffect(() => {
        const fetchGroundStations = async () => {
            try {
                setLoading(true);
                const data = await getCollection('ground_stations');
                setGroundStations(data);
                setError(null);
            } catch (err) {
                console.error('Error fetching ground stations:', err);
                setError('Failed to load ground stations. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchGroundStations();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this ground station?')) {
            try {
                await deleteDocument('ground_stations', id);
                setGroundStations(groundStations.filter(station => station.id !== id));
            } catch (err) {
                console.error('Error deleting ground station:', err);
                setError('Failed to delete ground station. Please try again.');
            }
        }
    };

    // Filter ground stations based on search term
    const filteredGroundStations = groundStations.filter(station =>
        station.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        station.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">Ground Stations</h1>
                <Link to="/ground-stations/new" className="px-4 py-2 bg-space-blue text-white rounded-md hover:bg-space-blue-dark transition">
                    Add New Ground Station
                </Link>
            </div>

            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Search ground stations..."
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-space-blue"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {filteredGroundStations.length === 0 ? (
                <div className="bg-gray-800 rounded-lg p-6 text-center">
                    <p className="text-gray-400">No ground stations found. Try adjusting your search or add a new ground station.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredGroundStations.map((station) => (
                        <div key={station.id} className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                            <div className="p-6">
                                <h2 className="text-xl font-bold text-white mb-2">{station.name}</h2>
                                <p className="text-gray-400 mb-4">
                                    {station.description?.substring(0, 100)}
                                    {station.description?.length > 100 ? '...' : ''}
                                </p>
                                <div className="text-sm text-gray-500 mb-4">
                                    <p>Location: {station.location || 'N/A'}</p>
                                    <p>Coordinates: {station.coordinates ? `${station.coordinates.latitude}, ${station.coordinates.longitude}` : 'N/A'}</p>
                                    <p>Status: {station.status || 'N/A'}</p>
                                </div>
                                <div className="flex justify-between mt-4">
                                    <Link to={`/ground-stations/${station.id}`} className="text-space-blue hover:underline">
                                        View Details
                                    </Link>
                                    {currentUser?.role === 'admin' && (
                                        <button
                                            onClick={() => handleDelete(station.id)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default GroundStations; 