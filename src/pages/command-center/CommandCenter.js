import React, { useState, useEffect } from 'react';
import { db, auth } from '../../services/api';
import { collection, addDoc, getDocs, query, orderBy, limit, where, serverTimestamp } from '../../services/api';
import { doc, getDoc } from '../../services/api';
import useRole from '../../hooks/useRole';
import { useAuth } from '../../context/AuthContext';

const CommandCenter = () => {
    const [satellites, setSatellites] = useState([]);
    const [commands, setCommands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const { isAdmin, isEngineer } = useRole();
    const { currentUser } = useAuth();

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
                // Only fetch active satellites
                const satQuery = query(
                    collection(null, 'satellites'),
                    where('status', 'in', ['active', 'maintenance']),
                    orderBy('name')
                );
                const satellitesSnapshot = await getDocs(satQuery);
                const satellitesList = satellitesSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                setSatellites(satellitesList);

                // Fetch recent commands
                const commandsQuery = query(
                    collection(null, 'commands'),
                    orderBy('timestamp', 'desc'),
                    limit(10)
                );
                const commandsSnapshot = await getDocs(commandsQuery);
                const commandsList = commandsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    timestamp: doc.data().timestamp?.toDate ? doc.data().timestamp.toDate() : new Date(doc.data().timestamp)
                }));

                setCommands(commandsList);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCommandForm({
            ...commandForm,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!commandForm.satelliteId || !commandForm.command) {
            alert("Please select a satellite and enter a command.");
            return;
        }

        if (!isAdmin && !isEngineer) {
            alert("You don't have permission to send commands.");
            return;
        }

        try {
            setSending(true);

            // Get the selected satellite name
            const satelliteDoc = await getDoc(doc(null, 'satellites', commandForm.satelliteId));
            const satelliteName = satelliteDoc.exists() ? satelliteDoc.data().name : 'Unknown Satellite';

            // Add the command to Firestore
            const commandData = {
                satelliteId: commandForm.satelliteId,
                satelliteName,
                command: commandForm.command,
                parameters: commandForm.parameters,
                priority: commandForm.priority,
                status: 'pending',
                operatorId: currentUser.uid,
                operatorName: currentUser.displayName || currentUser.email,
                timestamp: serverTimestamp(),
                result: null
            };

            const docRef = await addDoc(collection(null, 'commands'), commandData);

            // Simulate command processing
            setTimeout(async () => {
                // In a real system, this would be handled by a Cloud Function
                // that processes the command and updates its status

                // Randomly determine if the command succeeds or fails
                const success = Math.random() > 0.2; // 80% success rate

                // Update the command status
                const updatedCommandData = {
                    ...commandData,
                    id: docRef.id,
                    status: success ? 'success' : 'failed',
                    result: success ? 'Command executed successfully' : 'Command execution failed',
                    timestamp: commandData.timestamp ? new Date(commandData.timestamp) : new Date()
                };

                // Update commands list
                setCommands(prevCommands => [updatedCommandData, ...prevCommands]);

                // Reset form
                setCommandForm({
                    satelliteId: '',
                    command: '',
                    parameters: '',
                    priority: 'normal'
                });

                setSending(false);
            }, 3000);
        } catch (error) {
            console.error("Error sending command:", error);
            setSending(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-space-blue"></div>
            </div>
        );
    }

    if (!isAdmin && !isEngineer) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center py-12">
                    <h1 className="text-3xl font-bold text-white mb-6">Command Center</h1>
                    <div className="bg-red-500 bg-opacity-20 border border-red-500 text-white p-4 rounded-lg mb-6 inline-block">
                        <p className="text-lg">Access Denied</p>
                        <p className="text-sm text-gray-300 mt-1">You do not have permission to access the Command Center.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-white mb-8">Command Center</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                <div className="lg:col-span-1 bg-gray-800 rounded-lg shadow-lg p-6">
                    <h2 className="text-xl font-bold text-white mb-4">Send Command</h2>

                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="satelliteId">
                                Satellite
                            </label>
                            <select
                                id="satelliteId"
                                name="satelliteId"
                                value={commandForm.satelliteId}
                                onChange={handleInputChange}
                                className="bg-gray-700 text-white w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-space-blue"
                                required
                            >
                                <option value="">Select a satellite</option>
                                {satellites.map(satellite => (
                                    <option key={satellite.id} value={satellite.id}>
                                        {satellite.name} ({satellite.status})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="command">
                                Command
                            </label>
                            <select
                                id="command"
                                name="command"
                                value={commandForm.command}
                                onChange={handleInputChange}
                                className="bg-gray-700 text-white w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-space-blue"
                                required
                            >
                                <option value="">Select a command</option>
                                <option value="RESTART">RESTART</option>
                                <option value="SLEEP">SLEEP</option>
                                <option value="WAKE">WAKE</option>
                                <option value="CAPTURE_IMAGE">CAPTURE_IMAGE</option>
                                <option value="ADJUST_ORBIT">ADJUST_ORBIT</option>
                                <option value="DEPLOY_PAYLOAD">DEPLOY_PAYLOAD</option>
                                <option value="TRANSMIT_DATA">TRANSMIT_DATA</option>
                                <option value="RUN_DIAGNOSTICS">RUN_DIAGNOSTICS</option>
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="parameters">
                                Parameters (Optional)
                            </label>
                            <input
                                type="text"
                                id="parameters"
                                name="parameters"
                                value={commandForm.parameters}
                                onChange={handleInputChange}
                                placeholder="e.g. duration=30,mode=silent"
                                className="bg-gray-700 text-white w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-space-blue"
                            />
                            <p className="text-xs text-gray-400 mt-1">Separate multiple parameters with commas (param=value)</p>
                        </div>

                        <div className="mb-6">
                            <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="priority">
                                Priority
                            </label>
                            <select
                                id="priority"
                                name="priority"
                                value={commandForm.priority}
                                onChange={handleInputChange}
                                className="bg-gray-700 text-white w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-space-blue"
                            >
                                <option value="low">Low</option>
                                <option value="normal">Normal</option>
                                <option value="high">High</option>
                                <option value="critical">Critical</option>
                            </select>
                        </div>

                        <div className="flex justify-center">
                            <button
                                type="submit"
                                disabled={sending}
                                className="bg-space-red hover:bg-red-700 text-white py-2 px-6 rounded-md transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed w-full flex justify-center items-center"
                            >
                                {sending ? (
                                    <>
                                        <span className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full inline-block"></span>
                                        Sending Command...
                                    </>
                                ) : (
                                    'Send Command'
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="lg:col-span-2 bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                    <div className="p-4 bg-gray-700">
                        <h2 className="text-xl font-bold text-white">Command History</h2>
                    </div>
                    <div className="p-4">
                        {commands.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-700">
                                    <thead>
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Satellite</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Command</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Time</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Operator</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-700">
                                        {commands.map((command) => (
                                            <tr key={command.id} className="hover:bg-gray-700">
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{command.satelliteName}</td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm">
                                                    <span className="font-mono bg-gray-700 px-2 py-1 rounded text-xs">{command.command}</span>
                                                    {command.parameters && (
                                                        <span className="text-xs text-gray-400 ml-2">{command.parameters}</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                                                    {command.timestamp.toLocaleString()}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{command.operatorName}</td>
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
                            <p className="text-gray-400 text-center py-4">No commands have been sent yet.</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold text-white mb-4">Command Guidelines</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-2">Command Priority Levels</h3>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-center">
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 mr-2">Low</span>
                                <span className="text-gray-300">Routine operations, no time sensitivity</span>
                            </li>
                            <li className="flex items-center">
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 mr-2">Normal</span>
                                <span className="text-gray-300">Standard operations, moderate time sensitivity</span>
                            </li>
                            <li className="flex items-center">
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 mr-2">High</span>
                                <span className="text-gray-300">Important operations, high time sensitivity</span>
                            </li>
                            <li className="flex items-center">
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 mr-2">Critical</span>
                                <span className="text-gray-300">Emergency operations, immediate execution required</span>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-white mb-2">Command Status</h3>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-center">
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 mr-2">Pending</span>
                                <span className="text-gray-300">Command received, awaiting execution</span>
                            </li>
                            <li className="flex items-center">
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 mr-2">Processing</span>
                                <span className="text-gray-300">Command is being executed</span>
                            </li>
                            <li className="flex items-center">
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 mr-2">Success</span>
                                <span className="text-gray-300">Command executed successfully</span>
                            </li>
                            <li className="flex items-center">
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 mr-2">Failed</span>
                                <span className="text-gray-300">Command execution failed</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommandCenter; 