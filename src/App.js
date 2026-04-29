import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Artisans from './pages/Artisans';
import Clients from './pages/Clients';
import Missions from './pages/Missions';
import Paiements from './pages/Paiements';
import Collaborateurs from './pages/Collaborateurs';
import Signalements from './pages/Signalements';
import Notifications from './pages/Notifications';
import Login from './pages/Login';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'https://web-production-b97ed.up.railway.app';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) { setLoading(false); return; }
    fetch(API_URL + '/api/admin-auth/verify', {
      headers: { 'Authorization': 'Bearer ' + token }
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setAdmin(data.admin);
        } else {
          localStorage.removeItem('admin_token');
          localStorage.removeItem('admin_user');
        }
      })
      .catch(() => {
        // Serveur inaccessible - utiliser le cache local
        const cached = localStorage.getItem('admin_user');
        if (cached) setAdmin(JSON.parse(cached));
      })
      .finally(() => setLoading(false));
  }, []);

  const handleLogin = (adminData) => {
    setAdmin(adminData);
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setAdmin(null);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f6fa' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🛠️</div>
          <p style={{ color: '#888' }}>Chargement...</p>
        </div>
      </div>
    );
  }

  if (!admin) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Router>
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f6fa' }}>
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} admin={admin} onLogout={handleLogout} />
        <main style={{ flex: 1, marginLeft: sidebarOpen ? 250 : 70, transition: 'margin 0.3s', padding: 24 }}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<Dashboard admin={admin} />} />
            <Route path="/artisans" element={<Artisans admin={admin} />} />
            <Route path="/clients" element={<Clients admin={admin} />} />
            <Route path="/missions" element={<Missions admin={admin} />} />
            <Route path="/paiements" element={<Paiements admin={admin} />} />
            <Route path="/collaborateurs" element={<Collaborateurs admin={admin} />} />
            <Route path="/signalements" element={<Signalements admin={admin} />} />
            <Route path="/notifications" element={<Notifications admin={admin} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}