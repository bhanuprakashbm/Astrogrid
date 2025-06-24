import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    TimeScale
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import API from '../services/apiClient';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    TimeScale
);

const SatelliteVisualizations = ({ satelliteId }) => {
    const [telemetryData, setTelemetryData] = useState([]);
    const [positionData, setPositionData] = useState([]);
    const [loading, setLoading] = useState(true);

    // Generate sample data for development and fallback
    const generateSampleData = () => {
        const now = Date.now();
        const hours = 24;
        const data = [];
        
        // Generate data points for the last 24 hours
        for (let i = 0; i < hours; i++) {
            const timestamp = new Date(now - (i * 60 * 60 * 1000));
            
            // Position data with realistic orbital variations
            const baseLatitude = 0;
            const baseLongitude = -75;
            const baseAltitude = 500;
            const orbitalPeriod = 90; // minutes
            const phase = (i * 60) / orbitalPeriod * 2 * Math.PI;
            
            data.push({
                timestamp,
                latitude: baseLatitude + 45 * Math.sin(phase),
                longitude: baseLongitude + 45 * Math.cos(phase),
                altitude: baseAltitude + 10 * Math.sin(phase * 2),
                data_json: JSON.stringify({
                    power: Math.round(85 + Math.sin(phase * 0.5) * 10),
                    temperature: parseFloat((20 + 5 * Math.sin(phase)).toFixed(1)),
                    signal: Math.round(85 + Math.sin(phase) * 10),
                    memory: Math.round(60 + Math.sin(phase * 2) * 15),
                    cpu: Math.round(45 + Math.sin(phase * 3) * 20)
                })
            });
        }
        
        return data.sort((a, b) => a.timestamp - b.timestamp);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (!satelliteId) {
                    const sampleData = generateSampleData();
                    setTelemetryData(sampleData);
                    setPositionData(sampleData);
                    return;
                }

                // Fetch both telemetry and position data in parallel
                const [telemetry, position] = await Promise.all([
                    API.telemetry.getBySatellite(satelliteId),
                    API.satellites.getPositionHistory(satelliteId)
                ]);

                if (!telemetry || telemetry.length === 0) {
                    console.warn('No telemetry data received for satellite:', satelliteId);
                    const sampleData = generateSampleData();
                    setTelemetryData(sampleData);
                    setPositionData(sampleData);
                    return;
                }

                // Parse the telemetry data
                const parsedTelemetry = telemetry.map(item => ({
                    ...item,
                    ...JSON.parse(item.data_json || '{}')
                }));

                setTelemetryData(parsedTelemetry);
                setPositionData(position || parsedTelemetry);
            } catch (error) {
                console.error('Error fetching visualization data:', error);
                // Fall back to sample data on error
                const sampleData = generateSampleData();
                setTelemetryData(sampleData);
                setPositionData(sampleData);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        // Refresh data every 30 seconds instead of every minute for more responsive updates
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, [satelliteId]);

    // Position data chart configuration
    const positionChartConfig = {
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'nearest',
                intersect: false,
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Satellite Position',
                    color: '#e2e8f0',
                    font: {
                        size: 16,
                        weight: 'bold'
                    },
                    padding: {
                        top: 10,
                        bottom: 20
                    }
                },
                legend: {
                    labels: {
                        color: '#e2e8f0',
                        font: {
                            size: 12
                        },
                        usePointStyle: true,
                        padding: 15
                    },
                    position: 'top',
                    align: 'center'
                },
                tooltip: {
                    backgroundColor: 'rgba(17, 24, 39, 0.9)',
                    titleColor: '#e2e8f0',
                    bodyColor: '#e2e8f0',
                    borderColor: 'rgba(107, 114, 128, 0.2)',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: true,
                    titleFont: {
                        size: 13,
                        weight: 'bold'
                    },
                    bodyFont: {
                        size: 12
                    },
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += context.parsed.y.toFixed(2);
                                if (label.includes('Altitude')) {
                                    label += ' km';
                                } else {
                                    label += '°';
                                }
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'hour',
                        displayFormats: {
                            hour: 'HH:mm',
                            day: 'MMM d'
                        }
                    },
                    grid: {
                        color: 'rgba(107, 114, 128, 0.1)',
                        drawBorder: true,
                        drawOnChartArea: true,
                        drawTicks: true
                    },
                    ticks: {
                        color: '#e2e8f0',
                        maxRotation: 45,
                        minRotation: 45,
                        padding: 8,
                        font: {
                            size: 11
                        }
                    },
                    border: {
                        display: true,
                        color: 'rgba(107, 114, 128, 0.3)'
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(107, 114, 128, 0.1)',
                        drawBorder: true,
                        drawOnChartArea: true,
                        drawTicks: true
                    },
                    ticks: {
                        color: '#e2e8f0',
                        padding: 8,
                        font: {
                            size: 11
                        }
                    },
                    border: {
                        display: true,
                        color: 'rgba(107, 114, 128, 0.3)'
                    }
                }
            }
        },
        data: {
            labels: positionData.map(d => d.timestamp),
            datasets: [
                {
                    label: 'Latitude',
                    data: positionData.map(d => d.latitude),
                    borderColor: 'rgba(59, 130, 246, 0.8)',
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    borderWidth: 2,
                    pointRadius: 0,
                    pointHoverRadius: 4,
                    tension: 0.4
                },
                {
                    label: 'Longitude',
                    data: positionData.map(d => d.longitude),
                    borderColor: 'rgba(139, 92, 246, 0.8)',
                    backgroundColor: 'rgba(139, 92, 246, 0.2)',
                    borderWidth: 2,
                    pointRadius: 0,
                    pointHoverRadius: 4,
                    tension: 0.4
                },
                {
                    label: 'Altitude',
                    data: positionData.map(d => d.altitude),
                    borderColor: 'rgba(34, 197, 94, 0.8)',
                    backgroundColor: 'rgba(34, 197, 94, 0.2)',
                    borderWidth: 2,
                    pointRadius: 0,
                    pointHoverRadius: 4,
                    tension: 0.4
                }
            ]
        }
    };

    // Telemetry data chart configuration
    const telemetryChartConfig = {
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'nearest',
                intersect: false,
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Telemetry Data',
                    color: '#e2e8f0',
                    font: {
                        size: 16,
                        weight: 'bold'
                    },
                    padding: {
                        top: 10,
                        bottom: 20
                    }
                },
                legend: {
                    labels: {
                        color: '#e2e8f0',
                        font: {
                            size: 12
                        },
                        usePointStyle: true,
                        padding: 15
                    },
                    position: 'top',
                    align: 'center'
                },
                tooltip: {
                    backgroundColor: 'rgba(17, 24, 39, 0.9)',
                    titleColor: '#e2e8f0',
                    bodyColor: '#e2e8f0',
                    borderColor: 'rgba(107, 114, 128, 0.2)',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: true,
                    titleFont: {
                        size: 13,
                        weight: 'bold'
                    },
                    bodyFont: {
                        size: 12
                    }
                }
            },
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'hour',
                        displayFormats: {
                            hour: 'HH:mm',
                            day: 'MMM d'
                        }
                    },
                    grid: {
                        color: 'rgba(107, 114, 128, 0.1)',
                        drawBorder: true,
                        drawOnChartArea: true,
                        drawTicks: true
                    },
                    ticks: {
                        color: '#e2e8f0',
                        maxRotation: 45,
                        minRotation: 45,
                        padding: 8,
                        font: {
                            size: 11
                        }
                    },
                    border: {
                        display: true,
                        color: 'rgba(107, 114, 128, 0.3)'
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(107, 114, 128, 0.1)',
                        drawBorder: true,
                        drawOnChartArea: true,
                        drawTicks: true
                    },
                    ticks: {
                        color: '#e2e8f0',
                        padding: 8,
                        font: {
                            size: 11
                        }
                    },
                    border: {
                        display: true,
                        color: 'rgba(107, 114, 128, 0.3)'
                    }
                }
            }
        },
        data: {
            labels: telemetryData.map(d => new Date(d.timestamp)),
            datasets: [
                {
                    label: 'Power Level (%)',
                    data: telemetryData.map(d => {
                        const data = typeof d.data_json === 'string' ? JSON.parse(d.data_json) : d.data_json;
                        return data.power;
                    }),
                    borderColor: 'rgba(234, 179, 8, 0.8)',
                    backgroundColor: 'rgba(234, 179, 8, 0.2)',
                    borderWidth: 2,
                    pointRadius: 0,
                    pointHoverRadius: 4,
                    tension: 0.4,
                    fill: false
                },
                {
                    label: 'Temperature (°C)',
                    data: telemetryData.map(d => {
                        const data = typeof d.data_json === 'string' ? JSON.parse(d.data_json) : d.data_json;
                        return data.temperature;
                    }),
                    borderColor: 'rgba(239, 68, 68, 0.8)',
                    backgroundColor: 'rgba(239, 68, 68, 0.2)',
                    borderWidth: 2,
                    pointRadius: 0,
                    pointHoverRadius: 4,
                    tension: 0.4,
                    fill: false
                },
                {
                    label: 'Signal Strength (%)',
                    data: telemetryData.map(d => {
                        const data = typeof d.data_json === 'string' ? JSON.parse(d.data_json) : d.data_json;
                        return data.signal;
                    }),
                    borderColor: 'rgba(59, 130, 246, 0.8)',
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    borderWidth: 2,
                    pointRadius: 0,
                    pointHoverRadius: 4,
                    tension: 0.4,
                    fill: false
                }
            ]
        }
    };

    // Remove loading spinner and show empty state with sample data
    if (loading) {
        const sampleData = generateSampleData();
        setTelemetryData(sampleData);
        setPositionData(sampleData);
        setLoading(false);
    }

    return (
        <div className="space-y-8">
            {/* Position Visualization */}
            <div className="h-[300px] bg-gray-800/50 rounded-lg p-4 relative z-0">
                <Line {...positionChartConfig} />
            </div>

            {/* Telemetry Visualization */}
            <div className="h-[300px] bg-gray-800/50 rounded-lg p-4 relative z-0">
                <Line {...telemetryChartConfig} />
            </div>
        </div>
    );
};

export default SatelliteVisualizations; 