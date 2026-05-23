export function toSpotifyEmbed(url) {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes('spotify.com')) return null;
    const parts = parsed.pathname.split('/').filter(Boolean);
    if (parts.length < 2) return null;
    const [type, id] = parts;
    if (['track', 'album', 'playlist', 'episode', 'show'].includes(type)) {
      return `https://open.spotify.com/embed/${type}/${id}?utm_source=generator`;
    }
  } catch {
    return null;
  }
  return null;
}

export function isSpotifyUrl(url) {
  return Boolean(toSpotifyEmbed(url));
}
