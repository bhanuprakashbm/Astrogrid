// Database connection module
// This module handles client-side connections for development and connects to real MySQL in production

// Determine if running in browser or Node.js environment
const isBrowser = typeof window !== 'undefined';

// Import mysql only in Node.js environment
let mysql;
if (!isBrowser) {
    try {
        mysql = require('mysql2/promise');
    } catch (error) {
        console.error('Error importing mysql2:', error);
    }
}

// MySQL connection configuration
const dbConfig = {
    host: isBrowser ? process.env.REACT_APP_DB_HOST : process.env.DB_HOST || 'localhost',
    user: isBrowser ? process.env.REACT_APP_DB_USER : process.env.DB_USER || 'root',
    password: isBrowser ? process.env.REACT_APP_DB_PASSWORD : process.env.DB_PASSWORD || '',
    database: isBrowser ? process.env.REACT_APP_DB_NAME : process.env.DB_NAME || 'astrogrid',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Create connection pool for server-side (Node.js) execution
let pool;
if (!isBrowser) {
    try {
        pool = mysql.createPool(dbConfig);
        console.log('MySQL pool created');
    } catch (error) {
        console.error('Error creating MySQL pool:', error);
    }
}

// Query function - handles both browser mock mode and server MySQL connections
export const query = async (sql, params = []) => {
    // Browser environment - use mock data
    if (isBrowser) {
        console.log('DB Query (mock):', sql, params);
        return mockQuery(sql, params);
    }

    // Server environment - use real MySQL connection
    try {
        const [results] = await pool.execute(sql, params);
        return results;
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
};

// Test database connection
export const testConnection = async () => {
    if (isBrowser) {
        console.log('Testing database connection (mock mode)');
        return true;
    }

    try {
        const connection = await pool.getConnection();
        connection.release();
        console.log('Database connection successful');
        return true;
    } catch (error) {
        console.error('Database connection error:', error);
        return false;
    }
};

// Export pool for direct access if needed
export { pool };

// Mock query implementation for browser environment
const mockQuery = (sql, params) => {
    // This mock implementation simulates database operations in the browser
    // for development purposes only. In production, these calls would go to a backend API.

    // For development, return mock data based on the SQL query
    if (sql.includes('SELECT * FROM users')) {
        return [
            { id: 1, name: 'Admin User', email: 'admin@astrogrid.com', role: 'Admin' },
            { id: 2, name: 'Mission Controller', email: 'mission@astrogrid.com', role: 'Controller' },
            { id: 3, name: 'Observer', email: 'observer@astrogrid.com', role: 'Observer' }
        ];
    } else if (sql.includes('SELECT * FROM satellites WHERE id =')) {
        // Handle single satellite query
        const satelliteId = params[0];
        const satellites = [
            { id: 1, name: 'AstroSat-1', description: 'Earth observation satellite for environmental monitoring', status: 'Operational', altitude: 650, operator: 'ISRO', type: 'Earth Observation', orbit: 'LEO', launch_date: '2023-01-15', mass: 1500, mission_life: '5' },
            { id: 2, name: 'Resourcesat-2A', description: 'Resource monitoring satellite with multispectral imaging', status: 'Operational', altitude: 817, operator: 'ISRO', type: 'Earth Observation', orbit: 'LEO', launch_date: '2022-03-22', mass: 1200, mission_life: '5' },
            { id: 3, name: 'GSAT-19', description: 'Communications satellite providing internet and broadcasting services', status: 'Operational', altitude: 35786, operator: 'ISRO', type: 'Communication', orbit: 'GEO', launch_date: '2021-11-05', mass: 3500, mission_life: '12' }
        ];
        return satellites.filter(sat => sat.id === parseInt(satelliteId));
    } else if (sql.includes('SELECT * FROM satellites')) {
        return [
            { id: 1, name: 'AstroSat-1', description: 'Earth observation satellite for environmental monitoring', status: 'Operational', altitude: 650, operator: 'ISRO', type: 'Earth Observation', orbit: 'LEO', launch_date: '2023-01-15' },
            { id: 2, name: 'Resourcesat-2A', description: 'Resource monitoring satellite with multispectral imaging', status: 'Operational', altitude: 817, operator: 'ISRO', type: 'Earth Observation', orbit: 'LEO', launch_date: '2022-03-22' },
            { id: 3, name: 'GSAT-19', description: 'Communications satellite providing internet and broadcasting services', status: 'Operational', altitude: 35786, operator: 'ISRO', type: 'Communication', orbit: 'GEO', launch_date: '2021-11-05' }
        ];
    } else if (sql.includes('SELECT * FROM ground_stations')) {
        return [
            {
                id: 1,
                name: 'Bangalore Station',
                location: 'Bangalore, India',
                latitude: 12.9716,
                longitude: 77.5946,
                elevation: 920,
                status: 'Operational',
                description: 'Primary ground station for LEO satellite tracking and communications'
            },
            {
                id: 2,
                name: 'Chennai Station',
                location: 'Chennai, India',
                latitude: 13.0827,
                longitude: 80.2707,
                elevation: 6.7,
                status: 'Operational',
                description: 'Secondary ground station focused on weather satellite tracking'
            },
            {
                id: 3,
                name: 'Lucknow Station',
                location: 'Lucknow, India',
                latitude: 26.8467,
                longitude: 80.9462,
                elevation: 123,
                status: 'Maintenance',
                description: 'Tertiary ground station currently undergoing equipment upgrades'
            }
        ];
    } else if (sql.includes('SELECT * FROM missions')) {
        return [
            { id: 1, name: 'Earth Observation Mission', status: 'Active', description: 'Monitoring Earth\'s climate and resources', startDate: '2023-01-01', endDate: '2026-12-31' },
            { id: 2, name: 'Communication Relay', status: 'Planned', description: 'Establishing new communication network', startDate: '2024-06-01', endDate: '2029-05-31' },
            { id: 3, name: 'Mars Orbital Survey', status: 'Completed', description: 'Detailed mapping of Mars surface', startDate: '2018-03-15', endDate: '2022-12-31' }
        ];
    } else if (sql.includes('SELECT * FROM commands')) {
        return [
            { id: 1, satellite_id: 1, command_type: 'Orbital Adjust', status: 'Pending', timestamp: new Date().toISOString(), user_id: 1 },
            { id: 2, satellite_id: 2, command_type: 'Restart System', status: 'Completed', timestamp: new Date(Date.now() - 86400000).toISOString(), user_id: 2 }
        ];
    } else if (sql.includes('SELECT * FROM anomalies')) {
        return [
            { id: 1, satellite_id: 3, description: 'Power fluctuation detected', severity: 'Critical', status: 'Open', timestamp: new Date().toISOString() },
            { id: 2, satellite_id: 1, description: 'Minor telemetry issue', severity: 'Low', status: 'Resolved', timestamp: new Date(Date.now() - 172800000).toISOString() }
        ];
    } else if (sql.includes('SELECT * FROM telemetry')) {
        return [
            { id: 1, satellite_id: 1, timestamp: new Date().toISOString(), data: { power: 95, temperature: 23, signal: 87 } },
            { id: 2, satellite_id: 1, timestamp: new Date(Date.now() - 3600000).toISOString(), data: { power: 96, temperature: 22, signal: 89 } }
        ];
    } else if (sql.includes('INSERT INTO')) {
        return { insertId: Math.floor(Math.random() * 1000) + 10 };
    } else if (sql.includes('UPDATE')) {
        return { affectedRows: 1 };
    } else if (sql.includes('DELETE')) {
        return { affectedRows: 1 };
    } else {
        return [];
    }
}; 