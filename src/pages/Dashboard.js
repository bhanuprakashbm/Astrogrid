import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getCollection, queryCollection, getCurrentTimestamp } from '../services/database-adapter';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
    const { currentUser } = useAuth();
    const [satellites, setSatellites] = useState([]);
    const [groundStations, setGroundStations] = useState([]);
    const [pendingCommands, setPendingCommands] = useState([]);
    const [activeAnomalies, setActiveAnomalies] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                // Fetch satellites
                const satelliteData = await getCollection('satellites');
                setSatellites(satelliteData);

                // Fetch ground stations
                const groundStationData = await getCollection('ground_stations');
                setGroundStations(groundStationData);

                // Fetch pending commands
                const commandData = await queryCollection('commands', { status: 'Pending' });
                setPendingCommands(commandData);

                // Fetch active anomalies
                const anomalyData = await queryCollection('anomalies', { status: 'Open' });
                setActiveAnomalies(anomalyData);
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    // Prepare data for status chart
    const statusData = [
        { name: 'Operational', count: satellites.filter(sat => sat.status === 'Operational').length },
        { name: 'Maintenance', count: satellites.filter(sat => sat.status === 'Maintenance').length },
        { name: 'Warning', count: satellites.filter(sat => sat.status === 'Warning').length },
        { name: 'Critical', count: satellites.filter(sat => sat.status === 'Critical').length },
        { name: 'Inactive', count: satellites.filter(sat => sat.status === 'Inactive').length }
    ];

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-space-blue"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-6">
            <h1 className="text-3xl font-bold text-gray-100 mb-6">Mission Control Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Summary Cards */}
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                    <h3 className="text-xl font-semibold text-space-blue-400 mb-2">Satellites</h3>
                    <div className="flex justify-between items-end">
                        <p className="text-4xl font-bold text-white">{satellites.length}</p>
                        <span className="text-green-400 text-sm">
                            {satellites.filter(sat => sat.status === 'Operational').length} operational
                        </span>
                    </div>
                </div>

                <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                    <h3 className="text-xl font-semibold text-space-blue-400 mb-2">Ground Stations</h3>
                    <div className="flex justify-between items-end">
                        <p className="text-4xl font-bold text-white">{groundStations.length}</p>
                        <span className="text-green-400 text-sm">
                            {groundStations.filter(station => station.status === 'Operational').length} online
                        </span>
                    </div>
                </div>

                <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                    <h3 className="text-xl font-semibold text-space-blue-400 mb-2">Pending Commands</h3>
                    <div className="flex justify-between items-end">
                        <p className="text-4xl font-bold text-white">{pendingCommands.length}</p>
                        <span className={`${pendingCommands.length > 0 ? 'text-yellow-400' : 'text-green-400'} text-sm`}>
                            {pendingCommands.length > 0 ? 'Awaiting execution' : 'None pending'}
                        </span>
                    </div>
                </div>

                <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                    <h3 className="text-xl font-semibold text-space-blue-400 mb-2">Active Anomalies</h3>
                    <div className="flex justify-between items-end">
                        <p className="text-4xl font-bold text-white">{activeAnomalies.length}</p>
                        <span className={`${activeAnomalies.length > 0 ? 'text-red-400' : 'text-green-400'} text-sm`}>
                            {activeAnomalies.length > 0 ? 'Needs attention' : 'All clear'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Status Chart */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
                <h3 className="text-xl font-semibold text-space-blue-400 mb-4">Satellite Status Overview</h3>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={statusData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="name" stroke="#9CA3AF" />
                            <YAxis stroke="#9CA3AF" />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#111827', border: 'none', borderRadius: '0.5rem' }}
                                itemStyle={{ color: '#E5E7EB' }}
                                labelStyle={{ fontWeight: 'bold', color: '#F9FAFB' }}
                            />
                            <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-semibold text-space-blue-400 mb-4">Recent Activity</h3>
                <div className="space-y-4">
                    {pendingCommands.slice(0, 5).map((command, index) => (
                        <div key={index} className="bg-gray-700 p-4 rounded-lg flex justify-between items-center">
                            <div>
                                <h4 className="font-medium text-white">{command.command_type}</h4>
                                <p className="text-gray-400 text-sm">
                                    Satellite ID: {command.satellite_id}
                                </p>
                            </div>
                            <span className="px-3 py-1 bg-yellow-900 text-yellow-300 rounded-full text-xs">
                                Pending
                            </span>
                        </div>
                    ))}

                    {activeAnomalies.slice(0, 5).map((anomaly, index) => (
                        <div key={index} className="bg-gray-700 p-4 rounded-lg flex justify-between items-center">
                            <div>
                                <h4 className="font-medium text-white">{anomaly.description}</h4>
                                <p className="text-gray-400 text-sm">
                                    Satellite ID: {anomaly.satellite_id}
                                </p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs ${anomaly.severity === 'Critical' ? 'bg-red-900 text-red-300' :
                                    anomaly.severity === 'Major' ? 'bg-orange-900 text-orange-300' :
                                        'bg-yellow-900 text-yellow-300'
                                }`}>
                                {anomaly.severity}
                            </span>
                        </div>
                    ))}

                    {pendingCommands.length === 0 && activeAnomalies.length === 0 && (
                        <p className="text-gray-400 text-center italic">No recent activity</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard; 