require('dotenv').config();
const mysql = require('mysql2/promise');

async function checkAndInsertData() {
    const dbConfig = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'astrogrid'
    };

    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log('Connected to database successfully');

        // Check if satellites table exists and has data
        const [satellites] = await connection.execute('SELECT COUNT(*) as count FROM satellites');
        
        if (satellites[0].count === 0) {
            console.log('No satellites found. Inserting sample data...');
            
            // Insert sample satellites
            await connection.execute(`
                INSERT INTO satellites (name, description, status, type, launch_date, altitude, orbit, operator) VALUES
                ('AstroSat-1', 'Earth observation satellite for environmental monitoring', 'Operational', 'Earth Observation', '2023-01-15', 650, 'LEO', 'ISRO'),
                ('Resourcesat-2A', 'Resource monitoring satellite with multispectral imaging', 'Operational', 'Earth Observation', '2022-03-22', 817, 'LEO', 'ISRO'),
                ('GSAT-19', 'Communications satellite providing internet and broadcasting services', 'Operational', 'Communication', '2021-11-05', 35786, 'GEO', 'ISRO'),
                ('NavIC-1R', 'Regional navigation satellite', 'Operational', 'Navigation', '2022-06-10', 36000, 'GEO', 'ISRO'),
                ('AstroSat-2', 'Advanced astronomy satellite', 'In Development', 'Scientific', '2024-01-01', 650, 'LEO', 'ISRO'),
                ('EduSat-1', 'Educational satellite for universities', 'Operational', 'Educational', '2023-03-15', 500, 'LEO', 'ISRO')
            `);
            
            console.log('Sample satellites inserted successfully');
        } else {
            console.log(`Found ${satellites[0].count} satellites in the database`);
        }

        await connection.end();
        console.log('Database connection closed');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkAndInsertData(); 