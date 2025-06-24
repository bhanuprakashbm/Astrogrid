import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ReactApexChart from 'react-apexcharts';
import API from '../services/apiClient';

const Dashboard = () => {
    const { currentUser } = useAuth();
    const [satellites, setSatellites] = useState([]);
    const [groundStations, setGroundStations] = useState([]);
    const [pendingCommands, setPendingCommands] = useState([]);
    const [activeAnomalies, setActiveAnomalies] = useState([]);
    const [positionData, setPositionData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                // Fetch satellites
                const satelliteData = await API.satellites.getAll();
                setSatellites(satelliteData);

                // Fetch ground stations
                const stationData = await API.groundStations.getAll();
                setGroundStations(stationData);

                // Fetch pending commands
                const commandData = await API.commands.getPending();
                setPendingCommands(commandData);

                // Fetch active anomalies
                const anomalyData = await API.anomalies.getActive();
                setActiveAnomalies(anomalyData);

                // Fetch position data for the last 24 hours
                const now = new Date();
                const yesterday = new Date(now.getTime() - (24 * 60 * 60 * 1000));
                const posData = await API.telemetry.getPositionData(yesterday, now);
                setPositionData(posData);

                setLoading(false);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const chartOptions = {
        chart: {
            type: 'line',
            background: '#1E2A3B',
            foreColor: '#A0AEC0',
            toolbar: {
                show: false
            },
            animations: {
                enabled: true,
                easing: 'easeinout',
                speed: 800
            }
        },
        stroke: {
            curve: 'smooth',
            width: 3,
            lineCap: 'round'
        },
        colors: ['#3B82F6', '#10B981', '#F59E0B'],
        xaxis: {
            type: 'datetime',
            labels: {
                style: {
                    colors: '#A0AEC0',
                    fontSize: '12px'
                },
                format: 'HH:mm',
                datetimeUTC: false
            },
            axisBorder: {
                show: true,
                color: 'rgba(160, 174, 192, 0.2)'
            },
            axisTicks: {
                show: true,
                color: 'rgba(160, 174, 192, 0.2)'
            },
            title: {
                text: 'Time (UTC)',
                style: {
                    fontSize: '14px',
                    color: '#A0AEC0'
                }
            }
        },
        yaxis: [
            {
                min: -100,
                max: 100,
                tickAmount: 4,
                title: {
                    text: 'Latitude (°N/S)',
                    style: {
                        color: '#3B82F6',
                        fontSize: '13px'
                    }
                },
                labels: {
                    style: {
                        colors: '#A0AEC0'
                    },
                    formatter: (value) => `${value.toFixed(0)}°`
                }
            },
            {
                min: -100,
                max: 100,
                tickAmount: 4,
                opposite: true,
                title: {
                    text: 'Longitude (°E/W)',
                    style: {
                        color: '#10B981',
                        fontSize: '13px'
                    }
                },
                labels: {
                    style: {
                        colors: '#A0AEC0'
                    },
                    formatter: (value) => `${value.toFixed(0)}°`
                }
            },
            {
                min: 400,
                max: 600,
                tickAmount: 4,
                opposite: true,
                title: {
                    text: 'Altitude (km)',
                    style: {
                        color: '#F59E0B',
                        fontSize: '13px'
                    }
                },
                labels: {
                    style: {
                        colors: '#A0AEC0'
                    },
                    formatter: (value) => `${value.toFixed(0)}`
                }
            }
        ],
        tooltip: {
            theme: 'dark',
            x: {
                format: 'HH:mm'
            },
            y: {
                formatter: (value, { seriesIndex }) => {
                    if (seriesIndex === 2) { // Altitude
                        return `${value.toFixed(2)} km`;
                    }
                    return `${value.toFixed(2)}°`;
                }
            },
            fixed: {
                enabled: true,
                position: 'topRight'
            }
        },
        legend: {
            position: 'top',
            horizontalAlign: 'right',
            offsetY: -10,
            offsetX: -10,
            labels: {
                colors: '#A0AEC0'
            },
            markers: {
                width: 12,
                height: 12,
                radius: 6
            }
        },
        grid: {
            borderColor: 'rgba(160, 174, 192, 0.1)',
            xaxis: {
                lines: {
                    show: true,
                    opacity: 0.1
                }
            },
            yaxis: {
                lines: {
                    show: true,
                    opacity: 0.1
                }
            },
            padding: {
                top: 10,
                right: 10,
                bottom: 10,
                left: 10
            }
        },
        markers: {
            size: 0,
            hover: {
                size: 5,
                sizeOffset: 3
            }
        },
        subtitle: {
            text: satellites[0]?.name ? `Tracking ${satellites[0].name}` : 'Satellite Position Data',
            align: 'left',
            style: {
                fontSize: '13px',
                color: '#A0AEC0'
            }
        }
    };

    // Generate sample position data if API doesn't return any
    useEffect(() => {
        if (positionData.length === 0) {
            const now = new Date();
            const data = [];
            for (let i = 23; i >= 0; i--) {
                const time = new Date(now.getTime() - (i * 60 * 60 * 1000));
                const phase = (i * Math.PI) / 12;
                data.push({
                    timestamp: time,
                    latitude: 45 * Math.sin(phase + Math.PI/6),
                    longitude: -75 + 45 * Math.cos(phase),
                    altitude: 491.34 + 15 * Math.sin(phase * 2)
                });
            }
            setPositionData(data);
        }
    }, [positionData, satellites]);

    const chartSeries = [
        {
            name: 'Latitude',
            data: positionData.map(d => ([new Date(d.timestamp).getTime(), d.latitude]))
        },
        {
            name: 'Longitude',
            data: positionData.map(d => ([new Date(d.timestamp).getTime(), d.longitude]))
        },
        {
            name: 'Altitude',
            data: positionData.map(d => ([new Date(d.timestamp).getTime(), d.altitude]))
        }
    ];

    if (loading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    return (
        <div className="p-6 bg-gray-900 min-h-screen">
            <h1 className="text-3xl font-bold text-white mb-8">Dashboard</h1>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-gray-800 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-300">Active Satellites</h3>
                    <p className="text-2xl font-bold text-white">{satellites.length}</p>
                </div>
                <div className="bg-gray-800 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-300">Ground Stations</h3>
                    <p className="text-2xl font-bold text-white">{groundStations.length}</p>
                </div>
                <div className="bg-gray-800 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-300">Pending Commands</h3>
                    <p className="text-2xl font-bold text-white">{pendingCommands.length}</p>
                </div>
                <div className="bg-gray-800 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-300">Active Anomalies</h3>
                    <p className="text-2xl font-bold text-white">{activeAnomalies.length}</p>
                </div>
            </div>

            {/* Satellite Position Chart */}
            <div className="bg-gray-800 p-6 rounded-lg mb-8">
                <h2 className="text-xl font-bold text-white mb-4">Satellite Position Overview</h2>
                <div className="h-[400px]">
                    <ReactApexChart
                        options={chartOptions}
                        series={chartSeries}
                        type="line"
                        height="100%"
                    />
                </div>
            </div>
        </div>
    );
};

export default Dashboard; 