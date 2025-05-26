import { query } from '../../utils/db';

// Get all ground stations
export const getAllGroundStations = async (filter = null) => {
    try {
        let sql;
        let params = [];

        if (filter && filter !== 'all') {
            sql = 'SELECT * FROM ground_stations WHERE status = ? ORDER BY name';
            params = [filter];
        } else {
            sql = 'SELECT * FROM ground_stations ORDER BY name';
        }

        const results = await query(sql, params);
        return results;
    } catch (error) {
        console.error('Error fetching ground stations:', error);
        throw error;
    }
};

// Get ground station by id
export const getGroundStationById = async (id) => {
    try {
        const sql = 'SELECT * FROM ground_stations WHERE id = ?';
        const results = await query(sql, [id]);

        if (results.length === 0) {
            return null;
        }

        return results[0];
    } catch (error) {
        console.error(`Error fetching ground station with id ${id}:`, error);
        throw error;
    }
};

// Create new ground station
export const createGroundStation = async (stationData) => {
    try {
        const sql = `
            INSERT INTO ground_stations 
            (name, location, latitude, longitude, elevation, status, description, created_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const params = [
            stationData.name,
            stationData.location,
            stationData.latitude,
            stationData.longitude,
            stationData.elevation || 0,
            stationData.status || 'Operational',
            stationData.description || '',
            new Date().toISOString()
        ];

        const result = await query(sql, params);

        return {
            id: result.insertId,
            ...stationData
        };
    } catch (error) {
        console.error('Error creating ground station:', error);
        throw error;
    }
};

// Update ground station
export const updateGroundStation = async (id, stationData) => {
    try {
        // Build the SET clause and parameters dynamically based on provided data
        const updates = [];
        const values = [];

        if (stationData.name) {
            updates.push('name = ?');
            values.push(stationData.name);
        }

        if (stationData.location) {
            updates.push('location = ?');
            values.push(stationData.location);
        }

        if (stationData.latitude !== undefined) {
            updates.push('latitude = ?');
            values.push(stationData.latitude);
        }

        if (stationData.longitude !== undefined) {
            updates.push('longitude = ?');
            values.push(stationData.longitude);
        }

        if (stationData.elevation !== undefined) {
            updates.push('elevation = ?');
            values.push(stationData.elevation);
        }

        if (stationData.status) {
            updates.push('status = ?');
            values.push(stationData.status);
        }

        if (stationData.description !== undefined) {
            updates.push('description = ?');
            values.push(stationData.description);
        }

        // Add updated_at timestamp
        updates.push('updated_at = ?');
        values.push(new Date().toISOString());

        // Add ID for WHERE clause
        values.push(id);

        const sql = `UPDATE ground_stations SET ${updates.join(', ')} WHERE id = ?`;
        await query(sql, values);

        // Get the updated ground station
        return await getGroundStationById(id);
    } catch (error) {
        console.error(`Error updating ground station with id ${id}:`, error);
        throw error;
    }
};

// Delete ground station
export const deleteGroundStation = async (id) => {
    try {
        const sql = 'DELETE FROM ground_stations WHERE id = ?';
        await query(sql, [id]);
        return true;
    } catch (error) {
        console.error(`Error deleting ground station with id ${id}:`, error);
        throw error;
    }
}; 