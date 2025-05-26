import React, { useState, useEffect } from 'react';
import { db } from '../../services/api';
import { collection, getDocs, query, orderBy, addDoc, serverTimestamp } from '../../services/api';
import useRole from '../../hooks/useRole';

const GroundStations = () => {
    const [groundStations, setGroundStations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedStation, setSelectedStation] = useState(null);
    const { isAdmin, isEngineer } = useRole();

    // Form state for adding a new ground station
    const [newStation, setNewStation] = useState({
        name: '',
        location: '',
        latitude: '',
        longitude: '',
        status: 'operational',
        agency: 'NASA'
    });

    useEffect(() => {
        const fetchGroundStations = async () => {
            try {
                const q = query(collection(null, 'groundStations'), orderBy('name'));
                const stationsSnapshot = await getDocs(q);
                const stationsList = stationsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                setGroundStations(stationsList);
            } catch (error) {
                console.error("Error fetching ground stations:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchGroundStations();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewStation({
            ...newStation,
            [name]: value
        });
    };

    const handleAddStation = async (e) => {
        e.preventDefault();

        try {
            // Parse latitude and longitude as numbers
            const stationData = {
                ...newStation,
                latitude: parseFloat(newStation.latitude),
                longitude: parseFloat(newStation.longitude),
                createdAt: serverTimestamp()
            };

            await addDoc(collection(null, 'groundStations'), stationData);

            // Reset form and close modal
            setNewStation({
                name: '',
                location: '',
                latitude: '',
                longitude: '',
                status: 'operational',
                agency: 'NASA'
            });

            setShowAddModal(false);

            // Refresh the list
            const q = query(collection(null, 'groundStations'), orderBy('name'));
            const stationsSnapshot = await getDocs(q);
            const stationsList = stationsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            setGroundStations(stationsList);
        } catch (error) {
            console.error("Error adding ground station:", error);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-space-blue"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-white">Ground Stations</h1>

                {(isAdmin || isEngineer) && (
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-space-blue hover:bg-blue-700 text-white px-4 py-2 rounded-md transition duration-300"
                    >
                        Add Ground Station
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                <div className="lg:col-span-2 bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                    <div className="h-96 bg-gray-700 flex items-center justify-center">
                        <p className="text-gray-400">World map with ground stations would go here</p>
                        {/* This would be implemented with Leaflet/Mapbox */}
                    </div>
                </div>

                <div className="bg-gray-800 rounded-lg shadow-lg overflow-auto h-96">
                    <div className="p-4 bg-gray-700 sticky top-0">
                        <h2 className="text-xl font-bold text-white">Station List</h2>
                    </div>
                    <div className="p-4">
                        {groundStations.length > 0 ? (
                            <ul className="space-y-4">
                                {groundStations.map((station) => (
                                    <li
                                        key={station.id}
                                        className={`p-3 rounded-lg cursor-pointer transition-colors duration-200 ${selectedStation?.id === station.id ? 'bg-space-blue bg-opacity-50' : 'bg-gray-700 hover:bg-gray-600'
                                            }`}
                                        onClick={() => setSelectedStation(station)}
                                    >
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h3 className="font-medium text-white">{station.name}</h3>
                                                <p className="text-sm text-gray-300">{station.location}</p>
                                            </div>
                                            <span className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full
                        ${station.status === 'operational' ? 'bg-green-100 text-green-800' :
                                                    station.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-red-100 text-red-800'}`}>
                                                {station.status}
                                            </span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-400 text-center py-4">No ground stations found.</p>
                        )}
                    </div>
                </div>
            </div>

            {selectedStation && (
                <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-white">{selectedStation.name}</h2>
                            <p className="text-gray-400">{selectedStation.location}</p>
                        </div>
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
              ${selectedStation.status === 'operational' ? 'bg-green-100 text-green-800' :
                                selectedStation.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'}`}>
                            {selectedStation.status}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-xl font-semibold text-white mb-4">Details</h3>

                            <div className="space-y-3">
                                <div className="grid grid-cols-2">
                                    <p className="text-sm text-gray-400">Agency</p>
                                    <p className="text-white">{selectedStation.agency}</p>
                                </div>

                                <div className="grid grid-cols-2">
                                    <p className="text-sm text-gray-400">Coordinates</p>
                                    <p className="text-white">
                                        {selectedStation.latitude}° N, {selectedStation.longitude}° E
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xl font-semibold text-white mb-4">Recent Activity</h3>

                            <div className="bg-gray-700 rounded-lg p-4 text-center">
                                <p className="text-gray-400">Station activity would be displayed here</p>
                                {/* This would show recent satellite communications */}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Ground Station Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full">
                        <h2 className="text-2xl font-bold text-white mb-4">Add New Ground Station</h2>

                        <form onSubmit={handleAddStation}>
                            <div className="mb-4">
                                <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="name">
                                    Station Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={newStation.name}
                                    onChange={handleInputChange}
                                    className="bg-gray-700 text-white w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-space-blue"
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="location">
                                    Location
                                </label>
                                <input
                                    type="text"
                                    id="location"
                                    name="location"
                                    value={newStation.location}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Houston, Texas, USA"
                                    className="bg-gray-700 text-white w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-space-blue"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="latitude">
                                        Latitude
                                    </label>
                                    <input
                                        type="number"
                                        step="0.000001"
                                        id="latitude"
                                        name="latitude"
                                        value={newStation.latitude}
                                        onChange={handleInputChange}
                                        placeholder="e.g. 29.5502"
                                        className="bg-gray-700 text-white w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-space-blue"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="longitude">
                                        Longitude
                                    </label>
                                    <input
                                        type="number"
                                        step="0.000001"
                                        id="longitude"
                                        name="longitude"
                                        value={newStation.longitude}
                                        onChange={handleInputChange}
                                        placeholder="e.g. -95.097"
                                        className="bg-gray-700 text-white w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-space-blue"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div>
                                    <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="status">
                                        Status
                                    </label>
                                    <select
                                        id="status"
                                        name="status"
                                        value={newStation.status}
                                        onChange={handleInputChange}
                                        className="bg-gray-700 text-white w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-space-blue"
                                    >
                                        <option value="operational">Operational</option>
                                        <option value="maintenance">Maintenance</option>
                                        <option value="offline">Offline</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="agency">
                                        Agency
                                    </label>
                                    <select
                                        id="agency"
                                        name="agency"
                                        value={newStation.agency}
                                        onChange={handleInputChange}
                                        className="bg-gray-700 text-white w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-space-blue"
                                    >
                                        <option value="NASA">NASA</option>
                                        <option value="ESA">ESA</option>
                                        <option value="ISRO">ISRO</option>
                                        <option value="SpaceX">SpaceX</option>
                                        <option value="Roscosmos">Roscosmos</option>
                                        <option value="JAXA">JAXA</option>
                                        <option value="CNSA">CNSA</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition duration-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-space-blue hover:bg-blue-700 text-white px-4 py-2 rounded-md transition duration-300"
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

export default GroundStations; 