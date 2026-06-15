import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AuthContext';
import { MoodProvider } from './context/MoodContext';
import { ProtectedRoute } from './context/ProtectedRoute';
import { Login } from './pages/Login';
import Home from './pages/Home';

function App() {
  return (
    // Provider sits at the very top so hooks inside the router can access it safely
    <AppProvider>
      <MoodProvider>
      <HashRouter>
        <Routes>
          {/* Public Login Screen */}
          <Route path="/login" element={<Login />} />

          {/* Protected Main Terminal Workspace */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } 
          />

          {/* Global Fallback Safeguard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </HashRouter>
      </MoodProvider>
    </AppProvider>

  );
}

export default App;