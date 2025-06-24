import React, { useState, useEffect } from 'react';
import API from '../../services/apiClient';
import useRole from '../../hooks/useRole';
import { useAuth } from '../../context/AuthContext';

const AnomalyCard = ({ anomaly, isSelected, onClick, getTimeAgo, getSeverityColor, getStatusColor }) => (
    <div
        onClick={() => onClick(anomaly)}
        className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
            isSelected 
                ? 'bg-gray-800/70 border-blue-500/50 shadow-lg shadow-blue-900/20' 
                : 'bg-gray-800/30 border-gray-700/50 hover:bg-gray-800/50'
        }`}
    >
        <div className="flex items-start justify-between">
            <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${getSeverityColor(anomaly.severity)}`}>
                        {anomaly.severity}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${getStatusColor(anomaly.status)}`}>
                        {anomaly.status}
                    </span>
                </div>
                <p className="text-gray-300 text-sm line-clamp-2">{anomaly.description}</p>
                <div className="mt-2 flex items-center space-x-2 text-sm text-gray-400">
                    <span>Satellite #{anomaly.satellite_id}</span>
                    <span>•</span>
                    <span>{getTimeAgo(new Date(anomaly.timestamp))}</span>
                </div>
            </div>
        </div>
    </div>
);

const AnomalyDetail = ({ anomaly, onUpdateStatus, isEngineer, isAdmin, getTimeAgo, getSeverityColor, getStatusColor }) => {
    if (!anomaly) return null;
    
    // Debug logging
    console.log('AnomalyDetail - isEngineer:', isEngineer, 'isAdmin:', isAdmin, 'anomaly.status:', anomaly.status);

    return (
        <div className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-6 space-y-6">
            <div className="flex items-start justify-between">
                <div>
                    <div className="flex items-center space-x-3 mb-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${getSeverityColor(anomaly.severity)}`}>
                            {anomaly.severity}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${getStatusColor(anomaly.status)}`}>
                            {anomaly.status}
                        </span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-200 mb-2">Anomaly Details</h3>
                    <p className="text-gray-300">{anomaly.description}</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                    <p className="text-gray-400">Satellite ID</p>
                    <p className="text-gray-200">#{anomaly.satellite_id}</p>
                </div>
                <div>
                    <p className="text-gray-400">Detected</p>
                    <p className="text-gray-200">{getTimeAgo(new Date(anomaly.timestamp))}</p>
                </div>
                {anomaly.resolved_at && (
                    <>
                        <div>
                            <p className="text-gray-400">Resolved At</p>
                            <p className="text-gray-200">{getTimeAgo(new Date(anomaly.resolved_at))}</p>
                        </div>
                        <div>
                            <p className="text-gray-400">Resolved By</p>
                            <p className="text-gray-200">User #{anomaly.resolved_by || 'Unknown'}</p>
                        </div>
                    </>
                )}
            </div>

            {anomaly.status !== 'Resolved' && (
                <div className="flex items-center space-x-4 pt-4 border-t border-gray-700/50">
                    {anomaly.status === 'Open' && (
                        <button
                            onClick={() => onUpdateStatus('Investigating')}
                            className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg border border-blue-600/30 transition-colors"
                        >
                            Start Investigation
                        </button>
                    )}
                    <button
                        onClick={() => onUpdateStatus('Resolved')}
                        className="px-4 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg border border-green-600/30 transition-colors"
                    >
                        Mark as Resolved
                    </button>
                </div>
            )}
        </div>
    );
};

const AnomalyTracker = () => {
    const [anomalies, setAnomalies] = useState([]);
    const [selectedAnomaly, setSelectedAnomaly] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const { isAdmin, isEngineer } = useRole();
    const { currentUser } = useAuth();
    
    // Debug logging
    console.log('AnomalyTracker - currentUser:', currentUser);
    console.log('AnomalyTracker - isAdmin:', isAdmin, 'isEngineer:', isEngineer);

    useEffect(() => {
        const fetchAnomalies = async () => {
            try {
                const response = await API.anomalies.getAll();
                console.log('Raw anomalies response:', response);
                
                if (!Array.isArray(response)) {
                    console.error('Invalid anomalies response:', response);
                    setAnomalies([]);
                    return;
                }

                // Sort anomalies by timestamp (newest first)
                const sortedAnomalies = response.sort((a, b) => 
                    new Date(b.timestamp) - new Date(a.timestamp)
                );

                // Apply status filter
                let filteredList = sortedAnomalies;
                if (filter !== 'all') {
                    filteredList = filteredList.filter(a => a.status === filter);
                }

                console.log('Filtered anomalies:', filteredList);
                setAnomalies(filteredList);

                // Update selected anomaly if it's no longer in the filtered list
                if (selectedAnomaly && !filteredList.find(a => a.id === selectedAnomaly.id)) {
                    setSelectedAnomaly(filteredList[0] || null);
                } else if (!selectedAnomaly && filteredList.length > 0) {
                    setSelectedAnomaly(filteredList[0]);
                }
            } catch (error) {
                console.error("Error fetching anomalies:", error);
                setAnomalies([]);
            } finally {
                setLoading(false);
            }
        };

        fetchAnomalies();
        const interval = setInterval(fetchAnomalies, 30000);
        return () => clearInterval(interval);
    }, [filter, selectedAnomaly]);

    const handleUpdateStatus = async (newStatus) => {
        if (!selectedAnomaly) {
            console.error('No anomaly selected');
            return;
        }

        console.log('Updating status to:', newStatus, 'for anomaly:', selectedAnomaly.id);

        try {
            const updateData = {
                status: newStatus
            };

            // Only set resolved_by and resolved_at if the status is being set to Resolved
            if (newStatus === 'Resolved') {
                updateData.resolved_by = currentUser?.id || 1; // Fallback to admin user if not logged in
                updateData.resolved_at = new Date().toISOString();
            }


            console.log('Sending update data:', updateData);
            const updatedAnomaly = await API.anomalies.update(selectedAnomaly.id, updateData);
            console.log('Update response:', updatedAnomaly);

            // Update the selected anomaly and the list
            setSelectedAnomaly(prev => ({
                ...prev,
                ...updatedAnomaly,
                status: newStatus,
                resolved_by: updateData.resolved_by,
                resolved_at: updateData.resolved_at
            }));

            setAnomalies(prevAnomalies => 
                prevAnomalies.map(anomaly =>
                    anomaly.id === selectedAnomaly.id 
                        ? { ...anomaly, ...updatedAnomaly, status: newStatus }
                        : anomaly
                )
            );

            console.log('State updated successfully');
        } catch (error) {
            console.error("Error updating anomaly status:", error);
            // You might want to show an error message to the user here
        }
    };

    const getSeverityColor = (severity) => {
        switch (severity?.toLowerCase()) {
            case 'critical':
                return 'from-red-900/50 to-red-800/30 text-red-400 border-red-700/50 shadow-red-900/20';
            case 'major':
                return 'from-orange-900/50 to-orange-800/30 text-orange-400 border-orange-700/50 shadow-orange-900/20';
            case 'minor':
                return 'from-yellow-900/50 to-yellow-800/30 text-yellow-400 border-yellow-700/50 shadow-yellow-900/20';
            case 'low':
                return 'from-green-900/50 to-green-800/30 text-green-400 border-green-700/50 shadow-green-900/20';
            default:
                return 'from-gray-900/50 to-gray-800/30 text-gray-400 border-gray-700/50 shadow-gray-900/20';
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'resolved':
                return 'from-emerald-900/50 to-emerald-800/30 text-emerald-400 border-emerald-700/50';
            case 'investigating':
                return 'from-blue-900/50 to-blue-800/30 text-blue-400 border-blue-700/50';
            case 'open':
                return 'from-red-900/50 to-red-800/30 text-red-400 border-red-700/50';
            default:
                return 'from-gray-900/50 to-gray-800/30 text-gray-400 border-gray-700/50';
        }
    };

    const getTimeAgo = (date) => {
        const seconds = Math.floor((new Date() - date) / 1000);
        if (isNaN(seconds)) return 'Invalid date';
        if (seconds < 60) return 'just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    return (
        <div className="p-6 max-w-[1600px] mx-auto">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-200 mb-4">Anomaly Tracker</h2>
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                            filter === 'all'
                                ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30'
                                : 'bg-gray-800/30 text-gray-400 border border-gray-700/30 hover:bg-gray-800/50'
                        }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilter('Open')}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                            filter === 'Open'
                                ? 'bg-red-600/20 text-red-400 border border-red-600/30'
                                : 'bg-gray-800/30 text-gray-400 border border-gray-700/30 hover:bg-gray-800/50'
                        }`}
                    >
                        Open
                    </button>
                    <button
                        onClick={() => setFilter('Investigating')}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                            filter === 'Investigating'
                                ? 'bg-yellow-600/20 text-yellow-400 border border-yellow-600/30'
                                : 'bg-gray-800/30 text-gray-400 border border-gray-700/30 hover:bg-gray-800/50'
                        }`}
                    >
                        Investigating
                    </button>
                    <button
                        onClick={() => setFilter('Resolved')}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                            filter === 'Resolved'
                                ? 'bg-green-600/20 text-green-400 border border-green-600/30'
                                : 'bg-gray-800/30 text-gray-400 border border-gray-700/30 hover:bg-gray-800/50'
                        }`}
                    >
                        Resolved
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                            </div>
            ) : anomalies.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-400">No anomalies found</p>
                        </div>
            ) : (
                <div className="grid grid-cols-12 gap-6">
                    {/* Anomalies List - Left Side */}
                    <div className="col-span-12 lg:col-span-7 space-y-4 max-h-[calc(100vh-220px)] overflow-y-auto pr-4">
                        {anomalies.map(anomaly => (
                            <AnomalyCard
                                    key={anomaly.id}
                                anomaly={anomaly}
                                isSelected={selectedAnomaly?.id === anomaly.id}
                                onClick={setSelectedAnomaly}
                                getTimeAgo={getTimeAgo}
                                getSeverityColor={getSeverityColor}
                                getStatusColor={getStatusColor}
                            />
                        ))}
                </div>

                    {/* Anomaly Details - Right Side */}
                    <div className="col-span-12 lg:col-span-5 sticky top-6">
                    {selectedAnomaly ? (
                            <AnomalyDetail
                                anomaly={selectedAnomaly}
                                onUpdateStatus={handleUpdateStatus}
                                isEngineer={isEngineer}
                                isAdmin={isAdmin}
                                getTimeAgo={getTimeAgo}
                                getSeverityColor={getSeverityColor}
                                getStatusColor={getStatusColor}
                            />
                        ) : (
                            <div className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-6 text-center">
                                <p className="text-gray-400">Select an anomaly to view details</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
        </div>
    );
};

export default AnomalyTracker; 