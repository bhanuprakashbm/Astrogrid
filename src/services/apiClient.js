// API Client for communication between frontend and backend
import axios from 'axios';

// Function to check if a port is available
const checkPort = async (port) => {
    try {
        const response = await fetch(`http://localhost:${port}/api/status`);
        return response.ok;
    } catch (error) {
        return false;
    }
};

// Function to find the active API port
const findActivePort = async (startPort = 3001, maxAttempts = 5) => {
    for (let port = startPort; port < startPort + maxAttempts; port++) {
        if (await checkPort(port)) {
            return port;
        }
    }
    return startPort; // Default to start port if no active port found
};

// Initialize API client with dynamic port
const initializeApiClient = async () => {
    const port = await findActivePort();
    const baseURL = `http://localhost:${port}/api`;

const apiClient = axios.create({
        baseURL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add request interceptor for logging
apiClient.interceptors.request.use(
    (config) => {
        console.log('API Request:', config.method.toUpperCase(), config.url);
        return config;
    },
    (error) => {
        console.error('API Request Error:', error);
        return Promise.reject(error);
    }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => {
        console.log('API Response:', response.status, response.data);
        return response;
    },
    (error) => {
        console.error('API Response Error:', error.response || error);
        return Promise.reject(error);
    }
);

    return apiClient;
};

// Create API instance
let apiClientInstance = null;
const getApiClient = async () => {
    if (!apiClientInstance) {
        apiClientInstance = await initializeApiClient();
    }
    return apiClientInstance;
};

// Sample data generator for development
const generateSampleTelemetryData = (satelliteId) => {
    const now = new Date();
    const data = [];
    
    // Get orbit characteristics based on satellite ID
    const getOrbitParams = (id) => {
        console.log('Getting orbit params for satellite ID:', id);
        const numId = parseInt(id, 10);
        switch(numId) {
            case 1: // AstroSat-1 (LEO)
                return {
                    baseAltitude: 650,
                    altitudeVar: 10,
                    baseVelocity: 7.5,
                    velocityVar: 0.2,
                    baseTemp: 23.5,
                    tempVar: 5,
                    baseLat: 35,
                    baseLong: -100
                };
            case 2: // Resourcesat-2A (LEO)
                return {
                    baseAltitude: 817,
                    altitudeVar: 15,
                    baseVelocity: 7.2,
                    velocityVar: 0.3,
                    baseTemp: 22.8,
                    tempVar: 4,
                    baseLat: 40,
                    baseLong: -90
                };
            case 3: // GSAT-19 (GEO)
                return {
                    baseAltitude: 35786,
                    altitudeVar: 5,
                    baseVelocity: 3.1,
                    velocityVar: 0.1,
                    baseTemp: 24.1,
                    tempVar: 6,
                    baseLat: 0,
                    baseLong: 83
                };
            default: // Default LEO parameters
                console.log('Using default orbit params for unknown satellite ID:', id);
                return {
                    baseAltitude: 550,
                    altitudeVar: 10,
                    baseVelocity: 7.8,
                    velocityVar: 0.2,
                    baseTemp: 20,
                    tempVar: 5,
                    baseLat: 30,
                    baseLong: -95
                };
        }
    };

    const params = getOrbitParams(satelliteId);
    console.log('Using orbit parameters:', params);
    
    for (let i = 0; i < 24; i++) {
        const timestamp = new Date(now.getTime() - (i * 3600000)); // 1 hour intervals
        const phase = (i / 24) * 2 * Math.PI;
        
        // Calculate dynamic values with realistic variations
        const altitude = params.baseAltitude + Math.sin(phase) * params.altitudeVar;
        const velocity = params.baseVelocity + Math.sin(phase * 2) * params.velocityVar;
        const temperature = params.baseTemp + Math.sin(phase * 1.5) * params.tempVar;
        const batteryLevel = 85 + Math.sin(phase * 0.5) * 10; // Battery varies between 75-95%
        
        // Calculate position based on orbit
        const latitude = params.baseLat + Math.sin(phase) * 15;
        const longitude = params.baseLong + Math.cos(phase) * 30;

        data.push({
            id: `telemetry-${satelliteId}-${i}`,
            satellite_id: parseInt(satelliteId, 10),
            timestamp: timestamp.toISOString(),
            data_json: JSON.stringify({
                latitude: parseFloat(latitude.toFixed(6)),
                longitude: parseFloat(longitude.toFixed(6)),
                altitude: parseFloat(altitude.toFixed(2)),
                velocity: parseFloat(velocity.toFixed(2)),
                temperature: parseFloat(temperature.toFixed(1)),
                power: parseFloat(batteryLevel.toFixed(1)),
                signal: parseFloat((85 + Math.sin(phase) * 10).toFixed(1)),
                memory: parseFloat((60 + Math.sin(phase * 2) * 15).toFixed(1)),
                cpu: parseFloat((45 + Math.sin(phase * 3) * 20).toFixed(1))
            })
        });
    }
    
    return data.reverse();
};

/**
 * API endpoints for different entities
 */
const API = {
    // Initialize the API client
    initialize: async () => {
        await getApiClient();
    },

    // Auth endpoints
    auth: {
        login: async (credentials) => {
            const client = await getApiClient();
            return client.post('/auth/login', credentials);
        },
        register: async (userData) => {
            const client = await getApiClient();
            return client.post('/auth/register', userData);
        }
    },

    // Satellites
    satellites: {
        getAll: async () => {
            try {
                console.log('Fetching satellites from API...');
                const client = await getApiClient();
                console.log('API client initialized, making request...');
                const response = await client.get('/satellites');
                console.log('Satellites API response:', response);
                console.log('Satellites data:', response.data);
                return response.data;
            } catch (error) {
                console.error('Error fetching satellites:', error);
                console.error('Error details:', error.response || error);
                throw new Error('Failed to fetch satellites. Please try again later.');
            }
        },
        getById: async (id) => {
            try {
                const client = await getApiClient();
                const response = await client.get(`/satellites/${id}`);
                if (!response.data) {
                    throw new Error('Satellite not found');
                }
                return response.data;
            } catch (error) {
                console.error(`Error fetching satellite ${id}:`, error);
                if (error.response?.status === 404) {
                    throw new Error('Satellite not found');
                }
                throw new Error('Failed to fetch satellite details. Please try again later.');
            }
        },
        create: async (data) => {
            try {
                const client = await getApiClient();
                const response = await client.post('/satellites', data);
                return response.data;
            } catch (error) {
                console.error('Error creating satellite:', error);
                throw new Error('Failed to create satellite. Please try again later.');
            }
        },
        update: async (id, data) => {
            try {
                const client = await getApiClient();
                const response = await client.put(`/satellites/${id}`, data);
                return response.data;
            } catch (error) {
                console.error(`Error updating satellite ${id}:`, error);
                throw new Error('Failed to update satellite. Please try again later.');
            }
        },
        delete: async (id) => {
            try {
                const client = await getApiClient();
                const response = await client.delete(`/satellites/${id}`);
                return response.data;
            } catch (error) {
                console.error(`Error deleting satellite ${id}:`, error);
                throw new Error('Failed to delete satellite. Please try again later.');
            }
        }
    },

    // Ground stations
    groundStations: {
        getAll: async () => {
            try {
                const client = await getApiClient();
                const response = await client.get('/ground-stations');
                if (!Array.isArray(response.data)) {
                    // If we're in development mode, return mock data
                    return [
                        {
                            id: 1,
                            name: 'Bangalore Station',
                            location: 'Bangalore, India',
                            latitude: 12.9716,
                            longitude: 77.5946,
                            elevation: 920,
                            status: 'Operational',
                            description: 'Primary ground station for LEO satellite tracking'
                        },
                        {
                            id: 2,
                            name: 'Chennai Station',
                            location: 'Chennai, India',
                            latitude: 13.0827,
                            longitude: 80.2707,
                            elevation: 6.7,
                            status: 'Operational',
                            description: 'Secondary ground station for weather satellites'
                        },
                        {
                            id: 3,
                            name: 'Lucknow Station',
                            location: 'Lucknow, India',
                            latitude: 26.8467,
                            longitude: 80.9462,
                            elevation: 123,
                            status: 'Maintenance',
                            description: 'Tertiary ground station for backup operations'
                        }
                    ];
                }
                return response.data;
            } catch (error) {
                console.error('Error fetching ground stations:', error);
                throw new Error('Failed to fetch ground stations. Please try again later.');
            }
        },
        getById: async (id) => {
            try {
                const client = await getApiClient();
                const response = await client.get(`/ground-stations/${id}`);
                return response.data;
            } catch (error) {
                console.error(`Error fetching ground station ${id}:`, error);
                throw new Error('Failed to fetch ground station details. Please try again later.');
            }
        },
        create: async (data) => {
            try {
                // Validate required fields
                if (!data.name || !data.location || 
                    typeof data.latitude !== 'number' || typeof data.longitude !== 'number') {
                    throw new Error('Missing required fields');
                }

                // Format data for API
                const formattedData = {
                    name: data.name,
                    location: data.location,
                    latitude: data.latitude,
                    longitude: data.longitude,
                    elevation: data.elevation || null,
                    status: data.status || 'Operational',
                    description: data.description || null
                };

                const client = await getApiClient();
                const response = await client.post('/ground-stations', formattedData);
                return response.data;
            } catch (error) {
                console.error('Error creating ground station:', error);
                if (error.response?.data?.details) {
                    throw new Error(`Failed to create ground station: ${error.response.data.details}`);
                }
                throw new Error(error.message || 'Failed to create ground station. Please try again later.');
            }
        },
        update: async (id, data) => {
            try {
                const client = await getApiClient();
                const response = await client.put(`/ground-stations/${id}`, data);
                return response.data;
            } catch (error) {
                console.error(`Error updating ground station ${id}:`, error);
                throw new Error('Failed to update ground station. Please try again later.');
            }
        },
        delete: async (id) => {
            try {
                const client = await getApiClient();
                const response = await client.delete(`/ground-stations/${id}`);
                return response.data;
            } catch (error) {
                console.error(`Error deleting ground station ${id}:`, error);
                throw new Error('Failed to delete ground station. Please try again later.');
            }
        }
    },

    // Telemetry
    telemetry: {
        getAll: async () => {
            try {
                const client = await getApiClient();
                const response = await client.get('/telemetry');
                return Array.isArray(response.data) ? response.data : [];
            } catch (error) {
                console.error('Error fetching telemetry:', error);
                return [];
            }
        },
        getBySatellite: async (satelliteId) => {
            try {
                // For development, always use sample data
                const parsedId = parseInt(satelliteId, 10);
                console.log('Generating sample telemetry data for satellite:', parsedId);
                const sampleData = generateSampleTelemetryData(parsedId);
                console.log('Sample data first point:', sampleData[0]);
                return Array.isArray(sampleData) ? sampleData : [];
            } catch (error) {
                console.error('Error generating telemetry data:', error);
                return [];
            }
        },
        getLatest: async (satelliteId, limit = 50) => {
            try {
                const data = await API.telemetry.getBySatellite(satelliteId);
                // Ensure we have an array and it's properly sorted by timestamp
                const dataArray = Array.isArray(data) ? data : data ? [data] : [];
                return dataArray.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, limit);
            } catch (error) {
                console.error('Error fetching latest telemetry:', error);
                return [];
            }
        },
        getBySatelliteId: async (satelliteId) => {
            try {
                // For development, return sample data
                const data = generateSampleTelemetryData(satelliteId);
                return Array.isArray(data) ? data : [];
                
                // For production:
                // const response = await axios.get(`${API_BASE_URL}/telemetry/${satelliteId}`);
                // return Array.isArray(response.data) ? response.data : [];
            } catch (error) {
                console.error('Error fetching telemetry data:', error);
                return [];
            }
        }
    },

    // Commands
    commands: {
        getAll: async () => {
            try {
                const client = await getApiClient();
                const response = await client.get('/commands');
                return response.data || [];
            } catch (error) {
                console.error('Error fetching commands:', error);
                throw new Error('Failed to fetch commands. Please try again later.');
            }
        },
        getById: async (id) => {
            try {
                const client = await getApiClient();
                const response = await client.get(`/commands/${id}`);
                return response.data;
            } catch (error) {
                console.error('Error fetching command:', error);
                throw new Error('Failed to fetch command details. Please try again later.');
            }
        },
        create: async (data) => {
            try {
                const client = await getApiClient();
                const response = await client.post('/commands', data);
                return response.data;
            } catch (error) {
                console.error('Error creating command:', error);
                throw new Error('Failed to create command. Please try again later.');
            }
        },
        update: async (id, data) => {
            try {
                const client = await getApiClient();
                const response = await client.put(`/commands/${id}`, data);
                return response.data;
            } catch (error) {
                console.error('Error updating command:', error);
                throw new Error('Failed to update command. Please try again later.');
            }
        },
        getPending: async () => {
            try {
                const client = await getApiClient();
                const response = await client.get('/commands?status=Pending');
                return response.data || [];
            } catch (error) {
                console.error('Error fetching pending commands:', error);
                throw new Error('Failed to fetch pending commands. Please try again later.');
            }
        },
        getBySatellite: async (satelliteId) => {
            try {
                const client = await getApiClient();
                const response = await client.get(`/commands?satellite_id=${satelliteId}`);
                return response.data || [];
            } catch (error) {
                console.error('Error fetching satellite commands:', error);
                throw new Error('Failed to fetch satellite commands. Please try again later.');
            }
        }
    },

    // Anomalies
    anomalies: {
        getAll: async () => {
            try {
                const client = await getApiClient();
                const response = await client.get('/anomalies');
                return response.data || [];
            } catch (error) {
                console.error('Error fetching anomalies:', error);
                throw new Error('Failed to fetch anomalies. Please try again later.');
            }
        },
        getById: async (id) => {
            try {
                const client = await getApiClient();
                const response = await client.get(`/anomalies/${id}`);
                return response.data;
            } catch (error) {
                console.error('Error fetching anomaly:', error);
                throw new Error('Failed to fetch anomaly details. Please try again later.');
            }
        },
        create: async (data) => {
            try {
                const client = await getApiClient();
                const response = await client.post('/anomalies', data);
                return response.data;
            } catch (error) {
                console.error('Error creating anomaly:', error);
                throw new Error('Failed to create anomaly. Please try again later.');
            }
        },
        update: async (id, data) => {
            try {
                const client = await getApiClient();
                const response = await client.put(`/anomalies/${id}`, data);
                return response.data;
            } catch (error) {
                console.error('Error updating anomaly:', error);
                throw new Error('Failed to update anomaly. Please try again later.');
            }
        },
        getActive: async () => {
            try {
                const client = await getApiClient();
                const response = await client.get('/anomalies?status=Open,Investigating');
                return response.data || [];
            } catch (error) {
                console.error('Error fetching active anomalies:', error);
                throw new Error('Failed to fetch active anomalies. Please try again later.');
            }
        },
        getBySatellite: async (satelliteId) => {
            try {
                const client = await getApiClient();
                const response = await client.get(`/anomalies?satellite_id=${satelliteId}`);
                return response.data || [];
            } catch (error) {
                console.error('Error fetching satellite anomalies:', error);
                throw new Error('Failed to fetch satellite anomalies. Please try again later.');
            }
        }
    },

    // Users
    users: {
        getAll: () => {
            const client = getApiClient();
            return client.get('/users');
        },
        getById: (id) => {
            const client = getApiClient();
            return client.get(`/users/${id}`);
        },
        create: (data) => {
            const client = getApiClient();
            return client.post('/users', data);
        },
        update: (id, data) => {
            const client = getApiClient();
            return client.put(`/users/${id}`, data);
        },
        delete: (id) => {
            const client = getApiClient();
            return client.delete(`/users/${id}`);
        }
    },

    // Missions
    missions: {
        getAll: async () => {
            try {
                const client = await getApiClient();
                const response = await client.get('/missions');
                return response.data;
            } catch (error) {
                console.error('Error fetching missions:', error);
                throw new Error('Failed to fetch missions. Please try again later.');
            }
        },
        getById: async (id) => {
            try {
                const client = await getApiClient();
                const response = await client.get(`/missions/${id}`);
                if (!response.data) {
                    throw new Error('Mission not found');
                }
                return response.data;
            } catch (error) {
                console.error(`Error fetching mission ${id}:`, error);
                if (error.response?.status === 404) {
                    throw new Error('Mission not found');
                }
                throw new Error('Failed to fetch mission details. Please try again later.');
            }
        },
        getSatellites: async (id) => {
            try {
                // Query the mission_satellites table to get connected satellites
                const client = await getApiClient();
                const response = await client.get(`/missions/${id}/satellites`);
                return response.data;
            } catch (error) {
                console.error(`Error fetching satellites for mission ${id}:`, error);
                return []; // Return empty array on error to prevent UI from breaking
            }
        },
        getGroundStations: async (id) => {
            try {
                // Query the mission_ground_stations table to get connected ground stations
                const client = await getApiClient();
                const response = await client.get(`/missions/${id}/ground-stations`);
                return response.data;
            } catch (error) {
                console.error(`Error fetching ground stations for mission ${id}:`, error);
                return []; // Return empty array on error to prevent UI from breaking
            }
        },
        addSatellite: async (missionId, satelliteId) => {
            try {
                const client = await getApiClient();
                const response = await client.post(`/missions/${missionId}/satellites`, { satellite_id: satelliteId });
                return response.data;
            } catch (error) {
                console.error(`Error adding satellite ${satelliteId} to mission ${missionId}:`, error);
                throw new Error('Failed to add satellite to mission. Please try again later.');
            }
        },
        removeSatellite: async (missionId, satelliteId) => {
            try {
                const client = await getApiClient();
                const response = await client.delete(`/missions/${missionId}/satellites/${satelliteId}`);
                return response.data;
            } catch (error) {
                console.error(`Error removing satellite ${satelliteId} from mission ${missionId}:`, error);
                throw new Error('Failed to remove satellite from mission. Please try again later.');
            }
        },
        addGroundStation: async (missionId, stationId) => {
            try {
                const client = await getApiClient();
                const response = await client.post(`/missions/${missionId}/ground-stations`, { ground_station_id: stationId });
                return response.data;
            } catch (error) {
                console.error(`Error adding ground station ${stationId} to mission ${missionId}:`, error);
                throw new Error('Failed to add ground station to mission. Please try again later.');
            }
        },
        removeGroundStation: async (missionId, stationId) => {
            try {
                const client = await getApiClient();
                const response = await client.delete(`/missions/${missionId}/ground-stations/${stationId}`);
                return response.data;
            } catch (error) {
                console.error(`Error removing ground station ${stationId} from mission ${missionId}:`, error);
                throw new Error('Failed to remove ground station from mission. Please try again later.');
            }
        },
        create: async (data) => {
            try {
                const client = await getApiClient();
                const response = await client.post('/missions', data);
                return response.data;
            } catch (error) {
                console.error('Error creating mission:', error);
                throw new Error('Failed to create mission. Please try again later.');
            }
        },
        update: async (id, data) => {
            try {
                const client = await getApiClient();
                const response = await client.put(`/missions/${id}`, data);
                return response.data;
            } catch (error) {
                console.error(`Error updating mission ${id}:`, error);
                throw new Error('Failed to update mission. Please try again later.');
            }
        },
        delete: async (id) => {
            try {
                const client = await getApiClient();
                const response = await client.delete(`/missions/${id}`);
                return response.data;
            } catch (error) {
                console.error(`Error deleting mission ${id}:`, error);
                throw new Error('Failed to delete mission. Please try again later.');
            }
        }
    },

    checkDatabaseConnection: async () => {
        try {
            // For development, simulate a successful connection
            return { status: 'connected' };
            
            // For production:
            // const response = await axios.get(`${API_BASE_URL}/health`);
            // return { status: 'connected', ...response.data };
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Database connection failed');
        }
    }
};

// Initialize the API client when the module is imported
API.initialize().catch(console.error);

export default API; 