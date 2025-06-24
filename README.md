# AstroGrid

AstroGrid is a space mission control dashboard application for satellite management and monitoring.

## Features

- Satellite management and monitoring
- Ground station overview
- Mission planning and execution
- Telemetry data visualization
- Command execution
- Anomaly detection and tracking
- User authentication and role-based access control

## Database Setup

AstroGrid uses MySQL as its database system.

### Setting up MySQL

1. Install MySQL on your system if you haven't already.
2. Create a new database:
   ```sql
   CREATE DATABASE astrogrid;
   ```
3. Run the schema SQL script to set up the tables:
   ```
   mysql -u root -p astrogrid < astrogrid-schema.sql
   ```

### Environment Configuration

Create a `.env` file in the root directory with the following variables:

```
# Database configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=astrogrid

# React app database settings
REACT_APP_DB_HOST=localhost
REACT_APP_DB_USER=root
REACT_APP_DB_PASSWORD=your_password
REACT_APP_DB_NAME=astrogrid

# Application settings
PORT=3001
REACT_APP_API_URL=http://localhost:3001/api
```

## Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm run dev
   ```
   This will start both the React frontend and the Express backend server.

## Development

### Backend Server

The backend server is built with Express.js and handles the MySQL database operations.

- `server.js` - Main Express server file
- `astrogrid-schema.sql` - Database schema and sample data

### Frontend Application

The frontend is a React application using:

- React Router for navigation
- Tailwind CSS for styling
- Recharts for data visualization

## Available Scripts

- `npm start` - Runs the React app in development mode
- `npm run server` - Starts the Express server
- `npm run dev` - Runs both the server and React app in parallel
- `npm run build` - Builds the app for production
- `npm test` - Runs tests

## Browser Compatibility

The application is designed to work in modern browsers and includes polyfills for older browsers.

## Architecture

AstroGrid uses a layered architecture:

1. **UI Layer**: React components and pages
2. **Service Layer**: Database adapter services that handle data operations
3. **Database Layer**: MySQL database accessed through a RESTful API

In development, the app uses a mock database that simulates MySQL operations. In production, it connects to a real MySQL database through the Express server.

## Folder Structure

- `/src` - React application source code
  - `/components` - Reusable UI components
  - `/pages` - Application pages
  - `/services` - Data services
  - `/utils` - Utility functions
- `/public` - Static assets

## Database Structure

The database consists of these main tables:

- `users` - User accounts and authentication
- `satellites` - Satellite information
- `ground_stations` - Ground station details
- `missions` - Mission information
- `telemetry` - Satellite telemetry data
- `commands` - Commands sent to satellites
- `anomalies` - Detected anomalies

## License

This project is licensed under the MIT License.
