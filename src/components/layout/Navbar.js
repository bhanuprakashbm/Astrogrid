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
        <nav className="bg-space-blue shadow-md py-2 px-4">
            <div className="container mx-auto flex justify-between items-center">
                <div className="flex items-center">
                    <Link to="/" className="flex items-center space-x-2">
                        <span className="text-xl font-bold text-white">AstroGrid</span>
                    </Link>
                </div>

                <div className="flex items-center space-x-4">
                    {currentUser ? (
                        <>
                            <div className="relative">
                                <button
                                    onClick={toggleDropdown}
                                    className="flex items-center space-x-2 text-sm text-white hover:text-gray-300 focus:outline-none"
                                >
                                    <span className="text-sm text-gray-300">
                                        {currentUser.email} ({userRole})
                                    </span>
                                    <svg
                                        className={`w-4 h-4 transform ${dropdownOpen ? 'rotate-180' : ''}`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M19 9l-7 7-7-7"
                                        ></path>
                                    </svg>
                                </button>
                                {dropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 z-10">
                                        <Link
                                            to="/profile"
                                            className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                                            onClick={() => setDropdownOpen(false)}
                                        >
                                            Profile
                                        </Link>
                                        <button
                                            onClick={() => {
                                                handleLogout();
                                                setDropdownOpen(false);
                                            }}
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                                        >
                                            Logout
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