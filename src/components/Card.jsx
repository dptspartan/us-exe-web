export function Card({ title, subtitle, children, className = '' }) {
  return (
    <section
      className={`rounded-2xl border border-white/10 bg-vibe-card backdrop-blur-md p-5 ${className}`}
    >
      {(title || subtitle) && (
        <header className="mb-4">
          {title && (
            <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-vibe-text/80">
              {title}
            </h2>
          )}
          {subtitle && <p className="text-[10px] text-vibe-text/50 mt-1">{subtitle}</p>}
        </header>
      )}
      {children}
    </section>
  );
}
