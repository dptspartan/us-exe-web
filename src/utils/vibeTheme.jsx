import { moodEmoji } from './moods';

/** Per-mood colors for gradient blending (inspired by vibe matrix, not 1:1 combos). */
export const moodColors = {
  Happy: { glow: '#fbbf24', deep: '#1e1b4b', accent: '#ec4899' },
  Loving: { glow: '#f472b6', deep: '#2a1020', accent: '#f472b6' },
  Neutral: { glow: '#94a3b8', deep: '#121214', accent: '#ec4899' },
  Tired: { glow: '#818cf8', deep: '#14141a', accent: '#818cf8' },
  Sad: { glow: '#64748b', deep: '#0f1419', accent: '#64748b' },
  Sick: { glow: '#34d399', deep: '#0c1a14', accent: '#f59e0b' },
  Overwhelmed: { glow: '#a855f7', deep: '#180f18', accent: '#a855f7' },
  Angry: { glow: '#ef4444', deep: '#1a0a0a', accent: '#ef4444' },
};

const fallback = moodColors.Neutral;

function pick(mood) {
  return moodColors[mood] || fallback;
}

/**
 * Dual-mood ambient gradient on the page background + CSS tokens for cards/text.
 */
export const applyVibeTheme = (myMood = 'Neutral', partnerMood = 'Neutral') => {
  const a = pick(myMood || 'Neutral');
  const b = pick(partnerMood || 'Neutral');
  const base = '#0a0a0c';

  const gradient = `
    radial-gradient(ellipse 120% 80% at 0% 0%, ${a.glow}40 0%, transparent 55%),
    radial-gradient(ellipse 100% 70% at 100% 100%, ${b.glow}38 0%, transparent 50%),
    linear-gradient(145deg, ${a.deep} 0%, ${base} 42%, ${b.deep} 100%)
  `.trim();

  const accent = a.accent;
  const text = '#f4f4f5';
  const card = 'rgba(255, 255, 255, 0.06)';

  const root = document.documentElement;
  root.style.setProperty('--vibe-gradient', gradient);
  root.style.setProperty('--vibe-bg', base);
  root.style.setProperty('--vibe-card', card);
  root.style.setProperty('--vibe-text', text);
  root.style.setProperty('--vibe-accent', accent);
  root.style.setProperty('--vibe-mood-a', a.glow);
  root.style.setProperty('--vibe-mood-b', b.glow);
};

export function moodPairLabel(myMood, partnerMood) {
  return `${moodEmoji[myMood] || '🌙'} ${myMood} · ${moodEmoji[partnerMood] || '🌙'} ${partnerMood}`;
}
