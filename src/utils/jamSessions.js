export const JAM_SESSION_TYPES = [
  {
    id: 'meet',
    label: 'Meet',
    icon: '📹',
    hint: 'Zoom, Google Meet, FaceTime…',
    placeholder: 'https://meet.google.com/...',
  },
  {
    id: 'teleparty',
    label: 'Teleparty',
    icon: '🎬',
    hint: 'Netflix Party or watch-together link',
    placeholder: 'https://netflix.com/watch/...',
  },
  {
    id: 'spotify',
    label: 'Spotify',
    icon: '🎧',
    hint: 'Jam, playlist, or track link',
    placeholder: 'https://open.spotify.com/...',
  },
];

const SESSION_TAG = /^\[(meet|teleparty|spotify)\]\s*(.*)$/i;

/** Encode type in title when DB has no session_type column yet */
export function encodeJamTitle(sessionType, title) {
  return `[${sessionType}] ${title}`;
}

export function normalizeJamRow(row) {
  if (!row) return null;
  if (row.session_type) {
    return {
      ...row,
      session_type: row.session_type.toLowerCase(),
      displayTitle: row.title?.replace(SESSION_TAG, '$2').trim() || row.title,
    };
  }
  const match = row.title?.match(SESSION_TAG);
  if (match) {
    return {
      ...row,
      session_type: match[1].toLowerCase(),
      displayTitle: match[2].trim() || 'Shared session',
    };
  }
  return { ...row, session_type: 'spotify', displayTitle: row.title };
}

export function groupSessionsByType(rows) {
  const map = Object.fromEntries(JAM_SESSION_TYPES.map((t) => [t.id, null]));
  for (const row of rows || []) {
    const normalized = normalizeJamRow(row);
    if (normalized?.is_open !== false && map[normalized.session_type] === null) {
      map[normalized.session_type] = normalized;
    }
  }
  return map;
}
