import React, { createContext, useContext, useState, useCallback } from 'react';
import { networkUtility } from '../api/NetworkUtils';
import { useApp } from '../hooks/useApp';
import { useCoupleRealtime } from '../hooks/useCoupleRealtime';
import { applyVibeTheme } from '../utils/vibeTheme';

const MoodContext = createContext(null);

export function MoodProvider({ children }) {
  const { user, coupleId, partnerId } = useApp();
  const [mine, setMine] = useState('Neutral');
  const [theirs, setTheirs] = useState('Neutral');
  const [saving, setSaving] = useState(false);

  // Central fetching logic
  const load = useCallback(async () => {
    if (!coupleId) return;
    try {
      const moods = await networkUtility.getMoods(coupleId);
      const myMood = moods.find((m) => m.user_id === user?.id)?.mood_type || 'Neutral';
      const partnerMood = moods.find((m) => m.user_id === partnerId)?.mood_type || 'Neutral';
      
      setMine(myMood);
      setTheirs(partnerMood);
      applyVibeTheme(myMood, partnerMood);
    } catch (err) {
      console.error("Error loading central moods:", err);
    }
  }, [coupleId, user?.id, partnerId]);

  // Hook up your single global realtime subscription stream
  const { reload } = useCoupleRealtime(coupleId, 'moods', load, {
    userIdField: 'user_id',
    currentUserId: user?.id,
  });

  // Central state modifier function
  const updateMood = async (newMood) => {
    if (!coupleId || !user?.id || saving) return;
    setSaving(true);
    
    // Optimistic Update: make UI snappy by changing state instantly
    const previousMine = mine;
    setMine(newMood);
    applyVibeTheme(newMood, theirs);

    try {
      await networkUtility.updateMood(coupleId, user.id, newMood);
    } catch (error) {
      // Rollback if network fails
      setMine(previousMine);
      applyVibeTheme(previousMine, theirs);
      await reload();
    } finally {
      setSaving(false);
    }
  };

  return (
    <MoodContext.Provider value={{ mine, theirs, updateMood, saving, reloadMoods: reload }}>
      {children}
    </MoodContext.Provider>
  );
}

// Custom hook for simple component consumption
export function useMood() {
  const context = useContext(MoodContext);
  if (!context) {
    throw new Error('useMood must be executed within a valid MoodProvider');
  }
  return context;
}