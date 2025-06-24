// Simple Express server to handle database operations
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
// Configure CORS to allow requests from frontend
app.use(cors({
    origin: '*', // Allow all origins in development
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use(bodyParser.json());

// Add a timestamp to each request
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Root API endpoint
app.get('/api', (req, res) => {
    res.json({
        message: 'Welcome to the Astrogrid API',
        endpoints: {
            status: '/api/status',
            satellites: '/api/satellites',
            'ground-stations': '/api/ground-stations',
            users: '/api/users',
            missions: '/api/missions',
            telemetry: '/api/telemetry',
            commands: '/api/commands',
            anomalies: '/api/anomalies',
            auth: {
                login: '/api/auth/login',
                register: '/api/auth/register'
            }
        }
    });
});

// MySQL connection configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'astrogrid',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
app.get('/api/status', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        connection.release();
        res.json({ status: 'Database connection successful' });
    } catch (error) {
        console.error('Database connection error:', error);
        res.status(500).json({ error: 'Database connection failed', details: error.message });
    }
});

// Generic database query endpoint
app.post('/api/query', async (req, res) => {
    try {
        const { sql, params } = req.body;
        const [results] = await pool.execute(sql, params || []);
        res.json(results);
    } catch (error) {
        console.error('Query error:', error);
        res.status(500).json({ error: 'Query failed', details: error.message });
    }
});

// CRUD endpoints for entities
const createEntityEndpoints = (entity, tableName, orderByField = 'name') => {
    // Get all
    app.get(`/api/${entity}`, async (req, res) => {
        try {
            console.log(`Fetching all ${entity} from database...`);
            console.log('SQL Query:', `SELECT * FROM ${tableName} ORDER BY ${orderByField} DESC`);
            
            const [results] = await pool.execute(`SELECT * FROM ${tableName} ORDER BY ${orderByField} DESC`);
            
            console.log(`Found ${results.length} ${entity}:`, results);
            
            if (!Array.isArray(results)) {
                throw new Error(`Invalid data format from database for ${entity}`);
            }
            
            res.json(results);
        } catch (error) {
            console.error(`Error fetching ${entity}:`, error);
            console.error('Error details:', {
                code: error.code,
                errno: error.errno,
                sqlMessage: error.sqlMessage,
                sqlState: error.sqlState,
                stack: error.stack
            });
            res.status(500).json({ error: `Failed to fetch ${entity}`, details: error.message });
        }
    });

    // Get by ID
    app.get(`/api/${entity}/:id`, async (req, res) => {
        try {
            console.log(`Fetching ${entity} with ID ${req.params.id}`);
            const [results] = await pool.execute(
                `SELECT * FROM ${tableName} WHERE id = ?`,
                [req.params.id]
            );
            if (results.length === 0) {
                return res.status(404).json({ error: `${entity} not found` });
            }
            res.json(results[0]);
        } catch (error) {
            console.error(`Error fetching ${entity}:`, error);
            res.status(500).json({ error: `Failed to fetch ${entity}`, details: error.message });
        }
    });

    // Create
    app.post(`/api/${entity}`, async (req, res) => {
        try {
            const data = req.body;
            console.log(`Creating ${entity} with data:`, data);

            const fields = Object.keys(data).join(', ');
            const placeholders = Object.keys(data).map(() => '?').join(', ');
            const values = Object.values(data);

            console.log(`SQL Query: INSERT INTO ${tableName} (${fields}) VALUES (${placeholders})`);
            console.log('Values:', values);

            const [result] = await pool.execute(
                `INSERT INTO ${tableName} (${fields}) VALUES (${placeholders})`,
                values
            );

            // Get the newly created record
            const [records] = await pool.execute(
                `SELECT * FROM ${tableName} WHERE id = ?`,
                [result.insertId]
            );

            res.status(201).json(records[0]);
        } catch (error) {
            console.error(`Error creating ${entity}:`, error);
            console.error('Stack trace:', error.stack);
            res.status(500).json({ 
                error: `Failed to create ${entity}`, 
                details: error.message,
                sqlMessage: error.sqlMessage
            });
        }
    });

    // Update
    app.put(`/api/${entity}/:id`, async (req, res) => {
        try {
            const data = req.body;
            const updates = Object.keys(data).map(field => `${field} = ?`).join(', ');
            const values = [...Object.values(data), req.params.id];

            const [result] = await pool.execute(
                `UPDATE ${tableName} SET ${updates} WHERE id = ?`,
                values
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: `${entity} not found` });
            }

            // Get the updated record
            const [records] = await pool.execute(
                `SELECT * FROM ${tableName} WHERE id = ?`,
                [req.params.id]
            );

            res.json(records[0]);
        } catch (error) {
            console.error(`Error updating ${entity}:`, error);
            res.status(500).json({ error: `Failed to update ${entity}`, details: error.message });
        }
    });

    // Delete
    app.delete(`/api/${entity}/:id`, async (req, res) => {
        try {
            const [result] = await pool.execute(
                `DELETE FROM ${tableName} WHERE id = ?`,
                [req.params.id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: `${entity} not found` });
            }

            res.json({ message: `${entity} deleted successfully` });
        } catch (error) {
            console.error(`Error deleting ${entity}:`, error);
            res.status(500).json({ error: `Failed to delete ${entity}`, details: error.message });
        }
    });
};

// Create endpoints for each entity
createEntityEndpoints('satellites', 'satellites', 'name');
createEntityEndpoints('ground-stations', 'ground_stations', 'name');
createEntityEndpoints('commands', 'commands', 'timestamp');

// Custom endpoint to create a command with proper timestamp and status
app.post('/api/commands', async (req, res) => {
    console.log('Received command request:', JSON.stringify(req.body, null, 2));
    
    try {
        const { satellite_id, user_id, command_type, parameters, status = 'Pending' } = req.body;
        
        console.log('Parsed command data:', { satellite_id, user_id, command_type, parameters, status });
        
        if (!satellite_id || !command_type) {
            const errorMsg = 'Satellite ID and command type are required';
            console.error('Validation error:', errorMsg);
            return res.status(400).json({ error: errorMsg });
        }

        // Ensure parameters is a valid JSON string or null
        let params = null;
        try {
            params = parameters ? JSON.parse(parameters) : null;
        } catch (e) {
            console.warn('Parameters is not valid JSON, using as-is');
            params = parameters;
        }

        console.log('Executing SQL with values:', {
            satellite_id,
            user_id: user_id || 1, // Fallback to admin user if not provided
            command_type,
            parameters: params,
            status
        });

        const [result] = await pool.execute(
            'INSERT INTO commands (satellite_id, user_id, command_type, parameters, status, timestamp) VALUES (?, ?, ?, ?, ?, NOW())',
            [
                satellite_id,
                user_id || 1, // Fallback to admin user if not provided
                command_type,
                JSON.stringify(params),
                status
            ]
        );

        console.log('Command inserted successfully, ID:', result.insertId);

        const [newCommand] = await pool.execute(
            'SELECT * FROM commands WHERE id = ?',
            [result.insertId]
        );

        console.log('Retrieved new command:', newCommand[0]);
        res.status(201).json(newCommand[0]);
    } catch (error) {
        console.error('Error creating command:', {
            message: error.message,
            stack: error.stack,
            code: error.code,
            errno: error.errno,
            sqlState: error.sqlState,
            sqlMessage: error.sqlMessage,
            sql: error.sql
        });
        res.status(500).json({ 
            error: 'Failed to create command', 
            details: error.message,
            code: error.code,
            sqlMessage: error.sqlMessage
        });
    }
});
createEntityEndpoints('users', 'users', 'name');
createEntityEndpoints('missions', 'missions', 'name');
createEntityEndpoints('telemetry', 'telemetry', 'timestamp');
createEntityEndpoints('commands', 'commands', 'timestamp');
createEntityEndpoints('anomalies', 'anomalies', 'timestamp');

// Migration endpoint to add missing columns
app.post('/api/migrate/satellites', async (req, res) => {
    try {
        // Add mass column if it doesn't exist
        await pool.execute(`
            ALTER TABLE satellites 
            ADD COLUMN IF NOT EXISTS mass FLOAT,
            ADD COLUMN IF NOT EXISTS mission_life VARCHAR(50)
        `);
        
        // Update status enum
        await pool.execute(`
            ALTER TABLE satellites 
            MODIFY COLUMN status ENUM('Operational', 'Non-operational', 'In Development', 'Retired') DEFAULT 'Operational'
        `);

        res.json({ message: 'Migration completed successfully' });
    } catch (error) {
        console.error('Migration error:', error);
        res.status(500).json({ error: 'Migration failed', details: error.message });
    }
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const [users] = await pool.execute(
            'SELECT * FROM users WHERE email = ? AND password = ?',
            [email, password]
        );

        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const user = users[0];
        const userData = {
            uid: user.id,
            displayName: user.name,
            email: user.email,
            role: user.role
        };

        res.json(userData);
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed', details: error.message });
    }
});

// Registration endpoint
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Check if user already exists
        const [existingUsers] = await pool.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Insert new user
        const [result] = await pool.execute(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            [name, email, password, role || 'Observer']
        );

        // Get the newly created user
        const [users] = await pool.execute(
            'SELECT * FROM users WHERE id = ?',
            [result.insertId]
        );

        const user = users[0];
        const userData = {
            uid: user.id,
            displayName: user.name,
            email: user.email,
            role: user.role
        };

        res.status(201).json(userData);
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed', details: error.message });
    }
});

// Mission relationship endpoints
// Get satellites for a mission
app.get('/api/missions/:id/satellites', async (req, res) => {
    try {
        const [results] = await pool.execute(`
            SELECT s.* 
            FROM satellites s
             INNER JOIN mission_satellites ms ON s.id = ms.satellite_id 
            WHERE ms.mission_id = ?
        `, [req.params.id]);
        res.json(results);
    } catch (error) {
        console.error('Error fetching mission satellites:', error);
        res.status(500).json({ error: 'Failed to fetch mission satellites', details: error.message });
    }
});

// Get ground stations for a mission
app.get('/api/missions/:id/ground-stations', async (req, res) => {
    try {
        const [results] = await pool.execute(`
            SELECT gs.* 
            FROM ground_stations gs
             INNER JOIN mission_ground_stations mgs ON gs.id = mgs.ground_station_id 
            WHERE mgs.mission_id = ?
        `, [req.params.id]);
        res.json(results);
    } catch (error) {
        console.error('Error fetching mission ground stations:', error);
        res.status(500).json({ error: 'Failed to fetch mission ground stations', details: error.message });
    }
});

// Add satellite to mission
app.post('/api/missions/:id/satellites', async (req, res) => {
    try {
        const { satellite_id } = req.body;
        const mission_id = req.params.id;

        // Check if the relationship already exists
        const [existing] = await pool.execute(
            'SELECT * FROM mission_satellites WHERE mission_id = ? AND satellite_id = ?',
            [mission_id, satellite_id]
        );

        if (existing.length > 0) {
            return res.status(400).json({ error: 'Satellite is already part of this mission' });
        }

        // Add the relationship
        await pool.execute(
            'INSERT INTO mission_satellites (mission_id, satellite_id) VALUES (?, ?)',
            [mission_id, satellite_id]
        );

        // Get the satellite details
        const [satellite] = await pool.execute(
            'SELECT * FROM satellites WHERE id = ?',
            [satellite_id]
        );

        res.status(201).json(satellite[0]);
    } catch (error) {
        console.error('Error adding satellite to mission:', error);
        res.status(500).json({ error: 'Failed to add satellite to mission', details: error.message });
    }
});

// Remove satellite from mission
app.delete('/api/missions/:missionId/satellites/:satelliteId', async (req, res) => {
    try {
        const { missionId, satelliteId } = req.params;

        const [result] = await pool.execute(
            'DELETE FROM mission_satellites WHERE mission_id = ? AND satellite_id = ?',
            [missionId, satelliteId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Satellite not found in mission' });
        }

        res.json({ message: 'Satellite removed from mission successfully' });
    } catch (error) {
        console.error('Error removing satellite from mission:', error);
        res.status(500).json({ error: 'Failed to remove satellite from mission', details: error.message });
    }
});

// Add ground station to mission
app.post('/api/missions/:id/ground-stations', async (req, res) => {
    try {
        const { ground_station_id } = req.body;
        const mission_id = req.params.id;

        // Check if the relationship already exists
        const [existing] = await pool.execute(
            'SELECT * FROM mission_ground_stations WHERE mission_id = ? AND ground_station_id = ?',
            [mission_id, ground_station_id]
        );

        if (existing.length > 0) {
            return res.status(400).json({ error: 'Ground station is already part of this mission' });
        }

        // Add the relationship
        await pool.execute(
            'INSERT INTO mission_ground_stations (mission_id, ground_station_id) VALUES (?, ?)',
            [mission_id, ground_station_id]
        );

        // Get the ground station details
        const [station] = await pool.execute(
            'SELECT * FROM ground_stations WHERE id = ?',
            [ground_station_id]
        );

        res.status(201).json(station[0]);
    } catch (error) {
        console.error('Error adding ground station to mission:', error);
        res.status(500).json({ error: 'Failed to add ground station to mission', details: error.message });
    }
});

// Remove ground station from mission
app.delete('/api/missions/:missionId/ground-stations/:stationId', async (req, res) => {
    try {
        const { missionId, stationId } = req.params;

        const [result] = await pool.execute(
            'DELETE FROM mission_ground_stations WHERE mission_id = ? AND ground_station_id = ?',
            [missionId, stationId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Ground station not found in mission' });
        }

        res.json({ message: 'Ground station removed from mission successfully' });
    } catch (error) {
        console.error('Error removing ground station from mission:', error);
        res.status(500).json({ error: 'Failed to remove ground station from mission', details: error.message });
    }
});

// Telemetry endpoints
app.get('/api/telemetry', async (req, res) => {
    try {
        const { satellite_id, limit = 50, order = 'desc' } = req.query;
        console.log('Fetching telemetry data with params:', { satellite_id, limit, order });
        
        let query = 'SELECT * FROM telemetry';
        const params = [];

        if (satellite_id) {
            query += ' WHERE satellite_id = ?';
            params.push(satellite_id);
        }

        query += ` ORDER BY timestamp ${order === 'desc' ? 'DESC' : 'ASC'}`;

        if (limit) {
            query += ' LIMIT ?';
            params.push(parseInt(limit));
        }

        console.log('Executing query:', query, 'with params:', params);
        const [results] = await pool.execute(query, params);
        console.log(`Found ${results.length} telemetry records`);

        if (results.length === 0) {
            console.log('No telemetry data found for satellite:', satellite_id);
            return res.json([]);
        }

        // Validate data_json for each record
        const validatedResults = results.map(record => {
            try {
                if (typeof record.data_json === 'string') {
                    JSON.parse(record.data_json); // Validate JSON
                }
                return record;
            } catch (e) {
                console.error('Invalid JSON in telemetry record:', record.id, e);
                return {
                    ...record,
                    data_json: JSON.stringify({
                        power: 0,
                        temperature: 0,
                        signal: 0,
                        memory: 0,
                        cpu: 0
                    })
                };
            }
        });

        res.json(validatedResults);
    } catch (error) {
        console.error('Error fetching telemetry:', error);
        res.status(500).json({ error: 'Failed to fetch telemetry data', details: error.message });
    }
});

// Get latest telemetry for a satellite
app.get('/api/telemetry/latest/:satelliteId', async (req, res) => {
    try {
        const [results] = await pool.execute(
            'SELECT * FROM telemetry WHERE satellite_id = ? ORDER BY timestamp DESC LIMIT 1',
            [req.params.satelliteId]
        );
        res.json(results[0] || null);
    } catch (error) {
        console.error('Error fetching latest telemetry:', error);
        res.status(500).json({ error: 'Failed to fetch latest telemetry', details: error.message });
    }
});

// Start server with port fallback
const startServer = (port) => {
    try {
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
    console.log('Database configuration:', {
        host: dbConfig.host,
        user: dbConfig.user,
        database: dbConfig.database
    });
}); 
    } catch (error) {
        if (error.code === 'EADDRINUSE') {
            console.log(`Port ${port} is in use, trying ${port + 1}`);
            startServer(port + 1);
        } else {
            console.error('Error starting server:', error);
        }
    }
};

// Start server on port 3001 or next available port
startServer(process.env.PORT || 3001); 