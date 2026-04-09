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
  const { user, role, loading, error } = useApp();

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600 mb-4"></div>
        <p className="text-gray-500 font-bold animate-pulse uppercase tracking-widest text-xs">Initializing PropTrack...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-red-50 p-6">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-red-100 text-center">
          <h2 className="text-2xl font-black text-red-600 mb-2">Configuration Error</h2>
          <p className="text-gray-600 mb-6 font-medium">{error}</p>
          <div className="p-4 bg-gray-50 rounded-2xl text-left text-xs font-mono text-gray-500 mb-6">
            Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file or host environment.
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all"
          >
            Retry Connection
          </button>
        </div>
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