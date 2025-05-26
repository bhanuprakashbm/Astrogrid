import { query } from '../../utils/db';

// Get all satellites
export const getAllSatellites = async (filter = null) => {
    try {
        let sql;
        let params = [];

        if (filter && filter !== 'all') {
            sql = 'SELECT * FROM satellites WHERE status = ? ORDER BY name';
            params = [filter];
        } else {
            sql = 'SELECT * FROM satellites ORDER BY name';
        }

        const results = await query(sql, params);
        return results;
    } catch (error) {
        console.error('Error fetching satellites:', error);
        throw error;
    }
};

// Get satellite by id
export const getSatelliteById = async (id) => {
    try {
        const sql = 'SELECT * FROM satellites WHERE id = ?';
        const results = await query(sql, [id]);

        if (results.length === 0) {
            return null;
        }

        return results[0];
    } catch (error) {
        console.error(`Error fetching satellite with id ${id}:`, error);
        throw error;
    }
};

// Create new satellite
export const createSatellite = async (satelliteData) => {
    try {
        // Format date to YYYY-MM-DD for MySQL
        const formattedDate = satelliteData.launch_date
            ? new Date(satelliteData.launch_date).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0];

        const sql = `
            INSERT INTO satellites 
            (name, type, operator, launch_date, status, orbit, created_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        const params = [
            satelliteData.name,
            satelliteData.type,
            satelliteData.agency || satelliteData.operator,
            formattedDate,
            satelliteData.status,
            satelliteData.orbit,
            new Date().toISOString()
        ];

        const result = await query(sql, params);

        return {
            id: result.insertId,
            ...satelliteData,
            launch_date: formattedDate
        };
    } catch (error) {
        console.error('Error creating satellite:', error);
        throw error;
    }
};

// Update satellite
export const updateSatellite = async (id, satelliteData) => {
    try {
        // Build the SET clause and parameters dynamically based on provided data
        const updates = [];
        const values = [];

        if (satelliteData.name) {
            updates.push('name = ?');
            values.push(satelliteData.name);
        }

        if (satelliteData.type) {
            updates.push('type = ?');
            values.push(satelliteData.type);
        }

        if (satelliteData.agency || satelliteData.operator) {
            updates.push('operator = ?');
            values.push(satelliteData.agency || satelliteData.operator);
        }

        if (satelliteData.launch_date) {
            const formattedDate = new Date(satelliteData.launch_date).toISOString().split('T')[0];
            updates.push('launch_date = ?');
            values.push(formattedDate);
        }

        if (satelliteData.status) {
            updates.push('status = ?');
            values.push(satelliteData.status);
        }

        if (satelliteData.orbit) {
            updates.push('orbit = ?');
            values.push(satelliteData.orbit);
        }

        // Add updated_at timestamp
        updates.push('updated_at = ?');
        values.push(new Date().toISOString());

        // Add ID for WHERE clause
        values.push(id);

        const sql = `UPDATE satellites SET ${updates.join(', ')} WHERE id = ?`;
        await query(sql, values);

        // Get the updated satellite
        return await getSatelliteById(id);
    } catch (error) {
        console.error(`Error updating satellite with id ${id}:`, error);
        throw error;
    }
};

// Delete satellite
export const deleteSatellite = async (id) => {
    try {
        const sql = 'DELETE FROM satellites WHERE id = ?';
        await query(sql, [id]);
        return true;
    } catch (error) {
        console.error(`Error deleting satellite with id ${id}:`, error);
        throw error;
    }
};

// Get satellites by status
export const getSatellitesByStatus = async (status) => {
    try {
        const sql = 'SELECT * FROM satellites WHERE status = ? ORDER BY name';
        const results = await query(sql, [status]);
        return results;
    } catch (error) {
        console.error(`Error fetching satellites with status ${status}:`, error);
        throw error;
    }
}; 