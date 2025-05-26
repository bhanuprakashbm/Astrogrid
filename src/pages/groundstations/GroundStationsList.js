import React, { useEffect, useState } from 'react';
import { collection, getDocs } from '../../services/api';
import { query } from '../../services/api';
import { db } from '../../services/api';

const GroundStationsList = () => {
    const [groundStations, setGroundStations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchGroundStations = async () => {
            setLoading(true);
            try {
                const q = query(collection(null, "groundStations"));
                const querySnapshot = await getDocs(q);

                if (querySnapshot.empty) {
                    // Load sample data if no ground stations exist in Firestore
                    const sampleGroundStations = [
                        {
                            id: "gs1",
                            name: "Goldstone Deep Space Communications Complex",
                            location: "Mojave Desert, California, USA",
                            coordinates: { latitude: 35.4267, longitude: -116.89 },
                            agency: "NASA/JPL",
                            status: "active",
                            capabilities: ["Deep Space Communications", "Near-Earth Communications", "Radio Astronomy"]
                        },
                        {
                            id: "gs2",
                            name: "ESTRACK Malargüe Station",
                            location: "Malargüe, Argentina",
                            coordinates: { latitude: -35.776, longitude: -69.398 },
                            agency: "ESA",
                            status: "active",
                            capabilities: ["Deep Space Communications", "Data Reception"]
                        },
                        {
                            id: "gs3",
                            name: "Svalbard Satellite Station",
                            location: "Longyearbyen, Svalbard, Norway",
                            coordinates: { latitude: 78.229, longitude: 15.407 },
                            agency: "KSAT",
                            status: "active",
                            capabilities: ["Polar Orbit Support", "Earth Observation Data"]
                        },
                        {
                            id: "gs4",
                            name: "White Sands Complex",
                            location: "Las Cruces, New Mexico, USA",
                            coordinates: { latitude: 32.5427, longitude: -106.6128 },
                            agency: "NASA",
                            status: "active",
                            capabilities: ["TDRS Relay", "Space Network Support"]
                        },
                        {
                            id: "gs5",
                            name: "Kourou Ground Station",
                            location: "Kourou, French Guiana",
                            coordinates: { latitude: 5.2522, longitude: -52.6817 },
                            agency: "ESA/CNES",
                            status: "active",
                            capabilities: ["Launch Support", "Tracking", "Telemetry"]
                        },
                        {
                            id: "gs6",
                            name: "Madrid Deep Space Communications Complex",
                            location: "Robledo de Chavela, Spain",
                            coordinates: { latitude: 40.431, longitude: -4.248 },
                            agency: "NASA/INTA",
                            status: "active",
                            capabilities: ["Deep Space Communications", "Near-Earth Communications"]
                        },
                        {
                            id: "gs7",
                            name: "Wallops Flight Facility",
                            location: "Wallops Island, Virginia, USA",
                            coordinates: { latitude: 37.9403, longitude: -75.4661 },
                            agency: "NASA",
                            status: "active",
                            capabilities: ["Launch Support", "LEO Satellite Communications"]
                        },
                        {
                            id: "gs8",
                            name: "Canberra Deep Space Communications Complex",
                            location: "Tidbinbilla, Australia",
                            coordinates: { latitude: -35.4019, longitude: 148.9819 },
                            agency: "NASA/CSIRO",
                            status: "active",
                            capabilities: ["Deep Space Communications", "Near-Earth Communications"]
                        },
                        {
                            id: "gs9",
                            name: "Kiruna Station",
                            location: "Kiruna, Sweden",
                            coordinates: { latitude: 67.8557, longitude: 20.9639 },
                            agency: "SSC/ESA",
                            status: "active",
                            capabilities: ["Earth Observation", "Polar Orbit Support"]
                        },
                        {
                            id: "gs10",
                            name: "KSAT Troll Satellite Station",
                            location: "Antarctica",
                            coordinates: { latitude: -72.0116, longitude: 2.5353 },
                            agency: "KSAT",
                            status: "active",
                            capabilities: ["Polar Orbit Support", "Earth Observation"]
                        },
                        {
                            id: "gs11",
                            name: "Hartebeesthoek Ground Station",
                            location: "Gauteng, South Africa",
                            coordinates: { latitude: -25.8901, longitude: 27.6855 },
                            agency: "SANSA",
                            status: "active",
                            capabilities: ["LEO Tracking", "Earth Observation"]
                        },
                        {
                            id: "gs12",
                            name: "Tsukuba Space Center",
                            location: "Tsukuba, Japan",
                            coordinates: { latitude: 36.0649, longitude: 140.1234 },
                            agency: "JAXA",
                            status: "active",
                            capabilities: ["Satellite Control", "Data Reception"]
                        },
                        {
                            id: "gs13",
                            name: "GISTDA Space Krenovation Park",
                            location: "Chon Buri, Thailand",
                            coordinates: { latitude: 13.1306, longitude: 100.9274 },
                            agency: "GISTDA",
                            status: "active",
                            capabilities: ["Earth Observation", "Satellite Control"]
                        },
                        {
                            id: "gs14",
                            name: "Fucino Space Centre",
                            location: "Fucino, Italy",
                            coordinates: { latitude: 41.9800, longitude: 13.6033 },
                            agency: "Telespazio",
                            status: "active",
                            capabilities: ["Satellite Control", "Communications"]
                        },
                        {
                            id: "gs15",
                            name: "Dongara Ground Station",
                            location: "Western Australia, Australia",
                            coordinates: { latitude: -29.0453, longitude: 115.3508 },
                            agency: "SSC",
                            status: "active",
                            capabilities: ["LEO Support", "Launch Support"]
                        },
                        {
                            id: "gs16",
                            name: "Inuvik Satellite Station Facility",
                            location: "Inuvik, Canada",
                            coordinates: { latitude: 68.3195, longitude: -133.5494 },
                            agency: "CSA/CCRS/SSC",
                            status: "active",
                            capabilities: ["Polar Orbit Support", "Earth Observation"]
                        },
                        {
                            id: "gs17",
                            name: "KSAT Singapore Ground Station",
                            location: "Singapore",
                            coordinates: { latitude: 1.3521, longitude: 103.8198 },
                            agency: "KSAT",
                            status: "active",
                            capabilities: ["LEO Support", "Equatorial Coverage"]
                        },
                        {
                            id: "gs18",
                            name: "Punta Arenas Ground Station",
                            location: "Punta Arenas, Chile",
                            coordinates: { latitude: -53.1638, longitude: -70.9171 },
                            agency: "SSC",
                            status: "active",
                            capabilities: ["Polar Orbit Support", "Earth Observation"]
                        },
                        {
                            id: "gs19",
                            name: "Baikonur Cosmodrome Ground Station",
                            location: "Kazakhstan",
                            coordinates: { latitude: 45.9646, longitude: 63.3052 },
                            agency: "Roscosmos",
                            status: "active",
                            capabilities: ["Launch Support", "Satellite Control"]
                        },
                        {
                            id: "gs20",
                            name: "Troll Satellite Station",
                            location: "Queen Maud Land, Antarctica",
                            coordinates: { latitude: -72.0116, longitude: 2.5353 },
                            agency: "Norwegian Polar Institute",
                            status: "active",
                            capabilities: ["Polar Orbit Support", "Earth Observation"]
                        },
                        {
                            id: "gs21",
                            name: "Santiago Ground Station",
                            location: "Santiago, Chile",
                            coordinates: { latitude: -33.4489, longitude: -70.6693 },
                            agency: "ESA",
                            status: "active",
                            capabilities: ["Earth Observation", "Spacecraft Operations"]
                        },
                        {
                            id: "gs22",
                            name: "McMurdo Ground Station",
                            location: "Ross Island, Antarctica",
                            coordinates: { latitude: -77.8419, longitude: 166.6863 },
                            agency: "NASA",
                            status: "active",
                            capabilities: ["Polar Orbit Support", "Scientific Data Collection"]
                        },
                        {
                            id: "gs23",
                            name: "Guiana Space Centre",
                            location: "Kourou, French Guiana",
                            coordinates: { latitude: 5.2322, longitude: -52.7651 },
                            agency: "ESA/CNES",
                            status: "active",
                            capabilities: ["Launch Support", "Tracking"]
                        },
                        {
                            id: "gs24",
                            name: "Weilheim Ground Station",
                            location: "Weilheim, Germany",
                            coordinates: { latitude: 47.8817, longitude: 11.0806 },
                            agency: "DLR",
                            status: "active",
                            capabilities: ["Satellite Control", "Data Reception"]
                        },
                        {
                            id: "gs25",
                            name: "Maspalomas Ground Station",
                            location: "Gran Canaria, Spain",
                            coordinates: { latitude: 27.7626, longitude: -15.6347 },
                            agency: "INTA/ESA",
                            status: "active",
                            capabilities: ["Earth Observation", "Launch Support"]
                        }
                    ];
                    setGroundStations(sampleGroundStations);
                } else {
                    const groundStationData = [];
                    querySnapshot.forEach((doc) => {
                        groundStationData.push({ id: doc.id, ...doc.data() });
                    });
                    setGroundStations(groundStationData);
                }
            } catch (error) {
                console.error("Error fetching ground stations: ", error);
                setError(error.message);
            }
            setLoading(false);
        };

        fetchGroundStations();
    }, []);

    return (
        <div>
            {/* Render your ground stations list here */}
        </div>
    );
};

export default GroundStationsList; 