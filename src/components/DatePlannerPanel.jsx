import React, { useCallback, useRef, useState } from 'react';
import { networkUtility } from '../api/NetworkUtils';
import { useApp } from '../hooks/useApp';
import { useCoupleRealtime } from '../hooks/useCoupleRealtime';

function formatDisplayDate(isoDate) {
  if (!isoDate) return '';
  return new Date(`${isoDate}T12:00:00`).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function isUpcoming(date) {
  if (date.is_completed) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const scheduled = new Date(`${date.scheduled_date}T12:00:00`);
  return scheduled >= today;
}

function parseNoteEntries(notesText) {
  if (!notesText?.trim()) return [];
  const parts = notesText.split(/\n\n— /);
  return parts.map((part, index) => {
    if (index === 0) return { stamp: null, body: part.trim() };
    const lineBreak = part.indexOf('\n');
    if (lineBreak === -1) return { stamp: part.trim(), body: '' };
    return {
      stamp: part.slice(0, lineBreak).trim(),
      body: part.slice(lineBreak + 1).trim(),
    };
  }).filter((e) => e.body);
}

function StarRating({ value, onChange, disabled }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          onClick={() => onChange(star)}
          className={`text-sm leading-none transition-colors ${
            star <= value ? 'text-vibe-accent' : 'text-neutral-600 hover:text-neutral-400'
          }`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export function DatePlannerPanel({ filter }) {
  const { user, coupleId, partnerId } = useApp();
  const [dates, setDates] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [busy, setBusy] = useState(false);

  const [title, setTitle] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [location, setLocation] = useState('');

  const [noteText, setNoteText] = useState('');
  const [noteRating, setNoteRating] = useState(0);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef(null);

  const load = useCallback(async () => {
    if (!coupleId) return;
    try {
      const rows = await networkUtility.getDiaryDates(coupleId);
      setDates(rows || []);
    } catch (err) {
      console.error(err);
    }
  }, [coupleId]);

  const { reload } = useCoupleRealtime(coupleId, 'date_diary', load);

  const filteredDates = dates.filter((d) => {
    if (filter === 'completed') return d.is_completed;
    if (filter === 'pending') return isUpcoming(d);
    return true;
  });

  const selected = dates.find((d) => d.id === selectedId) || null;

  const createDate = async (e) => {
    e.preventDefault();
    if (!title.trim() || !scheduledDate || !coupleId || busy) return;
    setBusy(true);
    try {
      await networkUtility.createDiaryDate(coupleId, {
        title,
        scheduled_date: scheduledDate,
        location,
      });
      setTitle('');
      setScheduledDate('');
      setLocation('');
      await reload();
    } catch (err) {
      console.error(err);
    } finally {
      setBusy(false);
    }
  };

  const toggleComplete = async (date) => {
    const next = !date.is_completed;
    setDates((prev) =>
      prev.map((d) => (d.id === date.id ? { ...d, is_completed: next } : d))
    );
    try {
      await networkUtility.toggleDateCompletion(date.id, next, coupleId);
    } catch {
      reload();
    }
  };

  const removeDate = async (id) => {
    if (!confirm('Remove this date from the planner?')) return;
    setDates((prev) => prev.filter((d) => d.id !== id));
    if (selectedId === id) setSelectedId(null);
    try {
      await networkUtility.deleteDiaryDate(id, coupleId);
    } catch {
      reload();
    }
  };

  const addNote = async (e) => {
    e.preventDefault();
    if (!selected || !noteText.trim() || !user?.id || busy) return;
    setBusy(true);
    try {
      await networkUtility.appendDiaryNote(
        selected.id,
        user.id,
        noteText,
        noteRating || null,
        coupleId
      );
      setNoteText('');
      setNoteRating(0);
      await reload();
    } catch (err) {
      console.error(err);
    } finally {
      setBusy(false);
    }
  };

  const handlePhotoPick = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !selected?.is_completed || !coupleId || !user?.id) return;
    setUploadingPhoto(true);
    try {
      await networkUtility.uploadPhotoToDiaryDate(
        coupleId,
        user.id,
        selected.id,
        file,
        selected.title
      );
      await reload();
    } catch (err) {
      console.error(err);
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removePhoto = async (link) => {
    const wall = link.photo_wall;
    if (!wall || !confirm('Remove this memory from the wall and this date?')) return;
    const ok = await networkUtility.wipePhotoFromServer(wall.id, wall.storage_path, coupleId);
    if (ok) await reload();
  };

  if (selected) {
    const myNotes = selected.notes?.filter((n) => n.user_id === user?.id) || [];
    const partnerNotes = selected.notes?.filter((n) => n.user_id === partnerId) || [];

    return (
      <div className="flex flex-col h-full min-h-0">
        <button
          type="button"
          onClick={() => {
            setSelectedId(null);
            setNoteText('');
            setNoteRating(0);
          }}
          className="text-[9px] uppercase tracking-widest text-vibe-accent/80 hover:text-vibe-accent mb-2 text-left shrink-0"
        >
          ← Back to dates
        </button>

        <div className="border-b border-white/5 pb-2 mb-2 shrink-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-black text-neutral-200 uppercase leading-snug">
                {selected.title}
              </h3>
              <p className="text-[10px] text-neutral-500 font-mono mt-0.5">
                {formatDisplayDate(selected.scheduled_date)}
              </p>
              {selected.location && (
                <p className="text-[9px] text-vibe-accent/70 mt-1 truncate">📍 {selected.location}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => toggleComplete(selected)}
              className={`shrink-0 text-[9px] uppercase font-bold px-2 py-1 rounded-lg border ${
                selected.is_completed
                  ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10'
                  : 'border-neutral-600 text-neutral-400 hover:border-vibe-accent/40'
              }`}
            >
              {selected.is_completed ? '✓ Done' : 'Finish'}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 pr-1 space-y-3">
          {/* Partner reflections */}
          {partnerNotes.map((n) =>
            parseNoteEntries(n.notes).map((entry, i) => (
              <div
                key={`p-${n.id}-${i}`}
                className="rounded-lg border border-white/5 bg-black/30 p-2.5"
              >
                <span className="text-[8px] uppercase tracking-widest text-neutral-500 font-bold">
                  Partner {entry.stamp ? `· ${entry.stamp}` : ''}
                </span>
                {n.rating && i === 0 && (
                  <p className="text-[9px] text-vibe-accent mt-0.5">{'★'.repeat(n.rating)}</p>
                )}
                <p className="text-[11px] text-neutral-300 mt-1 leading-relaxed whitespace-pre-wrap">
                  {entry.body}
                </p>
              </div>
            ))
          )}

          {/* Your reflections */}
          {myNotes.map((n) =>
            parseNoteEntries(n.notes).map((entry, i) => (
              <div
                key={`m-${n.id}-${i}`}
                className="rounded-lg border border-vibe-accent/20 bg-vibe-accent/5 p-2.5"
              >
                <span className="text-[8px] uppercase tracking-widest text-vibe-accent/80 font-bold">
                  You {entry.stamp ? `· ${entry.stamp}` : ''}
                </span>
                {n.rating && i === 0 && (
                  <p className="text-[9px] text-vibe-accent mt-0.5">{'★'.repeat(n.rating)}</p>
                )}
                <p className="text-[11px] text-neutral-200 mt-1 leading-relaxed whitespace-pre-wrap">
                  {entry.body}
                </p>
              </div>
            ))
          )}

          {/* Completed date photos */}
          {selected.is_completed && (
            <div className="pt-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] uppercase tracking-widest text-neutral-500 font-bold">
                  Date memories
                </span>
                <button
                  type="button"
                  disabled={uploadingPhoto}
                  onClick={() => fileInputRef.current?.click()}
                  className="text-[9px] uppercase font-bold text-vibe-accent hover:brightness-110"
                >
                  {uploadingPhoto ? 'Saving…' : '+ Photo'}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoPick}
                />
              </div>
              {selected.photos?.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {selected.photos.map((link) => (
                    <div
                      key={link.id}
                      className="relative rounded-sm overflow-hidden border border-neutral-200/30 bg-[#fcfbf9] p-1 pb-2"
                    >
                      <img
                        src={link.photo_wall?.imageUrl}
                        alt=""
                        className="w-full aspect-square object-cover rounded-sm"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(link)}
                        className="absolute top-1 right-1 w-5 h-5 rounded bg-black/60 text-white text-[10px] hover:bg-red-600"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[9px] text-neutral-600 text-center py-3 border border-dashed border-neutral-800 rounded-lg">
                  Add a polaroid to the wall & link it here
                </p>
              )}
            </div>
          )}
        </div>

        <form onSubmit={addNote} className="shrink-0 pt-2 mt-2 border-t border-white/5 space-y-2">
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            rows={2}
            placeholder="Leave a note on this date..."
            className="w-full bg-black/30 border border-white/5 rounded-lg px-2 py-1.5 text-[11px] text-neutral-200 resize-none focus:outline-none focus:border-vibe-accent/30"
          />
          <div className="flex items-center justify-between gap-2">
            <StarRating value={noteRating} onChange={setNoteRating} disabled={busy} />
            <button
              type="submit"
              disabled={!noteText.trim() || busy}
              className="text-[10px] px-3 py-1 bg-vibe-accent text-black font-bold rounded-lg disabled:opacity-40"
            >
              Add note
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="border-b border-white/5 pb-2 mb-3 shrink-0">
        <h3 className="text-sm font-black text-neutral-200 uppercase">Date Planner 💕</h3>
        <span className="text-[9px] text-vibe-accent/60 font-mono">
          {dates.filter((d) => isUpcoming(d)).length} upcoming
        </span>
      </div>

      <form onSubmit={createDate} className="shrink-0 space-y-2 mb-3 border-b border-white/5 pb-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Date idea / title..."
          className="w-full bg-transparent border-b border-dashed border-neutral-700 text-xs text-neutral-200 px-1 py-1 focus:outline-none"
        />
        <div className="flex gap-2">
          <input
            type="date"
            value={scheduledDate}
            onChange={(e) => setScheduledDate(e.target.value)}
            className="flex-1 min-w-0 bg-black/40 border border-white/5 rounded-lg px-2 py-1 text-[10px] text-neutral-300 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!title.trim() || !scheduledDate || busy}
            className="text-[10px] px-3 py-1 bg-vibe-accent text-black font-bold rounded-lg shrink-0"
          >
            Plan
          </button>
        </div>
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Location (optional)"
          className="w-full bg-transparent border-b border-dashed border-neutral-800 text-[10px] text-neutral-400 px-1 py-0.5 focus:outline-none"
        />
      </form>

      <div className="flex-1 overflow-y-auto min-h-0">
        {filteredDates.length === 0 ? (
          <div className="text-center text-[10px] text-neutral-600 pt-8">
            No dates yet — plan something sweet
          </div>
        ) : (
          <ul className="space-y-2">
            {filteredDates.map((date) => (
              <li key={date.id} className="group">
                <button
                  type="button"
                  onClick={() => setSelectedId(date.id)}
                  className="w-full text-left flex items-start gap-2 py-2 rounded-lg hover:bg-white/5 px-1 -mx-1 transition-colors"
                >
                  <span
                    className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                      date.is_completed
                        ? 'bg-emerald-500'
                        : isUpcoming(date)
                        ? 'bg-vibe-accent animate-pulse'
                        : 'bg-neutral-600'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-xs font-semibold leading-snug ${
                        date.is_completed ? 'text-neutral-500' : 'text-neutral-200'
                      }`}
                    >
                      {date.title}
                    </p>
                    <p className="text-[9px] text-neutral-600 font-mono mt-0.5">
                      {formatDisplayDate(date.scheduled_date)}
                      {date.notes?.length > 0 && ` · ${date.notes.length} note(s)`}
                    </p>
                  </div>
                  <span className="text-neutral-600 text-[10px] opacity-0 group-hover:opacity-100">
                    →
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => removeDate(date.id)}
                  className="text-[9px] text-neutral-700 hover:text-red-400 ml-4 opacity-0 group-hover:opacity-100"
                >
                  remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
