import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../services/apiClient';

const MissionDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [mission, setMission] = useState(null);
    const [satellites, setSatellites] = useState([]);
    const [groundStations, setGroundStations] = useState([]);
    const [availableSatellites, setAvailableSatellites] = useState([]);
    const [availableGroundStations, setAvailableGroundStations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch mission data and relationships
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [
                    missionData,
                    allSatellites,
                    allGroundStations,
                    missionSatellites,
                    missionGroundStations
                ] = await Promise.all([
                    API.missions.getById(id),
                    API.satellites.getAll(),
                    API.groundStations.getAll(),
                    API.missions.getSatellites(id),
                    API.missions.getGroundStations(id)
                ]);

                setMission(missionData);
                setSatellites(missionSatellites);
                setGroundStations(missionGroundStations);
                
                // Filter out already connected satellites and ground stations
                const connectedSatIds = new Set(missionSatellites.map(s => s.id));
                const connectedGSIds = new Set(missionGroundStations.map(gs => gs.id));
                
                setAvailableSatellites(allSatellites.filter(s => !connectedSatIds.has(s.id)));
                setAvailableGroundStations(allGroundStations.filter(gs => !connectedGSIds.has(gs.id)));
                
                setError(null);
            } catch (err) {
                console.error('Error fetching mission details:', err);
                setError('Failed to load mission details. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleAddSatellite = async (satelliteId) => {
        try {
            await API.missions.addSatellite(id, satelliteId);
            // Refresh data
            const [satellite] = availableSatellites.filter(s => s.id === satelliteId);
            setSatellites([...satellites, satellite]);
            setAvailableSatellites(availableSatellites.filter(s => s.id !== satelliteId));
        } catch (err) {
            console.error('Error adding satellite:', err);
            setError('Failed to add satellite. Please try again.');
        }
    };

    const handleRemoveSatellite = async (satelliteId) => {
        try {
            await API.missions.removeSatellite(id, satelliteId);
            // Refresh data
            const [satellite] = satellites.filter(s => s.id === satelliteId);
            setAvailableSatellites([...availableSatellites, satellite]);
            setSatellites(satellites.filter(s => s.id !== satelliteId));
        } catch (err) {
            console.error('Error removing satellite:', err);
            setError('Failed to remove satellite. Please try again.');
        }
    };

    const handleAddGroundStation = async (stationId) => {
        try {
            await API.missions.addGroundStation(id, stationId);
            // Refresh data
            const [station] = availableGroundStations.filter(gs => gs.id === stationId);
            setGroundStations([...groundStations, station]);
            setAvailableGroundStations(availableGroundStations.filter(gs => gs.id !== stationId));
        } catch (err) {
            console.error('Error adding ground station:', err);
            setError('Failed to add ground station. Please try again.');
        }
    };

    const handleRemoveGroundStation = async (stationId) => {
        try {
            await API.missions.removeGroundStation(id, stationId);
            // Refresh data
            const [station] = groundStations.filter(gs => gs.id === stationId);
            setAvailableGroundStations([...availableGroundStations, station]);
            setGroundStations(groundStations.filter(gs => gs.id !== stationId));
        } catch (err) {
            console.error('Error removing ground station:', err);
            setError('Failed to remove ground station. Please try again.');
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

    if (!mission) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-400">Mission not found</h2>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <button
                    onClick={() => navigate('/missions')}
                    className="text-space-blue hover:underline mb-4 flex items-center"
                >
                    ← Back to Missions
                </button>
                <h1 className="text-3xl font-bold text-white mb-2">{mission.name}</h1>
                <div className="flex items-center space-x-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        mission.status === 'Active' ? 'bg-green-500' :
                        mission.status === 'Planned' ? 'bg-blue-500' :
                        mission.status === 'Completed' ? 'bg-gray-500' :
                        'bg-red-500'
                    } text-white`}>
                        {mission.status}
                    </span>
                    <span className="text-gray-400">
                        {mission.start_date && `Start: ${new Date(mission.start_date).toLocaleDateString()}`}
                    </span>
                    <span className="text-gray-400">
                        {mission.end_date && `End: ${new Date(mission.end_date).toLocaleDateString()}`}
                    </span>
                </div>
                <p className="text-gray-300 mt-4">{mission.description}</p>
            </div>

            {/* Satellites Section */}
            <div className="bg-gray-800 rounded-lg p-6 mb-8">
                <h2 className="text-xl font-bold text-white mb-4">Mission Satellites</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-300 mb-2">Connected Satellites</h3>
                        {satellites.length === 0 ? (
                            <p className="text-gray-400">No satellites connected to this mission</p>
                        ) : (
                            <ul className="space-y-2">
                                {satellites.map(satellite => (
                                    <li key={satellite.id} className="flex items-center justify-between bg-gray-700 p-3 rounded">
                                        <span className="text-white">{satellite.name}</span>
                                        <button
                                            onClick={() => handleRemoveSatellite(satellite.id)}
                                            className="text-red-400 hover:text-red-300"
                                        >
                                            Remove
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-300 mb-2">Available Satellites</h3>
                        {availableSatellites.length === 0 ? (
                            <p className="text-gray-400">No satellites available to add</p>
                        ) : (
                            <ul className="space-y-2">
                                {availableSatellites.map(satellite => (
                                    <li key={satellite.id} className="flex items-center justify-between bg-gray-700 p-3 rounded">
                                        <span className="text-white">{satellite.name}</span>
                                        <button
                                            onClick={() => handleAddSatellite(satellite.id)}
                                            className="text-green-400 hover:text-green-300"
                                        >
                                            Add
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>

            {/* Ground Stations Section */}
            <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-bold text-white mb-4">Ground Stations</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-300 mb-2">Connected Ground Stations</h3>
                        {groundStations.length === 0 ? (
                            <p className="text-gray-400">No ground stations connected to this mission</p>
                        ) : (
                            <ul className="space-y-2">
                                {groundStations.map(station => (
                                    <li key={station.id} className="flex items-center justify-between bg-gray-700 p-3 rounded">
                                        <span className="text-white">{station.name}</span>
                                        <button
                                            onClick={() => handleRemoveGroundStation(station.id)}
                                            className="text-red-400 hover:text-red-300"
                                        >
                                            Remove
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-300 mb-2">Available Ground Stations</h3>
                        {availableGroundStations.length === 0 ? (
                            <p className="text-gray-400">No ground stations available to add</p>
                        ) : (
                            <ul className="space-y-2">
                                {availableGroundStations.map(station => (
                                    <li key={station.id} className="flex items-center justify-between bg-gray-700 p-3 rounded">
                                        <span className="text-white">{station.name}</span>
                                        <button
                                            onClick={() => handleAddGroundStation(station.id)}
                                            className="text-green-400 hover:text-green-300"
                                        >
                                            Add
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MissionDetails; 