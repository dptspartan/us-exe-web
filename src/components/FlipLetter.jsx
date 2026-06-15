import React, { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { networkUtility } from '../api/NetworkUtils';
import { useApp } from '../hooks/useApp';
import { useCoupleRealtime } from '../hooks/useCoupleRealtime';
import { useMood } from '../context/MoodContext';

import { FiEdit2, FiCheck, FiRotateCw } from 'react-icons/fi';

export function FlipLetter() {
  const { user, coupleId, partnerId } = useApp();
  const { mine: myMood, theirs: partnerMood } = useMood();

  const [flipped, setFlipped] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [mine, setMine] = useState('');
  const [theirs, setTheirs] = useState('');
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const letters = await networkUtility.getFlipLetters(coupleId);
    const myLetter = letters.find((l) => l.author_id === user?.id);
    const partnerLetter = letters.find((l) => l.author_id === partnerId);
    setMine(myLetter?.content || '');
    setDraft(myLetter?.content || '');
    setTheirs(partnerLetter?.content || '');
  }, [coupleId, user?.id, partnerId]);

  useCoupleRealtime(coupleId, 'flip_letters', load, {
    userIdField: 'author_id',
    currentUserId: user?.id,
  });

  const handleSave = async (e) => {
    if (e) e.stopPropagation();
    if (!coupleId || !user?.id || saving) return;
    
    setSaving(true);
    try {
      await networkUtility.updateFlipLetter(coupleId, user.id, draft);
      setMine(draft);
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update letter side:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleCardClick = () => {
    if (isEditing) return;
    setFlipped((prev) => !prev);
  };

  return (
    <div className="h-full w-full flex items-start justify-center overflow-visible select-none">
      {/* Premium scrollbar styling with a completely transparent track */}
      <style dangerouslySetInnerHTML={{__html: `
        .vibe-minimal-scroll::-webkit-scrollbar {
          width: 3px;
          height: 3px;
        }
        .vibe-minimal-scroll::-webkit-scrollbar-track {
          background: transparent !important;
        }
        .vibe-minimal-scroll::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2) !important;
          border-radius: 99px !important;
        }
        .vibe-minimal-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.4) !important;
        }
        .vibe-minimal-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
          -webkit-overflow-scrolling: touch;
        }
      `}} />

      <div
        style={{ perspective: '1200px' }}
        className="h-full max-h-[min(26rem,calc(100dvh-10rem))] w-auto aspect-[320/416] max-w-[clamp(14rem,18vw,20rem)] relative overflow-visible shrink-0"
      >
        <div
          onClick={handleCardClick}
          className="absolute inset-0 transition-transform duration-700 ease-out preserve-3d cursor-pointer"
          style={{
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            transformStyle: 'preserve-3d'
          }}
        >
          
          {/* ======================= FRONT CARD SIDE: USER'S NOTE ======================= */}
          <div
            className="absolute inset-0 w-full h-full rounded-3xl border-2 border-white/10 p-6 flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.4)] transition-all duration-300 overflow-hidden"
            style={{ 
              backfaceVisibility: 'hidden',
              background: 'linear-gradient(135deg, rgba(10,10,10,0.95), var(--vibe-accent-fallback, rgba(255,255,255,0.05)))',
              backgroundColor: 'var(--vibe-bg, #171717)',
              // When flipped, disable mouse interactions on this face so it doesn't block the back face
              pointerEvents: flipped ? 'none' : 'auto',
              zIndex: flipped ? 0 : 10
            }}
          >
            <div className="w-full h-full flex flex-col justify-between relative z-10">
              {/* Front Header */}
              <div className="flex items-center justify-between w-full mb-3">
                <div className="flex flex-col">
                  <span className="text-[10px] tracking-[0.2em] uppercase font-black text-vibe-text/40">My Side</span>
                  <span className="text-xs font-bold text-vibe-text/80 mt-0.5">💌 To Someone Special</span>
                </div>
                
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isEditing) {
                      handleSave(e);
                    } else {
                      setIsEditing(true);
                    }
                  }}
                  disabled={saving}
                  className={`p-2 rounded-xl border flex items-center gap-1.5 transition-all text-[10px] tracking-wider uppercase font-bold ${
                    isEditing
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30'
                      : 'bg-white/5 text-vibe-text/70 border-white/10 hover:bg-white/10'
                  }`}
                >
                  {isEditing ? (
                    <>
                      <FiCheck className="text-xs animate-bounce" />
                      <span>Done</span>
                    </>
                  ) : (
                    <>
                      <FiEdit2 className="text-xs" />
                      <span>Edit</span>
                    </>
                  )}
                </button>
              </div>

              {/* Core Body Container Area */}
              <div className="flex-1 w-full flex flex-col justify-between mt-2 overflow-hidden">
                {isEditing ? (
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    placeholder="Tell them something..."
                    className="w-full flex-1 bg-black/40 text-vibe-text border border-white/10 rounded-xl p-4 text-xs font-sans font-medium focus:outline-none focus:border-vibe-accent/50 resize-none leading-relaxed transition-colors duration-200 vibe-minimal-scroll"
                  />
                ) : (
                  <div className="w-full flex-1 flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto pr-2 text-xs font-sans font-medium text-vibe-text/90 whitespace-pre-wrap leading-relaxed min-h-0 vibe-minimal-scroll">
                      {mine.trim() ? mine : (
                        <span className="italic text-vibe-text/30 tracking-wide block pt-4 text-center">
                          Tell them something...
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-center gap-1.5 text-[9px] font-black tracking-widest text-vibe-text/30 uppercase mt-4 pt-2 border-t border-white/5">
                      <FiRotateCw className="animate-spin" style={{ animationDuration: '8s' }} />
                      <span>Tap Card To Flip</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="absolute -bottom-4 -right-2 text-white/5 text-8xl pointer-events-none font-sans font-black select-none z-0">
              ME
            </div>
          </div>

          {/* ======================= BACK CARD SIDE: PARTNER'S NOTE ======================= */}
          <div
            className="absolute inset-0 w-full h-full rounded-3xl border-2 p-6 flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-300 overflow-hidden"
            style={{ 
              backfaceVisibility: 'hidden', 
              transform: 'rotateY(180deg)',
              background: 'linear-gradient(135deg, #0a0a0a, var(--partner-vibe-accent-fallback, rgba(244,63,94,0.15)))',
              borderColor: 'var(--partner-vibe-accent, rgba(244,63,94,0.3))',
              backgroundColor: 'var(--partner-vibe-bg, #0f0f0f)',
              // Ignore pointers when flipped away, capture seamlessly when active
              pointerEvents: flipped ? 'auto' : 'none',
              zIndex: flipped ? 10 : 0
            }}
          >
            {/* Keeping it backward safe on the 3D local matrix axis */}
            <div className="w-full h-full flex flex-col justify-between relative z-10" style={{ transform: 'translateZ(1px)' }}>
              
              {/* Back Header */}
              <div className="flex flex-col items-start mb-3 border-b border-white/5 pb-3 w-full">
                <span className="text-[10px] tracking-[0.2em] uppercase font-black text-white/40">Their Side</span>
                <span className="text-xs font-bold text-white mt-0.5">❤️ Words From Your Favorite</span>
              </div>

              {/* Core Body Container Area */}
              <div className="flex-1 w-full flex flex-col justify-between mt-2 overflow-hidden">
                <div className="flex-1 overflow-y-auto pr-2 text-xs font-sans font-medium text-white/90 whitespace-pre-wrap leading-relaxed min-h-0 vibe-minimal-scroll">
                  {theirs.trim() ? theirs : (
                    <div className="h-full flex flex-col items-center justify-center text-center px-4 py-8">
                      <span className="italic text-white/40 tracking-wide text-xs block">
                        Have patience...
                      </span>
                      <span className="text-[10px] text-white/30 font-mono uppercase mt-2 tracking-wider">
                        They are still gathering their thoughts
                      </span>
                    </div>
                  )}
                </div>

                {/* Visual Interface Navigation Hint */}
                <div className="flex items-center justify-center gap-1.5 text-[9px] font-black tracking-widest text-white/40 uppercase mt-4 pt-2 border-t border-white/5">
                  <FiRotateCw />
                  <span>Tap to view your side</span>
                </div>
              </div>

            </div>

            {/* Background Aesthetic Watermark */}
            <div className="absolute -bottom-4 -right-2 text-white/5 text-8xl pointer-events-none font-sans font-black select-none z-0">
              YOU
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}