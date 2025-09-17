import { useState, useRef, useEffect } from "react";
import { Pause, Play, SkipForward, SkipBack, Volume2 } from "lucide-react";
import { usePlayer } from "../context/PlayerContext";
import MobileBottomSheet from "../components/MobileBottomSheet";

function Footer() {
  const { pid, songurl, name, artist, imgurl, album, setPid, duration: ctxDuration, goToNext, goToPrev, autoNext } = usePlayer();
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(100);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);


  useEffect(() => {
    if (songurl) {
      try {
        if (audioRef.current) {
          audioRef.current.load();
          audioRef.current.play().catch((error) =>
            console.warn("Auto-play failed", error)
          );
        }
      } catch (err) {
        console.warn("Footer audio handling error:", err);
      }
    }
  }, [songurl]);

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
    if (next && next.id) {
      setPid(next.id);
    }
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
    if (prev && prev.id) {
      setPid(prev.id);
    }
  };

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.pause();
      else audioRef.current.play();
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = e.target.value;
    setVolume(newVolume);
    if (audioRef.current) audioRef.current.volume = newVolume / 100;
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      setCurrentTime(audio.currentTime || 0);
      setDuration(audio.duration || ctxDuration || 0);
    };

    const onLoadedMetadata = () => setDuration(audio.duration || ctxDuration || 0);

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
    };
  }, [ctxDuration]);

  // Apply volume to audio element when it mounts and whenever volume changes
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume / 100;
  }, [volume]);

  const handleProgressChange = (e) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    audioRef.current.currentTime = newTime;
  };

  const formatTime = (time) => {
    if (!time) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}`;
  };

  return (
    <>
      <footer
        className="fixed left-1/2 bottom-2 transform -translate-x-1/2 w-7/12 z-50 hidden md:flex items-center justify-center"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="w-full bg-zinc-900/60 backdrop-blur-md rounded-full shadow-xl px-4 py-2 flex items-center justify-between gap-3 border border-zinc-800">
          {imgurl ? (
            <>
              <div className="flex items-center gap-3">
                <img
                  src={imgurl}
                  alt="Song cover"
                  className="w-10 h-10 rounded-full bg-zinc-900 object-cover"
                />
                <div className="flex flex-col min-w-0 max-w-[260px]">
                  <h4 className="text-white text-sm font-semibold truncate">{(name || '').replace(/&amp;/g, "&").replace(/&#039;/g, "'").replace(/&quot;/g, '"')}</h4>
                  <h5 className="text-zinc-400 text-xs truncate">{(artist || '').replace(/&amp;/g, "&").replace(/&#039;/g, "'").replace(/&quot;/g, '"')}</h5>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="w-1/12 h-full"></div>
            </>
          )}
          <audio id="global-audio" ref={audioRef} src={songurl} onEnded={() => { if (autoNext && typeof goToNext === 'function') goToNext(); else songchangefwd(); }} />

          <div className="flex flex-col items-center flex-1 mx-4">
            <div className="flex gap-2 w-2/3 items-center">
              <span className="text-slate-400 text-sm font-mono">
                {formatTime(currentTime)}
              </span>
              <input
                type="range"
                min="0"
                max={duration || ctxDuration || 0}
                step="0.1"
                value={currentTime}
                onChange={handleProgressChange}
                className="w-full h-1 rounded-full cursor-pointer appearance-none bg-zinc-700/30"
                style={{
                  background: (() => {
                    const total = duration || ctxDuration || 1;
                    const pct = Math.max(0, Math.min(100, (currentTime / total) * 100));
                    return `linear-gradient(90deg, rgba(255,255,255,0.95) ${pct}%, rgba(148,163,184,0.18) ${pct}%)`;
                  })(),
                }}
              />
              <span className="text-slate-400 text-sm font-mono">
                {formatTime(duration || ctxDuration)}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <button
                className="text-zinc-400 hover:text-white transition-colors"
                onClick={() => { if (typeof goToPrev === 'function') goToPrev(); else songchangebwd(); }}
              >
                <SkipBack className="size-5" />
              </button>

              <button
                className="text-zinc-900 bg-white rounded-full p-2 hover:bg-zinc-200 transition-colors"
                onClick={togglePlayPause}
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <Pause className="size-4" />
                ) : (
                  <Play className="size-4" />
                )}
              </button>

              <button
                className="text-zinc-400 hover:text-white transition-colors"
                onClick={() => { if (typeof goToNext === 'function') goToNext(); else songchangefwd(); }}
              >
                <SkipForward className="size-5" />
              </button>
            </div>
          </div>

          <div className="p-1 flex gap-2 items-center">
            <button className="text-zinc-400 hover:text-white">
              <Volume2 className="size-5" />
            </button>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={volume}
              onChange={handleVolumeChange}
              className="w-28 h-1 appearance-none bg-zinc-700/30"
              style={{
                background: (() => {
                  const pct = Math.max(0, Math.min(100, Number(volume)));
                  return `linear-gradient(90deg, rgba(255,255,255,0.95) ${pct}%, rgba(148,163,184,0.18) ${pct}%)`;
                })(),
              }}
            />
          </div>
        </div>
      </footer>
  {/* Mobile bottom sheet (hidden on md+) */}
  <MobileBottomSheet />
    </>
  );
}

export default Footer;
