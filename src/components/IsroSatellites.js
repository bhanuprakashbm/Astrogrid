import React, { useState } from 'react';
import IsroSatelliteDetails from './IsroSatelliteDetails';

const IsroSatellites = () => {
    const [activeFilter, setActiveFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSatellite, setSelectedSatellite] = useState(null);

    // Data sourced from ISRO website (https://www.isro.gov.in/)
    const isroSatellites = [
        {
            id: 1,
            name: "GSLV-F15/NVS-02",
            launchDate: "January 29, 2025",
            type: "Navigation",
            status: "active",
            description: "Navigation satellite for the NavIC constellation",
            imageUrl: "https://www.isro.gov.in/media_isro/image/GSLVF15NVS02/NVS-02_integrated.jpg.webp"
        },
        {
            id: 2,
            name: "PSLV-C60/SPADEX",
            launchDate: "December 30, 2024",
            type: "Technology Demonstrator",
            status: "active",
            description: "Space Docking Experiment (SPADEX), a pioneering docking demonstrator for future space exploration",
            imageUrl: "https://www.isro.gov.in/media_isro/image/PSLVC60-SPADEX/01SpadexBanner-Dec30-2024.jpg.webp"
        },
        {
            id: 3,
            name: "PSLV-C59/PROBA-3",
            launchDate: "December 05, 2024",
            type: "Scientific",
            status: "active",
            description: "ESA's PROBA-3 mission for formation flying and solar corona studies",
            imageUrl: "https://www.isro.gov.in/media_isro/image/PSLVC59/PSLVC59-Dec05-2024-00.jpg.webp"
        },
        {
            id: 4,
            name: "SSLV-D3/EOS-08",
            launchDate: "August 16, 2024",
            type: "Earth Observation",
            status: "active",
            description: "Earth Observation Satellite with high-resolution imaging capabilities",
            imageUrl: "https://www.isro.gov.in/media_isro/image/SSLVD3EOS08/SSLVD3-00-Aug16-2024.jpg.webp"
        },
        {
            id: 5,
            name: "Aditya-L1",
            launchDate: "September 2, 2023",
            type: "Solar Observatory",
            status: "active",
            description: "India's first dedicated solar mission studying the Sun from the L1 Lagrange point",
            imageUrl: "https://www.isro.gov.in/media_isro/image/Chandrayaan3/adityal1.jpg.webp"
        },
        {
            id: 6,
            name: "Chandrayaan-3",
            launchDate: "July 14, 2023",
            type: "Lunar",
            status: "mission complete",
            description: "India's successful lunar landing mission, demonstrating soft landing capabilities on the Moon's surface",
            imageUrl: "https://www.isro.gov.in/media_isro/image/Chandrayaan3/LVM3M4-1.jpg.webp"
        },
        {
            id: 7,
            name: "POEM-4",
            launchDate: "December 30, 2024",
            type: "Orbital Platform",
            status: "reentry complete",
            description: "PSLV Orbital Experimental Module that conducted microgravity experiments",
            imageUrl: "https://www.isro.gov.in/media_isro/image/PSLVC60-SPADEX/POEM4-PSLVC60-01.jpg.webp"
        },
        {
            id: 8,
            name: "OCM-3",
            launchDate: "September 2023",
            type: "Earth Observation",
            status: "active",
            description: "Ocean Colour Monitor-3 for studying vegetation dynamics and ocean color",
            imageUrl: "https://www.isro.gov.in/media_isro/image/Multimedia/images/eos06-1.jpg.webp"
        },
        {
            id: 9,
            name: "INSAT Series",
            launchDate: "Various",
            type: "Communication",
            status: "active",
            description: "Indian National Satellite System for telecommunications, broadcasting, and weather monitoring",
            imageUrl: "https://www.isro.gov.in/media_isro/image/GSAT/GSAT-30mockup.jpg.webp"
        },
        {
            id: 10,
            name: "Cartosat-3",
            launchDate: "November 27, 2019",
            type: "Earth Observation",
            status: "active",
            description: "Advanced high-resolution imaging satellite with sub-meter resolution",
            imageUrl: "https://www.isro.gov.in/media_isro/image/PSLVC47/C3-integration.jpeg.webp"
        }
    ];

    // Filter satellites based on activeFilter and searchTerm
    const filteredSatellites = isroSatellites.filter(satellite => {
        const matchesFilter = activeFilter === 'all' || satellite.status === activeFilter;
        const matchesSearch = satellite.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            satellite.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
            satellite.description.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    // Function to get status badge color
    const getStatusBadgeColor = (status) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'mission complete':
                return 'bg-blue-100 text-blue-800';
            case 'reentry complete':
                return 'bg-purple-100 text-purple-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="p-4 bg-gray-700">
                <h2 className="text-xl font-bold text-white">ISRO Satellites</h2>
                <p className="text-gray-400 text-sm mt-1">India's space missions - data sourced from ISRO</p>
            </div>

            <div className="p-4 bg-gray-750 border-b border-gray-700">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setActiveFilter('all')}
                            className={`px-3 py-1 rounded-md text-sm ${activeFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setActiveFilter('active')}
                            className={`px-3 py-1 rounded-md text-sm ${activeFilter === 'active' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                        >
                            Active
                        </button>
                        <button
                            onClick={() => setActiveFilter('mission complete')}
                            className={`px-3 py-1 rounded-md text-sm ${activeFilter === 'mission complete' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                        >
                            Completed
                        </button>
                    </div>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search satellites..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full md:w-64 bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <svg className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                        </svg>
                    </div>
                </div>
            </div>

            <div className="p-4">
                {filteredSatellites.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredSatellites.map(satellite => (
                            <div
                                key={satellite.id}
                                className="bg-gray-700 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                                onClick={() => setSelectedSatellite(satellite)}
                            >
                                <div className="h-40 overflow-hidden">
                                    <img
                                        src={satellite.imageUrl}
                                        alt={satellite.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.src = "https://www.isro.gov.in/media_isro/image/NationalSpaceDay2023/NSD.jpg.webp"; // Fallback image
                                        }}
                                    />
                                </div>
                                <div className="p-4">
                                    <div className="flex justify-between items-start">
                                        <h3 className="text-lg font-semibold text-white">{satellite.name}</h3>
                                        <span className={`px-2 py-1 inline-flex text-xs leading-4 font-medium rounded-full ${getStatusBadgeColor(satellite.status)}`}>
                                            {satellite.status}
                                        </span>
                                    </div>
                                    <p className="text-gray-400 text-sm mt-1">{satellite.type}</p>
                                    <p className="text-gray-300 text-sm mt-2">{satellite.description}</p>
                                    <div className="mt-3 text-gray-400 text-xs">
                                        <span>Launched: {satellite.launchDate}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10">
                        <p className="text-gray-400">No satellites found matching your criteria.</p>
                    </div>
                )}
            </div>

            {selectedSatellite && (
                <IsroSatelliteDetails
                    satellite={selectedSatellite}
                    onClose={() => setSelectedSatellite(null)}
                />
            )}
        </div>
    );
};

export default IsroSatellites; 