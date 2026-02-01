import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Login from './pages/Login';
import POSDashboard from './POSDashboard';
import OrderTracking from './pages/OrderTracking';
import PrintSettings from './pages/PrintSettings';
import PrintProfile from './pages/PrintProfile';
import PrintFooter from './components/PrintFooter';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-teal-600 rounded-full animate-spin"></div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Authenticating Terminal...</p>
        </div>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const App = () => {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Toaster 
            position="top-center"
            toastOptions={{
              style: {
                borderRadius: '20px',
                padding: '16px 24px',
                fontWeight: 'bold',
                fontFamily: 'Cairo, sans-serif',
              }
            }}
          />
          <div className="min-h-screen flex flex-col">
            <main className="flex-1">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <POSDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/tracking"
                  element={<OrderTracking />}
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <PrintSettings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <PrintProfile />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </main>
            <PrintFooter />
          </div>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
};

export default App;
