import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCollection, deleteDocument } from '../services/database-adapter';
import { useAuth } from '../context/AuthContext';

const Satellites = () => {
    const [satellites, setSatellites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const { currentUser } = useAuth();

    useEffect(() => {
        const fetchSatellites = async () => {
            try {
                setLoading(true);
                const data = await getCollection('satellites');
                setSatellites(data);
                setError(null);
            } catch (err) {
                console.error('Error fetching satellites:', err);
                setError('Failed to load satellites. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchSatellites();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this satellite?')) {
            try {
                await deleteDocument('satellites', id);
                setSatellites(satellites.filter(satellite => satellite.id !== id));
            } catch (err) {
                console.error('Error deleting satellite:', err);
                setError('Failed to delete satellite. Please try again.');
            }
        }
    };

    // Filter satellites based on search term and status
    const filteredSatellites = satellites.filter(satellite => {
        const matchesSearch = satellite.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'All' || satellite.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    // Status options for filter dropdown
    const statusOptions = ['All', 'Operational', 'Maintenance', 'Warning', 'Critical', 'Inactive'];

    // Status badge color mapping
    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'Operational': return 'bg-green-100 text-green-800';
            case 'Maintenance': return 'bg-blue-100 text-blue-800';
            case 'Warning': return 'bg-yellow-100 text-yellow-800';
            case 'Critical': return 'bg-red-100 text-red-800';
            case 'Inactive': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
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
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">Satellites</h1>
                <Link to="/satellites/new" className="px-4 py-2 bg-space-blue text-white rounded-md hover:bg-space-blue-dark transition">
                    Add New Satellite
                </Link>
            </div>

            <div className="mb-6 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                {/* Search input */}
                <div className="flex-grow">
                    <input
                        type="text"
                        placeholder="Search satellites..."
                        className="w-full px-4 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-space-blue"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Status filter */}
                <div>
                    <select
                        className="w-full sm:w-auto px-4 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-space-blue"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        {statusOptions.map(status => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </select>
                </div>
            </div>

            {filteredSatellites.length === 0 ? (
                <div className="bg-gray-800 rounded-lg p-6 text-center">
                    <p className="text-gray-400">No satellites found. Try adjusting your filters or add a new satellite.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredSatellites.map((satellite) => (
                        <div key={satellite.id} className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                            <div className="p-6">
                                <div className="flex justify-between items-start">
                                    <h2 className="text-xl font-bold text-white mb-2">{satellite.name}</h2>
                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(satellite.status)}`}>
                                        {satellite.status}
                                    </span>
                                </div>
                                <p className="text-gray-400 mb-4">
                                    {satellite.description?.substring(0, 100)}
                                    {satellite.description?.length > 100 ? '...' : ''}
                                </p>
                                <div className="text-sm text-gray-500 mb-4">
                                    <p>Type: {satellite.type || 'N/A'}</p>
                                    <p>Launch Date: {satellite.launch_date || 'N/A'}</p>
                                    <p>Orbit: {satellite.orbit || 'N/A'}</p>
                                </div>
                                <div className="flex justify-between mt-4">
                                    <Link to={`/satellites/${satellite.id}`} className="text-space-blue hover:underline">
                                        View Details
                                    </Link>
                                    {currentUser?.role === 'admin' && (
                                        <button
                                            onClick={() => handleDelete(satellite.id)}
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

export default Satellites; 