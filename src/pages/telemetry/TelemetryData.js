import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from '../../services/api';

const TelemetryData = ({ satelliteId }) => {
    const [telemetryData, setTelemetryData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTelemetryData = async () => {
            setLoading(true);
            try {
                // If satelliteId is provided, fetch data for specific satellite
                let telemetryQuery;
                if (satelliteId) {
                    telemetryQuery = query(
                        collection(null, "telemetry"),
                        where("satelliteId", "==", satelliteId)
                    );
                } else {
                    // Fetch all telemetry data
                    telemetryQuery = query(collection(null, "telemetry"));
                }

                const querySnapshot = await getDocs(telemetryQuery);

                if (querySnapshot.empty) {
                    // Load sample telemetry data if no data exists
                    const sampleTelemetryData = generateSampleTelemetryData(satelliteId);
                    setTelemetryData(sampleTelemetryData);
                } else {
                    const telemetryDataFromDb = [];
                    querySnapshot.docs.forEach((doc) => {
                        telemetryDataFromDb.push({ id: doc.id, ...doc.data() });
                    });
                    setTelemetryData(telemetryDataFromDb);
                }
            } catch (error) {
                console.error("Error fetching telemetry data: ", error);
                setError(error.message);
            }
            setLoading(false);
        };

        fetchTelemetryData();
    }, [satelliteId]);

    // Generate sample telemetry data for 30 satellites
    const generateSampleTelemetryData = (specificSatelliteId) => {
        const satelliteIds = [
            "sat1", "sat2", "sat3", "sat4", "sat5", "sat6", "sat7", "sat8", "sat9", "sat10",
            "sat11", "sat12", "sat13", "sat14", "sat15", "sat16", "sat17", "sat18", "sat19", "sat20",
            "sat21", "sat22", "sat23", "sat24", "sat25", "sat26", "sat27", "sat28", "sat29", "sat30"
        ];

        // Satellite names corresponding to the IDs
        const satelliteNames = {
            "sat1": "GOES-18",
            "sat2": "Starlink-1095",
            "sat3": "Hubble Space Telescope",
            "sat4": "ISS (Zarya)",
            "sat5": "Landsat 9",
            "sat6": "GPS IIF-12",
            "sat7": "JPSS-2",
            "sat8": "Sentinel-6",
            "sat9": "Terra",
            "sat10": "Aqua",
            "sat11": "WorldView-4",
            "sat12": "GeoEye-1",
            "sat13": "TDRS-M",
            "sat14": "Intelsat 37e",
            "sat15": "Eutelsat 172B",
            "sat16": "KazSat-3",
            "sat17": "Tiangong Space Station",
            "sat18": "Astra 2G",
            "sat19": "Pleiades Neo 4",
            "sat20": "NigeriaSat-2",
            "sat21": "NOAA-20",
            "sat22": "GOES-16",
            "sat23": "Metop-C",
            "sat24": "CBERS-4A",
            "sat25": "Iridium NEXT 157",
            "sat26": "Yaogan-33",
            "sat27": "Gaofen-11 03",
            "sat28": "SAR-Lupe 5",
            "sat29": "SBIRS GEO-5",
            "sat30": "Globalstar M097"
        };

        // Define orbital characteristics based on satellite types
        const satelliteOrbits = {
            "sat1": { type: "GEO", altitude: 35786, inclination: 0 },
            "sat2": { type: "LEO", altitude: 550, inclination: 53 },
            "sat3": { type: "LEO", altitude: 540, inclination: 28.5 },
            "sat4": { type: "LEO", altitude: 420, inclination: 51.6 },
            "sat5": { type: "SSO", altitude: 705, inclination: 98.2 },
            "sat6": { type: "MEO", altitude: 20180, inclination: 55 },
            "sat7": { type: "SSO", altitude: 824, inclination: 98.7 },
            "sat8": { type: "LEO", altitude: 1336, inclination: 66 },
            "sat9": { type: "SSO", altitude: 705, inclination: 98.2 },
            "sat10": { type: "SSO", altitude: 705, inclination: 98.2 },
            "sat11": { type: "SSO", altitude: 617, inclination: 98 },
            "sat12": { type: "SSO", altitude: 681, inclination: 98 },
            "sat13": { type: "GEO", altitude: 35786, inclination: 0 },
            "sat14": { type: "GEO", altitude: 35786, inclination: 0 },
            "sat15": { type: "GEO", altitude: 35786, inclination: 0 },
            "sat16": { type: "GEO", altitude: 35786, inclination: 0 },
            "sat17": { type: "LEO", altitude: 390, inclination: 42.8 },
            "sat18": { type: "GEO", altitude: 35786, inclination: 0 },
            "sat19": { type: "SSO", altitude: 620, inclination: 97.9 },
            "sat20": { type: "SSO", altitude: 700, inclination: 98.3 },
            "sat21": { type: "SSO", altitude: 824, inclination: 98.7 },
            "sat22": { type: "GEO", altitude: 35786, inclination: 0 },
            "sat23": { type: "SSO", altitude: 817, inclination: 98.7 },
            "sat24": { type: "SSO", altitude: 628, inclination: 97.8 },
            "sat25": { type: "LEO", altitude: 780, inclination: 86.4 },
            "sat26": { type: "SSO", altitude: 688, inclination: 98.3 },
            "sat27": { type: "LEO", altitude: 500, inclination: 97.5 },
            "sat28": { type: "LEO", altitude: 500, inclination: 98.2 },
            "sat29": { type: "GEO", altitude: 35786, inclination: 0 },
            "sat30": { type: "LEO", altitude: 1414, inclination: 52 }
        };

        const getRandomValue = (min, max, decimals = 2) => {
            return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
        };

        const getRandomStatus = () => {
            const statuses = ["nominal", "warning", "critical"];
            const weights = [0.8, 0.15, 0.05]; // 80% chance of nominal, 15% warning, 5% critical
            const random = Math.random();
            let sum = 0;
            for (let i = 0; i < statuses.length; i++) {
                sum += weights[i];
                if (random <= sum) return statuses[i];
            }
            return statuses[0];
        };

        const sampleData = [];
        const now = new Date();

        // Generate data for a specific satellite or for all satellites
        const satellitesToProcess = specificSatelliteId
            ? [specificSatelliteId]
            : satelliteIds;

        satellitesToProcess.forEach(satId => {
            // Generate 24 hours of telemetry at 1-hour intervals
            for (let i = 0; i < 24; i++) {
                const timestamp = new Date(now.getTime() - (i * 60 * 60 * 1000));
                const orbit = satelliteOrbits[satId] || { type: "LEO", altitude: 500, inclination: 50 };

                // Calculate the base velocity based on altitude (using a simplified model)
                // In reality, this would be much more complex and accurate
                const baseVelocity = orbit.type === "GEO"
                    ? 3.07 // km/s for geostationary
                    : orbit.type === "MEO"
                        ? 3.9 // km/s for medium Earth orbit
                        : 7.8; // km/s for low Earth orbit

                // Add some variation
                const velocity = getRandomValue(baseVelocity - 0.2, baseVelocity + 0.2, 2);

                // Generate more realistic battery percentage with a slow discharge/charge cycle
                const batteryBaseValue = 85 + 10 * Math.sin(i / 24 * 2 * Math.PI);
                const batteryPercentage = getRandomValue(
                    Math.max(batteryBaseValue - 3, 65),
                    Math.min(batteryBaseValue + 3, 100),
                    1
                );

                // Temperature varies based on sun exposure
                const tempBaseValue = orbit.type === "GEO" ? 20 : 15;
                const tempVariation = 10 * Math.sin(i / 12 * Math.PI);
                const temperature = getRandomValue(tempBaseValue + tempVariation - 5, tempBaseValue + tempVariation + 5, 1);

                // Set altitude with slight variations around the nominal altitude
                const altitude = getRandomValue(orbit.altitude - 2, orbit.altitude + 2, 1);

                sampleData.push({
                    id: `telemetry-${satId}-${timestamp.getTime()}`,
                    satelliteId: satId,
                    satelliteName: satelliteNames[satId] || `Unknown Satellite`,
                    timestamp: timestamp.toISOString(),
                    altitude: altitude, // kilometers
                    velocity: velocity, // kilometers per second
                    position: {
                        latitude: getRandomValue(-80, 80, 4),
                        longitude: getRandomValue(-180, 180, 4)
                    },
                    batteryStatus: {
                        percentage: batteryPercentage,
                        chargingState: batteryPercentage < 90 ? "charging" : "discharging",
                        current: getRandomValue(1.8, 2.3, 2), // amperes
                        voltage: getRandomValue(27.8, 28.2, 2) // volts
                    },
                    temperatureC: temperature,
                    subsystems: {
                        communication: getRandomStatus(),
                        power: getRandomStatus(),
                        propulsion: getRandomStatus(),
                        attitudeControl: getRandomStatus(),
                        payload: getRandomStatus(),
                        thermalControl: getRandomStatus()
                    },
                    signalStrength: getRandomValue(70, 100, 1),
                    attitudeQuaternions: {
                        q1: getRandomValue(-1, 1, 4),
                        q2: getRandomValue(-1, 1, 4),
                        q3: getRandomValue(-1, 1, 4),
                        q4: getRandomValue(-1, 1, 4)
                    },
                    orbitType: orbit.type,
                    inclination: orbit.inclination
                });
            }
        });

        // Sort by timestamp (newest first)
        return sampleData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    };

    if (loading) return <div>Loading telemetry data...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="telemetry-container">
            <h2>Satellite Telemetry Data</h2>
            {telemetryData.length === 0 ? (
                <p>No telemetry data available.</p>
            ) : (
                <>
                    <div className="telemetry-table-container">
                        <table className="telemetry-table">
                            <thead>
                                <tr>
                                    <th>Satellite</th>
                                    <th>Timestamp</th>
                                    <th>Altitude (km)</th>
                                    <th>Velocity (km/s)</th>
                                    <th>Battery (%)</th>
                                    <th>Temp (°C)</th>
                                    <th>Signal</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {telemetryData.slice(0, 10).map((data) => (
                                    <tr key={data.id}>
                                        <td>{data.satelliteName}</td>
                                        <td>{new Date(data.timestamp).toLocaleString()}</td>
                                        <td>{data.altitude}</td>
                                        <td>{data.velocity}</td>
                                        <td>{data.batteryStatus?.percentage || 'N/A'}</td>
                                        <td>{data.temperatureC}</td>
                                        <td>{data.signalStrength}%</td>
                                        <td>
                                            {Object.entries(data.subsystems || {}).some(([_, status]) => status !== 'nominal')
                                                ? <span className="status-warning">Warning</span>
                                                : <span className="status-nominal">Nominal</span>
                                            }
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="telemetry-details">
                        <h3>Subsystem Status</h3>
                        {telemetryData.length > 0 && (
                            <div className="subsystem-status">
                                {Object.entries(telemetryData[0].subsystems || {}).map(([system, status]) => (
                                    <div key={system} className="subsystem-item">
                                        <span className="subsystem-name">{system.charAt(0).toUpperCase() + system.slice(1)}:</span>
                                        <span className={`status-badge ${status}`}>{status}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default TelemetryData; 