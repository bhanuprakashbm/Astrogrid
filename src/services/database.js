import { query } from '../utils/db';

// Generic function to get all items from a table
export const getAll = async (tableName, orderByField = 'created_at', orderDirection = 'DESC') => {
    try {
        const sql = `SELECT * FROM ${tableName} ORDER BY ${orderByField} ${orderDirection}`;
        return await query(sql);
    } catch (error) {
        console.error(`Error fetching all from ${tableName}:`, error);
        throw error;
    }
};

// Get item by ID
export const getById = async (tableName, id) => {
    try {
        const sql = `SELECT * FROM ${tableName} WHERE id = ?`;
        const results = await query(sql, [id]);
        return results.length > 0 ? results[0] : null;
    } catch (error) {
        console.error(`Error fetching ${tableName} by ID:`, error);
        throw error;
    }
};

// Create a new item
export const create = async (tableName, data) => {
    try {
        const fields = Object.keys(data).join(', ');
        const placeholders = Object.keys(data).map(() => '?').join(', ');
        const values = Object.values(data);

        const sql = `INSERT INTO ${tableName} (${fields}) VALUES (${placeholders})`;
        const result = await query(sql, values);

        // Get the newly created item
        return getById(tableName, result.insertId);
    } catch (error) {
        console.error(`Error creating ${tableName}:`, error);
        throw error;
    }
};

// Update an item
export const update = async (tableName, id, data) => {
    try {
        const updates = Object.keys(data).map(field => `${field} = ?`).join(', ');
        const values = [...Object.values(data), id];

        const sql = `UPDATE ${tableName} SET ${updates} WHERE id = ?`;
        await query(sql, values);

        // Get the updated item
        return getById(tableName, id);
    } catch (error) {
        console.error(`Error updating ${tableName}:`, error);
        throw error;
    }
};

// Delete an item
export const remove = async (tableName, id) => {
    try {
        const sql = `DELETE FROM ${tableName} WHERE id = ?`;
        return await query(sql, [id]);
    } catch (error) {
        console.error(`Error deleting from ${tableName}:`, error);
        throw error;
    }
};

// Query with filters
export const findWhere = async (tableName, conditions, orderByField = 'created_at', orderDirection = 'DESC') => {
    try {
        let sql = `SELECT * FROM ${tableName}`;
        const values = [];

        if (Object.keys(conditions).length > 0) {
            const whereConditions = Object.entries(conditions).map(([field, value]) => {
                values.push(value);
                return `${field} = ?`;
            }).join(' AND ');

            sql += ` WHERE ${whereConditions}`;
        }

        sql += ` ORDER BY ${orderByField} ${orderDirection}`;

        return await query(sql, values);
    } catch (error) {
        console.error(`Error querying ${tableName}:`, error);
        throw error;
    }
};

// Get items with pagination
export const getPaginated = async (tableName, page = 1, limit = 10, orderByField = 'created_at', orderDirection = 'DESC') => {
    try {
        const offset = (page - 1) * limit;

        // Get items
        const sql = `SELECT * FROM ${tableName} ORDER BY ${orderByField} ${orderDirection} LIMIT ? OFFSET ?`;
        const items = await query(sql, [limit, offset]);

        // Get total count
        const countSql = `SELECT COUNT(*) as total FROM ${tableName}`;
        const countResult = await query(countSql);
        const total = countResult[0].total;

        return {
            items,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };
    } catch (error) {
        console.error(`Error fetching paginated ${tableName}:`, error);
        throw error;
    }
};

// Specific services for different entities
export const satelliteService = {
    getAll: () => getAll('satellites', 'name', 'ASC'),
    getById: (id) => getById('satellites', id),
    create: (data) => create('satellites', data),
    update: (id, data) => update('satellites', id, data),
    delete: (id) => remove('satellites', id),
    getByStatus: (status) => findWhere('satellites', { status })
};

export const groundStationService = {
    getAll: () => getAll('ground_stations', 'name', 'ASC'),
    getById: (id) => getById('ground_stations', id),
    create: (data) => create('ground_stations', data),
    update: (id, data) => update('ground_stations', id, data),
    delete: (id) => remove('ground_stations', id),
    getByStatus: (status) => findWhere('ground_stations', { status })
};

export const telemetryService = {
    getAll: () => getAll('telemetry', 'timestamp', 'DESC'),
    getById: (id) => getById('telemetry', id),
    create: (data) => create('telemetry', data),
    getBySatelliteId: (satelliteId) => findWhere('telemetry', { satellite_id: satelliteId }, 'timestamp', 'DESC'),
    getLatestForSatellite: async (satelliteId, limit = 10) => {
        try {
            const sql = `
                SELECT * FROM telemetry 
                WHERE satellite_id = ? 
                ORDER BY timestamp DESC 
                LIMIT ?
            `;
            return await query(sql, [satelliteId, limit]);
        } catch (error) {
            console.error('Error fetching latest telemetry:', error);
            throw error;
        }
    }
};

export const commandService = {
    getAll: () => getAll('commands', 'timestamp', 'DESC'),
    getById: (id) => getById('commands', id),
    create: (data) => create('commands', { ...data, status: 'Pending' }),
    update: (id, data) => update('commands', id, data),
    delete: (id) => remove('commands', id),
    getByUserId: (userId) => findWhere('commands', { user_id: userId }, 'timestamp', 'DESC'),
    getBySatelliteId: (satelliteId) => findWhere('commands', { satellite_id: satelliteId }, 'timestamp', 'DESC'),
    getPending: () => findWhere('commands', { status: 'Pending' }, 'timestamp', 'ASC')
};

export const anomalyService = {
    getAll: () => getAll('anomalies', 'timestamp', 'DESC'),
    getById: (id) => getById('anomalies', id),
    create: (data) => create('anomalies', data),
    update: (id, data) => update('anomalies', id, data),
    delete: (id) => remove('anomalies', id),
    getBySatelliteId: (satelliteId) => findWhere('anomalies', { satellite_id: satelliteId }, 'timestamp', 'DESC'),
    getBySeverity: (severity) => findWhere('anomalies', { severity }, 'timestamp', 'DESC'),
    getUnresolved: () => findWhere('anomalies', { status: 'Open' }, 'timestamp', 'DESC')
};

export const missionService = {
    getAll: () => getAll('missions', 'name', 'ASC'),
    getById: (id) => getById('missions', id),
    create: (data) => create('missions', data),
    update: (id, data) => update('missions', id, data),
    delete: (id) => remove('missions', id),
    getByStatus: (status) => findWhere('missions', { status })
};

export const userService = {
    getAll: () => getAll('users', 'name', 'ASC'),
    getById: (id) => getById('users', id),
    getByEmail: async (email) => {
        const results = await findWhere('users', { email });
        return results.length > 0 ? results[0] : null;
    },
    create: (data) => create('users', data),
    update: (id, data) => update('users', id, data),
    delete: (id) => remove('users', id)
}; 