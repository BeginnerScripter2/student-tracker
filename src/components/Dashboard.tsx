import React from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase';

export default function Dashboard() {
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen bg-maroon-50">
      <nav className="bg-maroon-600 text-white p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Student Tracker</h1>
          <button
            onClick={handleLogout}
            className="bg-maroon-700 px-4 py-2 rounded hover:bg-maroon-800"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            to="/scanner"
            className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
          >
            <h2 className="text-xl font-bold text-maroon-900 mb-2">QR Scanner</h2>
            <p className="text-gray-600">Scan student QR codes to mark attendance</p>
          </Link>

          <Link
            to="/report"
            className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
          >
            <h2 className="text-xl font-bold text-maroon-900 mb-2">Attendance Report</h2>
            <p className="text-gray-600">View and export attendance records</p>
          </Link>
        </div>
      </div>
    </div>
  );
}