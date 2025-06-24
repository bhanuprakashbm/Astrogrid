import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import useRole from '../../hooks/useRole';

const Sidebar = () => {
    const { currentUser } = useAuth();
    const { isAdmin, isEngineer } = useRole();

    // If not logged in, don't show sidebar
    if (!currentUser) return null;

    return (
        <div className="bg-gray-800/50 backdrop-blur-xl border-r border-gray-700/50 w-64 flex flex-col">
            <div className="flex-1 overflow-y-auto">
                <nav className="mt-5 px-2">
                    <NavLink
                        to="/"
                        className={({ isActive }) =>
                            `flex items-center px-4 py-3 ${isActive ? 'bg-blue-900/50 text-blue-400 border border-blue-700/50 rounded-lg' : 'text-gray-300 hover:bg-gray-700/50 hover:text-white rounded-lg'}`
                        }
                    >
                        <span className="ml-2">Dashboard</span>
                    </NavLink>

                    <NavLink
                        to="/satellites"
                        className={({ isActive }) =>
                            `flex items-center px-4 py-3 ${isActive ? 'bg-blue-900/50 text-blue-400 border border-blue-700/50 rounded-lg' : 'text-gray-300 hover:bg-gray-700/50 hover:text-white rounded-lg'}`
                        }
                    >
                        <span className="ml-2">Satellites</span>
                    </NavLink>

                    <NavLink
                        to="/ground-stations"
                        className={({ isActive }) =>
                            `flex items-center px-4 py-3 ${isActive ? 'bg-blue-900/50 text-blue-400 border border-blue-700/50 rounded-lg' : 'text-gray-300 hover:bg-gray-700/50 hover:text-white rounded-lg'}`
                        }
                    >
                        <span className="ml-2">Ground Stations</span>
                    </NavLink>

                    <NavLink
                        to="/missions"
                        className={({ isActive }) =>
                            `flex items-center px-4 py-3 ${isActive ? 'bg-blue-900/50 text-blue-400 border border-blue-700/50 rounded-lg' : 'text-gray-300 hover:bg-gray-700/50 hover:text-white rounded-lg'}`
                        }
                    >
                        <span className="ml-2">Missions</span>
                    </NavLink>

                    <NavLink
                        to="/telemetry"
                        className={({ isActive }) =>
                            `flex items-center px-4 py-3 ${isActive ? 'bg-blue-900/50 text-blue-400 border border-blue-700/50 rounded-lg' : 'text-gray-300 hover:bg-gray-700/50 hover:text-white rounded-lg'}`
                        }
                    >
                        <span className="ml-2">Telemetry Data</span>
                    </NavLink>

                    <NavLink
                        to="/command-center"
                        className={({ isActive }) =>
                            `flex items-center px-4 py-3 ${isActive ? 'bg-blue-900/50 text-blue-400 border border-blue-700/50 rounded-lg' : 'text-gray-300 hover:bg-gray-700/50 hover:text-white rounded-lg'}`
                        }
                    >
                        <span className="ml-2">Command Center</span>
                    </NavLink>

                    <NavLink
                        to="/anomalies"
                        className={({ isActive }) =>
                            `flex items-center px-4 py-3 ${isActive ? 'bg-blue-900/50 text-blue-400 border border-blue-700/50 rounded-lg' : 'text-gray-300 hover:bg-gray-700/50 hover:text-white rounded-lg'}`
                        }
                    >
                        <span className="ml-2">Anomaly Tracker</span>
                    </NavLink>

                    <NavLink
                        to="/operators"
                        className={({ isActive }) =>
                            `flex items-center px-4 py-3 ${isActive ? 'bg-blue-900/50 text-blue-400 border border-blue-700/50 rounded-lg' : 'text-gray-300 hover:bg-gray-700/50 hover:text-white rounded-lg'}`
                        }
                    >
                        <span className="ml-2">Operators</span>
                    </NavLink>
                </nav>
            </div>

            <div className="p-4 border-t border-gray-700/50">
                <div className="text-xs text-gray-400">
                    AstroGrid v1.0.0
                </div>
            </div>
        </div>
    );
};

export default Sidebar; 