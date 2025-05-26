// API Client for communication between frontend and backend
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

/**
 * Base fetch function with error handling
 */
const fetchAPI = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}/${endpoint}`;

    // Default headers
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    try {
        const response = await fetch(url, {
            ...options,
            headers
        });

        // Check if response is OK
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const error = new Error(errorData.message || `API request failed with status ${response.status}`);
            error.status = response.status;
            error.data = errorData;
            throw error;
        }

        // Return JSON response or empty object if no content
        return response.status !== 204 ? await response.json() : {};
    } catch (error) {
        console.error(`API Error (${endpoint}):`, error);
        throw error;
    }
};

/**
 * API endpoints for different entities
 */
export const API = {
    // Auth endpoints
    auth: {
        login: (credentials) => fetchAPI('auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        }),
        register: (userData) => fetchAPI('auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        })
    },

    // Satellites
    satellites: {
        getAll: () => fetchAPI('satellites'),
        getById: (id) => fetchAPI(`satellites/${id}`),
        create: (data) => fetchAPI('satellites', {
            method: 'POST',
            body: JSON.stringify(data)
        }),
        update: (id, data) => fetchAPI(`satellites/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        }),
        delete: (id) => fetchAPI(`satellites/${id}`, {
            method: 'DELETE'
        })
    },

    // Ground stations
    groundStations: {
        getAll: () => fetchAPI('ground-stations'),
        getById: (id) => fetchAPI(`ground-stations/${id}`),
        create: (data) => fetchAPI('ground-stations', {
            method: 'POST',
            body: JSON.stringify(data)
        }),
        update: (id, data) => fetchAPI(`ground-stations/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        }),
        delete: (id) => fetchAPI(`ground-stations/${id}`, {
            method: 'DELETE'
        })
    },

    // Telemetry
    telemetry: {
        getAll: () => fetchAPI('telemetry'),
        getBySatellite: (satelliteId) => fetchAPI(`telemetry?satellite_id=${satelliteId}`),
        getLatest: (satelliteId, limit = 10) => fetchAPI(`telemetry?satellite_id=${satelliteId}&limit=${limit}&order=desc`)
    },

    // Commands
    commands: {
        getAll: () => fetchAPI('commands'),
        getById: (id) => fetchAPI(`commands/${id}`),
        create: (data) => fetchAPI('commands', {
            method: 'POST',
            body: JSON.stringify(data)
        }),
        update: (id, data) => fetchAPI(`commands/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        }),
        getBySatellite: (satelliteId) => fetchAPI(`commands?satellite_id=${satelliteId}`)
    },

    // Anomalies
    anomalies: {
        getAll: () => fetchAPI('anomalies'),
        getById: (id) => fetchAPI(`anomalies/${id}`),
        create: (data) => fetchAPI('anomalies', {
            method: 'POST',
            body: JSON.stringify(data)
        }),
        update: (id, data) => fetchAPI(`anomalies/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        }),
        getBySatellite: (satelliteId) => fetchAPI(`anomalies?satellite_id=${satelliteId}`)
    },

    // Users
    users: {
        getAll: () => fetchAPI('users'),
        getById: (id) => fetchAPI(`users/${id}`),
        create: (data) => fetchAPI('users', {
            method: 'POST',
            body: JSON.stringify(data)
        }),
        update: (id, data) => fetchAPI(`users/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        }),
        delete: (id) => fetchAPI(`users/${id}`, {
            method: 'DELETE'
        })
    },

    // Missions
    missions: {
        getAll: () => fetchAPI('missions'),
        getById: (id) => fetchAPI(`missions/${id}`),
        create: (data) => fetchAPI('missions', {
            method: 'POST',
            body: JSON.stringify(data)
        }),
        update: (id, data) => fetchAPI(`missions/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        }),
        delete: (id) => fetchAPI(`missions/${id}`, {
            method: 'DELETE'
        })
    }
};

export default API; 