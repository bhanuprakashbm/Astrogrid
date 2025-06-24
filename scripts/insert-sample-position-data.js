const mysql = require('mysql2/promise');
require('dotenv').config();

// Function to generate sample position data for the last 24 hours
function generatePositionData(satelliteId, hours = 24) {
    const data = [];
    const now = Date.now();
    const interval = 5 * 60 * 1000; // 5 minutes

    // Base orbital parameters (sample LEO orbit)
    const baseAltitude = 500 + Math.random() * 100; // 500-600 km
    const baseVelocity = 7.5 + Math.random() * 0.5; // ~7.5-8.0 km/s
    const orbitPeriod = 90 * 60 * 1000; // 90 minutes in milliseconds

    for (let i = 0; i < (hours * 60 * 60 * 1000) / interval; i++) {
        const timestamp = new Date(now - (i * interval));
        const orbitProgress = (timestamp.getTime() % orbitPeriod) / orbitPeriod;
        
        // Generate position data with some realistic variations
        const latitude = 80 * Math.sin(orbitProgress * 2 * Math.PI);
        const longitude = ((timestamp.getTime() / (orbitPeriod/2)) % 360) - 180;
        const altitude = baseAltitude + (Math.sin(orbitProgress * 4 * Math.PI) * 10);
        const velocity = baseVelocity + (Math.sin(orbitProgress * 2 * Math.PI) * 0.2);
        const heading = (orbitProgress * 360 + 90) % 360;

        data.push({
            satellite_id: satelliteId,
            timestamp,
            latitude,
            longitude,
            altitude,
            velocity,
            heading
        });
    }

    return data;
}

// Function to generate sample maneuver data for the last 30 days
function generateManeuverData(satelliteId, days = 30) {
    const data = [];
    const now = Date.now();
    const maneuverTypes = ['Orbit Raise', 'Station Keeping', 'Collision Avoidance', 'Other'];
    
    // Generate 1-3 maneuvers per week
    for (let i = 0; i < days/7; i++) {
        const numManeuvers = 1 + Math.floor(Math.random() * 3);
        
        for (let j = 0; j < numManeuvers; j++) {
            const daysAgo = i * 7 + Math.random() * 7;
            const timestamp = new Date(now - (daysAgo * 24 * 60 * 60 * 1000));
            const maneuverType = maneuverTypes[Math.floor(Math.random() * maneuverTypes.length)];
            
            let deltaV, description;
            switch (maneuverType) {
                case 'Orbit Raise':
                    deltaV = 10 + Math.random() * 20;
                    description = 'Planned orbit raising maneuver';
                    break;
                case 'Station Keeping':
                    deltaV = 1 + Math.random() * 5;
                    description = 'Regular station keeping adjustment';
                    break;
                case 'Collision Avoidance':
                    deltaV = 5 + Math.random() * 15;
                    description = 'Emergency maneuver to avoid orbital debris';
                    break;
                default:
                    deltaV = 2 + Math.random() * 8;
                    description = 'Attitude correction maneuver';
            }

            data.push({
                satellite_id: satelliteId,
                timestamp,
                delta_v: deltaV,
                maneuver_type: maneuverType,
                description,
                fuel_used: deltaV * 0.1, // Simplified fuel calculation
                target_orbit: JSON.stringify({
                    sma: 6878 + Math.random() * 10,
                    ecc: 0.001 + Math.random() * 0.001,
                    inc: 51.6 + Math.random() * 0.1
                }),
                actual_orbit: JSON.stringify({
                    sma: 6878 + Math.random() * 10,
                    ecc: 0.001 + Math.random() * 0.001,
                    inc: 51.6 + Math.random() * 0.1
                })
            });
        }
    }

    return data.sort((a, b) => a.timestamp - b.timestamp);
}

async function insertSampleData() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        console.log('Starting to insert sample position and maneuver data...');

        // Get all satellite IDs
        const [satellites] = await connection.execute('SELECT id FROM satellites');

        for (const satellite of satellites) {
            // Insert position data
            const positionData = generatePositionData(satellite.id);
            for (const position of positionData) {
                await connection.execute(
                    `INSERT INTO satellite_positions (
                        satellite_id,
                        timestamp,
                        latitude,
                        longitude,
                        altitude,
                        velocity,
                        heading
                    ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [
                        position.satellite_id,
                        position.timestamp,
                        position.latitude,
                        position.longitude,
                        position.altitude,
                        position.velocity,
                        position.heading
                    ]
                );
            }
            console.log(`Inserted ${positionData.length} position records for satellite ${satellite.id}`);

            // Insert maneuver data
            const maneuverData = generateManeuverData(satellite.id);
            for (const maneuver of maneuverData) {
                await connection.execute(
                    `INSERT INTO satellite_maneuvers (
                        satellite_id,
                        timestamp,
                        delta_v,
                        maneuver_type,
                        description,
                        fuel_used,
                        target_orbit,
                        actual_orbit
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        maneuver.satellite_id,
                        maneuver.timestamp,
                        maneuver.delta_v,
                        maneuver.maneuver_type,
                        maneuver.description,
                        maneuver.fuel_used,
                        maneuver.target_orbit,
                        maneuver.actual_orbit
                    ]
                );
            }
            console.log(`Inserted ${maneuverData.length} maneuver records for satellite ${satellite.id}`);
        }

        console.log('Successfully inserted all sample data!');
    } catch (error) {
        console.error('Error inserting sample data:', error);
    } finally {
        await connection.end();
    }
}

insertSampleData(); 