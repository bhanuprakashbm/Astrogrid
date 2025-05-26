// Database adapter to provide Firebase-like functionality for components
// This will help with migrating from Firebase to MySQL without rewriting all components

import * as dbServices from './database';

// Collection functions
export const getCollection = async (collectionName, orderByField = 'created_at', orderDirection = 'DESC') => {
    try {
        // Map collection names to our services
        switch (collectionName) {
            case 'satellites':
                return await dbServices.satelliteService.getAll();
            case 'ground_stations':
                return await dbServices.groundStationService.getAll();
            case 'users':
                return await dbServices.userService.getAll();
            case 'telemetry':
                return await dbServices.telemetryService.getAll();
            case 'commands':
                return await dbServices.commandService.getAll();
            case 'anomalies':
                return await dbServices.anomalyService.getAll();
            case 'missions':
                return await dbServices.missionService.getAll();
            default:
                console.warn(`Unknown collection: ${collectionName}`);
                return [];
        }
    } catch (error) {
        console.error(`Error fetching collection ${collectionName}:`, error);
        throw error;
    }
};

// Document functions
export const getDocument = async (collectionName, docId) => {
    try {
        // Map collection names to our services
        switch (collectionName) {
            case 'satellites':
                return await dbServices.satelliteService.getById(docId);
            case 'ground_stations':
                return await dbServices.groundStationService.getById(docId);
            case 'users':
                return await dbServices.userService.getById(docId);
            case 'telemetry':
                return await dbServices.telemetryService.getById(docId);
            case 'commands':
                return await dbServices.commandService.getById(docId);
            case 'anomalies':
                return await dbServices.anomalyService.getById(docId);
            case 'missions':
                return await dbServices.missionService.getById(docId);
            default:
                console.warn(`Unknown collection: ${collectionName}`);
                return null;
        }
    } catch (error) {
        console.error(`Error fetching document ${collectionName}/${docId}:`, error);
        throw error;
    }
};

// Create document
export const createDocument = async (collectionName, data) => {
    try {
        // Map collection names to our services
        switch (collectionName) {
            case 'satellites':
                return await dbServices.satelliteService.create(data);
            case 'ground_stations':
                return await dbServices.groundStationService.create(data);
            case 'users':
                return await dbServices.userService.create(data);
            case 'telemetry':
                return await dbServices.telemetryService.create(data);
            case 'commands':
                return await dbServices.commandService.create(data);
            case 'anomalies':
                return await dbServices.anomalyService.create(data);
            case 'missions':
                return await dbServices.missionService.create(data);
            default:
                console.warn(`Unknown collection: ${collectionName}`);
                return null;
        }
    } catch (error) {
        console.error(`Error creating document in ${collectionName}:`, error);
        throw error;
    }
};

// Update document
export const updateDocument = async (collectionName, docId, data) => {
    try {
        // Map collection names to our services
        switch (collectionName) {
            case 'satellites':
                return await dbServices.satelliteService.update(docId, data);
            case 'ground_stations':
                return await dbServices.groundStationService.update(docId, data);
            case 'users':
                return await dbServices.userService.update(docId, data);
            case 'commands':
                return await dbServices.commandService.update(docId, data);
            case 'anomalies':
                return await dbServices.anomalyService.update(docId, data);
            case 'missions':
                return await dbServices.missionService.update(docId, data);
            default:
                console.warn(`Unknown collection: ${collectionName}`);
                return null;
        }
    } catch (error) {
        console.error(`Error updating document ${collectionName}/${docId}:`, error);
        throw error;
    }
};

// Delete document
export const deleteDocument = async (collectionName, docId) => {
    try {
        // Map collection names to our services
        switch (collectionName) {
            case 'satellites':
                return await dbServices.satelliteService.delete(docId);
            case 'ground_stations':
                return await dbServices.groundStationService.delete(docId);
            case 'users':
                return await dbServices.userService.delete(docId);
            case 'commands':
                return await dbServices.commandService.delete(docId);
            case 'anomalies':
                return await dbServices.anomalyService.delete(docId);
            case 'missions':
                return await dbServices.missionService.delete(docId);
            default:
                console.warn(`Unknown collection: ${collectionName}`);
                return null;
        }
    } catch (error) {
        console.error(`Error deleting document ${collectionName}/${docId}:`, error);
        throw error;
    }
};

// Query with filters
export const queryCollection = async (collectionName, filters = {}, orderByField = 'created_at', orderDirection = 'DESC') => {
    try {
        // Map collection names to our services and apply filters
        let results = [];

        switch (collectionName) {
            case 'satellites':
                if (filters.status) {
                    results = await dbServices.satelliteService.getByStatus(filters.status);
                } else {
                    results = await dbServices.satelliteService.getAll();
                }
                break;

            case 'ground_stations':
                if (filters.status) {
                    results = await dbServices.groundStationService.getByStatus(filters.status);
                } else {
                    results = await dbServices.groundStationService.getAll();
                }
                break;

            case 'telemetry':
                if (filters.satellite_id) {
                    results = await dbServices.telemetryService.getBySatelliteId(filters.satellite_id);
                } else {
                    results = await dbServices.telemetryService.getAll();
                }
                break;

            case 'commands':
                if (filters.satellite_id) {
                    results = await dbServices.commandService.getBySatelliteId(filters.satellite_id);
                } else if (filters.user_id) {
                    results = await dbServices.commandService.getByUserId(filters.user_id);
                } else if (filters.status === 'Pending') {
                    results = await dbServices.commandService.getPending();
                } else {
                    results = await dbServices.commandService.getAll();
                }
                break;

            case 'anomalies':
                if (filters.satellite_id) {
                    results = await dbServices.anomalyService.getBySatelliteId(filters.satellite_id);
                } else if (filters.severity) {
                    results = await dbServices.anomalyService.getBySeverity(filters.severity);
                } else if (filters.status === 'Open') {
                    results = await dbServices.anomalyService.getUnresolved();
                } else {
                    results = await dbServices.anomalyService.getAll();
                }
                break;

            case 'users':
                if (filters.email) {
                    const user = await dbServices.userService.getByEmail(filters.email);
                    results = user ? [user] : [];
                } else {
                    results = await dbServices.userService.getAll();
                }
                break;

            case 'missions':
                if (filters.status) {
                    results = await dbServices.missionService.getByStatus(filters.status);
                } else {
                    results = await dbServices.missionService.getAll();
                }
                break;

            default:
                console.warn(`Unknown collection: ${collectionName}`);
                results = [];
        }

        return results;
    } catch (error) {
        console.error(`Error querying collection ${collectionName}:`, error);
        throw error;
    }
};

// Get current timestamp
export const getCurrentTimestamp = () => {
    return new Date().toISOString();
}; 