// PropTypes removed for build cleanup

const SongItem = ({ song, setpid, formatTime, isActive }) => {
  const getBestImage = (img) => {
    if (!img) return '/logo.webp';
    if (typeof img === 'string') return img;
    if (Array.isArray(img)) {
      // prefer last (highest quality) entry
      for (let i = img.length - 1; i >= 0; i--) {
        const it = img[i];
        if (!it) continue;
        if (typeof it === 'string' && it) return it;
        if (it.url) return it.url;
      }
    }
    if (img.url) return img.url;
    if (img.more_info && Array.isArray(img.more_info.images) && img.more_info.images.length) return img.more_info.images[img.more_info.images.length - 1];
    return '/logo.webp';
  };

  const imageSrc = getBestImage(song && (song.image || song.more_info && song.more_info.images));

  const safeText = (v) => {
    const s = v == null ? '' : String(v);
    return s.replace(/&/g, '&').replace(/&#039;/g, "'").replace(/"/g, '"');
  };

  const title = safeText(song && (song.name || song.title || song.song));
  const artist = safeText(
    song &&
      ((song.artists && song.artists.primary && song.artists.primary[0] && song.artists.primary[0].name) ||
        song.more_info?.singers ||
        song.primary_artists ||
        '')
  );

  return (
    <button
      type="button"
      onClick={() => setpid(song.id)}
      className={`group w-full flex items-center gap-4 px-4 py-2 transition relative text-left rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/60 focus:ring-offset-0 ${
        isActive
          ? 'bg-zinc-800/70 ring-1 ring-zinc-700/60'
          : 'hover:bg-zinc-800/40'
      }`}
    >
      <div className="relative shrink-0">
        <div className={`size-11 rounded-md overflow-hidden shadow-inner ring-1 ring-white/5 ${isActive ? 'outline outline-2 outline-blue-500/70 outline-offset-2' : ''}`}>
          {isActive ? (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-600">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l10 6.5-10 6.5z" />
              </svg>
            </div>
          ) : (
            <img
              src={imageSrc}
              className="w-full h-full object-cover"
              alt={title || 'cover'}
              loading="lazy"
            />
          )}
        </div>
      </div>
      <div className="flex flex-col flex-1 min-w-0">
        <span className={`text-[0.85rem] font-medium tracking-wide truncate ${isActive ? 'text-white' : 'text-slate-200 group-hover:text-white'}`}>
          {title || 'Unknown Title'}
        </span>
        <span className="text-[0.75rem] text-slate-400 group-hover:text-slate-300 truncate">
          {(artist || 'Unknown Artist').replace(/&amp;/g, "&").replace(/&#039;/g, "'").replace(/&quot;/g, '"')}
        </span>
      </div>
      <span className="text-[0.65rem] font-mono text-slate-400 w-12 text-right">
            {formatTime((() => {
              const d = song && (song.duration || song.duration_in_seconds || song.length);
              if (!d) return 0;
              // If duration looks like milliseconds (> 3600 seconds), convert to seconds
              const num = Number(d) || 0;
              if (num > 3600) return Math.round(num / 1000);
              return num;
            })())}
      </span>
    </button>
  );
};

export default SongItem;

// PropTypes removed for build cleanup
