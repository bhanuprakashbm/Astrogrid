import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useRole from '../../hooks/useRole';
import { satelliteService } from '../../services/mysql';

const SatellitesList = () => {
    const [satellites, setSatellites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [showAddModal, setShowAddModal] = useState(false);
    const { isAdmin, isEngineer } = useRole();

    // Form state for adding a new satellite
    const [newSatellite, setNewSatellite] = useState({
        name: '',
        type: 'research',
        agency: 'NASA',
        launch_date: '',
        status: 'active',
        orbit: 'LEO'
    });

    useEffect(() => {
        const fetchSatellites = async () => {
            setLoading(true);
            try {
                const results = await satelliteService.getAllSatellites(filter);

                if (results.length === 0) {
                    // Load sample data if no satellites exist
                    setSatellites(getSampleSatellites());
                } else {
                    setSatellites(results);
                }
            } catch (error) {
                console.error("Error fetching satellites:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSatellites();
    }, [filter]);

    const getSampleSatellites = () => {
        return [
            {
                id: "sample1",
                name: "GOES-18",
                type: "Weather",
                agency: "NOAA",
                launch_date: "2022-03-01",
                status: "active",
                orbit: "Geostationary"
            },
            {
                id: "sample2",
                name: "Starlink-1095",
                type: "Communications",
                agency: "SpaceX",
                launch_date: "2020-08-18",
                status: "active",
                orbit: "LEO"
            },
            {
                id: "sample3",
                name: "Landsat 9",
                type: "Earth Observation",
                agency: "NASA/USGS",
                launch_date: "2021-09-27",
                status: "active",
                orbit: "SSO"
            }
            // Add more sample satellites as needed
        ];
    };

    const handleAddSatellite = async (e) => {
        e.preventDefault();

        try {
            // Create new satellite using service
            const newSatelliteData = await satelliteService.createSatellite(newSatellite);

            // Add the new satellite to the state
            setSatellites(prev => [...prev, newSatelliteData]);
            setShowAddModal(false);

            // Reset the form
            setNewSatellite({
                name: '',
                type: 'research',
                agency: 'NASA',
                launch_date: '',
                status: 'active',
                orbit: 'LEO'
            });
        } catch (error) {
            console.error("Error adding satellite:", error);
            alert("Failed to add satellite. Please try again.");
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewSatellite({
            ...newSatellite,
            [name]: value
        });
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading satellites...</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Satellite Fleet</h1>
                <div className="flex space-x-2">
                    <div className="inline-block relative">
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="appearance-none bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                        >
                            <option value="all">All Satellites</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="maintenance">Maintenance</option>
                            <option value="critical">Critical</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                            </svg>
                        </div>
                    </div>
                    {(isAdmin || isEngineer) && (
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
                        >
                            Add Satellite
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {satellites.map((satellite) => (
                    <Link
                        key={satellite.id}
                        to={`/satellites/${satellite.id}`}
                        className="block"
                    >
                        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                            <div className="p-6">
                                <div className="flex justify-between items-start">
                                    <h2 className="text-xl font-semibold text-gray-800">{satellite.name}</h2>
                                    <StatusBadge status={satellite.status} />
                                </div>
                                <p className="text-gray-600 mt-2">{satellite.type}</p>
                                <div className="mt-4 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Operator:</span>
                                        <span className="text-gray-800">{satellite.operator}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Orbit:</span>
                                        <span className="text-gray-800">{satellite.orbit}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Launch Date:</span>
                                        <span className="text-gray-800">
                                            {satellite.launch_date ? new Date(satellite.launch_date).toLocaleDateString() : 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Add Satellite Modal */}
            {showAddModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg p-8 max-w-md w-full">
                        <h2 className="text-2xl font-bold mb-4">Add New Satellite</h2>
                        <form onSubmit={handleAddSatellite}>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                                    Satellite Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={newSatellite.name}
                                    onChange={handleInputChange}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="type">
                                    Type
                                </label>
                                <select
                                    id="type"
                                    name="type"
                                    value={newSatellite.type}
                                    onChange={handleInputChange}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                >
                                    <option value="research">Research</option>
                                    <option value="communications">Communications</option>
                                    <option value="earth observation">Earth Observation</option>
                                    <option value="navigation">Navigation</option>
                                    <option value="weather">Weather</option>
                                    <option value="military">Military</option>
                                </select>
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="agency">
                                    Agency/Operator
                                </label>
                                <input
                                    type="text"
                                    id="agency"
                                    name="agency"
                                    value={newSatellite.agency}
                                    onChange={handleInputChange}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="launchDate">
                                    Launch Date
                                </label>
                                <input
                                    type="date"
                                    id="launch_date"
                                    name="launch_date"
                                    value={newSatellite.launch_date}
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
                                    value={newSatellite.status}
                                    onChange={handleInputChange}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="maintenance">Maintenance</option>
                                    <option value="critical">Critical</option>
                                </select>
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="orbitType">
                                    Orbit Type
                                </label>
                                <select
                                    id="orbit"
                                    name="orbit"
                                    value={newSatellite.orbit}
                                    onChange={handleInputChange}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                >
                                    <option value="LEO">Low Earth Orbit (LEO)</option>
                                    <option value="MEO">Medium Earth Orbit (MEO)</option>
                                    <option value="GEO">Geostationary Orbit (GEO)</option>
                                    <option value="HEO">Highly Elliptical Orbit (HEO)</option>
                                    <option value="SSO">Sun-Synchronous Orbit (SSO)</option>
                                </select>
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
                                    Add Satellite
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// Status badge component
const StatusBadge = ({ status }) => {
    let bgColor;
    let textColor;

    switch (status.toLowerCase()) {
        case 'active':
        case 'operational':
            bgColor = 'bg-green-100';
            textColor = 'text-green-800';
            break;
        case 'inactive':
        case 'decommissioned':
            bgColor = 'bg-gray-100';
            textColor = 'text-gray-800';
            break;
        case 'critical':
            bgColor = 'bg-red-100';
            textColor = 'text-red-800';
            break;
        case 'maintenance':
        case 'warning':
            bgColor = 'bg-yellow-100';
            textColor = 'text-yellow-800';
            break;
        default:
            bgColor = 'bg-blue-100';
            textColor = 'text-blue-800';
    }

    return (
        <span className={`${bgColor} ${textColor} text-xs px-2 py-1 rounded-full`}>
            {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
        </span>
    );
};

export default SatellitesList; 