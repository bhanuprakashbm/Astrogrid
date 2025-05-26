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
        <aside className="w-64 bg-dark-space shadow-xl">
            <div className="h-full flex flex-col">
                <div className="p-4 border-b border-gray-700">
                    <h2 className="text-xl font-bold text-white">Mission Control</h2>
                </div>

                <nav className="flex-1 overflow-y-auto py-4">
                    <NavLink
                        to="/"
                        className={({ isActive }) =>
                            `flex items-center px-4 py-3 ${isActive ? 'bg-space-blue text-white' : 'text-gray-300 hover:bg-gray-800'}`
                        }
                        end
                    >
                        <span className="ml-2">Dashboard</span>
                    </NavLink>

                    <NavLink
                        to="/satellites"
                        className={({ isActive }) =>
                            `flex items-center px-4 py-3 ${isActive ? 'bg-space-blue text-white' : 'text-gray-300 hover:bg-gray-800'}`
                        }
                    >
                        <span className="ml-2">Satellites</span>
                    </NavLink>

                    <NavLink
                        to="/isro-satellites"
                        className={({ isActive }) =>
                            `flex items-center px-4 py-3 ${isActive ? 'bg-space-blue text-white' : 'text-gray-300 hover:bg-gray-800'}`
                        }
                    >
                        <span className="ml-2">ISRO Satellites</span>
                    </NavLink>

                    <NavLink
                        to="/ground-stations"
                        className={({ isActive }) =>
                            `flex items-center px-4 py-3 ${isActive ? 'bg-space-blue text-white' : 'text-gray-300 hover:bg-gray-800'}`
                        }
                    >
                        <span className="ml-2">Ground Stations</span>
                    </NavLink>

                    <NavLink
                        to="/telemetry"
                        className={({ isActive }) =>
                            `flex items-center px-4 py-3 ${isActive ? 'bg-space-blue text-white' : 'text-gray-300 hover:bg-gray-800'}`
                        }
                    >
                        <span className="ml-2">Telemetry Data</span>
                    </NavLink>

                    {(isAdmin || isEngineer) && (
                        <NavLink
                            to="/command-center"
                            className={({ isActive }) =>
                                `flex items-center px-4 py-3 ${isActive ? 'bg-space-blue text-white' : 'text-gray-300 hover:bg-gray-800'}`
                            }
                        >
                            <span className="ml-2">Command Center</span>
                        </NavLink>
                    )}

                    <NavLink
                        to="/anomalies"
                        className={({ isActive }) =>
                            `flex items-center px-4 py-3 ${isActive ? 'bg-space-blue text-white' : 'text-gray-300 hover:bg-gray-800'}`
                        }
                    >
                        <span className="ml-2">Anomaly Tracker</span>
                    </NavLink>

                    {isAdmin && (
                        <NavLink
                            to="/operators"
                            className={({ isActive }) =>
                                `flex items-center px-4 py-3 ${isActive ? 'bg-space-blue text-white' : 'text-gray-300 hover:bg-gray-800'}`
                            }
                        >
                            <span className="ml-2">Operators</span>
                        </NavLink>
                    )}
                </nav>

                <div className="p-4 border-t border-gray-700 text-xs text-gray-500">
                    AstroGrid v1.0.0
                </div>
            </div>
        </aside>
    );
};

export default Sidebar; 