import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import QRScanner from './components/QRScanner';
import AttendanceReport from './components/AttendanceReport';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter basename="/student-tracker">
      <div className="min-h-screen bg-maroon-50">
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/scanner" element={<QRScanner />} />
            <Route path="/report" element={<AttendanceReport />} />
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;