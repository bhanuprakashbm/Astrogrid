import React, { useEffect, useState } from 'react';
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
  Filler,
  TimeScale
} from 'chart.js';
import API from '../../services/apiClient';
import 'chartjs-adapter-date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TimeScale
);

const TelemetryData = () => {
    const [telemetryData, setTelemetryData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [satellites, setSatellites] = useState([]);
    const [selectedSatellite, setSelectedSatellite] = useState(null);
    const [selectedTimeRange, setSelectedTimeRange] = useState('6h');
    const [selectedMetric, setSelectedMetric] = useState('altitude');

    const metrics = [
        { value: 'altitude', label: 'Altitude (km)' },
        { value: 'velocity', label: 'Velocity (km/s)' },
        { value: 'temperature', label: 'Temperature (°C)' },
        { value: 'battery', label: 'Battery (%)' },
        { value: 'latitude', label: 'Latitude (°)' },
        { value: 'longitude', label: 'Longitude (°)' }
    ];

    useEffect(() => {
        const fetchSatellites = async () => {
            try {
                const response = await API.satellites.getAll();
                setSatellites(response);
                if (response.length > 0 && !selectedSatellite) {
                    console.log('Setting initial satellite:', response[0].id);
                    setSelectedSatellite(response[0].id);
                }
            } catch (err) {
                console.error('Error fetching satellites:', err);
                setError('Failed to load satellites');
            }
        };

        fetchSatellites();
    }, []);

    useEffect(() => {
        const fetchTelemetryData = async () => {
            if (!selectedSatellite) return;

            try {
                setLoading(true);
                setTelemetryData([]);
                console.log('Fetching telemetry data for satellite:', selectedSatellite);
                const response = await API.telemetry.getBySatellite(selectedSatellite);
                console.log('Received telemetry data:', response);
                if (!response || response.length === 0) {
                    throw new Error('No telemetry data received');
                }
                
                // Parse the telemetry data properly
                const parsedData = response.map(item => {
                    const data = typeof item.data_json === 'string' ? JSON.parse(item.data_json) : item.data_json;
                    return {
                        timestamp: item.timestamp,
                        latitude: parseFloat(data.latitude || 0),
                        longitude: parseFloat(data.longitude || 0),
                        altitude: parseFloat(data.altitude || 0),
                        velocity: parseFloat(data.velocity || 0),
                        temperature: parseFloat(data.temperature || 0),
                        battery: parseFloat(data.power || 0),
                        signal: parseFloat(data.signal || 0)
                    };
                });
                
                setTelemetryData(parsedData);
                setError(null);
            } catch (err) {
                console.error('Error fetching telemetry data:', err);
                setError('Failed to load telemetry data');
                setTelemetryData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchTelemetryData();
        const interval = setInterval(fetchTelemetryData, 30000);
        return () => clearInterval(interval);
    }, [selectedSatellite]);

    const getChartData = () => {
        if (!telemetryData || telemetryData.length === 0) return null;

        const getMetricColor = () => {
            switch(selectedMetric) {
                case 'latitude':
                    return {
                        primary: 'rgba(132, 99, 255, 1)',  // Purple
                        gradient: ['rgba(132, 99, 255, 0.2)', 'rgba(132, 99, 255, 0.05)']
                    };
                case 'longitude':
                    return {
                        primary: 'rgba(255, 206, 86, 1)',  // Yellow
                        gradient: ['rgba(255, 206, 86, 0.2)', 'rgba(255, 206, 86, 0.05)']
                    };
                case 'altitude':
                    return {
                        primary: 'rgba(255, 159, 64, 1)',  // Orange
                        gradient: ['rgba(255, 159, 64, 0.2)', 'rgba(255, 159, 64, 0.05)']
                    };
                case 'temperature':
                    return {
                        primary: 'rgba(255, 99, 132, 1)',  // Red
                        gradient: ['rgba(255, 99, 132, 0.2)', 'rgba(255, 99, 132, 0.05)']
                    };
                case 'battery':
                    return {
                        primary: 'rgba(75, 192, 192, 1)',  // Teal
                        gradient: ['rgba(75, 192, 192, 0.2)', 'rgba(75, 192, 192, 0.05)']
                    };
                case 'velocity':
                    return {
                        primary: 'rgba(153, 102, 255, 1)', // Purple
                        gradient: ['rgba(153, 102, 255, 0.2)', 'rgba(153, 102, 255, 0.05)']
                    };
                default:
                    return {
                        primary: 'rgba(54, 162, 235, 1)',  // Blue
                        gradient: ['rgba(54, 162, 235, 0.2)', 'rgba(54, 162, 235, 0.05)']
                    };
            }
        };

        const colors = getMetricColor();
        const sortedData = [...telemetryData].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        return {
            datasets: [
                {
                    label: metrics.find(m => m.value === selectedMetric)?.label || selectedMetric,
                    data: sortedData.map(item => ({
                        x: new Date(item.timestamp),
                        y: item[selectedMetric]
                    })),
                    borderColor: colors.primary,
                    backgroundColor: colors.gradient[0],
                    fill: true,
                    tension: 0.3,
                    borderWidth: 2,
                    pointRadius: 0,
                    pointHoverRadius: 4,
                    spanGaps: true
                }
            ]
        };
    };

    if (loading) return (
        <div className="flex items-center justify-center h-screen bg-gray-900">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        </div>
    );

    if (error) return (
        <div className="text-red-400 p-4 rounded-lg bg-red-900/50 border border-red-700/50 mb-4">
            Error: {error}
        </div>
    );

    const latestData = telemetryData[0] || {};

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                    Telemetry Data
                </h1>
                <p className="text-gray-400 mt-2">Real-time satellite telemetry monitoring</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Status Panel */}
                <div className="lg:col-span-2 bg-gray-800/50 backdrop-blur-xl rounded-xl border border-gray-700/50 shadow-lg p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold text-gray-200">
                            {latestData?.satelliteName || 'Satellite'} Status
                        </h2>
                        <span className="text-sm text-gray-400">
                            Last Updated: {latestData?.timestamp ? new Date(latestData.timestamp).toLocaleString() : 'N/A'}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Position Data */}
                        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/30">
                            <h3 className="text-lg font-medium text-gray-300 mb-4">Position</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Latitude:</span>
                                    <span className="text-gray-200">{latestData?.latitude?.toFixed(2)}°</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Longitude:</span>
                                    <span className="text-gray-200">{latestData?.longitude?.toFixed(2)}°</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Altitude:</span>
                                    <span className="text-gray-200">{latestData?.altitude?.toFixed(2)} km</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Velocity:</span>
                                    <span className="text-gray-200">{latestData?.velocity?.toFixed(2)} km/s</span>
                                </div>
                            </div>
                        </div>

                        {/* System Status */}
                        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/30">
                            <h3 className="text-lg font-medium text-gray-300 mb-4">System Status</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Power:</span>
                                    <span className="text-green-400">Nominal</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Temperature:</span>
                                    <span className="text-gray-200">{latestData?.temperature?.toFixed(1)}°C</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Battery:</span>
                                    <span className="text-gray-200">{latestData?.battery?.toFixed(1)}%</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Signal:</span>
                                    <span className="text-gray-200">{latestData?.signal?.toFixed(1)}%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Satellite Selection */}
                <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-gray-700/50 shadow-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-200 mb-6">Select Satellite</h2>
                    <div className="space-y-4">
                        {satellites.map(satellite => (
                            <button
                                key={satellite.id}
                                onClick={() => {
                                    console.log('Selecting satellite:', satellite.id);
                                    setSelectedSatellite(satellite.id);
                                    setLoading(true);
                                }}
                                className={`w-full p-4 rounded-lg border transition-all ${
                                    selectedSatellite === satellite.id
                                        ? 'bg-blue-900/50 border-blue-700/50 text-blue-400'
                                        : 'bg-gray-900/50 border-gray-700/30 text-gray-400 hover:bg-gray-800/50'
                                }`}
                            >
                                <div className="flex items-center">
                                    <div className="flex-1 text-left">
                                        <div className="font-medium">{satellite.name}</div>
                                        <div className="text-sm opacity-75">{satellite.type || 'Unknown Type'}</div>
                                    </div>
                                    {selectedSatellite === satellite.id && (
                                        <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                                    )}
                                </div>
                            </button>
                                ))}
                    </div>
                </div>
            </div>

            {/* Telemetry Chart */}
            <div className="mt-6 bg-gray-800/50 backdrop-blur-xl rounded-xl border border-gray-700/50 shadow-lg p-6">
                <div className="flex justify-between items-center mb-6">
                    <div className="space-y-1">
                        <h2 className="text-xl font-semibold text-gray-200">Historical Data</h2>
                        <p className="text-sm text-gray-400">Tracking satellite metrics over time</p>
                    </div>
                    <div className="flex space-x-4">
                        <select
                            value={selectedTimeRange}
                            onChange={(e) => setSelectedTimeRange(e.target.value)}
                            className="bg-gray-900/50 text-gray-300 border border-gray-700/50 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="1h">Last Hour</option>
                            <option value="6h">Last 6 Hours</option>
                            <option value="24h">Last 24 Hours</option>
                            <option value="7d">Last 7 Days</option>
                        </select>
                    </div>
                </div>
                <div className="h-[500px] relative">
                    {loading ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        </div>
                    ) : error ? (
                        <div className="absolute inset-0 flex items-center justify-center text-red-400">
                            {error}
                        </div>
                    ) : getChartData() && (
                        <Line
                            data={getChartData()}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                interaction: {
                                    mode: 'nearest',
                                    intersect: false,
                                    axis: 'x'
                                },
                                plugins: {
                                    legend: {
                                        display: false
                                    },
                                    tooltip: {
                                        mode: 'index',
                                        intersect: false,
                                        backgroundColor: 'rgba(17, 24, 39, 0.9)',
                                        titleColor: '#E5E7EB',
                                        bodyColor: '#D1D5DB',
                                        borderColor: 'rgba(75, 85, 99, 0.3)',
                                        borderWidth: 1,
                                        padding: 12,
                                        displayColors: false,
                                        callbacks: {
                                            title: function(tooltipItems) {
                                                return new Date(tooltipItems[0].parsed.x).toLocaleString();
                                            },
                                            label: function(context) {
                                                let value = context.parsed.y;
                                                switch(selectedMetric) {
                                                    case 'altitude':
                                                        return `Altitude: ${value.toFixed(2)} km`;
                                                    case 'temperature':
                                                        return `Temperature: ${value.toFixed(1)} °C`;
                                                    case 'battery':
                                                        return `Battery Level: ${value.toFixed(1)}%`;
                                                    case 'velocity':
                                                        return `Velocity: ${value.toFixed(2)} km/s`;
                                                    default:
                                                        return `${value.toFixed(2)}`;
                                                }
                                            }
                                        }
                                    }
                                },
                                scales: {
                                    x: {
                                        type: 'time',
                                        time: {
                                            unit: selectedTimeRange === '1h' ? 'minute' :
                                                  selectedTimeRange === '6h' ? 'hour' :
                                                  selectedTimeRange === '24h' ? 'hour' : 'day',
                                            displayFormats: {
                                                minute: 'HH:mm',
                                                hour: 'HH:mm',
                                                day: 'MMM d'
                                            },
                                            tooltipFormat: 'MMM d, HH:mm'
                                        },
                                        grid: {
                                            color: 'rgba(75, 85, 99, 0.2)',
                                            tickLength: 10,
                                            drawBorder: false,
                                            lineWidth: 1,
                                            borderDash: [5, 5]
                                        },
                                        ticks: {
                                            color: '#9CA3AF',
                                            font: {
                                                size: 11
                                            },
                                            maxRotation: 0,
                                            padding: 10,
                                            autoSkip: true,
                                            maxTicksLimit: 8
                                        }
                                    },
                                    y: {
                                        position: 'right',
                                        grid: {
                                            color: 'rgba(75, 85, 99, 0.2)',
                                            tickLength: 10,
                                            drawBorder: false,
                                            lineWidth: 1,
                                            borderDash: [5, 5],
                                            z: -1
                                        },
                                        border: {
                                            display: false
                                        },
                                        ticks: {
                                            color: '#9CA3AF',
                                            font: {
                                                size: 11
                                            },
                                            padding: 10,
                                            callback: function(value) {
                                                switch(selectedMetric) {
                                                    case 'altitude':
                                                        return value + ' km';
                                                    case 'temperature':
                                                        return value + ' °C';
                                                    case 'battery':
                                                        return value + '%';
                                                    case 'velocity':
                                                        return value + ' km/s';
                                                    default:
                                                        return value;
                                                }
                                            },
                                            maxTicksLimit: 6
                                        },
                                        beginAtZero: selectedMetric === 'battery'
                                        }
                                },
                                animation: {
                                    duration: 750,
                                    easing: 'easeInOutQuart'
                                }
                            }}
                        />
                    )}
                </div>
            </div>

            {/* Metrics Selection */}
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-gray-700/50 shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-200 mb-6">Select Metric</h2>
                <div className="space-y-4">
                    {metrics.map(metric => (
                        <button
                            key={metric.value}
                            onClick={() => setSelectedMetric(metric.value)}
                            className={`w-full p-4 rounded-lg border transition-all ${
                                selectedMetric === metric.value
                                    ? 'bg-blue-900/50 border-blue-700/50 text-blue-400'
                                    : 'bg-gray-900/50 border-gray-700/30 text-gray-400 hover:bg-gray-800/50'
                            }`}
                        >
                            <div className="flex items-center">
                                <div className="flex-1">
                                    <div className="font-medium capitalize">{metric.label}</div>
                                    <div className="text-sm opacity-75">
                                        {metric.value === 'altitude' && 'Orbital height'}
                                        {metric.value === 'temperature' && 'Satellite temperature'}
                                        {metric.value === 'battery' && 'Power level'}
                                        {metric.value === 'velocity' && 'Orbital speed'}
                                    </div>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TelemetryData; 