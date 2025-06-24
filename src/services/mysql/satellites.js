import { query } from '../../utils/db';

// Get all satellites
export const getAll = async () => {
    try {
        const sql = `SELECT * FROM satellites ORDER BY name ASC`;
        return await query(sql);
    } catch (error) {
        console.error('Error fetching satellites:', error);
        throw error;
    }
};

// Get satellite by ID
export const getById = async (id) => {
    try {
        const sql = `SELECT * FROM satellites WHERE id = ?`;
        const results = await query(sql, [id]);
        return results.length > 0 ? results[0] : null;
    } catch (error) {
        console.error('Error fetching satellite:', error);
        throw error;
    }
};

// Get satellite position history
export const getPositionHistory = async (satelliteId, hours = 24) => {
    try {
        const sql = `
            SELECT 
                timestamp,
                latitude,
                longitude,
                altitude
            FROM satellite_positions
            WHERE satellite_id = ?
                AND timestamp >= DATE_SUB(NOW(), INTERVAL ? HOUR)
            ORDER BY timestamp ASC
        `;
        return await query(sql, [satelliteId, hours]);
    } catch (error) {
        console.error('Error fetching satellite position history:', error);
        throw error;
    }
};

// Get satellite Delta-V history
export const getDeltaVHistory = async (satelliteId, days = 30) => {
    try {
        const sql = `
            SELECT 
                timestamp,
                delta_v,
                maneuver_type,
                description
            FROM satellite_maneuvers
            WHERE satellite_id = ?
                AND timestamp >= DATE_SUB(NOW(), INTERVAL ? DAY)
            ORDER BY timestamp ASC
        `;
        return await query(sql, [satelliteId, days]);
    } catch (error) {
        console.error('Error fetching satellite Delta-V history:', error);
        throw error;
    }
};

// Create new satellite
export const create = async (data) => {
    try {
        const sql = `
            INSERT INTO satellites (
                name,
                type,
                status,
                launch_date,
                orbit_type,
                description
            ) VALUES (?, ?, ?, ?, ?, ?)
        `;
        const result = await query(sql, [
            data.name,
            data.type,
            data.status,
            data.launch_date,
            data.orbit_type,
            data.description
        ]);
        return getById(result.insertId);
    } catch (error) {
        console.error('Error creating satellite:', error);
        throw error;
    }
};

// Update satellite
export const update = async (id, data) => {
    try {
        const sql = `
            UPDATE satellites 
            SET 
                name = ?,
                type = ?,
                status = ?,
                launch_date = ?,
                orbit = ?,
                description = ?,
                mass = ?,
                mission_life = ?,
                operator = ?
            WHERE id = ?
        `;
        await query(sql, [
            data.name,
            data.type,
            data.status || 'Operational',
            data.launch_date,
            data.orbit_type || data.orbit || null,
            data.description,
            data.mass ? parseFloat(data.mass) : null,
            data.mission_life || null,
            data.operator || null,
            id
        ]);
        return getById(id);
    } catch (error) {
        console.error('Error updating satellite:', error);
        throw error;
    }
};

// Delete satellite
export const remove = async (id) => {
    try {
        const sql = `DELETE FROM satellites WHERE id = ?`;
        return await query(sql, [id]);
    } catch (error) {
        console.error('Error deleting satellite:', error);
        throw error;
    }
};

// Get satellites by status
export const getByStatus = async (status) => {
    try {
        const sql = `SELECT * FROM satellites WHERE status = ? ORDER BY name ASC`;
        return await query(sql, [status]);
    } catch (error) {
        console.error('Error fetching satellites by status:', error);
        throw error;
    }
}; 