import React, { useState, useEffect } from 'react';
import {
    collection,
    doc,
    getDocs,
    updateDoc,
    query,
    orderBy,
    where,
    serverTimestamp
} from '../../services/api';
import useRole from '../../hooks/useRole';
import { useAuth } from '../../context/AuthContext';

const AnomalyTracker = () => {
    const [anomalies, setAnomalies] = useState([]);
    const [selectedAnomaly, setSelectedAnomaly] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const { isAdmin, isEngineer } = useRole();
    const { currentUser } = useAuth();

    useEffect(() => {
        const fetchAnomalies = async () => {
            try {
                let q;

                if (filter === 'all') {
                    q = query(collection(null, 'anomalies'), orderBy('timestamp', 'desc'));
                } else {
                    q = query(collection(null, 'anomalies'), where('status', '==', filter), orderBy('timestamp', 'desc'));
                }

                const anomaliesSnapshot = await getDocs(q);
                const anomaliesList = anomaliesSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    timestamp: doc.data().timestamp ? new Date(doc.data().timestamp) : new Date()
                }));

                setAnomalies(anomaliesList);

                if (anomaliesList.length > 0 && !selectedAnomaly) {
                    setSelectedAnomaly(anomaliesList[0]);
                }
            } catch (error) {
                console.error("Error fetching anomalies:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAnomalies();
    }, [filter, selectedAnomaly]);

    const handleUpdateStatus = async (newStatus) => {
        if (!selectedAnomaly || !isEngineer) return;

        try {
            const anomalyRef = doc(null, 'anomalies', selectedAnomaly.id);

            await updateDoc(anomalyRef, {
                status: newStatus,
                resolvedBy: newStatus === 'resolved' ? currentUser?.uid : null,
                resolvedByName: newStatus === 'resolved' ? (currentUser?.displayName || currentUser?.email) : null,
                resolvedAt: newStatus === 'resolved' ? serverTimestamp() : null,
                lastUpdated: serverTimestamp()
            });

            // Update the selected anomaly in state
            setSelectedAnomaly({
                ...selectedAnomaly,
                status: newStatus,
                resolvedBy: newStatus === 'resolved' ? currentUser?.uid : null,
                resolvedByName: newStatus === 'resolved' ? (currentUser?.displayName || currentUser?.email) : null,
                resolvedAt: newStatus === 'resolved' ? new Date() : null,
                lastUpdated: new Date()
            });

            // Update the anomaly in the list
            setAnomalies(anomalies.map(anomaly =>
                anomaly.id === selectedAnomaly.id
                    ? {
                        ...anomaly,
                        status: newStatus,
                        resolvedBy: newStatus === 'resolved' ? currentUser?.uid : null,
                        resolvedByName: newStatus === 'resolved' ? (currentUser?.displayName || currentUser?.email) : null,
                        resolvedAt: newStatus === 'resolved' ? new Date() : null,
                        lastUpdated: new Date()
                    }
                    : anomaly
            ));
        } catch (error) {
            console.error("Error updating anomaly status:", error);
        }
    };

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'critical':
                return 'bg-red-100 text-red-800';
            case 'high':
                return 'bg-orange-100 text-orange-800';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800';
            case 'low':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'resolved':
                return 'bg-green-100 text-green-800';
            case 'investigating':
                return 'bg-blue-100 text-blue-800';
            case 'unresolved':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
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
                <h1 className="text-3xl font-bold text-white">Anomaly Tracker</h1>

                <div>
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="bg-gray-700 text-white border border-gray-600 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-space-blue"
                    >
                        <option value="all">All Anomalies</option>
                        <option value="unresolved">Unresolved</option>
                        <option value="investigating">Investigating</option>
                        <option value="resolved">Resolved</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 bg-gray-800 rounded-lg shadow-lg overflow-auto max-h-[calc(100vh-200px)]">
                    <div className="p-4 bg-gray-700 sticky top-0">
                        <h2 className="text-xl font-bold text-white">Anomaly List</h2>
                    </div>
                    <div className="p-4">
                        {anomalies.length > 0 ? (
                            <ul className="space-y-4">
                                {anomalies.map((anomaly) => (
                                    <li
                                        key={anomaly.id}
                                        className={`p-3 rounded-lg cursor-pointer transition-colors duration-200 ${selectedAnomaly?.id === anomaly.id ? 'bg-space-blue bg-opacity-50' : 'bg-gray-700 hover:bg-gray-600'
                                            }`}
                                        onClick={() => setSelectedAnomaly(anomaly)}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-medium text-white">{anomaly.type}</h3>
                                                <p className="text-sm text-gray-300">{anomaly.satelliteName}</p>
                                                <p className="text-xs text-gray-400 mt-1">{anomaly.timestamp.toLocaleString()}</p>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full ${getSeverityColor(anomaly.severity)}`}>
                                                    {anomaly.severity}
                                                </span>
                                                <span className={`mt-1 px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full ${getStatusColor(anomaly.status)}`}>
                                                    {anomaly.status}
                                                </span>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-400 text-center py-4">
                                No anomalies found with the current filter.
                            </p>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-2">
                    {selectedAnomaly ? (
                        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                            <div className="p-4 bg-gray-700">
                                <h2 className="text-xl font-bold text-white">Anomaly Details</h2>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                    <div className="bg-gray-700 rounded-lg p-4">
                                        <p className="text-sm text-gray-400">Type</p>
                                        <p className="text-lg font-medium text-white">{selectedAnomaly.type}</p>
                                    </div>
                                    <div className="bg-gray-700 rounded-lg p-4">
                                        <p className="text-sm text-gray-400">Severity</p>
                                        <p className="flex items-center">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full ${getSeverityColor(selectedAnomaly.severity)}`}>
                                                {selectedAnomaly.severity}
                                            </span>
                                        </p>
                                    </div>
                                    <div className="bg-gray-700 rounded-lg p-4">
                                        <p className="text-sm text-gray-400">Status</p>
                                        <p className="flex items-center">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full ${getStatusColor(selectedAnomaly.status)}`}>
                                                {selectedAnomaly.status}
                                            </span>
                                        </p>
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-white mb-2">Satellite Information</h3>
                                    <div className="bg-gray-700 rounded-lg p-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm text-gray-400">Satellite</p>
                                                <p className="text-white">{selectedAnomaly.satelliteName}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-400">Detected At</p>
                                                <p className="text-white">{selectedAnomaly.timestamp.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-white mb-2">Anomaly Description</h3>
                                    <div className="bg-gray-700 rounded-lg p-4">
                                        <p className="text-white">
                                            {selectedAnomaly.description || 'No detailed description available.'}
                                        </p>
                                    </div>
                                </div>

                                {selectedAnomaly.status === 'resolved' && selectedAnomaly.resolvedByName && (
                                    <div className="mb-6">
                                        <h3 className="text-lg font-semibold text-white mb-2">Resolution Information</h3>
                                        <div className="bg-gray-700 rounded-lg p-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-sm text-gray-400">Resolved By</p>
                                                    <p className="text-white">{selectedAnomaly.resolvedByName}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-400">Resolved At</p>
                                                    <p className="text-white">
                                                        {selectedAnomaly.resolvedAt
                                                            ? (selectedAnomaly.resolvedAt instanceof Date
                                                                ? selectedAnomaly.resolvedAt.toLocaleString()
                                                                : new Date(selectedAnomaly.resolvedAt).toLocaleString())
                                                            : 'Unknown'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {(isAdmin || isEngineer) && selectedAnomaly.status !== 'resolved' && (
                                    <div className="mt-8">
                                        <h3 className="text-lg font-semibold text-white mb-4">Actions</h3>
                                        <div className="flex space-x-4">
                                            {selectedAnomaly.status === 'unresolved' && (
                                                <button
                                                    onClick={() => handleUpdateStatus('investigating')}
                                                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition duration-300"
                                                >
                                                    Start Investigation
                                                </button>
                                            )}

                                            <button
                                                onClick={() => handleUpdateStatus('resolved')}
                                                className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md transition duration-300"
                                            >
                                                Mark as Resolved
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-gray-800 rounded-lg shadow-lg p-8 flex justify-center items-center">
                            <p className="text-gray-400">Select an anomaly to view details</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AnomalyTracker; 