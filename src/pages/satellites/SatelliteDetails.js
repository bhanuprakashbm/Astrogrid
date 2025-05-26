import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { db } from '../../services/api';
import { doc, getDoc, updateDoc, collection, query, orderBy, limit, getDocs, where } from '../../services/api';
import useRole from '../../hooks/useRole';
import { Line } from 'recharts';

const SatelliteDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAdmin, isEngineer } = useRole();

    const [satellite, setSatellite] = useState(null);
    const [telemetryData, setTelemetryData] = useState([]);
    const [recentCommands, setRecentCommands] = useState([]);
    const [recentAnomalies, setRecentAnomalies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editForm, setEditForm] = useState({});

    useEffect(() => {
        const fetchSatelliteData = async () => {
            try {
                // Fetch satellite details
                const satelliteDoc = await getDoc(doc(null, 'satellites', id));

                if (!satelliteDoc.exists()) {
                    navigate('/satellites');
                    return;
                }

                const satelliteData = {
                    id: satelliteDoc.id,
                    ...satelliteDoc.data()
                };

                setSatellite(satelliteData);
                setEditForm(satelliteData);

                // Fetch latest telemetry
                const telemetryQuery = query(
                    collection(null, 'telemetry'),
                    where('satelliteId', '==', id),
                    orderBy('timestamp', 'desc'),
                    limit(50)
                );
                const telemetrySnapshot = await getDocs(telemetryQuery);
                const telemetryItems = telemetrySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    timestamp: doc.data().timestamp?.toDate ? doc.data().timestamp.toDate() : new Date(doc.data().timestamp)
                }));

                setTelemetryData(telemetryItems.reverse()); // Reverse for chronological order

                // Fetch recent commands
                const commandsQuery = query(
                    collection(null, 'commands'),
                    where('satelliteId', '==', id),
                    orderBy('timestamp', 'desc'),
                    limit(5)
                );
                const commandsSnapshot = await getDocs(commandsQuery);
                const commandsItems = commandsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    timestamp: doc.data().timestamp?.toDate ? doc.data().timestamp.toDate() : new Date(doc.data().timestamp)
                }));

                setRecentCommands(commandsItems);

                // Fetch recent anomalies
                const anomaliesQuery = query(
                    collection(null, 'anomalies'),
                    where('satelliteId', '==', id),
                    orderBy('timestamp', 'desc'),
                    limit(5)
                );
                const anomaliesSnapshot = await getDocs(anomaliesQuery);
                const anomaliesItems = anomaliesSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    timestamp: doc.data().timestamp?.toDate ? doc.data().timestamp.toDate() : new Date(doc.data().timestamp)
                }));

                setRecentAnomalies(anomaliesItems);
            } catch (error) {
                console.error("Error fetching satellite data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSatelliteData();
    }, [id, navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditForm({
            ...editForm,
            [name]: value
        });
    };

    const handleUpdateSatellite = async (e) => {
        e.preventDefault();

        try {
            const satelliteRef = doc(null, 'satellites', id);

            await updateDoc(satelliteRef, {
                name: editForm.name,
                type: editForm.type,
                agency: editForm.agency,
                status: editForm.status,
                orbitType: editForm.orbitType
            });

            // Update the state with the edited values
            setSatellite({
                ...satellite,
                name: editForm.name,
                type: editForm.type,
                agency: editForm.agency,
                status: editForm.status,
                orbitType: editForm.orbitType
            });

            setShowEditModal(false);
        } catch (error) {
            console.error("Error updating satellite:", error);
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
                            <p className="text-sm text-gray-400">Agency</p>
                            <p className="text-white">{satellite.agency}</p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-400">Launch Date</p>
                            <p className="text-white">{new Date(satellite.launchDate).toLocaleDateString()}</p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-400">Status</p>
                            <p>
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                  ${satellite.status === 'active' ? 'bg-green-100 text-green-800' :
                                        satellite.status === 'inactive' ? 'bg-red-100 text-red-800' :
                                            satellite.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-gray-100 text-gray-800'}`}>
                                    {satellite.status}
                                </span>
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-400">Orbit Type</p>
                            <p className="text-white">{satellite.orbitType}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-800 rounded-lg shadow-lg p-6 lg:col-span-2">
                    <h2 className="text-xl font-bold text-white mb-4">Last Known Position</h2>

                    <div className="h-64 flex items-center justify-center bg-gray-700 rounded-lg mb-4">
                        <p className="text-gray-400">Position data visualization would go here</p>
                        {/* This would typically be a map or 3D globe using libraries like Cesium or Mapbox */}
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="bg-gray-700 p-3 rounded-lg">
                            <p className="text-sm text-gray-400">Latitude</p>
                            <p className="text-white font-medium">34.05°N</p>
                        </div>
                        <div className="bg-gray-700 p-3 rounded-lg">
                            <p className="text-sm text-gray-400">Longitude</p>
                            <p className="text-white font-medium">118.25°W</p>
                        </div>
                        <div className="bg-gray-700 p-3 rounded-lg">
                            <p className="text-sm text-gray-400">Altitude</p>
                            <p className="text-white font-medium">408 km</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                    <div className="p-4 bg-gray-700">
                        <h2 className="text-xl font-bold text-white">Recent Commands</h2>
                    </div>
                    <div className="p-4">
                        {recentCommands.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-700">
                                    <thead>
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Command</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Sent By</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Time</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-700">
                                        {recentCommands.map((command) => (
                                            <tr key={command.id} className="hover:bg-gray-700">
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{command.command}</td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{command.operatorName}</td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                                                    {command.timestamp.toLocaleString()}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                            ${command.status === 'success' ? 'bg-green-100 text-green-800' :
                                                            command.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-red-100 text-red-800'}`}>
                                                        {command.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-gray-400 text-center py-4">No recent commands found.</p>
                        )}

                        <div className="mt-4 text-right">
                            <Link to="/command-center" className="text-space-blue hover:underline text-sm">
                                View command center →
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                    <div className="p-4 bg-gray-700">
                        <h2 className="text-xl font-bold text-white">Recent Anomalies</h2>
                    </div>
                    <div className="p-4">
                        {recentAnomalies.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-700">
                                    <thead>
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Severity</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Time</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-700">
                                        {recentAnomalies.map((anomaly) => (
                                            <tr key={anomaly.id} className="hover:bg-gray-700">
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{anomaly.type}</td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                            ${anomaly.severity === 'critical' ? 'bg-red-100 text-red-800' :
                                                            anomaly.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                                                                anomaly.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                                                    'bg-green-100 text-green-800'}`}>
                                                        {anomaly.severity}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                                                    {anomaly.timestamp.toLocaleString()}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                            ${anomaly.status === 'resolved' ? 'bg-green-100 text-green-800' :
                                                            anomaly.status === 'investigating' ? 'bg-blue-100 text-blue-800' :
                                                                'bg-red-100 text-red-800'}`}>
                                                        {anomaly.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-gray-400 text-center py-4">No recent anomalies detected.</p>
                        )}

                        <div className="mt-4 text-right">
                            <Link to="/anomalies" className="text-space-blue hover:underline text-sm">
                                View all anomalies →
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
                <h2 className="text-xl font-bold text-white mb-4">Telemetry Data</h2>

                {telemetryData.length > 0 ? (
                    <div className="h-80 bg-gray-700 p-4 rounded-lg flex items-center justify-center">
                        <p className="text-gray-400">Telemetry data visualization would go here using Recharts or Chart.js</p>
                        {/* This would be implemented with a chart library */}
                    </div>
                ) : (
                    <p className="text-gray-400 text-center py-12">No telemetry data available.</p>
                )}

                <div className="mt-4 text-right">
                    <Link to="/telemetry" className="text-space-blue hover:underline text-sm">
                        View all telemetry data →
                    </Link>
                </div>
            </div>

            {/* Edit Satellite Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full">
                        <h2 className="text-2xl font-bold text-white mb-4">Edit Satellite</h2>

                        <form onSubmit={handleUpdateSatellite}>
                            <div className="mb-4">
                                <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="name">
                                    Satellite Name
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

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="type">
                                        Type
                                    </label>
                                    <select
                                        id="type"
                                        name="type"
                                        value={editForm.type}
                                        onChange={handleInputChange}
                                        className="bg-gray-700 text-white w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-space-blue"
                                    >
                                        <option value="research">Research</option>
                                        <option value="communication">Communication</option>
                                        <option value="weather">Weather</option>
                                        <option value="navigation">Navigation</option>
                                        <option value="military">Military</option>
                                        <option value="earth-observation">Earth Observation</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="agency">
                                        Agency
                                    </label>
                                    <select
                                        id="agency"
                                        name="agency"
                                        value={editForm.agency}
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

                            <div className="grid grid-cols-2 gap-4 mb-6">
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
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                        <option value="maintenance">Maintenance</option>
                                        <option value="decommissioned">Decommissioned</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="orbitType">
                                        Orbit Type
                                    </label>
                                    <select
                                        id="orbitType"
                                        name="orbitType"
                                        value={editForm.orbitType}
                                        onChange={handleInputChange}
                                        className="bg-gray-700 text-white w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-space-blue"
                                    >
                                        <option value="LEO">Low Earth Orbit (LEO)</option>
                                        <option value="MEO">Medium Earth Orbit (MEO)</option>
                                        <option value="GEO">Geostationary Orbit (GEO)</option>
                                        <option value="HEO">Highly Elliptical Orbit (HEO)</option>
                                        <option value="SSO">Sun-Synchronous Orbit (SSO)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3">
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
                                >
                                    Update Satellite
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SatelliteDetails; 