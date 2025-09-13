import { useEffect, useState, useMemo } from 'react';

const VisualizerSection = ({ currentSong }) => {
  const cover = currentSong.cover;
  const [glowRgb, setGlowRgb] = useState([59,130,246]);

  useEffect(() => {
    let mounted = true;
    if (!cover) {
      setGlowRgb([59,130,246]);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = cover;
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const w = (canvas.width = Math.min(100, img.width));
        const h = (canvas.height = Math.min(100, img.height));
        ctx.drawImage(img, 0, 0, w, h);
        const data = ctx.getImageData(0, 0, w, h).data;
        const colorCount = {};
        for (let i = 0; i < data.length; i += 4 * 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const brightness = (r + g + b) / 3;
          if (brightness < 30 || brightness > 230) continue;
          const key = `${Math.round(r/16)*16},${Math.round(g/16)*16},${Math.round(b/16)*16}`;
          colorCount[key] = (colorCount[key] || 0) + 1;
        }
        const sorted = Object.entries(colorCount).sort((a,b) => b[1]-a[1]);
        if (sorted.length > 0) {
          const [r,g,b] = sorted[0][0].split(',').map((v)=>parseInt(v,10));
          if (mounted) setGlowRgb([r,g,b]);
        } else {
          if (mounted) setGlowRgb([59,130,246]);
        }
      } catch {
        if (mounted) setGlowRgb([59,130,246]);
      }
    };
    img.onerror = () => { if (mounted) setGlowRgb([59,130,246]); };
    return () => { mounted = false; };
  }, [cover]);

  const rawName = currentSong && currentSong.name ? String(currentSong.name) : '';

  const displayName = useMemo(() => {
    const raw = rawName;
    if (!raw) return '';
    // If running in browser, use a textarea trick to decode HTML entities safely
    try {
      if (typeof document !== 'undefined') {
        const ta = document.createElement('textarea');
        ta.innerHTML = raw;
        return ta.value || ta.textContent || raw;
      }
    } catch {
      // fallthrough to simple replacements
    }
    // Fallback simple replacements for common entities
    return raw.replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&amp;/g, '&');
  }, [rawName]);
  return (
    <div className="relative h-full min-h-[420px] flex flex-col items-center justify-center p-6">
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/40 via-zinc-900/40 to-black" />
      <div className="relative group">
        <div
          className="absolute -inset-3 rounded-2xl blur-xl opacity-70 group-hover:opacity-95 transition-opacity"
          style={{
            background: `radial-gradient(40% 60% at 10% 20%, rgba(${glowRgb.join(',')},0.30), rgba(${glowRgb.join(',')},0.12) 20%, transparent 40%), linear-gradient(45deg, rgba(${glowRgb.join(',')},0.06), transparent)`,
            boxShadow: `0 20px 60px rgba(${glowRgb.join(',')},0.18)`
          }}
        />
  <div className="relative w-[240px] h-[240px] sm:w-[320px] sm:h-[320px] md:w-[420px] md:h-[420px] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
          {cover ? (
            <img
              src={cover}
              alt="Album Art"
              className="w-full h-full object-cover select-none pointer-events-none animate-[slowpulse_12s_ease-in-out_infinite]"
              draggable={false}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-500 text-sm">
              No Art
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />
        </div>
      </div>
        <div className="mt-6 text-center px-4 max-w-md">
        <h2 className="text-xl md:text-2xl font-semibold text-white tracking-wide line-clamp-2">
          {displayName || 'Select a track'}
        </h2>
        <h4 className="text-md font-semibold text-slate-400">
          {(currentSong.artist || '—').replace(/&amp;/g, "&").replace(/&#039;/g, "'").replace(/&quot;/g, '"')}
        </h4>
      </div>
    </div>
  );
};

export default VisualizerSection;

// PropTypes removed for build cleanup
