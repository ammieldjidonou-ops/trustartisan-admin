import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Artisans from './pages/Artisans';
import Clients from './pages/Clients';
import Missions from './pages/Missions';
import Paiements from './pages/Paiements';
import './App.css';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <Router>
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f6fa' }}>
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        <main style={{ flex: 1, marginLeft: sidebarOpen ? 250 : 70, transition: 'margin 0.3s', padding: 24 }}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/artisans" element={<Artisans />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/missions" element={<Missions />} />
            <Route path="/paiements" element={<Paiements />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
