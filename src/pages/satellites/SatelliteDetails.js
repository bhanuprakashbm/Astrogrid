import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import useRole from '../../hooks/useRole';
import API from '../../services/apiClient';
import SatelliteVisualizations from '../../components/SatelliteVisualizations';

const SatelliteDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAdmin, isEngineer } = useRole();

    const [satellite, setSatellite] = useState(null);
    const [telemetryData, setTelemetryData] = useState([]);
    const [recentCommands, setRecentCommands] = useState([]);
    const [recentAnomalies, setRecentAnomalies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editForm, setEditForm] = useState({
        name: '',
        type: '',
        status: 'Operational',
        launch_date: '',
        orbit: '',
        description: '',
        mass: '',
        mission_life: '',
        operator: ''
    });

    useEffect(() => {
        fetchSatelliteData();
    }, [id]);

    useEffect(() => {
        if (satellite) {
            setEditForm({
                name: satellite.name || '',
                type: satellite.type || '',
                status: satellite.status || 'Operational',
                launch_date: satellite.launch_date ? new Date(satellite.launch_date).toISOString().split('T')[0] : '',
                orbit: satellite.orbit || '',
                description: satellite.description || '',
                mass: satellite.mass || '',
                mission_life: satellite.mission_life || '',
                operator: satellite.operator || ''
            });
        }
    }, [satellite]);

    const fetchSatelliteData = async () => {
        try {
            setError(null);
            
            // Fetch satellite details and telemetry in parallel
            const [satelliteData, telemetryItems] = await Promise.all([
                API.satellites.getById(id),
                API.telemetry.getLatest(id, 50)
            ]);

            if (!satelliteData) {
                throw new Error('Satellite not found');
            }
            setSatellite(satelliteData);
            
            // Ensure telemetryItems is an array before reversing
            const telemetryArray = Array.isArray(telemetryItems) ? telemetryItems : 
                                 telemetryItems ? [telemetryItems] : [];
            setTelemetryData(telemetryArray.reverse()); // Reverse for chronological order

            // Fetch non-critical data after main data is loaded
            Promise.all([
                API.commands.getBySatellite(id),
                API.anomalies.getBySatellite(id)
            ]).then(([commandsItems, anomaliesItems]) => {
                setRecentCommands(commandsItems.slice(0, 5));
                setRecentAnomalies(anomaliesItems.slice(0, 5));
            }).catch(error => {
                console.error('Error fetching additional data:', error);
            });

        } catch (err) {
            console.error('Error fetching satellite:', err);
            setError(err.message || 'Failed to fetch satellite details. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleUpdateSatellite = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const formattedData = {
                ...editForm,
                mass: editForm.mass ? parseFloat(editForm.mass) : null,
                launch_date: editForm.launch_date || null
            };
            
            // Log the data being sent
            console.log('Updating satellite with data:', formattedData);
            
            await API.satellites.update(id, formattedData);
            setShowEditModal(false);
            await fetchSatelliteData();
            alert('Satellite updated successfully!');
        } catch (err) {
            console.error('Error updating satellite:', err);
            alert(err.message || 'Failed to update satellite. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-900">
                <div className="text-white">Loading satellite details...</div>
            </div>
        );
    }

    if (error || !satellite) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-900">
                <div className="text-red-500">{error || 'Satellite not found'}</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900">
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <Link to="/satellites" className="text-gray-400 hover:text-white mb-2 inline-flex items-center">
                            <span className="mr-2">←</span> Back to Satellites
                        </Link>
                        <h1 className="text-3xl font-bold text-white">{satellite.name}</h1>
                    </div>

                    {(isAdmin || isEngineer) && (
                        <button
                            onClick={() => setShowEditModal(true)}
                            className="bg-space-blue hover:bg-blue-700 text-white px-4 py-2 rounded-md transition duration-300"
                        >
                            Edit Satellite
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    <div className="bg-gray-800 rounded-lg shadow-lg p-6 lg:col-span-1">
                        <h2 className="text-xl font-bold text-white mb-4">Satellite Information</h2>

                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-400">Type</p>
                                <p className="text-white">{satellite.type}</p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-400">Operator</p>
                                <p className="text-white">{satellite.operator}</p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-400">Launch Date</p>
                                <p className="text-white">{new Date(satellite.launch_date).toLocaleDateString()}</p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-400">Status</p>
                                <p>
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                                        ${satellite.status === 'Operational' ? 'bg-green-100 text-green-800' :
                                        satellite.status === 'Non-operational' ? 'bg-red-100 text-red-800' :
                                        'bg-yellow-100 text-yellow-800'}`}>
                                        {satellite.status}
                                    </span>
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-400">Orbit</p>
                                <p className="text-white">{satellite.orbit}</p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-400">Altitude</p>
                                <p className="text-white">550 km</p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-400">Velocity</p>
                                <p className="text-white">7.8 km/s</p>
                            </div>

                            {satellite.mass && (
                                <div>
                                    <p className="text-sm text-gray-400">Mass</p>
                                    <p className="text-white">{satellite.mass} kg</p>
                                </div>
                            )}

                            {satellite.mission_life && (
                                <div>
                                    <p className="text-sm text-gray-400">Mission Life</p>
                                    <p className="text-white">{satellite.mission_life} years</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-gray-800 rounded-lg shadow-lg p-6 lg:col-span-2 relative z-0">
                        <h2 className="text-xl font-bold text-white mb-4">Telemetry & Position Data</h2>
                        <div className="h-[600px] relative">
                            <SatelliteVisualizations satelliteId={id} />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Recent Commands */}
                    <div className="bg-gray-800 rounded-lg shadow-lg p-6 relative z-20">
                        <h2 className="text-xl font-bold text-white mb-4">Recent Commands</h2>
                        {recentCommands.length === 0 ? (
                            <p className="text-gray-400">No recent commands found.</p>
                        ) : (
                            <div className="space-y-4">
                                {recentCommands.map((command) => (
                                    <div key={command.id} className="bg-gray-700/50 rounded-lg p-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-white font-medium">{command.command_type}</p>
                                                <p className="text-sm text-gray-400">
                                                    {new Date(command.timestamp).toLocaleString()}
                                                </p>
                        </div>
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                command.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                                command.status === 'Failed' ? 'bg-red-100 text-red-800' :
                                                command.status === 'Executing' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-blue-100 text-blue-800'
                                            }`}>
                                                            {command.status}
                                                        </span>
                                        </div>
                                </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Recent Anomalies */}
                    <div className="bg-gray-800 rounded-lg shadow-lg p-6 relative z-20">
                        <h2 className="text-xl font-bold text-white mb-4">Recent Anomalies</h2>
                        {recentAnomalies.length === 0 ? (
                            <p className="text-gray-400">No recent anomalies found.</p>
                        ) : (
                            <div className="space-y-4">
                                {recentAnomalies.map((anomaly) => (
                                    <div key={anomaly.id} className="bg-gray-700/50 rounded-lg p-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-white font-medium">{anomaly.description}</p>
                                                <p className="text-sm text-gray-400">
                                                    {new Date(anomaly.timestamp).toLocaleString()}
                                                </p>
                        </div>
                                            <div className="flex space-x-2">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                    anomaly.severity === 'Critical' ? 'bg-red-100 text-red-800' :
                                                    anomaly.severity === 'Major' ? 'bg-orange-100 text-orange-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                            {anomaly.severity}
                                                        </span>
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                    anomaly.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                                                    anomaly.status === 'Investigating' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                            {anomaly.status}
                                                        </span>
                                            </div>
                                        </div>
                                </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Telemetry Data */}
                <div className="bg-gray-800 rounded-lg shadow-lg p-6 mt-8">
                    <h2 className="text-xl font-bold text-white mb-4">Telemetry Data</h2>
                    {telemetryData.length === 0 ? (
                        <p className="text-gray-400">No telemetry data available.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Power Systems */}
                            <div className="bg-gray-700/50 rounded-lg p-4">
                                <h3 className="text-lg font-semibold text-white mb-3">Power Systems</h3>
                                <div className="space-y-2">
                                    <div>
                                        <p className="text-sm text-gray-400">Power Level</p>
                                        <p className="text-white font-medium">
                                            {JSON.parse(telemetryData[0]?.data_json || '{}').power || 'N/A'}%
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-400">Memory Usage</p>
                                        <p className="text-white font-medium">
                                            {JSON.parse(telemetryData[0]?.data_json || '{}').memory || 'N/A'}%
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-400">CPU Usage</p>
                                        <p className="text-white font-medium">
                                            {JSON.parse(telemetryData[0]?.data_json || '{}').cpu || 'N/A'}%
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Environmental Data */}
                            <div className="bg-gray-700/50 rounded-lg p-4">
                                <h3 className="text-lg font-semibold text-white mb-3">Environmental</h3>
                                <div className="space-y-2">
                                    <div>
                                        <p className="text-sm text-gray-400">Temperature</p>
                                        <p className="text-white font-medium">
                                            {JSON.parse(telemetryData[0]?.data_json || '{}').temperature?.toFixed(1) || 'N/A'} °C
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Signal Data */}
                            <div className="bg-gray-700/50 rounded-lg p-4">
                                <h3 className="text-lg font-semibold text-white mb-3">Signal</h3>
                                <div className="space-y-2">
                                    <div>
                                        <p className="text-sm text-gray-400">Signal Strength</p>
                                        <p className="text-white font-medium">
                                            {JSON.parse(telemetryData[0]?.data_json || '{}').signal || 'N/A'}%
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-400">Last Updated</p>
                                        <p className="text-white font-medium">
                                            {telemetryData[0]?.timestamp ? new Date(telemetryData[0].timestamp).toLocaleString() : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Edit Satellite Modal */}
                {showEditModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full">
                            <h2 className="text-2xl font-bold text-white mb-4">Edit Satellite</h2>

                            <form onSubmit={handleUpdateSatellite} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                    <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="name">
                                            Name *
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={editForm.name}
                                        onChange={handleInputChange}
                                        className="bg-gray-700 text-white w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-space-blue"
                                        required
                                    />
                                </div>

                                    <div>
                                        <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="type">
                                            Type *
                                        </label>
                                        <select
                                            id="type"
                                            name="type"
                                            value={editForm.type}
                                            onChange={handleInputChange}
                                            className="bg-gray-700 text-white w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-space-blue"
                                            required
                                        >
                                            <option value="">Select Type</option>
                                            <option value="Earth Observation">Earth Observation</option>
                                            <option value="Communication">Communication</option>
                                            <option value="Navigation">Navigation</option>
                                            <option value="Scientific">Scientific</option>
                                            <option value="Experimental">Experimental</option>
                                            <option value="Small">Small</option>
                                            <option value="Student">Student</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="status">
                                            Status
                                        </label>
                                        <select
                                            id="status"
                                            name="status"
                                            value={editForm.status}
                                            onChange={handleInputChange}
                                            className="bg-gray-700 text-white w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-space-blue"
                                        >
                                            <option value="Operational">Operational</option>
                                            <option value="Non-operational">Non-operational</option>
                                            <option value="In Development">In Development</option>
                                            <option value="Retired">Retired</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="launch_date">
                                            Launch Date
                                        </label>
                                        <input
                                            type="date"
                                            id="launch_date"
                                            name="launch_date"
                                            value={editForm.launch_date}
                                            onChange={handleInputChange}
                                            className="bg-gray-700 text-white w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-space-blue"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="orbit">
                                            Orbit Type
                                        </label>
                                        <select
                                            id="orbit"
                                            name="orbit"
                                            value={editForm.orbit}
                                            onChange={handleInputChange}
                                            className="bg-gray-700 text-white w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-space-blue"
                                        >
                                            <option value="">Select Orbit</option>
                                            <option value="LEO">Low Earth Orbit (LEO)</option>
                                            <option value="MEO">Medium Earth Orbit (MEO)</option>
                                            <option value="GEO">Geostationary Orbit (GEO)</option>
                                            <option value="HEO">Highly Elliptical Orbit (HEO)</option>
                                            <option value="SSO">Sun-Synchronous Orbit (SSO)</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="mass">
                                            Mass (kg)
                                        </label>
                                        <input
                                            type="number"
                                            id="mass"
                                            name="mass"
                                            value={editForm.mass}
                                            onChange={handleInputChange}
                                            className="bg-gray-700 text-white w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-space-blue"
                                            min="0"
                                            step="0.1"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="mission_life">
                                            Mission Life
                                        </label>
                                        <input
                                            type="text"
                                            id="mission_life"
                                            name="mission_life"
                                            value={editForm.mission_life}
                                            onChange={handleInputChange}
                                            className="bg-gray-700 text-white w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-space-blue"
                                            placeholder="e.g., 5 years"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="operator">
                                            Operator
                                        </label>
                                        <input
                                            type="text"
                                            id="operator"
                                            name="operator"
                                            value={editForm.operator}
                                            onChange={handleInputChange}
                                            className="bg-gray-700 text-white w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-space-blue"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="description">
                                        Description
                                    </label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        value={editForm.description}
                                        onChange={handleInputChange}
                                        className="bg-gray-700 text-white w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-space-blue"
                                        rows="4"
                                    ></textarea>
                                </div>

                                <div className="flex justify-end space-x-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setShowEditModal(false)}
                                        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition duration-300"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="bg-space-blue hover:bg-blue-700 text-white px-4 py-2 rounded-md transition duration-300"
                                        disabled={loading}
                                    >
                                        {loading ? 'Updating...' : 'Update Satellite'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SatelliteDetails; 