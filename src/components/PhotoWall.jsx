import React, { useCallback, useState, useRef } from 'react';
import { networkUtility } from '../api/NetworkUtils';
import { useApp } from '../hooks/useApp';
import { useCoupleRealtime } from '../hooks/useCoupleRealtime';

function formatDatePill(isoDate) {
  if (!isoDate) return '';
  return new Date(`${isoDate}T12:00:00`).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function DateLinkTag({ dateLink }) {
  if (!dateLink?.scheduled_date) return null;

  return (
    <div
      className="absolute top-1.5 left-1.5 z-20 flex items-center gap-1 pl-1 pr-2 py-0.5 rounded-full bg-neutral-950/92 border border-vibe-accent/50 shadow-[0_2px_8px_rgba(0,0,0,0.45)] pointer-events-none"
      title={dateLink.title ? `${dateLink.title} · ${formatDatePill(dateLink.scheduled_date)}` : formatDatePill(dateLink.scheduled_date)}
    >
      <span className="text-[9px] leading-none text-vibe-accent" aria-hidden>
        📌
      </span>
      <span className="text-[8px] font-mono font-bold uppercase tracking-wide text-white leading-tight whitespace-nowrap">
        {formatDatePill(dateLink.scheduled_date)}
      </span>
    </div>
  );
}

function stackTransform(index, total, activeIndex, cycling) {
  const rel = (index - activeIndex + total) % total;
  // Subtle structural rotations simulating a messy, organic desktop pile
  const rot = -4 + rel * 3.5 + (index % 2 ? 1.5 : -1);
  const ty = rel * 5;
  const tx = rel * 2;
  const scale = 1 - rel * 0.04;
  const z = total - rel;
  return {
    style: {
      transform: `translate(${tx}px, ${ty}px) rotate(${rot}deg) scale(${scale})`,
      zIndex: z,
      opacity: rel > 3 ? 0 : 1 - rel * 0.18,
    },
    className: `absolute inset-0 w-full h-full bg-[#fcfbf9] p-3 pb-10 rounded-sm shadow-[0_6px_16px_rgba(0,0,0,0.3),0_1px_3px_rgba(0,0,0,0.15)] transition-all duration-500 ease-out select-none border border-neutral-200/40 origin-bottom ${
      rel === 0 ? 'cursor-pointer' : 'pointer-events-none'
    } ${rel === 0 && cycling ? 'animate-[polaroidFlip_0.52s_ease-in-out]' : ''}`,
  };
}

export function PhotoWall() {
  const { user, coupleId } = useApp();
  const [photos, setPhotos] = useState([]);
  const [dateTags, setDateTags] = useState({});
  const [activeIndex, setActiveIndex] = useState(0);
  const [cycling, setCycling] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Preview Mode State Machine
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [captionText, setCaptionText] = useState('');
  const fileInputRef = useRef(null);

  const load = useCallback(async () => {
    if (!coupleId) return;
    const [rows, tags] = await Promise.all([
      networkUtility.getPhotosWithUrls(coupleId),
      networkUtility.getPhotoDateTags(coupleId),
    ]);
    setPhotos(rows);
    setDateTags(tags || {});
    setActiveIndex((i) => (rows.length ? Math.min(i, rows.length - 1) : 0));
  }, [coupleId]);

  const { reload } = useCoupleRealtime(coupleId, 'photo_wall', load, {
    userIdField: 'uploaded_by',
    currentUserId: user?.id,
  });

  useCoupleRealtime(coupleId, 'date_diary', load);

  // Handle local file selection and convert to temporary visual string URL
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreviewFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  // Commit transaction up to Supabase Storage and DB Tables
  const handleUploadCommit = async () => {
    if (!previewFile || !coupleId || !user?.id) return;
    setUploading(true);
    try {
      await networkUtility.uploadPhotoToWall(coupleId, user.id, previewFile, captionText.trim());
      await reload();
      handleCancelPreview();
      setActiveIndex(0); // Snap deck focus immediately to the newest image
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleCancelPreview = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewFile(null);
    setPreviewUrl('');
    setCaptionText('');
    setIsPreviewMode(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const cycle = () => {
    if (photos.length <= 1 || cycling || isPreviewMode) return;
    setCycling(true);
    setTimeout(() => {
      setActiveIndex((i) => (i + 1) % photos.length);
      setCycling(false);
    }, 500);
  };

  const remove = async (e, photo) => {
    e.stopPropagation(); // Avoid triggering card deck cycling during click action
    if (!confirm('Destroy this memory permanently?')) return;
    const ok = await networkUtility.wipePhotoFromServer(photo.id, photo.storage_path, coupleId);
    if (ok) {
      setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
      setActiveIndex(0);
    }
  };

  return (
    <div className="h-full min-h-0 w-full flex flex-col items-center justify-center py-0 select-none gap-2 lg:gap-4 shrink min-w-0">
      
      {/* Hidden Base Input Tracker */}
      <input 
        type="file" 
        accept="image/*" 
        ref={fileInputRef}
        className="hidden" 
        onChange={handleFileSelect}
      />

      {/* Primary Stack Stage Container */}
      <div className="relative w-[clamp(9.5rem,12vw,16rem)] aspect-[256/304] max-h-full shrink-0">
        
        {/* ====================================================================
           LAYER ONE: ACTIVE IMAGE PREVIEW / UPLOADER COMPOSER SLATE
           ==================================================================== */}
        {isPreviewMode && (
          <div className="absolute inset-0 w-full h-full bg-[#fdfcfb] p-3 pb-4 rounded-sm shadow-[0_8px_24px_rgba(0,0,0,0.35)] border border-neutral-200/60 z-50 flex flex-col justify-between">
            <div 
              className="w-full aspect-square bg-neutral-100 rounded-sm overflow-hidden border border-neutral-300/40 flex flex-col items-center justify-center relative group cursor-pointer"
              onClick={() => !previewUrl && fileInputRef.current?.click()}
            >
              {previewUrl ? (
                <>
                  <img src={previewUrl} alt="Preview element" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs font-medium text-white">
                    Change Image
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-1.5 text-neutral-400 hover:text-neutral-600 transition-colors">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-[10px] font-mono uppercase tracking-wider font-bold">Select Photo</span>
                </div>
              )}
            </div>

            {/* Simulated Marker Caption Input Area */}
            <input
              type="text"
              placeholder="Write a caption... (felt pen)"
              maxLength={42}
              value={captionText}
              onChange={(e) => setCaptionText(e.target.value)}
              className="w-full mt-2 text-center text-xs font-serif bg-transparent border-b border-dashed border-neutral-300 focus:border-neutral-500 outline-none text-neutral-800 placeholder-neutral-400 px-1 py-0.5"
            />

            {/* Action Buttons Footer row */}
            <div className="flex gap-2 w-full mt-3">
              <button
                type="button"
                onClick={handleCancelPreview}
                disabled={uploading}
                className="flex-1 py-1 text-[10px] font-mono uppercase font-bold tracking-wider rounded border border-neutral-300 text-neutral-600 hover:bg-neutral-50 active:bg-neutral-100 transition-colors disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUploadCommit}
                disabled={uploading || !previewFile}
                className="flex-1 py-1 text-[10px] font-mono uppercase font-bold tracking-wider rounded bg-neutral-900 text-white hover:bg-neutral-800 active:bg-black transition-colors disabled:opacity-40 flex items-center justify-center gap-1"
              >
                {uploading ? 'Saving...' : 'Upload'}
              </button>
            </div>
          </div>
        )}

        {/* ====================================================================
           LAYER TWO: RENDERED PHYSICAL PHOTO ITEM DECK STACK
           ==================================================================== */}
        {photos.length === 0 && !isPreviewMode ? (
          /* Empty State Placeholder Fallback Base Structure */
          <div 
            onClick={() => setIsPreviewMode(true)}
            className="absolute inset-0 w-full h-full bg-[#fcfbf9] p-3 pb-8 rounded-sm shadow-md border border-dashed border-neutral-300 flex flex-col items-center justify-center text-neutral-400 hover:text-neutral-600 cursor-pointer transition-colors"
          >
            <svg className="w-8 h-8 stroke-1.5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-mono text-[10px] uppercase tracking-widest font-bold">No memories yet</span>
            <span className="text-[9px] mt-0.5">Click to drop first photo</span>
          </div>
        ) : (
          /* Map Active Iteration Arrays to Stacking Transformation Math */
          photos.map((_, rawIndex) => {
            const t = stackTransform(rawIndex, photos.length, activeIndex, cycling && rawIndex === activeIndex);
            const photo = photos[rawIndex];
            const isTopCard = rawIndex === activeIndex;
            const dateLink = dateTags[photo.id];

            return (
              <div
                key={photo.id}
                className={`${t.className} group`}
                style={t.style}
                onClick={() => isTopCard && cycle()}
              >
                {/* Image Frame Container Box */}
                <div className="w-full aspect-square bg-neutral-950 rounded-sm overflow-hidden border border-black/10 relative">
                  <DateLinkTag dateLink={dateLink} />
                  <img
                    src={photo.imageUrl}
                    alt="Memory frame"
                    draggable={false}
                    className="w-full h-full object-cover grayscale-[10%] contrast-[102%] pointer-events-none"
                  />
                  
                  {/* Polaroid analog shadow filter mask overlay */}
                  <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-black/5 via-transparent to-white/5 mix-blend-overlay" />
                  
                  {/* Floating Action Glass Tray: Glides up ONLY when hovering top card */}
                  {isTopCard && !isPreviewMode && (
                    <div className="absolute inset-x-0 bottom-0 p-2 flex justify-center gap-2 bg-gradient-to-t from-black/70 via-black/40 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-200 ease-out backdrop-blur-[2px]">
                      {/* Plus (Add Memory) Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsPreviewMode(true);
                        }}
                        className="p-1.5 rounded-md bg-white/20 hover:bg-white text-white hover:text-neutral-900 transition-colors border border-white/10"
                        title="Add New Memory"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                        </svg>
                      </button>

                      {/* Trash (Delete) Button */}
                      <button
                        type="button"
                        onClick={(e) => remove(e, photo)}
                        className="p-1.5 rounded-md bg-black/40 hover:bg-red-600 text-white/90 hover:text-white transition-colors border border-white/5"
                        title="Wipe Memory"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>

                {/* Felt-Pen analog text area below frame */}
                <p className="mt-2 text-center text-[12px] font-medium tracking-tight text-neutral-800/80 font-serif truncate px-0.5 min-h-[16px]">
                  {photo.caption || ""}
                </p>
              </div>
            );
          })
        )}
      </div>

      {/* High-Performance Micro-Animation Canvas Handshakes */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes polaroidFlip {
          0% { transform: translate(var(--tx, 0px), var(--ty, 0px)) rotate(var(--rot, 0deg)) scale(1); z-index: 50; }
          42% { transform: translate(-150px, -15px) rotate(-16deg) scale(1.04); z-index: 50; }
          43% { z-index: 1; }
          100% { transform: translate(0px, 0px) rotate(0deg) scale(0.92); z-index: 1; }
        }
      `}} />
    </div>
  );
}