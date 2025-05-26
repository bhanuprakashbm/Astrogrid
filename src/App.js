import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layout components
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Dashboard from './pages/Dashboard';
import SatellitesList from './pages/satellites/SatellitesList';
import SatelliteDetails from './pages/satellites/SatelliteDetails';
import GroundStations from './pages/ground-stations/GroundStations';
import CommandCenter from './pages/command-center/CommandCenter';
import TelemetryData from './pages/telemetry/TelemetryData';
import Operators from './pages/operators/Operators';
import AnomalyTracker from './pages/anomalies/AnomalyTracker';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Profile from './pages/user/Profile';
import IsroSatellitesPage from './pages/IsroSatellitesPage';

// Context
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';

function AppContent() {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-dark-space">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-space-blue"></div>
      </div>
    );
  }

  return (
    <Router>
      {currentUser ? (
        <div className="flex h-screen bg-dark-space text-gray-100">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Navbar />
            <main className="flex-1 overflow-y-auto p-4 bg-gray-900">
              <Routes>
                <Route path="/" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/satellites" element={
                  <ProtectedRoute>
                    <SatellitesList />
                  </ProtectedRoute>
                } />
                <Route path="/satellites/:id" element={
                  <ProtectedRoute>
                    <SatelliteDetails />
                  </ProtectedRoute>
                } />
                <Route path="/ground-stations" element={
                  <ProtectedRoute>
                    <GroundStations />
                  </ProtectedRoute>
                } />
                <Route path="/command-center" element={
                  <ProtectedRoute>
                    <CommandCenter />
                  </ProtectedRoute>
                } />
                <Route path="/telemetry" element={
                  <ProtectedRoute>
                    <TelemetryData />
                  </ProtectedRoute>
                } />
                <Route path="/operators" element={
                  <ProtectedRoute>
                    <Operators />
                  </ProtectedRoute>
                } />
                <Route path="/anomalies" element={
                  <ProtectedRoute>
                    <AnomalyTracker />
                  </ProtectedRoute>
                } />
                <Route path="/isro-satellites" element={
                  <ProtectedRoute>
                    <IsroSatellitesPage />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                <Route path="/login" element={<Navigate to="/" />} />
                <Route path="/register" element={<Navigate to="/" />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </main>
          </div>
        </div>
      ) : (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      )}
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
