const mysql = require('mysql2/promise');
require('dotenv').config();

const sampleAnomalies = [
    {
        satellite_id: 1,
        description: "Power system fluctuation detected during solar panel rotation. Significant voltage drop observed during scheduled solar panel rotation. Power output decreased by 45% from nominal levels.",
        severity: "Critical",
        status: "Investigating",
        timestamp: new Date(Date.now() - 2520000) // 42 minutes ago
    },
    {
        satellite_id: 2,
        description: "GPS signal degradation affecting orbital positioning. Position accuracy exceeds operational limits. GPS receiver reporting intermittent signal loss.",
        severity: "Major",
        status: "Open",
        timestamp: new Date(Date.now() - 3600000) // 1 hour ago
    },
    {
        satellite_id: 1,
        description: "Communication subsystem bandwidth reduction. Downlink bandwidth operating at 30% of nominal capacity. Signal strength within acceptable range but data throughput reduced.",
        severity: "Minor",
        status: "Open",
        timestamp: new Date(Date.now() - 7200000) // 2 hours ago
    },
    {
        satellite_id: 3,
        description: "Thermal control system temperature spike. Temperature exceeding operational limits in primary payload bay. Automated thermal management system not compensating adequately.",
        severity: "Critical",
        status: "Investigating",
        timestamp: new Date(Date.now() - 10800000) // 3 hours ago
    },
    {
        satellite_id: 2,
        description: "Onboard computer memory error detected. Memory checksum errors detected in primary computer system. Error correction codes active but error rate increasing.",
        severity: "Major",
        status: "Open",
        timestamp: new Date(Date.now() - 14400000) // 4 hours ago
    },
    {
        satellite_id: 1,
        description: "Star tracker calibration drift. Star tracker showing gradual calibration drift. Attitude determination accuracy slightly degraded but within operational limits.",
        severity: "Minor",
        status: "Resolved",
        timestamp: new Date(Date.now() - 18000000) // 5 hours ago
    },
    {
        satellite_id: 3,
        description: "Solar array current fluctuation. Irregular current output from port solar array. Possible damage to solar cells or power regulation system.",
        severity: "Major",
        status: "Investigating",
        timestamp: new Date(Date.now() - 21600000) // 6 hours ago
    },
    {
        satellite_id: 2,
        description: "Reaction wheel speed anomaly. Reaction wheel 3 operating above nominal speed range. Increased power consumption and potential bearing wear.",
        severity: "Critical",
        status: "Open",
        timestamp: new Date(Date.now() - 25200000) // 7 hours ago
    },
    {
        satellite_id: 1,
        description: "Payload sensor data corruption. Main payload sensor returning corrupted data packets. Automated data validation failing for 25% of readings.",
        severity: "Major",
        status: "Investigating",
        timestamp: new Date(Date.now() - 28800000) // 8 hours ago
    },
    {
        satellite_id: 3,
        description: "Battery temperature warning. Battery pack temperature slightly above normal operating range. No immediate impact on performance but monitoring required.",
        severity: "Minor",
        status: "Open",
        timestamp: new Date(Date.now() - 32400000) // 9 hours ago
    }
];

async function insertSampleAnomalies() {
    let connection;
    try {
        console.log('Starting to insert sample anomalies...');
        
        // Create database connection
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'astrogrid'
        });

        // Insert each anomaly
        for (const anomaly of sampleAnomalies) {
            await connection.execute(
                `INSERT INTO anomalies (
                    satellite_id,
                    description,
                    severity,
                    status,
                    timestamp
                ) VALUES (?, ?, ?, ?, ?)`,
                [
                    anomaly.satellite_id,
                    anomaly.description,
                    anomaly.severity,
                    anomaly.status,
                    anomaly.timestamp
                ]
            );
        }

        console.log('Successfully inserted sample anomalies!');
    } catch (error) {
        console.error('Error inserting sample anomalies:', error);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

insertSampleAnomalies(); 