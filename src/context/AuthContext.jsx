import React, { createContext, useState, useEffect, useMemo } from 'react';
import { supabase, networkUtility } from '../api/NetworkUtils';

export const AppContext = createContext(undefined);

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [coupleProfile, setCoupleProfile] = useState(null);
  const [hydrated, setHydrated] = useState(false);
  const [initializing, setInitializing] = useState(true);

  const partnerId = coupleProfile
    ? user?.id === coupleProfile.partner_1_id
      ? coupleProfile.partner_2_id
      : coupleProfile.partner_1_id
    : null;

  // Auth only — never refetch couple profile or show spinner on tab focus / token refresh
  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setUser(session?.user ?? null);
      setHydrated(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setTimeout(() => {
        if (!mounted) return;
        setUser(session?.user ?? null);
      }, 0);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Couple profile only when auth is ready and user id changes — not on every auth event
  useEffect(() => {
    if (!hydrated) return;

    if (!user?.id) {
      setCoupleProfile(null);
      setInitializing(false);
      return;
    }

    let cancelled = false;
    setInitializing(true);

    (async () => {
      try {
        const profile = await networkUtility.getCoupleProfile(user.id);
        if (!cancelled) setCoupleProfile(profile);
      } catch (profileError) {
        console.error('Database query choked on initialization:', profileError);
        if (!cancelled) setCoupleProfile(null);
      } finally {
        if (!cancelled) setInitializing(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [hydrated, user?.id]);

  const value = useMemo(
    () => ({
      user,
      coupleId: coupleProfile?.id || null,
      coupleProfile,
      partnerId,
      loading: !hydrated || initializing,
      isAuthenticated: !!user,
      isPaired: !!coupleProfile,
    }),
    [user, coupleProfile, partnerId, hydrated, initializing]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
