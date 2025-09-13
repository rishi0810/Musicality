import { useEffect, useRef, useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

export default function MobileBottomSheet() {
  const { songurl, imgurl, name, artist, album, pid, setPid, duration: ctxDuration, goToNext, goToPrev } = usePlayer();
  const sheetRef = useRef(null);
  const startYRef = useRef(0);
  const currentYRef = useRef(0);
  const [expanded, setExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  // Use the global audio element provided in Footer (id="global-audio")
  const audioRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);

  useEffect(() => {
    // ensure we reference the global audio element (rendered in Footer)
    if (!audioRef.current) audioRef.current = document.getElementById('global-audio');
    const audioEl = audioRef.current;
    if (audioEl) {
      const onPlay = () => setIsPlaying(true);
      const onPause = () => setIsPlaying(false);
      const onTimeUpdate = () => setCurrentTime(audioEl.currentTime || 0);
  const onLoaded = () => setDuration(audioEl.duration || ctxDuration || 0);
      audioEl.addEventListener('play', onPlay);
      audioEl.addEventListener('pause', onPause);
      audioEl.addEventListener('timeupdate', onTimeUpdate);
      audioEl.addEventListener('loadedmetadata', onLoaded);
      return () => {
        audioEl.removeEventListener('play', onPlay);
        audioEl.removeEventListener('pause', onPause);
        audioEl.removeEventListener('timeupdate', onTimeUpdate);
        audioEl.removeEventListener('loadedmetadata', onLoaded);
      };
    }
    return undefined;
  }, [ctxDuration]);

  // Autoplay / load when songurl changes
  useEffect(() => {
    const audioEl = audioRef.current || document.getElementById('global-audio');
    if (audioEl && songurl) {
      try {
        audioEl.load();
        audioEl.play().catch(() => {});
      } catch {
        // ignore autoplay errors
      }
    }
  }, [songurl]);

  useEffect(() => {
    if (!audioRef.current) audioRef.current = document.getElementById('global-audio');
    if (audioRef.current) audioRef.current.volume = volume / 100;
  }, [volume]);

  useEffect(() => {
    if (!sheetRef.current) return;
    const sheet = sheetRef.current;

    const onTouchStart = (e) => {
      startYRef.current = e.touches[0].clientY;
      sheet.style.transition = 'none';
    };

    const onTouchMove = (e) => {
      const dy = e.touches[0].clientY - startYRef.current;
      if (dy > 0) {
        sheet.style.transform = `translateY(${dy}px)`;
        currentYRef.current = dy;
      }
    };

    const onTouchEnd = () => {
      sheet.style.transition = '';
      if (currentYRef.current > 64) {
        // if dragged down enough, collapse
        setExpanded(false);
      } else {
        setExpanded(true);
      }
      sheet.style.transform = '';
      currentYRef.current = 0;
    };

  sheet.addEventListener('touchstart', onTouchStart, { passive: true });
  sheet.addEventListener('touchmove', onTouchMove, { passive: false });
  sheet.addEventListener('touchend', onTouchEnd);

    return () => {
      sheet.removeEventListener('touchstart', onTouchStart);
      sheet.removeEventListener('touchmove', onTouchMove);
      sheet.removeEventListener('touchend', onTouchEnd);
    };
  }, []);

  const songchangefwd = () => {
    if (!album || album.length === 0) return;
    let currentIndex = album.findIndex((s) => String(s.id) === String(pid));
    if (currentIndex === -1 && imgurl) {
      const matchesImage = (simg) => {
        if (!simg) return false;
        if (typeof simg === 'string') return simg === imgurl;
        if (Array.isArray(simg) && simg.length) {
          const last = simg[simg.length - 1];
          if (typeof last === 'string') return last === imgurl;
          if (last && last.url) return last.url === imgurl;
        }
        if (simg.url) return simg.url === imgurl;
        if (simg.more_info && Array.isArray(simg.more_info.images) && simg.more_info.images.length) return simg.more_info.images[simg.more_info.images.length - 1] === imgurl || (simg.more_info.images[simg.more_info.images.length - 1] && simg.more_info.images[simg.more_info.images.length - 1].url === imgurl);
        return false;
      };

      currentIndex = album.findIndex((s) => matchesImage(s.image || s.more_info && s.more_info.images));
    }
    if (currentIndex === -1 && name) {
      currentIndex = album.findIndex((s) => s.name && s.name === name);
    }
    const newIndex = currentIndex >= 0 && currentIndex < album.length - 1 ? currentIndex + 1 : 0;
    const next = album[newIndex];
    if (next && next.id) setPid(next.id);
  };

  const songchangebwd = () => {
    if (!album || album.length === 0) return;
    let currentIndex = album.findIndex((s) => String(s.id) === String(pid));
    if (currentIndex === -1 && imgurl) {
      const matchesImage = (simg) => {
        if (!simg) return false;
        if (typeof simg === 'string') return simg === imgurl;
        if (Array.isArray(simg)) return simg.some(it => (it && (it.url === imgurl || it === imgurl)));
        if (simg.url) return simg.url === imgurl;
        if (simg.more_info && Array.isArray(simg.more_info.images)) return simg.more_info.images.some(i => i === imgurl || (i && i.url === imgurl));
        return false;
      };

      currentIndex = album.findIndex((s) => matchesImage(s.image || s.more_info && s.more_info.images));
    }
    if (currentIndex === -1 && name) {
      currentIndex = album.findIndex((s) => s.name && s.name === name);
    }
    const newIndex = currentIndex > 0 ? currentIndex - 1 : album.length - 1;
    const prev = album[newIndex];
    if (prev && prev.id) setPid(prev.id);
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    if (typeof goToPrev === 'function') goToPrev(); else songchangebwd();
  };

  const handleNext = (e) => {
    e.stopPropagation();
    if (typeof goToNext === 'function') goToNext(); else songchangefwd();
  };

  const handlePlayToggle = (e) => {
    e.stopPropagation();
    if (!audioRef.current) audioRef.current = document.getElementById('global-audio');
    if (!audioRef.current) return;
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play();
  };

  const handleSeek = (val) => {
    if (!audioRef.current) audioRef.current = document.getElementById('global-audio');
    if (!audioRef.current) return;
    audioRef.current.currentTime = val;
    setCurrentTime(val);
  };

  const handleVolumeChange = (val) => {
    setVolume(val);
    if (!audioRef.current) audioRef.current = document.getElementById('global-audio');
    if (audioRef.current) audioRef.current.volume = val / 100;
  };

  return (
    <>
      {expanded && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setExpanded(false)}
        />
      )}

      <div
        ref={sheetRef}
        className={`bottom-sheet ${expanded ? 'expanded' : 'collapsed'} md:hidden fixed inset-x-0 bottom-0 z-50`}
      >
      <div className="sheet-handle" onClick={() => setExpanded(prev => !prev)}>
        <div className="bar" />
      </div>

      {!expanded && (
        <div className="sheet-collapsed-row py-3" onClick={() => setExpanded(true)} style={{minHeight: '72px'}}>
          <img src={imgurl} alt="cover" className="w-14 h-14 rounded-md ml-3" />
          <div className="flex-1 ml-4 mr-3">
            <div className="text-sm text-white font-medium truncate pl-2">{(name || '').replace(/&amp;/g, "&").replace(/&#039;/g, "'").replace(/&quot;/g, '"')}</div>
            <h4 className="text-md font-semibold text-slate-400 truncate pl-2">{(artist || '—').replace(/&amp;/g, "&").replace(/&#039;/g, "'").replace(/&quot;/g, '"')}</h4>
            <div className="mt-3">
              <input
                type="range"
                min={0}
                max={duration || ctxDuration || 100}
                value={currentTime}
                onChange={(e) => handleSeek(Number(e.target.value))}
                className="collapsed-progress appearance-none bg-transparent"
                style={{
                  background: (() => {
                    const total = duration || ctxDuration || 1;
                    const pct = Math.max(0, Math.min(100, (currentTime / total) * 100));
                    return `linear-gradient(90deg, rgba(255,255,255,0.95) ${pct}%, rgba(148,163,184,0.18) ${pct}%)`;
                  })(),
                }}
              />
            </div>
          </div>
        </div>
      )}

      {expanded && (
        <div className="p-4">
          <div className="flex gap-4 items-start">
            <img src={imgurl} alt="cover" className="w-32 h-32 rounded-md" />
            <div className="flex-1">
              <div className="text-white font-semibold text-lg">{(name || '').replace(/&amp;/g, "&").replace(/&#039;/g, "'").replace(/&quot;/g, '"')}</div>
              <h4 className="text-md font-semibold text-slate-400">{(artist || '—').replace(/&amp;/g, "&").replace(/&#039;/g, "'").replace(/&quot;/g, '"')}</h4>
              <div className="mt-3">
                <input
                  type="range"
                  min={0}
                  max={duration || ctxDuration || 100}
                  value={currentTime}
                  onChange={(e) => handleSeek(Number(e.target.value))}
                  className="w-full appearance-none bg-transparent"
                  style={{
                    background: (() => {
                      const total = duration || ctxDuration || 1;
                      const pct = Math.max(0, Math.min(100, (currentTime / total) * 100));
                      return `linear-gradient(90deg, rgba(255,255,255,0.95) ${pct}%, rgba(148,163,184,0.18) ${pct}%)`;
                    })(),
                  }}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-4">
                <button onPointerDown={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()} onClick={handlePrev} aria-label="Previous" className="text-zinc-300"><SkipBack /></button>
                <button onPointerDown={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()} onClick={handlePlayToggle} aria-label="Play/Pause" className="text-zinc-900 bg-white rounded-full p-3 hover:bg-zinc-200 transition-colors">{isPlaying ? <Pause /> : <Play />}</button>
                <button onPointerDown={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()} onClick={handleNext} aria-label="Next" className="text-zinc-300"><SkipForward /></button>
              </div>
            <div className="flex items-center gap-2">
              <Volume2 className="text-zinc-300" />
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => handleVolumeChange(Number(e.target.value))}
                className="w-24 appearance-none bg-transparent"
                style={{
                  background: (() => {
                    const pct = Math.max(0, Math.min(100, Number(volume)));
                    return `linear-gradient(90deg, rgba(255,255,255,0.95) ${pct}%, rgba(148,163,184,0.18) ${pct}%)`;
                  })(),
                }}
              />
            </div>
          </div>

        </div>
      )}

  {/* use the global audio element from Footer (no local audio node) */}
    </div>
    </>
  );
}
