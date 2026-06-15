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

const NOTE_STACK_LAYERS = [
  {
    rotate: -5.5,
    x: -8,
    y: 10,
    opacity: 0.32,
    gradient: 'linear-gradient(135deg, #18181a 0%, #101012 100%)',
  },
  {
    rotate: 4,
    x: 7,
    y: 6,
    opacity: 0.5,
    gradient: 'linear-gradient(135deg, #1c1c20 0%, #121214 100%)',
  },
  {
    rotate: -2,
    x: -3,
    y: 3,
    opacity: 0.72,
    gradient: 'linear-gradient(135deg, #202024 0%, #151518 100%)',
  },
];

const NOTE_CARD_SHADOW =
  '0 25px 50px -12px rgba(0,0,0,0.7), inset 0 1px 1px rgba(255,255,255,0.1)';

function NoteCardShell({ children, className = '', style = {} }) {
  return (
    <div
      className={`absolute inset-0 rounded-2xl border border-white/10 overflow-hidden flex flex-col ${className}`}
      style={{
        background: 'linear-gradient(135deg, #222227 0%, #161619 100%)',
        boxShadow: NOTE_CARD_SHADOW,
        ...style,
      }}
    >
      {children}
      <div className="absolute bottom-0 right-0 w-8 h-8 pointer-events-none bg-gradient-to-br from-transparent via-black/20 to-black/50 rounded-br-2xl border-r border-b border-white/5" />
    </div>
  );
}

export function StickyNoteComposer() {
  const { user, coupleId } = useApp();
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [flyingNote, setFlyingNote] = useState(null);

  const send = async (e) => {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed || !coupleId || !user?.id || sending || flyingNote) return;

    setSending(true);
    try {
      const res = await networkUtility.sendStickyNote(coupleId, user.id, trimmed);
      if (res || res?.status === 201) {
        setFlyingNote({ text: trimmed, id: Date.now() });
        setContent('');
      }
    } catch (err) {
      console.error('Failed to send note:', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="relative w-[clamp(11rem,14vw,18rem)] shrink-0 self-start select-none pb-1">
      {/* Stage sized to card; stack can peek below without stretching */}
      <div className="relative w-full aspect-square">

        {/* Decorative stack peeking from behind (bottom-anchored + rotated) */}
        {NOTE_STACK_LAYERS.map((layer, i) => (
          <div
            key={i}
            className="absolute inset-0 rounded-2xl border border-white/5 shadow-md origin-bottom"
            style={{
              zIndex: i + 1,
              opacity: layer.opacity,
              background: layer.gradient,
              transform: `translate(${layer.x}px, ${layer.y}px) rotate(${layer.rotate}deg)`,
            }}
          />
        ))}

        {/* Active composer — stays put; footer + Pin Note live inside the card */}
        <NoteCardShell className="z-20 origin-bottom" style={{ transform: 'rotate(0.75deg)' }}>
          <form
            onSubmit={send}
            className="relative z-10 flex flex-col h-full min-h-0 p-5 pointer-events-auto"
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2 shrink-0">
              <span className="text-[10px] uppercase font-black tracking-[0.2em] text-neutral-400">
                📝 Write Sticky Note
              </span>
              <div className="w-1.5 h-1.5 rounded-full bg-neutral-700 shadow-inner" />
            </div>

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={sending || !!flyingNote}
              placeholder="Type something sweet, urgent, or silly for them..."
              className="flex-1 min-h-0 w-full bg-transparent text-neutral-200 placeholder-neutral-600 text-xs font-sans font-semibold resize-none focus:outline-none leading-relaxed py-1 pr-1 scrollbar-thin"
            />

            <div className="shrink-0 pt-2 mt-2 border-t border-white/5 flex items-center justify-between gap-2">
              <span className="text-[9px] font-mono font-bold text-neutral-600 uppercase tracking-wider">
                {content.trim().length} chars
              </span>
              <button
                type="submit"
                disabled={sending || !content.trim() || !!flyingNote}
                className={`px-4 py-1.5 rounded-xl text-[10px] uppercase font-black tracking-widest transition-all active:scale-95 shadow-md shrink-0 ${
                  !content.trim() || flyingNote
                    ? 'bg-neutral-800 text-neutral-600 cursor-not-allowed shadow-none'
                    : 'bg-vibe-accent text-black font-extrabold hover:brightness-110 shadow-[0_0_15px_rgba(var(--vibe-accent-rgb),0.25)]'
                }`}
              >
                {sending ? 'Sending...' : 'Pin Note'}
              </button>
            </div>
          </form>
        </NoteCardShell>

        {/* Fly-away layer — clipped here only so the page never scrolls or shifts */}
        <div className="absolute inset-0 z-40 overflow-hidden pointer-events-none">
          <AnimatePresence>
            {flyingNote && (
              <motion.div
                key={flyingNote.id}
                className="absolute inset-0 origin-bottom"
                initial={{ x: 0, y: 0, rotate: 0.75, opacity: 1, scale: 1 }}
                animate={{
                  x: '108%',
                  y: '-48%',
                  rotate: 20,
                  opacity: 0,
                  scale: 0.78,
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
                onAnimationComplete={() => setFlyingNote(null)}
              >
                <NoteCardShell>
                  <div className="flex flex-col h-full min-h-0 p-5">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2 shrink-0">
                      <span className="text-[10px] uppercase font-black tracking-[0.2em] text-neutral-400">
                        📝 Write Sticky Note
                      </span>
                    </div>
                    <p className="flex-1 min-h-0 text-xs font-sans font-semibold text-neutral-200 leading-relaxed overflow-hidden">
                      {flyingNote.text}
                    </p>
                    <div className="shrink-0 pt-2 mt-2 border-t border-white/5 flex justify-end">
                      <span className="px-4 py-1.5 rounded-xl text-[10px] uppercase font-black tracking-widest bg-vibe-accent text-black">
                        Pin Note
                      </span>
                    </div>
                  </div>
                </NoteCardShell>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}