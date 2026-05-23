import React, { useEffect } from 'react';

export function SignalFlash({ signal, onDone }) {
  useEffect(() => {
    if (!signal) return;
    const timer = setTimeout(onDone, 2800);
    return () => clearTimeout(timer);
  }, [signal, onDone]);

  if (!signal) return null;

  const label = signal.message || signal.label || 'Signal received';
  const color = signal.color || 'var(--vibe-accent)';

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center">
      <div
        className="absolute inset-0 animate-pulse"
        style={{ background: `radial-gradient(circle at center, ${color}44 0%, transparent 70%)` }}
      />
      <div
        className="relative px-8 py-6 rounded-2xl border border-white/20 font-mono text-center animate-bounce"
        style={{ background: color, color: '#0a0a0a' }}
      >
        <p className="text-[10px] uppercase tracking-[0.3em] opacity-70 mb-2">Incoming pulse</p>
        <p className="text-lg font-bold tracking-wide">{label}</p>
      </div>
    </div>
  );
}
