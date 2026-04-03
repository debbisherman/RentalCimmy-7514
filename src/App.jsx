import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useApp } from './store/AppContext';
import Navigation from './components/Navigation';
import TopBar from './components/TopBar';
import LoginPage from './pages/LoginPage';
import LandlordOverview from './pages/LandlordOverview';
import RentersManager from './pages/RentersManager';
import PaymentsManager from './pages/PaymentsManager';
import RenterDashboard from './pages/RenterDashboard';

function App() {
  const { user, role, loading } = useApp();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) return <LoginPage />;

  const isAdmin = role === 'landlord' || role === 'super_admin';

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      <Navigation />
      <div className="flex-1 ml-64 flex flex-col h-screen relative">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-10">
          <Routes>
            {isAdmin ? (
              <>
                <Route path="/" element={<LandlordOverview />} />
                <Route path="/renters" element={<RentersManager />} />
                <Route path="/payments" element={<PaymentsManager />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </>
            ) : (
              <>
                <Route path="/" element={<RenterDashboard />} />
                <Route path="/my-payments" element={<RenterDashboard />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </>
            )}
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;