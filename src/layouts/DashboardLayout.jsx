import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { networkUtility } from '../api/NetworkUtils';
import { useApp } from '../hooks/useApp';
import { useMood } from '../context/MoodContext'; // Injecting the global unified mood context
import { SignalFlash } from '../components/SignalFlash';
import { moodPairLabel } from '../utils/vibeTheme';
import { MoodPicker } from '../components/MoodPicker';
import { motion } from 'framer-motion';

// Premium UI icons
import { FiPower, FiHeart } from 'react-icons/fi';

export default function DashboardLayout({ children }) {
  const navigate = useNavigate();
  const { user, coupleId } = useApp();
  
  // Consume shared state straight from context — no redundant DB reads or subscriptions here
  const { mine: myMood, theirs: partnerMood } = useMood();
  
  const [signal, setSignal] = useState(null);
  const [partnerName, setPartnerName] = useState('Partner');
  const [myName, setMyName] = useState('You');

  // Fetch names on initial load mount
  useEffect(() => {
    const fetchNames = async () => {
      if (!coupleId) return;
      const { partnerName, myName } = await networkUtility.getNamesFromCouple(coupleId, user?.id);
      setPartnerName(partnerName);
      setMyName(myName);
    };
    fetchNames();
  }, [coupleId, user?.id]);

  // Listen exclusively for inbound real-time signals
  useEffect(() => {
    if (!coupleId) return;
    const unsubscribe = networkUtility.listenForIncomingSignals(coupleId, (payload) => {
      if (payload?.from === user?.id) return;
      setSignal(payload);
    });
    return unsubscribe;
  }, [coupleId, user?.id]);

  const handleSignOut = async () => {
    await networkUtility.signOut();
    navigate('/login', { replace: true });
  };

  return (
    <div
      className="h-dvh max-h-dvh overflow-hidden text-vibe-text font-mono transition-[background] duration-1000 flex flex-col"
      style={{ background: 'var(--vibe-gradient)', backgroundAttachment: 'fixed' }}
    >
      {/* ================= EDITORIAL MASTHEAD HEADER ================= */}
      <header className="w-full shrink-0 z-50 backdrop-blur-md border-b-4 border-double border-vibe-text/20 bg-transparent pt-4 pb-3 md:pt-6 md:pb-4 px-4">

        <div className="max-w-6xl mx-auto grid grid-cols-[1fr_auto_1fr] items-center gap-4">

          {/* Left Spacer */}
          <div className="hidden md:block" />

          {/* Center Title */}
          <div className="text-center min-w-0 flex flex-col items-center">

            <h1 className="text-xl md:text-3xl font-black tracking-wider uppercase border-b border-vibe-text/10 pb-2 px-6 whitespace-normal break-words text-center leading-snug max-w-full">
              {myName}
              <span className="text-vibe-text/30 font-light italic mx-3 lowercase">&amp;</span>
              {partnerName}
            </h1>

            <p className="text-[10px] md:text-[11px] uppercase tracking-[0.25em] text-vibe-text/60 mt-2.5 font-bold transition-all duration-500">
              {moodPairLabel(myMood, partnerMood)}
            </p>

          </div>

          {/* Right Action Block */}
          <div className="w-full flex justify-center md:justify-end items-center mt-2 md:mt-0">

            <button
              type="button"
              onClick={handleSignOut}
              title="Sign Out"
              className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-red-400 hover:text-red-500 bg-red-500/5 hover:bg-red-500/10 px-4 py-2 rounded-full border border-red-500/20 hover:border-red-500/40 transition-all duration-300 group"
            >
              <FiPower className="text-xs group-hover:rotate-45 transition-transform duration-300" />
              <span>Bye Bye</span>
            </button>

          </div>

        </div>
      </header>

      {/* ================= MAIN CONTENT INJECTOR ================= */}
      <main className="flex-1 min-h-0 w-full max-w-[98vw] mx-auto px-3 md:px-4 py-2 md:py-3 pb-28 md:pb-24 overflow-hidden">
        {children}
      </main>

      {/* ================= MOBILE STICKY NAVIGATION HUB ================= */}
      <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-6 md:hidden pointer-events-none">
        <div className="pointer-events-auto bg-black/40 backdrop-blur-xl border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.5)] rounded-2xl px-5 py-4 flex items-center justify-between w-full max-w-sm">
          
          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-widest text-vibe-text/40 font-bold">Current Vibe</span>
            <span className="text-xs font-bold text-vibe-text/80 mt-0.5 truncate max-w-[140px] transition-colors duration-500">
              {myMood}
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 hover:border-white/20 active:scale-95 transition-all rounded-xl px-3.5 py-2">
            <div className="relative flex items-center justify-center text-pink-400">
              <FiHeart className="fill-current text-sm animate-pulse" />
            </div>
            <span className="text-[10px] uppercase tracking-wider text-vibe-text/90 font-bold pl-1">
              Moods
            </span>
          </div>

        </div>
      </div>

      {/* ================= FLOATING LIQUID DECK CORNER (BOTTOM RIGHT) ================= */}
      <motion.div 
        animate={{
          borderRadius: [
            "85% 0px 0px 0px / 85% 0px 0px 0px",
            "95% 0px 0px 0px / 65% 0px 0px 0px",
            "60% 0px 0px 0px / 95% 0px 0px 0px",
            "85% 0px 0px 0px / 85% 0px 0px 0px"
          ]
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="fixed bottom-0 right-0 bg-vibe-accent/25 backdrop-blur-md pt-8 pl-8 lg:pt-10 lg:pl-10 xl:pt-12 xl:pl-12 z-[60] pointer-events-auto border-t border-l border-white/10 shadow-[-10px_-10px_30px_rgba(0,0,0,0.15)] transition-colors duration-1000"
      >
        {/* Completely controlled component instance decoupled from local databases */}
        <MoodPicker />
      </motion.div>

      {/* Active Signal Core Overlay */}
      <SignalFlash signal={signal} onDone={() => setSignal(null)} />
    </div>
  );
}