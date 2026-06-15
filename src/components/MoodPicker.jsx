import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMood } from '../context/MoodContext'; // Consuming the unified central context
import { MOOD_OPTIONS, moodEmoji } from '../utils/moods';

export function MoodPicker() {
  // Pull values and controllers straight from the central source of truth
  const { mine, theirs, updateMood, saving } = useMood();
  
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredMood, setHoveredMood] = useState(null);

  const pickMood = async (mood) => {
    if (saving) return;
    setIsOpen(false);
    setHoveredMood(null);
    // Fires the central update (which includes optimistic UI updates and theme syncs)
    await updateMood(mood);
  };

  // Organic custom liquid morph variants for the user's element blob
  const myLiquidVariants = {
    breathing: {
      scale: [1, 1.05, 0.96, 1.02, 1],
      borderRadius: [
        "42% 58% 70% 30% / 45% 45% 55% 55%",
        "55% 45% 52% 48% / 45% 55% 48% 52%",
        "45% 55% 38% 62% / 55% 45% 55% 45%",
        "42% 58% 70% 30% / 45% 45% 55% 55%"
      ],
      transition: { duration: 6, repeat: Infinity, ease: "easeInOut" }
    },
    static: { scale: 0.95, borderRadius: "50%", transition: { duration: 0.3 } }
  };

  // Asymmetric morphing breathing vectors for the partner's node
  const partnerLiquidVariants = {
    breathing: {
      scale: [1, 0.96, 1.03, 0.98, 1],
      borderRadius: [
        "50% 50% 30% 70% / 50% 60% 40% 50%",
        "40% 60% 60% 40% / 52% 45% 55% 48%",
        "60% 40% 42% 58% / 40% 55% 45% 60%",
        "50% 50% 30% 70% / 50% 60% 40% 50%"
      ],
      transition: { duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }
    }
  };

  return (
    <div className="relative flex items-center justify-center w-[clamp(12rem,14vw,16rem)] h-[clamp(12rem,14vw,16rem)] select-none overflow-visible">
      
      {/* SVG Liquid Goo Engine WebGL-like Filter Core */}
      <svg className="absolute w-0 h-0" xmlns="http://www.w3.org/2000/svg" version="1.1">
        <defs>
          <filter id="gooey-fluid">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix 
              in="blur" 
              mode="matrix" 
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9" 
              result="goo" 
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      {/* DYNAMIC FLOATING TOOLTIP DETECTOR */}
      <AnimatePresence>
        {hoveredMood && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: -6 }}
            transition={{ duration: 0.12, ease: "easeOut" }}
            className="absolute top-2 bg-neutral-900/95 border border-white/10 backdrop-blur-sm px-2.5 py-1 rounded-full text-[10px] font-bold text-white tracking-widest uppercase shadow-xl z-50 pointer-events-none"
          >
            {hoveredMood}
          </motion.div>
        )}
      </AnimatePresence>

      {/* COMPONENT POSITIONING CANVAS CONTAINER */}
      <div className="relative flex items-center justify-center w-full h-full overflow-visible z-10 translate-x-4 -translate-y-4">
        
        {/* ================= LAYER 1: THE LIQUID MENU FILTER (BACKDROP BLOB PATHS) ================= */}
        <div style={{ filter: 'url(#gooey-fluid)' }} className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.div
            variants={myLiquidVariants}
            animate={isOpen ? "static" : "breathing"}
            className="absolute w-16 h-16 transform -translate-x-8 bg-vibe-accent"
          />

          {MOOD_OPTIONS.map((mood, index) => {
            const totalOptions = MOOD_OPTIONS.length;
            const totalArc = 260; 
            const startAngle = 50; 
            const step = totalOptions > 1 ? totalArc / (totalOptions - 1) : 0;
            const targetAngle = startAngle + (index * step);
            const angleRadian = targetAngle * (Math.PI / 180);

            const radius = 48;
            const originX = -32;
            const x = Math.round(originX + Math.cos(angleRadian) * radius);
            const y = Math.round(Math.sin(angleRadian) * radius);

            return (
              <motion.div
                key={`liquid-trail-${mood}`}
                initial={{ x: originX, y: 0, scale: 0.8 }}
                animate={isOpen ? { x, y, scale: 0.6 } : { x: originX, y: 0, scale: 0 }}
                transition={{ type: "spring", stiffness: 100, damping: 14 }}
                className="absolute w-8 h-8 rounded-full bg-vibe-accent/60"
              />
            );
          })}
        </div>

        {/* ================= LAYER 2: THE INTERACTIVE TRIGGER FLOATING SELECTORS ================= */}
        {MOOD_OPTIONS.map((mood, index) => {
          const totalOptions = MOOD_OPTIONS.length;
          const totalArc = 260; 
          const startAngle = 50; 
          const step = totalOptions > 1 ? totalArc / (totalOptions - 1) : 0;
          const targetAngle = startAngle + (index * step);
          const angleRadian = targetAngle * (Math.PI / 180);

          const radius = 92;
          const originX = -32; 
          const x = Math.round(originX + Math.cos(angleRadian) * radius);
          const y = Math.round(Math.sin(angleRadian) * radius);

          return (
            <motion.button
              key={mood}
              type="button"
              disabled={saving}
              onClick={() => pickMood(mood)}
              onMouseEnter={() => setHoveredMood(mood)}
              onMouseLeave={() => setHoveredMood(null)}
              initial={{ x: originX, y: 0, scale: 0, opacity: 0 }}
              animate={isOpen ? { 
                x, 
                y, 
                scale: 1, 
                opacity: 1,
                transition: { type: "spring", stiffness: 160, damping: 14, delay: index * 0.012 }
              } : { 
                x: originX, 
                y: 0, 
                scale: 0, 
                opacity: 0,
                transition: { type: "spring", stiffness: 200, damping: 24 }
              }}
              className={`absolute w-9 h-9 rounded-full flex items-center justify-center text-base shadow-xl z-20 cursor-pointer transition-colors duration-200 border border-white/5 focus:outline-none ${
                mine === mood 
                  ? 'bg-vibe-accent text-white ring-4 ring-vibe-accent/30 scale-110' 
                  : 'bg-neutral-800/90 hover:bg-neutral-700 text-white'
              }`}
            >
              <span>{moodEmoji[mood]}</span>
            </motion.button>
          );
        })}

        {/* MY ACTIVE INTERACTIVE CORE CONSOLE BUTTON */}
        <motion.div
          variants={myLiquidVariants}
          animate={isOpen ? "static" : "breathing"}
          onClick={() => setIsOpen(!isOpen)}
          className={`absolute w-16 h-16 flex items-center justify-center cursor-pointer shadow-2xl z-30 transform -translate-x-8 transition-colors duration-500 ${
            isOpen 
              ? 'bg-neutral-900 border-2 border-vibe-accent/80' 
              : 'bg-gradient-to-tr from-vibe-accent via-vibe-accent to-vibe-accent/80'
          }`}
        >
          <span className="text-2xl pointer-events-none transform active:scale-90 transition-transform">
            {moodEmoji[mine]}
          </span>
        </motion.div>

        {/* PARTNER'S STATIC LIVE DISPLAY NODE */}
        <motion.div
          variants={partnerLiquidVariants}
          animate="breathing"
          className="absolute w-11 h-11 flex items-center justify-center shadow-lg z-10 pointer-events-none transform translate-x-10 bg-gradient-to-bl from-white/10 to-white/5 border border-white/10 backdrop-blur-md"
        >
          <span className="text-lg filter drop-shadow-sm">
            {moodEmoji[theirs]}
          </span>
        </motion.div>

      </div>
    </div>
  );
}