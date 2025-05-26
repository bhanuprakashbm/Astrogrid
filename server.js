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
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
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
const createEntityEndpoints = (entity, tableName) => {
    // Get all
    app.get(`/api/${entity}`, async (req, res) => {
        try {
            const [results] = await pool.execute(`SELECT * FROM ${tableName}`);
            res.json(results);
        } catch (error) {
            console.error(`Error fetching ${entity}:`, error);
            res.status(500).json({ error: `Failed to fetch ${entity}`, details: error.message });
        }
    });

    // Get by ID
    app.get(`/api/${entity}/:id`, async (req, res) => {
        try {
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
            const fields = Object.keys(data).join(', ');
            const placeholders = Object.keys(data).map(() => '?').join(', ');
            const values = Object.values(data);

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
            res.status(500).json({ error: `Failed to create ${entity}`, details: error.message });
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
createEntityEndpoints('satellites', 'satellites');
createEntityEndpoints('ground-stations', 'ground_stations');
createEntityEndpoints('users', 'users');
createEntityEndpoints('missions', 'missions');
createEntityEndpoints('telemetry', 'telemetry');
createEntityEndpoints('commands', 'commands');
createEntityEndpoints('anomalies', 'anomalies');

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

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API available at http://localhost:${PORT}/api`);
}); 