import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import useRole from '../../hooks/useRole';

const Navbar = () => {
    const { currentUser, logout } = useAuth();
    const { userRole } = useRole();
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await logout();
            // No need to redirect, AuthContext will handle it
        } catch (error) {
            console.error("Failed to log out", error);
        }
    };

    const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

    return (
        <nav className="bg-dark-space/90 backdrop-blur-xl border-b border-dark py-3 px-6">
            <div className="container mx-auto flex justify-between items-center">
                <div className="flex items-center">
                    <Link to="/" className="flex items-center space-x-2 group">
                        <span className="text-2xl md:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-500 group-hover:from-blue-300 group-hover:to-pink-400 transition-colors duration-300">
                            AstroGrid
                        </span>
                    </Link>
                </div>

                <div className="flex items-center space-x-4">
                    {currentUser ? (
                        <>
                            <div className="relative">
                                <button
                                    onClick={toggleDropdown}
                                    className="flex items-center space-x-2 text-gray-300 hover:text-white focus:outline-none group"
                                >
                                    <div className="relative">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center text-white">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    </div>
                                    <span className="hidden md:inline">{currentUser?.email}</span>
                                    <svg
                                        className={`w-4 h-4 transition-transform duration-200 ${dropdownOpen ? 'transform rotate-180' : ''}`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {dropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg py-1 border border-gray-700/50">
                                        <div className="px-4 py-2 text-sm text-gray-400 border-b border-gray-700/50">
                                            Role: {userRole}
                                        </div>
                                        <Link
                                            to="/profile"
                                            className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                                        >
                                            Profile
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                                        >
                                            Sign out
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex space-x-2">
                            <Link
                                to="/login"
                                className="bg-transparent hover:bg-gray-700 text-white py-1 px-3 rounded text-sm transition duration-300"
                            >
                                Login
                            </Link>
                            <Link
                                to="/register"
                                className="bg-space-red hover:bg-red-700 text-white py-1 px-3 rounded text-sm transition duration-300"
                            >
                                Register
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar; 