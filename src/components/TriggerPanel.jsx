import React, { useEffect, useState } from 'react';
import { networkUtility } from '../api/NetworkUtils';
import { useApp } from '../hooks/useApp';
import { Card } from './Card';

const PRESETS = [
  { type: 'heart', label: '💗 Heart burst', message: 'Thinking of you', color: '#ec4899' },
  { type: 'hug', label: '🫂 Virtual hug', message: 'Sending a hug', color: '#f59e0b' },
  { type: 'ping', label: '⚡ Ping', message: 'Hey — look at me', color: '#818cf8' },
];

export function TriggerPanel() {
  const { user, coupleId } = useApp();
  const [customMsg, setCustomMsg] = useState('Miss you');
  const [firing, setFiring] = useState(false);

  useEffect(() => {
    if (!coupleId || !user?.id) return;
    const preset = PRESETS[0];
    networkUtility.saveTriggerConfig(coupleId, user.id, preset.type, {
      message: preset.message,
      color: preset.color,
    });
  }, [coupleId, user?.id]);

  const fire = async (payload) => {
    if (!coupleId || !user?.id || firing) return;
    setFiring(true);
    const full = { ...payload, from: user.id };
    await networkUtility.saveTriggerConfig(coupleId, user.id, payload.type || 'custom', full);
    networkUtility.sendLiveSignal(coupleId, full);
    setTimeout(() => setFiring(false), 800);
  };

  return (
    <Card title="Co-op triggers" subtitle="Realtime broadcast · no DB round-trip for pulse">
      <div className="grid grid-cols-3 gap-2 mb-4">
        {PRESETS.map((p) => (
          <button
            key={p.type}
            type="button"
            disabled={firing}
            onClick={() => fire(p)}
            className="py-3 rounded-lg border border-white/10 hover:border-vibe-accent/60 text-xs transition-all hover:bg-white/5"
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={customMsg}
          onChange={(e) => setCustomMsg(e.target.value)}
          className="flex-1 bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-xs"
        />
        <button
          type="button"
          disabled={firing}
          onClick={() =>
            fire({ type: 'custom', message: customMsg, color: 'var(--vibe-accent)', label: customMsg })
          }
          className="px-4 py-2 rounded-lg text-[10px] uppercase tracking-widest font-bold border border-vibe-accent text-vibe-accent"
        >
          Send
        </button>
      </div>
    </Card>
  );
}
