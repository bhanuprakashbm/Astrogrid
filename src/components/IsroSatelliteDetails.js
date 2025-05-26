import React from 'react';

const IsroSatelliteDetails = ({ satellite, onClose }) => {
    if (!satellite) return null;

    // Additional details for each satellite - simulated data based on ISRO information
    const satelliteDetails = {
        "GSLV-F15/NVS-02": {
            weight: "2,232 kg",
            orbit: "Geosynchronous Orbit",
            lifetime: "12 years",
            capabilities: [
                "Navigation Signal Transmission",
                "Precision Timing",
                "Search and Rescue Services"
            ],
            achievements: "Part of the NavIC constellation that provides regional navigation services"
        },
        "PSLV-C60/SPADEX": {
            weight: "Combined 515 kg",
            orbit: "Low Earth Orbit",
            lifetime: "Technology demonstration mission",
            capabilities: [
                "Autonomous docking in space",
                "Power transfer between satellites",
                "Demonstrating technology for future space stations"
            ],
            achievements: "Successfully demonstrated docking of two satellites and power transfer between them"
        },
        "PSLV-C59/PROBA-3": {
            weight: "415 kg (combined)",
            orbit: "Low Earth Orbit to High Elliptical Orbit",
            lifetime: "2 years (planned)",
            capabilities: [
                "Formation flying",
                "Solar corona studies",
                "Precision spacecraft control"
            ],
            achievements: "First ESA mission launched by ISRO under commercial arrangements"
        },
        "SSLV-D3/EOS-08": {
            weight: "178 kg",
            orbit: "Low Earth Orbit",
            lifetime: "5 years",
            capabilities: [
                "Earth observation",
                "High-resolution imaging",
                "Urban planning applications"
            ],
            achievements: "Successful validation of the SSLV launch vehicle capabilities"
        },
        "Aditya-L1": {
            weight: "1,475 kg",
            orbit: "L1 Lagrange point",
            lifetime: "5 years",
            capabilities: [
                "Solar coronal study",
                "Solar wind monitoring",
                "Helioseismology"
            ],
            achievements: "India's first space-based solar observatory, studying the sun from the L1 point"
        },
        "Chandrayaan-3": {
            weight: "3,900 kg (launch mass)",
            orbit: "Lunar orbit and surface",
            lifetime: "14 Earth days (surface operations)",
            capabilities: [
                "Lunar surface exploration",
                "Scientific experiments on lunar soil",
                "Demonstration of soft landing capabilities"
            ],
            achievements: "India's successful lunar landing mission, fourth country to achieve a soft landing on the Moon"
        },
        "POEM-4": {
            weight: "700 kg (approximate)",
            orbit: "Low Earth Orbit",
            lifetime: "3-6 months before re-entry",
            capabilities: [
                "Orbital platform for experiments",
                "In-orbit technology demonstrations",
                "Microgravity research"
            ],
            achievements: "Successful demonstration of PSLV's fourth stage as an orbital platform"
        },
        "OCM-3": {
            weight: "Part of EOS-06 satellite (~1,117 kg)",
            orbit: "Polar Sun Synchronous Orbit",
            lifetime: "5 years",
            capabilities: [
                "Ocean color monitoring",
                "Vegetation monitoring",
                "Coastal region studies"
            ],
            achievements: "Advanced imaging of ocean color and vegetation patterns globally"
        },
        "INSAT Series": {
            weight: "2,000-4,000 kg (varies by satellite)",
            orbit: "Geostationary Orbit",
            lifetime: "10-15 years",
            capabilities: [
                "Telecommunications",
                "Broadcasting",
                "Weather monitoring",
                "Search and rescue"
            ],
            achievements: "Backbone of India's telecommunication and broadcasting infrastructure"
        },
        "Cartosat-3": {
            weight: "1,625 kg",
            orbit: "Sun Synchronous Orbit",
            lifetime: "5 years",
            capabilities: [
                "High-resolution imaging (better than 30 cm)",
                "Terrain mapping",
                "Urban planning",
                "Disaster monitoring"
            ],
            achievements: "India's highest resolution civilian imaging satellite with sub-meter precision"
        }
    };

    // Get additional details for this satellite or use a default object
    const details = satelliteDetails[satellite.name] || {
        weight: "Information not available",
        orbit: "Information not available",
        lifetime: "Information not available",
        capabilities: ["Information not available"],
        achievements: "Information not available"
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg max-w-3xl w-full max-h-screen overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-start">
                        <h2 className="text-2xl font-bold text-white">{satellite.name}</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-white focus:outline-none"
                        >
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <div className="h-60 overflow-hidden rounded-lg">
                                <img
                                    src={satellite.imageUrl}
                                    alt={satellite.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.src = "https://www.isro.gov.in/media_isro/image/NationalSpaceDay2023/NSD.jpg.webp";
                                    }}
                                />
                            </div>

                            <div className="mt-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-400">Status:</span>
                                    <span className={`px-2 py-1 inline-flex text-xs leading-4 font-medium rounded-full ${satellite.status === 'active' ? 'bg-green-100 text-green-800' :
                                            satellite.status === 'mission complete' ? 'bg-blue-100 text-blue-800' :
                                                'bg-gray-100 text-gray-800'
                                        }`}>
                                        {satellite.status}
                                    </span>
                                </div>

                                <div className="mt-2 flex items-center justify-between">
                                    <span className="text-gray-400">Launch Date:</span>
                                    <span className="text-white">{satellite.launchDate}</span>
                                </div>

                                <div className="mt-2 flex items-center justify-between">
                                    <span className="text-gray-400">Type:</span>
                                    <span className="text-white">{satellite.type}</span>
                                </div>

                                <div className="mt-2 flex items-center justify-between">
                                    <span className="text-gray-400">Weight:</span>
                                    <span className="text-white">{details.weight}</span>
                                </div>

                                <div className="mt-2 flex items-center justify-between">
                                    <span className="text-gray-400">Orbit:</span>
                                    <span className="text-white">{details.orbit}</span>
                                </div>

                                <div className="mt-2 flex items-center justify-between">
                                    <span className="text-gray-400">Expected Lifetime:</span>
                                    <span className="text-white">{details.lifetime}</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-white mb-3">Description</h3>
                            <p className="text-gray-300">{satellite.description}</p>

                            <h3 className="text-lg font-semibold text-white mt-6 mb-3">Capabilities</h3>
                            <ul className="list-disc pl-5 space-y-1">
                                {details.capabilities.map((capability, index) => (
                                    <li key={index} className="text-gray-300">{capability}</li>
                                ))}
                            </ul>

                            <h3 className="text-lg font-semibold text-white mt-6 mb-3">Achievements</h3>
                            <p className="text-gray-300">{details.achievements}</p>

                            <div className="mt-6 p-4 bg-gray-700 rounded-lg">
                                <h3 className="text-md font-semibold text-white mb-2">Source</h3>
                                <p className="text-sm text-gray-400">
                                    Data compiled from <a href="https://www.isro.gov.in/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">ISRO's official website</a>.
                                    Visit for the most up-to-date information.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IsroSatelliteDetails; 