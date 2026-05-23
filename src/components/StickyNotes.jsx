import React, { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { networkUtility } from '../api/NetworkUtils';
import { useApp } from '../hooks/useApp';
import { useCoupleRealtime } from '../hooks/useCoupleRealtime';

/* ============================================================================
   1. STICKY NOTES TRAY (MODAL OVERLAY DISPLAY STACK FROM PARTNER)
   ============================================================================ */
export function StickyNotesTray() {
  const { user, coupleId } = useApp();
  const [notes, setNotes] = useState([]);

  const load = useCallback(async () => {
    if (!coupleId || !user?.id) return;
    const rows = await networkUtility.getActiveIncomingNotes(coupleId, user.id);
    setNotes(rows || []);
  }, [coupleId, user?.id]);

  // Realtime hook keeping both client windows completely synchronized
  useCoupleRealtime(coupleId, 'sticky_notes', load, {
    userIdField: 'author_id',
    currentUserId: user?.id,
  });

  const dismiss = async (id) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    await networkUtility.clearStickyNote(id);
  };

  if (!notes || notes.length === 0) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[999] flex items-center justify-center pointer-events-none select-none">
        
        {/* Full Screen Blurred Backdrop Guard Layer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/75 backdrop-blur-md pointer-events-auto"
        />

        {/* Note Stack Engine Stage Wrapper */}
        <div className="relative w-80 h-80 flex items-center justify-center pointer-events-auto">
          <AnimatePresence mode="popLayout">
            {notes.map((note, index) => {
              const stackOffset = index * -6; 
              const rotationOffset = (index % 2 === 0 ? 1.5 : -1.5) * index; 

              return (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, scale: 0.8, y: -40, rotate: 0 }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1, 
                    y: stackOffset, 
                    rotate: rotationOffset,
                    zIndex: 100 - index 
                  }}
                  exit={{ 
                    opacity: 0,
                    y: 400, 
                    scale: 0.65, 
                    rotate: index % 2 === 0 ? -12 : 12, 
                    skewX: index % 2 === 0 ? 15 : -15, 
                    filter: 'blur(2px)'
                  }}
                  transition={{ 
                    type: 'spring', 
                    stiffness: 140, 
                    damping: 18,
                    mass: 1.1 
                  }}
                  className="absolute w-full aspect-square rounded-2xl p-6 flex flex-col justify-between border border-white/10"
                  style={{
                    background: 'linear-gradient(135deg, #1e1e24 0%, #141416 100%)',
                    boxShadow: '0 30px 60px -12px rgba(0,0,0,0.8), inset 0 1px 1px rgba(255,255,255,0.1)'
                  }}
                >
                  <div className="flex flex-col flex-1">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-3">
                      <span className="text-[10px] uppercase font-black tracking-[0.2em] text-vibe-accent drop-shadow-[0_0_8px_rgba(var(--vibe-accent-rgb),0.4)]">
                        📌 Partner Note
                      </span>
                      <div className="w-1.5 h-1.5 rounded-full bg-vibe-accent/30 shadow-inner" />
                    </div>
                    
                    <p className="text-sm font-sans font-semibold text-neutral-200 leading-relaxed overflow-y-auto max-h-[11rem] pr-1 scrollbar-thin">
                      {note.content}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-white/5 mt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => dismiss(note.id)}
                      className="px-4 py-1.5 rounded-xl bg-neutral-800 text-neutral-200 hover:bg-neutral-700 text-[10px] uppercase font-bold tracking-widest transition-all shadow-md active:scale-95 border border-white/5"
                    >
                      Dismiss Note
                    </button>
                  </div>

                  {/* Bottom-Right Curled Aesthetic Page Overlay Accent */}
                  <div className="absolute bottom-0 right-0 w-8 h-8 pointer-events-none bg-gradient-to-br from-transparent via-black/10 to-black/40 rounded-br-2xl border-r border-b border-white/5" />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

      </div>
    </AnimatePresence>
  );
}


/* ============================================================================
   2. STICKY NOTE COMPOSER (SENDING ENGINE & PARCHMENT LAYOUT)
   ============================================================================ */
export function StickyNoteComposer() {
  const { user, coupleId } = useApp();
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [flingState, setFlingState] = useState('idle'); // 'idle' | 'flinging'

  const send = async (e) => {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed || !coupleId || !user?.id || sending || flingState === 'flinging') return;
    
    setSending(true);
    try {
      const res = await networkUtility.sendStickyNote(coupleId, user.id, trimmed);
      
      if (res || res?.status === 201) {
        setFlingState('flinging');
        
        setTimeout(() => {
          setContent('');
          setFlingState('idle');
        }, 850);
      }
    } catch (err) {
      console.error("Failed to send note:", err);
    } finally {
      setSending(false);
    }
  };

  const cardVariants = {
    idle: { 
      opacity: 1, 
      scale: 1, 
      x: 0, 
      y: 0, 
      rotate: 0, 
      skewY: 0,
      filter: 'blur(0px)'
    },
    flinging: { 
      opacity: 0,
      x: 450,        
      y: -100,       
      scale: 0.4,    
      rotate: 30,    
      skewY: -20,    
      filter: 'blur(2px)',
      transition: {
        type: 'spring',
        stiffness: 90,
        damping: 14,
        mass: 0.8
      }
    }
  };

  return (
    <div className="w-full max-w-xs mx-auto select-none relative">
      
      {/* Underlying Visual Pile Deck Layer 2 */}
      <div 
        className="absolute inset-x-3 bottom-4 top-8 rounded-2xl rotate-2 translate-y-2 border border-white/5 shadow-md z-0"
        style={{ background: 'linear-gradient(135deg, #1a1a1c 0%, #111112 100%)', opacity: 0.4 }}
      />
      
      {/* Underlying Visual Pile Deck Layer 1 */}
      <div 
        className="absolute inset-x-1.5 bottom-5 top-7 rounded-2xl -rotate-1 translate-y-1 border border-white/5 shadow-lg z-10"
        style={{ background: 'linear-gradient(135deg, #1e1e22 0%, #131315 100%)', opacity: 0.7 }}
      />

      {/* Main Structural Form Interactivity Node */}
      <motion.div
        variants={cardVariants}
        animate={flingState}
        initial="idle"
        className="relative w-full aspect-square rounded-2xl p-6 flex flex-col justify-between border border-white/10 z-20"
        style={{
          background: 'linear-gradient(135deg, #222227 0%, #161619 100%)',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.7), inset 0 1px 1px rgba(255,255,255,0.1)'
        }}
      >
        <form onSubmit={send} className="h-full flex flex-col justify-between w-full pointer-events-auto">
          
          <div className="flex flex-col w-full">
            <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-3">
              <span className="text-[10px] uppercase font-black tracking-[0.2em] text-neutral-400">
                📝 Write Sticky Note
              </span>
              <div className="w-1.5 h-1.5 rounded-full bg-neutral-700 shadow-inner" />
            </div>

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={sending || flingState === 'flinging'}
              rows={4}
              placeholder="Type something sweet, urgent, or silly for them..."
              className="w-full bg-transparent text-neutral-200 placeholder-neutral-600 text-xs font-sans font-semibold resize-none focus:outline-none leading-relaxed h-[10rem] pr-1 scrollbar-thin"
            />
          </div>

          <div className="pt-2 border-t border-white/5 w-full flex items-center justify-between">
            <span className="text-[9px] font-mono font-bold text-neutral-600 uppercase tracking-wider">
              {content.trim().length} chars
            </span>
            
            <button
              type="submit"
              disabled={sending || !content.trim() || flingState === 'flinging'}
              className={`px-4 py-1.5 rounded-xl text-[10px] uppercase font-black tracking-widest transition-all active:scale-95 shadow-md ${
                !content.trim() || flingState === 'flinging'
                  ? 'bg-neutral-800 text-neutral-600 cursor-not-allowed shadow-none'
                  : 'bg-vibe-accent text-black font-extrabold hover:brightness-110 shadow-[0_0_15px_rgba(var(--vibe-accent-rgb),0.25)]'
              }`}
            >
              {sending ? 'Sending...' : 'Pin Note'}
            </button>
          </div>
        </form>

        {/* Bottom-Right Curled Aesthetic Page Overlay Accent */}
        <div className="absolute bottom-0 right-0 w-8 h-8 pointer-events-none bg-gradient-to-br from-transparent via-black/20 to-black/50 rounded-br-2xl border-r border-b border-white/5" />
      </motion.div>

    </div>
  );
}