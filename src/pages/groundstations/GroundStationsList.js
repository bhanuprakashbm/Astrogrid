import React, { useEffect, useState } from 'react';
import API from '../../services/apiClient';
import useRole from '../../hooks/useRole';

const GroundStationsList = () => {
    const [groundStations, setGroundStations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const { isAdmin, isEngineer } = useRole();

    // Form state for adding a new ground station
    const [newGroundStation, setNewGroundStation] = useState({
        name: '',
        location: '',
        latitude: '',
        longitude: '',
        elevation: '',
        status: 'Operational',
        description: ''
    });

    useEffect(() => {
        const fetchGroundStations = async () => {
            setLoading(true);
            try {
                const results = await API.groundStations.getAll();
                setGroundStations(results);
            } catch (error) {
                console.error("Error fetching ground stations:", error);
                setError(error.message);
                setGroundStations([]);
            } finally {
                setLoading(false);
            }
        };

        fetchGroundStations();
    }, []);

    const handleAddGroundStation = async (e) => {
        e.preventDefault();
        try {
            // Create new ground station using API
            const newStationData = await API.groundStations.create(newGroundStation);

            // Add the new ground station to the state
            setGroundStations(prev => [...prev, newStationData]);
            setShowAddModal(false);

            // Reset the form
            setNewGroundStation({
                name: '',
                location: '',
                latitude: '',
                longitude: '',
                elevation: '',
                status: 'Operational',
                description: ''
            });
        } catch (error) {
            console.error("Error adding ground station:", error);
            alert("Failed to add ground station. Please try again.");
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewGroundStation(prev => ({
            ...prev,
            [name]: value
        }));
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading ground stations...</div>;
    }

    if (error) {
        return <div className="text-red-500">Error: {error}</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Ground Stations</h1>
                {(isAdmin || isEngineer) && (
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
                    >
                        Add Ground Station
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groundStations.map((station) => (
                    <div key={station.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="p-6">
                            <div className="flex justify-between items-start">
                                <h2 className="text-xl font-semibold text-gray-800">{station.name}</h2>
                                <span className={`px-2 py-1 rounded text-sm ${
                                    station.status === 'Operational' ? 'bg-green-100 text-green-800' :
                                    station.status === 'Maintenance' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                }`}>
                                    {station.status}
                                </span>
                            </div>
                            <p className="text-gray-600 mt-2">{station.location}</p>
                            <div className="mt-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Coordinates:</span>
                                    <span className="text-gray-800">
                                        {station.latitude}°, {station.longitude}°
                                    </span>
                                </div>
                                {station.elevation && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Elevation:</span>
                                        <span className="text-gray-800">{station.elevation}m</span>
                                    </div>
                                )}
                            </div>
                            {station.description && (
                                <p className="mt-4 text-sm text-gray-600">{station.description}</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Ground Station Modal */}
            {showAddModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg p-8 max-w-md w-full">
                        <h2 className="text-2xl font-bold mb-4">Add New Ground Station</h2>
                        <form onSubmit={handleAddGroundStation}>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                                    Station Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={newGroundStation.name}
                                    onChange={handleInputChange}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="location">
                                    Location
                                </label>
                                <input
                                    type="text"
                                    id="location"
                                    name="location"
                                    value={newGroundStation.location}
                                    onChange={handleInputChange}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="latitude">
                                        Latitude
                                    </label>
                                    <input
                                        type="number"
                                        step="0.0001"
                                        id="latitude"
                                        name="latitude"
                                        value={newGroundStation.latitude}
                                        onChange={handleInputChange}
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        required
                                    />
                                </div>
        <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="longitude">
                                        Longitude
                                    </label>
                                    <input
                                        type="number"
                                        step="0.0001"
                                        id="longitude"
                                        name="longitude"
                                        value={newGroundStation.longitude}
                                        onChange={handleInputChange}
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="elevation">
                                    Elevation (meters)
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    id="elevation"
                                    name="elevation"
                                    value={newGroundStation.elevation}
                                    onChange={handleInputChange}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="status">
                                    Status
                                </label>
                                <select
                                    id="status"
                                    name="status"
                                    value={newGroundStation.status}
                                    onChange={handleInputChange}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                >
                                    <option value="Operational">Operational</option>
                                    <option value="Maintenance">Maintenance</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                                    Description
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={newGroundStation.description}
                                    onChange={handleInputChange}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    rows="3"
                                />
                            </div>
                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
                                >
                                    Add Station
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GroundStationsList; 