import React from 'react';
import IsroSatellites from '../components/IsroSatellites';

const IsroSatellitesPage = () => {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-white">ISRO Satellite Database</h1>
                <div className="text-gray-400">
                    Data sourced from <a href="https://www.isro.gov.in/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">ISRO</a>
                </div>
            </div>

            <div className="mb-8 bg-gray-800 p-6 rounded-lg">
                <h2 className="text-xl font-bold text-white mb-2">About ISRO</h2>
                <p className="text-gray-300">
                    The Indian Space Research Organisation (ISRO) is the national space agency of India, headquartered in Bengaluru.
                    Established in 1969, ISRO has become one of the world's leading space agencies, known for its cost-effective and successful missions.
                    This database showcases ISRO's satellite missions, their current status, and specifications.
                </p>
            </div>

            <IsroSatellites />

            <div className="mt-8 text-sm text-gray-500 text-center">
                <p>
                    Note: This data is compiled from information available on the ISRO website as of April 2025.
                    For the most up-to-date information, please visit the <a href="https://www.isro.gov.in/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">official ISRO website</a>.
                </p>
            </div>
        </div>
    );
};

export default IsroSatellitesPage; 