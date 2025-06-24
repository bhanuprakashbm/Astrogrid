import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/apiClient';
import { useAuth } from '../context/AuthContext';

const Missions = () => {
    const [missions, setMissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const { currentUser } = useAuth();

    const fetchMissions = async () => {
        try {
            setLoading(true);
            const data = await API.missions.getAll();
            setMissions(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching missions:', err);
            setError('Failed to load missions. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMissions();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this mission?')) {
            try {
                await API.missions.delete(id);
                setMissions(missions.filter(mission => mission.id !== id));
            } catch (err) {
                console.error('Error deleting mission:', err);
                setError('Failed to delete mission. Please try again.');
            }
        }
    };

    // Filter missions based on search term and status
    const filteredMissions = missions.filter(mission => {
        const matchesSearch =
            mission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            mission.description?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'All' || mission.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const getStatusClass = (status) => {
        switch (status) {
            case 'Active':
                return 'bg-green-500';
            case 'Planned':
                return 'bg-blue-500';
            case 'Completed':
                return 'bg-gray-500';
            case 'Cancelled':
                return 'bg-red-500';
            default:
                return 'bg-gray-500';
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
                <h1 className="text-3xl font-bold text-white">Missions</h1>
                <Link to="/missions/new" className="px-4 py-2 bg-space-blue text-white rounded-md hover:bg-space-blue-dark transition">
                    Add New Mission
                </Link>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-grow">
                    <input
                        type="text"
                        placeholder="Search missions..."
                        className="w-full px-4 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-space-blue"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="w-full md:w-64">
                    <select
                        className="w-full px-4 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-space-blue"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="All">All Statuses</option>
                        <option value="Active">Active</option>
                        <option value="Planned">Planned</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            {filteredMissions.length === 0 ? (
                <div className="bg-gray-800 rounded-lg p-6 text-center">
                    <p className="text-gray-400">No missions found. Try adjusting your search or add a new mission.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredMissions.map((mission) => (
                        <div key={mission.id} className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <h2 className="text-xl font-bold text-white">{mission.name}</h2>
                                    <span className={`px-2 py-1 text-xs font-semibold text-white rounded-full ${getStatusClass(mission.status)}`}>
                                        {mission.status || 'Unknown'}
                                    </span>
                                </div>
                                <p className="text-gray-400 mb-4">
                                    {mission.description?.substring(0, 100)}
                                    {mission.description?.length > 100 ? '...' : ''}
                                </p>
                                <div className="text-sm text-gray-500 mb-4">
                                    <p>Start Date: {mission.start_date ? new Date(mission.start_date).toLocaleDateString() : 'N/A'}</p>
                                    <p>End Date: {mission.end_date ? new Date(mission.end_date).toLocaleDateString() : 'N/A'}</p>
                                </div>
                                <div className="flex justify-between mt-4">
                                    <Link to={`/missions/${mission.id}`} className="text-space-blue hover:underline">
                                        View Details
                                    </Link>
                                    {currentUser?.role === 'admin' && (
                                        <button
                                            onClick={() => handleDelete(mission.id)}
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

export default Missions;