import { useCallback, useEffect, useRef } from 'react';
import { networkUtility } from '../api/NetworkUtils';

/**
 * Supabase Realtime for couple-scoped tables (postgres_changes + broadcast fallback).
 */
export function useCoupleRealtime(coupleId, table, fetcher, options = {}) {
  const { userIdField = null, currentUserId = null } = options;
  const fetcherRef = useRef(fetcher);

  useEffect(() => {
    fetcherRef.current = fetcher;
  }, [fetcher]);

  const load = useCallback(async () => {
    if (!coupleId) return;
    await fetcherRef.current();
  }, [coupleId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!coupleId) return;

    let pendingWhileHidden = false;

    const isOwnPostgresChange = (payload) => {
      if (payload?.__source !== 'postgres') return false;
      if (!userIdField || !currentUserId) return false;
      const row = payload.new ?? payload.old;
      return row?.[userIdField] === currentUserId;
    };

    const onChange = (payload) => {
      if (isOwnPostgresChange(payload)) return;

      if (document.visibilityState === 'hidden') {
        pendingWhileHidden = true;
        return;
      }

      load();
    };

    const unsubscribe = networkUtility.subscribeToCoupleTable(coupleId, table, onChange);

    const onVisible = () => {
      if (document.visibilityState !== 'visible' || !pendingWhileHidden) return;
      pendingWhileHidden = false;
      load();
    };

    document.addEventListener('visibilitychange', onVisible);

    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      unsubscribe();
    };
  }, [coupleId, table, load, userIdField, currentUserId]);

  return { reload: load };
}
