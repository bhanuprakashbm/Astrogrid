import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/apiClient';
import useRole from '../../hooks/useRole';
import CustomSelect from '../../components/layout/CustomSelect';

const CommandCard = ({ command, getTimeAgo, getStatusColor, getPriorityColor }) => {
    const formatParameters = (params) => {
        try {
            const parsedParams = JSON.parse(params);
            return Object.entries(parsedParams)
                .map(([key, value]) => `${key}: ${value}`)
                .join(', ');
        } catch (e) {
            return params;
        }
    };

    return (
        <div className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-4 hover:bg-gray-700/30 transition-all">
            {/* Command Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${getStatusColor(command.status)}`}>
                        {command.status || 'Unknown'}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${getPriorityColor(command.parameters ? JSON.parse(command.parameters).priority : null)}`}>
                        {command.command_type}
                    </span>
                </div>
                <span className="text-gray-400 text-sm">
                    {getTimeAgo(command.timestamp)}
                </span>
            </div>

            {/* Command Details */}
            <div className="space-y-2">
                {command.parameters && (
                    <div className="text-sm">
                        <span className="text-gray-400">Parameters: </span>
                        <span className="text-gray-300">{formatParameters(command.parameters)}</span>
                    </div>
                )}
                <div className="flex items-center space-x-3 text-sm">
                    <div className="flex items-center space-x-1">
                        <span className="text-gray-400">Satellite:</span>
                        <span className="text-gray-300">#{command.satellite_id}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                        <span className="text-gray-400">User:</span>
                        <span className="text-gray-300">#{command.user_id}</span>
                    </div>
                    {command.executed_at && (
                        <div className="flex items-center space-x-1">
                            <span className="text-gray-400">Executed:</span>
                            <span className="text-gray-300">{getTimeAgo(command.executed_at)}</span>
                        </div>
                    )}
                </div>
                {command.result && (
                    <div className={`text-sm ${command.status?.toLowerCase() === 'completed' ? 'text-green-400' : 'text-red-400'}`}>
                        {command.result}
                    </div>
                )}
            </div>
        </div>
    );
};

const CommandForm = ({ satellites, commandForm, handleInputChange, handleSubmit, sending }) => (
    <form onSubmit={handleSubmit} className="space-y-4">
        <div>
            <label className="block text-gray-300 text-sm font-medium mb-2" htmlFor="satelliteId">
                Target Satellite
            </label>
            <CustomSelect
                options={satellites.map(satellite => ({
                    value: satellite.id,
                    label: `${satellite.name} (${satellite.status})`
                }))}
                value={commandForm.satelliteId}
                onChange={(value) => handleInputChange({ target: { name: 'satelliteId', value } })}
                placeholder="Select satellite"
            />
        </div>

        <div>
            <label className="block text-gray-300 text-sm font-medium mb-2" htmlFor="command">
                Command Type
            </label>
            <input
                type="text"
                id="command"
                name="command"
                value={commandForm.command}
                onChange={handleInputChange}
                className="w-full bg-gray-900/50 border border-gray-700/50 rounded-lg px-4 py-2.5 text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter command type"
                required
            />
        </div>

        <div>
            <label className="block text-gray-300 text-sm font-medium mb-2" htmlFor="parameters">
                Parameters
            </label>
            <textarea
                id="parameters"
                name="parameters"
                value={commandForm.parameters}
                onChange={handleInputChange}
                className="w-full bg-gray-900/50 border border-gray-700/50 rounded-lg px-4 py-2.5 text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter command parameters"
                rows="3"
            />
        </div>

        <div>
            <label className="block text-gray-300 text-sm font-medium mb-2" htmlFor="priority">
                Priority Level
            </label>
            <div className="relative">
                <select
                    id="priority"
                    name="priority"
                    value={commandForm.priority}
                    onChange={handleInputChange}
                    className="w-full bg-gray-900/50 border border-gray-700/50 rounded-lg px-4 py-2.5 text-gray-300 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>
        </div>

        <button
            type="submit"
            disabled={sending}
            className={`w-full mt-6 px-6 py-3 rounded-lg font-medium transition-all duration-200 
                ${sending 
                    ? 'bg-blue-900/30 text-blue-400 cursor-not-allowed' 
                    : 'bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-600/30'
                }`}
        >
            {sending ? (
                <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mr-2"></div>
                    Sending Command...
                </div>
            ) : 'Send Command'}
        </button>
    </form>
);

const CommandCenter = () => {
    const [satellites, setSatellites] = useState([]);
    const [commands, setCommands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const { isAdmin, isEngineer } = useRole();
    const { currentUser } = useAuth();
    const [error, setError] = useState(null);

    // Form state
    const [commandForm, setCommandForm] = useState({
        satelliteId: '',
        command: '',
        parameters: '',
        priority: 'normal'
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                console.log('Fetching data...');
                const [satellitesData, commandsData] = await Promise.all([
                    API.satellites.getAll(),
                    API.commands.getAll()
                ]);

                console.log('Received commands:', commandsData);

                // Format the commands data
                const formattedCommands = Array.isArray(commandsData) ? commandsData.map(cmd => ({
                    ...cmd,
                    timestamp: new Date(cmd.timestamp),
                    executed_at: cmd.executed_at ? new Date(cmd.executed_at) : null
                })) : [];

                console.log('Formatted commands:', formattedCommands);
                
                setSatellites(satellitesData);
                setCommands(formattedCommands);
                setError(null);
            } catch (err) {
                console.error('Error fetching data:', err);
                console.error('Error details:', err.response || err);
                setError('Failed to fetch commands');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCommandForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!commandForm.satelliteId || !commandForm.command) {
            alert("Please select a satellite and enter a command.");
            return;
        }

        console.log('Submitting command with data:', commandForm);

        try {
            setSending(true);
            
            // Use default user ID 1 (Admin) if not authenticated
            const userId = currentUser?.id || 1;
            
            const commandData = {
                satellite_id: parseInt(commandForm.satelliteId, 10),
                user_id: userId,
                command_type: commandForm.command,
                parameters: commandForm.parameters ? JSON.stringify({
                    description: commandForm.parameters,
                    priority: commandForm.priority
                }) : null,
                status: 'Pending',
                timestamp: new Date().toISOString()
            };
            
            console.log('Command data:', commandData);

            console.log('Sending command data:', commandData);

            const result = await API.commands.create(commandData);
            console.log('Command created successfully:', result);
            
            const commandWithTimestamp = {
                ...result,
                timestamp: new Date()
            };

            setCommands(prev => [commandWithTimestamp, ...prev]);
            setCommandForm({
                satelliteId: '',
                command: '',
                parameters: '',
                priority: 'normal'
            });
            
            alert('Command sent successfully!');
        } catch (error) {
            console.error("Error sending command:", error);
            alert(`Failed to send command: ${error.message || 'Unknown error'}`);
        } finally {
            setSending(false);
        }
    };

    const getTimeAgo = (timestamp) => {
        const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
        const seconds = Math.floor((new Date() - date) / 1000);
        
        if (isNaN(seconds)) {
            return 'Invalid date';
        }
        
        if (seconds < 60) return 'just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    const getPriorityColor = (priority) => {
        if (!priority) return 'from-gray-900/50 to-gray-800/30 text-gray-400 border-gray-700/50';
        
        switch (priority.toLowerCase()) {
            case 'critical':
                return 'from-red-900/50 to-red-800/30 text-red-400 border-red-700/50';
            case 'high':
                return 'from-orange-900/50 to-orange-800/30 text-orange-400 border-orange-700/50';
            case 'normal':
                return 'from-blue-900/50 to-blue-800/30 text-blue-400 border-blue-700/50';
            case 'low':
                return 'from-green-900/50 to-green-800/30 text-green-400 border-green-700/50';
            default:
                return 'from-gray-900/50 to-gray-800/30 text-gray-400 border-gray-700/50';
        }
    };

    const getStatusColor = (status) => {
        if (!status) return 'from-gray-900/50 to-gray-800/30 text-gray-400 border-gray-700/50';
        
        switch (status.toLowerCase()) {
            case 'completed':
            case 'success':
                return 'from-emerald-900/50 to-emerald-800/30 text-emerald-400 border-emerald-700/50';
            case 'pending':
            case 'executing':
                return 'from-yellow-900/50 to-yellow-800/30 text-yellow-400 border-yellow-700/50';
            case 'failed':
                return 'from-red-900/50 to-red-800/30 text-red-400 border-red-700/50';
            default:
                return 'from-gray-900/50 to-gray-800/30 text-gray-400 border-gray-700/50';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 p-6">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-900 p-6">
                <div className="text-red-500 text-center">{error}</div>
            </div>
        );
    }

    // Role-based access control has been removed to allow all authenticated users
    // to access the Command Center

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                    Mission Control Center
                </h1>
                <p className="text-gray-400 mt-2">Real-time satellite command and control interface</p>
            </div>

            <div className="grid grid-cols-12 gap-6">
                {/* Command Interface */}
                <div className="col-span-12 lg:col-span-4">
                    <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-gray-700/50 shadow-lg p-6 sticky top-6">
                        <h2 className="text-xl font-semibold text-gray-200 mb-6">Command Interface</h2>
                        <CommandForm
                            satellites={satellites}
                            commandForm={commandForm}
                            handleInputChange={handleInputChange}
                            handleSubmit={handleSubmit}
                            sending={sending}
                        />
                    </div>
                </div>

                {/* Command History */}
                <div className="col-span-12 lg:col-span-8">
                    <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-gray-700/50 shadow-lg">
                        <div className="p-6 border-b border-gray-700/50">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-semibold text-gray-200">Command History</h2>
                                <span className="px-3 py-1 bg-gray-900/50 rounded-lg text-sm text-gray-400">
                                    Last {commands.length} Commands
                                </span>
                            </div>
                        </div>
                        
                        <div className="p-6 space-y-4">
                            {commands.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-gray-400">No commands have been sent yet.</p>
                                </div>
                            ) : (
                                commands.map((cmd) => (
                                    <CommandCard
                                        key={cmd.id}
                                        command={cmd}
                                        getTimeAgo={getTimeAgo}
                                        getStatusColor={getStatusColor}
                                        getPriorityColor={getPriorityColor}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommandCenter; 