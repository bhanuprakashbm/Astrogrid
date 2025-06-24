import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Layout components
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Dashboard from './pages/Dashboard';
import SatellitesList from './pages/satellites/SatellitesListNew';
import SatelliteDetails from './pages/satellites/SatelliteDetails';
import AddSatellite from './pages/satellites/AddSatellite';
import GroundStations from './pages/ground-stations/GroundStations';
import CommandCenter from './pages/command-center/CommandCenter';
import TelemetryData from './pages/telemetry/TelemetryData';
import Operators from './pages/operators/Operators';
import AnomalyTracker from './pages/anomalies/AnomalyTracker';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Profile from './pages/user/Profile';
import Missions from './pages/Missions';
import MissionDetails from './pages/missions/MissionDetails';
import AddMission from './pages/missions/AddMission';

// Context
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex h-screen bg-gray-900">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Navbar />
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-900">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/satellites" element={<ProtectedRoute><SatellitesList /></ProtectedRoute>} />
                <Route path="/satellites/new" element={<ProtectedRoute><AddSatellite /></ProtectedRoute>} />
                <Route path="/satellites/:id" element={<ProtectedRoute><SatelliteDetails /></ProtectedRoute>} />
                <Route path="/ground-stations" element={<ProtectedRoute><GroundStations /></ProtectedRoute>} />
                <Route path="/command-center" element={<ProtectedRoute><CommandCenter /></ProtectedRoute>} />
                <Route path="/telemetry" element={<ProtectedRoute><TelemetryData /></ProtectedRoute>} />
                <Route path="/operators" element={<ProtectedRoute><Operators /></ProtectedRoute>} />
                <Route path="/anomalies" element={<ProtectedRoute><AnomalyTracker /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/missions" element={<ProtectedRoute><Missions /></ProtectedRoute>} />
                <Route path="/missions/new" element={<ProtectedRoute><AddMission /></ProtectedRoute>} />
                <Route path="/missions/:id" element={<ProtectedRoute><MissionDetails /></ProtectedRoute>} />
              </Routes>
            </main>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
