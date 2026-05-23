import React from 'react';
import { Navigate } from 'react-router-dom';
import { useApp } from '../hooks/useApp';

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isPaired, loading} = useApp();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121214] flex flex-col items-center justify-center font-mono text-zinc-500">
        <div className="w-5 h-5 border-2 border-zinc-700 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs tracking-widest uppercase opacity-60 animate-pulse">Synchronizing terminal session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isPaired) {
    return (
      <div className="min-h-screen bg-[#121214] flex items-center justify-center p-4 font-mono text-center">
        <div className="max-w-md bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 space-y-4">
          <h2 className="text-md font-bold text-zinc-200 tracking-wider">Awaiting Relationship Pairing</h2>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Your login token is verified, but your unique user ID has not been linked to your partner in the database 'couples' table yet.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};