-- AstroGrid Database Schema

-- Create database
CREATE DATABASE IF NOT EXISTS astrogrid;
USE astrogrid;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('Admin', 'Controller', 'Observer') DEFAULT 'Observer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email)
);

-- Satellites table
CREATE TABLE IF NOT EXISTS satellites (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  status ENUM('Operational', 'Non-operational', 'In Development', 'Retired') DEFAULT 'Operational',
  type VARCHAR(100),
  launch_date DATE,
  altitude FLOAT,
  orbit VARCHAR(50),
  operator VARCHAR(100),
  mass FLOAT,
  mission_life VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status)
);

-- Ground stations table
CREATE TABLE IF NOT EXISTS ground_stations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  location VARCHAR(255),
  latitude FLOAT,
  longitude FLOAT,
  elevation FLOAT,
  status ENUM('Operational', 'Maintenance', 'Inactive') DEFAULT 'Operational',
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status)
);

-- Missions table
CREATE TABLE IF NOT EXISTS missions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  status ENUM('Active', 'Planned', 'Completed', 'Cancelled') DEFAULT 'Planned',
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status)
);

-- Telemetry data table
CREATE TABLE IF NOT EXISTS telemetry (
  id INT AUTO_INCREMENT PRIMARY KEY,
  satellite_id INT NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_json JSON,
  FOREIGN KEY (satellite_id) REFERENCES satellites(id) ON DELETE CASCADE,
  INDEX idx_satellite_timestamp (satellite_id, timestamp)
);

-- Commands table
CREATE TABLE IF NOT EXISTS commands (
  id INT AUTO_INCREMENT PRIMARY KEY,
  satellite_id INT NOT NULL,
  user_id INT NOT NULL,
  command_type VARCHAR(100) NOT NULL,
  parameters JSON,
  status ENUM('Pending', 'Executing', 'Completed', 'Failed') DEFAULT 'Pending',
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  executed_at TIMESTAMP NULL,
  result TEXT,
  FOREIGN KEY (satellite_id) REFERENCES satellites(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_satellite_status (satellite_id, status),
  INDEX idx_user (user_id)
);

-- Anomalies table
CREATE TABLE IF NOT EXISTS anomalies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  satellite_id INT NOT NULL,
  description TEXT NOT NULL,
  severity ENUM('Critical', 'Major', 'Minor', 'Low') DEFAULT 'Minor',
  status ENUM('Open', 'Investigating', 'Resolved') DEFAULT 'Open',
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP NULL,
  resolved_by INT NULL,
  resolution_notes TEXT,
  FOREIGN KEY (satellite_id) REFERENCES satellites(id) ON DELETE CASCADE,
  FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_satellite_status (satellite_id, status),
  INDEX idx_severity (severity)
);

-- Satellite-to-mission mapping
CREATE TABLE IF NOT EXISTS mission_satellites (
  mission_id INT NOT NULL,
  satellite_id INT NOT NULL,
  role VARCHAR(100),
  PRIMARY KEY (mission_id, satellite_id),
  FOREIGN KEY (mission_id) REFERENCES missions(id) ON DELETE CASCADE,
  FOREIGN KEY (satellite_id) REFERENCES satellites(id) ON DELETE CASCADE
);

-- Ground station to mission mapping
CREATE TABLE IF NOT EXISTS mission_ground_stations (
  mission_id INT NOT NULL,
  ground_station_id INT NOT NULL,
  PRIMARY KEY (mission_id, ground_station_id),
  FOREIGN KEY (mission_id) REFERENCES missions(id) ON DELETE CASCADE,
  FOREIGN KEY (ground_station_id) REFERENCES ground_stations(id) ON DELETE CASCADE
);

-- Satellite Positions Table
CREATE TABLE IF NOT EXISTS satellite_positions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    satellite_id INT NOT NULL,
    timestamp DATETIME NOT NULL,
    latitude DECIMAL(10, 6) NOT NULL,
    longitude DECIMAL(10, 6) NOT NULL,
    altitude DECIMAL(10, 2) NOT NULL, -- in kilometers
    velocity DECIMAL(10, 2), -- in km/s
    heading DECIMAL(10, 2), -- in degrees
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (satellite_id) REFERENCES satellites(id) ON DELETE CASCADE,
    INDEX idx_satellite_timestamp (satellite_id, timestamp)
);

-- Satellite Maneuvers Table
CREATE TABLE IF NOT EXISTS satellite_maneuvers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    satellite_id INT NOT NULL,
    timestamp DATETIME NOT NULL,
    delta_v DECIMAL(10, 4) NOT NULL, -- in m/s
    maneuver_type ENUM('Orbit Raise', 'Station Keeping', 'Collision Avoidance', 'Deorbit', 'Other') NOT NULL,
    description TEXT,
    fuel_used DECIMAL(10, 4), -- in kg
    target_orbit JSON, -- stores target orbital parameters
    actual_orbit JSON, -- stores achieved orbital parameters
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (satellite_id) REFERENCES satellites(id) ON DELETE CASCADE,
    INDEX idx_satellite_timestamp (satellite_id, timestamp)
);

-- Sample data for testing
INSERT INTO users (id, name, email, password, role) VALUES
(1, 'Admin User', 'admin@astronet.io', 'password123', 'Admin'),
(2, 'Controller User', 'controller@astrogrid.com', 'password123', 'Controller'),
(3, 'Observer User', 'observer@astrogrid.com', 'password123', 'Observer');

INSERT INTO satellites (name, description, status, type, launch_date, altitude, orbit, operator) VALUES
('AstroSat-1', 'Earth observation satellite for environmental monitoring', 'Operational', 'Earth Observation', '2023-01-15', 650, 'LEO', 'ISRO'),
('Resourcesat-2A', 'Resource monitoring satellite with multispectral imaging', 'Operational', 'Earth Observation', '2022-03-22', 817, 'LEO', 'ISRO'),
('GSAT-19', 'Communications satellite providing internet and broadcasting services', 'Operational', 'Communication', '2021-11-05', 35786, 'GEO', 'ISRO');

INSERT INTO ground_stations (name, location, latitude, longitude, elevation, status, description) VALUES
('Bangalore Station', 'Bangalore, India', 12.9716, 77.5946, 920, 'Operational', 'Primary ground station for LEO satellite tracking and communications'),
('Chennai Station', 'Chennai, India', 13.0827, 80.2707, 6.7, 'Operational', 'Secondary ground station focused on weather satellite tracking'),
('Lucknow Station', 'Lucknow, India', 26.8467, 80.9462, 123, 'Maintenance', 'Tertiary ground station currently undergoing equipment upgrades');

INSERT INTO missions (name, description, status, start_date, end_date) VALUES
('Earth Observation Mission', 'Comprehensive monitoring of Earth climate and resources', 'Active', '2023-01-01', '2026-12-31'),
('Communication Relay Network', 'Establishing new high-throughput communication network', 'Planned', '2024-06-01', '2029-05-31'),
('Mars Orbital Survey', 'Detailed mapping of Mars surface features', 'Completed', '2018-03-15', '2022-12-31');

INSERT INTO mission_satellites (mission_id, satellite_id, role) VALUES
(1, 1, 'Primary'),
(1, 2, 'Secondary'),
(2, 3, 'Primary');

INSERT INTO mission_ground_stations (mission_id, ground_station_id) VALUES
(1, 1),
(1, 2),
(2, 1),
(2, 3);

INSERT INTO commands (satellite_id, user_id, command_type, parameters, status, timestamp) VALUES
(1, 1, 'Orbital Adjust', '{"delta_v": 0.05, "direction": "prograde"}', 'Pending', NOW()),
(2, 2, 'Restart Onboard Computer', '{"subsystem": "OBC", "mode": "safe"}', 'Completed', DATE_SUB(NOW(), INTERVAL 1 DAY));

INSERT INTO anomalies (satellite_id, description, severity, status, timestamp) VALUES
(3, 'Power system fluctuation detected during solar panel rotation', 'Critical', 'Open', NOW()),
(1, 'Minor telemetry data corruption in non-critical subsystem', 'Low', 'Resolved', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(2, 'Unexpected thermal readings in propulsion system', 'Major', 'Investigating', DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(1, 'Communication signal strength degradation detected', 'Minor', 'Open', DATE_SUB(NOW(), INTERVAL 3 HOUR)),
(3, 'Attitude control system showing irregular behavior', 'Critical', 'Investigating', DATE_SUB(NOW(), INTERVAL 4 HOUR)),
(2, 'Memory buffer overflow in onboard computer', 'Major', 'Open', DATE_SUB(NOW(), INTERVAL 5 HOUR)),
(1, 'GPS receiver reporting inconsistent position data', 'Minor', 'Resolved', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(3, 'Solar panel efficiency drop below nominal threshold', 'Major', 'Open', DATE_SUB(NOW(), INTERVAL 6 HOUR)),
(2, 'Reaction wheel showing signs of increased friction', 'Critical', 'Investigating', DATE_SUB(NOW(), INTERVAL 7 HOUR)),
(1, 'Battery charge cycle duration longer than expected', 'Minor', 'Open', DATE_SUB(NOW(), INTERVAL 8 HOUR)),
(3, 'Payload data transmission errors detected', 'Major', 'Open', DATE_SUB(NOW(), INTERVAL 9 HOUR)),
(2, 'Star tracker calibration deviation observed', 'Minor', 'Investigating', DATE_SUB(NOW(), INTERVAL 10 HOUR)),
(1, 'Thermal control system response delay', 'Major', 'Open', DATE_SUB(NOW(), INTERVAL 11 HOUR)),
(3, 'Unexpected power consumption spike in science payload', 'Critical', 'Open', DATE_SUB(NOW(), INTERVAL 12 HOUR)),
(2, 'Magnetometer readings showing unusual fluctuations', 'Minor', 'Resolved', DATE_SUB(NOW(), INTERVAL 2 DAY));

INSERT INTO telemetry (satellite_id, timestamp, data_json) VALUES
(1, NOW(), '{"power": 95, "temperature": 23.5, "signal": 87, "memory": 64, "cpu": 32}'),
(1, DATE_SUB(NOW(), INTERVAL 1 HOUR), '{"power": 96, "temperature": 22.8, "signal": 89, "memory": 61, "cpu": 28}'),
(2, NOW(), '{"power": 92, "temperature": 24.1, "signal": 84, "memory": 58, "cpu": 45}'); 