import React, { useCallback, useState } from 'react';
import { networkUtility } from '../api/NetworkUtils';
import { useApp } from '../hooks/useApp';
import { useCoupleRealtime } from '../hooks/useCoupleRealtime';
import { JAM_SESSION_TYPES, groupSessionsByType } from '../utils/jamSessions';

/* ============================================================================
   1. LIVE WAVE ANIMATION DECK COMPONENT
   ============================================================================ */
function MusicWaveGlow({ isActive, icon }) {
  return (
    <div className="relative w-16 h-16 rounded-full flex items-center justify-center border border-white/10 bg-neutral-950/60 shadow-inner group shrink-0">
      {/* Outer Pulse Waves (Only active when session is running) */}
      {isActive && (
        <>
          <div className="absolute inset-0 rounded-full bg-vibe-accent/10 animate-ping [animation-duration:2s]" />
          <div className="absolute inset-1 rounded-full bg-vibe-accent/5 animate-pulse [animation-duration:3s]" />
        </>
      )}

      {/* Internal Equalizer Bar Array */}
      <div className="absolute inset-0 flex items-center justify-center gap-[3px]">
        {[1, 2, 3, 4, 5].map((bar) => (
          <div
            key={bar}
            className={`w-[2px] bg-vibe-accent/30 rounded-full transition-all duration-300 ${
              isActive ? 'animate-[wave_1.2s_ease-in-out_infinite]' : 'h-1'
            }`}
            style={{
              animationDelay: `${bar * 0.15}s`,
              height: isActive ? undefined : '4px'
            }}
          />
        ))}
      </div>

      {/* Center Fixed Icon Display */}
      <span className="text-xl relative z-10 select-none filter drop-shadow-md group-hover:scale-110 transition-transform">
        {icon}
      </span>

      {/* Embedded Global CSS Injector for Wave Keyframes */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes wave {
          0%, 100% { height: 6px; }
          50% { height: 28px; }
        }
      `}} />
    </div>
  );
}

/* ============================================================================
   2. REFACTORED SESSION ENGINE CORE (UPDATED FOR ZERO VERTICAL GROWTH)
   ============================================================================ */
function SessionSlot({ type, session, userId, coupleId, onMutate }) {
  const [isExpanding, setIsExpanding] = useState(false);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const isMine = session?.creator_id === userId;

  const start = async (e) => {
    e.preventDefault();
    const t = title.trim() || type.label;
    const u = url.trim();
    if (!u || !coupleId || !userId) return;
    setBusy(true);
    try {
      await networkUtility.startJamSession(coupleId, userId, type.id, t, u);
      setTitle('');
      setUrl('');
      setIsExpanding(false);
      onMutate();
    } catch (err) {
      alert(err.message || 'Could not start session');
    } finally {
      setBusy(false);
    }
  };

  const end = async () => {
    if (!session?.id) return;
    setBusy(true);
    await networkUtility.endJamSession(session.id);
    onMutate();
    setBusy(false);
  };

  return (
    <div className="relative p-5 rounded-2xl border border-white/5 bg-gradient-to-b from-neutral-900/60 to-neutral-950/40 transition-all duration-300 hover:border-white/10 min-h-[106px] flex items-center">
      
      {/* Default Inline Layout Row (Fades out when form overlay is hot) */}
      <div className={`flex items-center justify-between gap-4 w-full transition-opacity duration-200 ${isExpanding ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <div className="flex items-center gap-4">
          <MusicWaveGlow isActive={!!session} icon={type.icon} />
          <div>
            <h4 className="text-sm font-sans font-black tracking-wider uppercase text-neutral-200">
              {type.label}
            </h4>
            <p className="text-[10px] text-neutral-500 font-mono tracking-tight mt-0.5">
              {session ? (isMine ? '⚡ Broadcasting live' : '📡 Incoming beam') : type.hint}
            </p>
          </div>
        </div>

        <div className="max-w-xs sm:max-w-md flex justify-end items-center relative z-20">
          {session ? (
            <div className="flex items-center gap-3 p-1.5 px-3 rounded-xl bg-black/40 border border-white/5 shadow-inner">
              <div className="truncate text-right hidden sm:block max-w-[120px]">
                <span className="block text-[8px] uppercase tracking-widest font-mono text-vibe-accent/60 font-black truncate">
                  {isMine ? 'Your link' : 'Partner Link'}
                </span>
                <span className="text-xs font-sans font-bold text-neutral-300 truncate block">
                  {session.displayTitle}
                </span>
              </div>
              
              <div className="flex items-center gap-1.5 shrink-0">
                <a
                  href={session.url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-widest font-black bg-vibe-accent text-black shadow-[0_0_15px_rgba(var(--vibe-accent-rgb),0.2)] hover:brightness-110 transition-all"
                >
                  Join
                </a>
                <button
                  type="button"
                  disabled={busy}
                  onClick={end}
                  className="p-1. text-neutral-500 hover:text-red-400 transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsExpanding(true)}
              className="px-4 py-2 rounded-xl text-[10px] font-sans font-black uppercase tracking-widest border border-white/5 text-neutral-400 bg-neutral-900/20 hover:bg-neutral-900/60 hover:text-vibe-accent hover:border-vibe-accent/20 transition-all active:scale-95"
            >
              + Initialize
            </button>
          )}
        </div>
      </div>

      {/* FIXED OVERLAY PANEL: Floats cleanly inside the bounds without resizing anything */}
      {isExpanding && !session && (
        <form 
          onSubmit={start} 
          className="absolute inset-0 bg-neutral-950 rounded-2xl border border-vibe-accent/20 p-4 flex items-center justify-between gap-4 z-30 animate-[slideIn_0.2s_ease-out]"
        >
          {/* Inputs Section */}
          <div className="flex-1 flex gap-3 min-w-0">
            {/* Target URL */}
            <div className="flex-1 min-w-0 flex flex-col gap-0.5">
              <label className="text-[8px] font-mono font-bold tracking-wider uppercase text-neutral-500 px-1">
                Link Endpoint
              </label>
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder={type.placeholder || 'Paste target stream link...'}
                required
                autoFocus
                className="w-full bg-neutral-900 border border-white/5 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-vibe-accent/40 shadow-inner truncate"
              />
            </div>

            {/* Optional Tag (Hidden on mobile to ensure zero cramming) */}
            <div className="w-1/3 hidden sm:flex flex-col gap-0.5">
              <label className="text-[8px] font-mono font-bold tracking-wider uppercase text-neutral-500 px-1">
                Tag (Optional)
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Chill"
                className="w-full bg-neutral-900 border border-white/5 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-white/20 shadow-inner"
              />
            </div>
          </div>

          {/* Core Controls Section */}
          <div className="flex items-center gap-1.5 shrink-0 pt-3">
            <button
              type="button"
              onClick={() => {
                setIsExpanding(false);
                setUrl('');
                setTitle('');
              }}
              className="px-3 py-2 rounded-xl text-[10px] uppercase tracking-widest font-black text-neutral-400 hover:text-neutral-200 transition-colors"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={busy}
              className="px-4 py-2 rounded-xl text-[10px] uppercase tracking-widest font-black bg-vibe-accent text-black hover:brightness-110 shadow-md"
            >
              {busy ? '...' : 'Launch'}
            </button>
          </div>
        </form>
      )}

      {/* CSS Animations Injector */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
      `}} />
    </div>
  );
}

/* ============================================================================
   3. STRUCTURAL SEGMENT ROUTER COMPONENT
   ============================================================================ */
export function JamSessions() {
  const { user, coupleId } = useApp();
  const [activeTab, setActiveTab] = useState(JAM_SESSION_TYPES[0]?.id || '');
  const [byType, setByType] = useState(() =>
    Object.fromEntries(JAM_SESSION_TYPES.map((t) => [t.id, null]))
  );

  const load = useCallback(async () => {
    const rows = await networkUtility.getActiveJamSessions(coupleId);
    setByType(groupSessionsByType(rows));
  }, [coupleId]);

  useCoupleRealtime(coupleId, 'link_drops', load, {
    userIdField: 'creator_id',
    currentUserId: user?.id,
  });

  const activeTypeConfig = JAM_SESSION_TYPES.find((t) => t.id === activeTab);

  return (
    <div className="w-full rounded-2xl flex flex-col justify-between shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden relative select-none bg-[#121214] p-6">
      
      {/* Rig Control Panel Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-4 mb-5 gap-4">
        <div>
          <h3 className="text-sm font-sans font-black text-neutral-200 tracking-wider uppercase flex items-center gap-2">
            The Jam Deck <span className="text-xs text-vibe-accent animate-pulse">📡</span>
          </h3>
          <p className="text-[10px] font-mono tracking-tight text-neutral-500 mt-0.5">
            Synchronized link tunnels — one continuous broadcast link per system
          </p>
        </div>

        {/* Custom Segment Tab Rail Bar */}
        <div className="flex p-0.5 rounded-xl bg-black/40 border border-white/5 shrink-0 self-start sm:self-auto">
          {JAM_SESSION_TYPES.map((type) => {
            const hasLiveSession = !!byType[type.id];
            const isCurrent = activeTab === type.id;
            
            return (
              <button
                key={type.id}
                type="button"
                onClick={() => setActiveTab(type.id)}
                className={`relative px-3 py-1.5 rounded-lg text-[10px] font-sans font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                  isCurrent 
                    ? 'bg-neutral-800 text-vibe-accent shadow-md' 
                    : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                <span>{type.icon}</span>
                <span className="hidden sm:inline">{type.label}</span>
                
                {/* Visual Live Beacon Dot Indicator over Segment button */}
                {hasLiveSession && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] absolute top-1 right-1 sm:static shrink-0 animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Structural Tab Blade Shell Area */}
      <div className="relative min-h-[106px] flex flex-col justify-center">
        {activeTypeConfig && (
          <SessionSlot
            key={activeTypeConfig.id}
            type={activeTypeConfig}
            session={byType[activeTypeConfig.id]}
            userId={user?.id}
            coupleId={coupleId}
            onMutate={load}
          />
        )}
      </div>

    </div>
  );
}