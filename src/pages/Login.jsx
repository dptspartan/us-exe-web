import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../hooks/useApp';
import { networkUtility } from '../api/NetworkUtils';

export const Login = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isPaired } = useApp();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // SAFEGUARD: If a user lands here but already has an active session token,
  // bypass the form entirely and pass them forward to the dashboard workspace.
  useEffect(() => {
    if (isAuthenticated && isPaired) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, isPaired, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Authorize token session via network interface
      await networkUtility.signIn(email, password);
      
      // 2. Clear execution state stack and seamlessly switch window focus routes
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Access Denied. Check credentials, love.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121214] flex items-center justify-center p-4 font-mono select-none">
      <div className="w-full max-w-sm bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 backdrop-blur-xl shadow-2xl relative">
        
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-widest text-zinc-100 mb-2">Us.exe</h1>
          <p className="text-xs text-zinc-500">Initializing secure terminal connection...</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-zinc-400 mb-1.5">System Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operator@us.exe"
              className="w-full bg-zinc-950/60 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-zinc-700 transition-colors"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider text-zinc-400 mb-1.5">Access Cryptokey</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-zinc-950/60 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-zinc-700 transition-colors"
            />
          </div>

          {error && (
            <div className="text-xs text-red-400 bg-red-950/20 border border-red-900/30 rounded-lg p-3 text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-zinc-100 hover:bg-zinc-200 disabled:bg-zinc-800 text-zinc-950 text-xs font-bold uppercase tracking-widest py-3.5 rounded-lg transition-all cursor-pointer"
          >
            {loading ? 'Decrypting Connection...' : 'Authorize Session'}
          </button>
        </form>
      </div>
    </div>
  );
};