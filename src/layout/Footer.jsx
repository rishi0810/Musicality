import { useState, useRef, useEffect } from "react";
import { Pause, Play, SkipForward, SkipBack, Volume2 } from "lucide-react";
import { usePlayer } from "../context/PlayerContext";
import MobileBottomBar from "../components/MobileBottomBar";
import MobileFullscreenPlayer from "../components/MobileFullscreenPlayer";
import { useNavigate } from "react-router-dom";

function Footer() {
  const {
    pid,
    songurl,
    name,
    artist,
    imgurl,
    duration,
    goToNext,
    goToPrev,
    isPlaying,
    currentTime,
    volume,
    audioRef,
    togglePlayPause,
    handleVolumeChange
  } = usePlayer();
  const [showFullscreenPlayer, setShowFullscreenPlayer] = useState(false);


  // Note: Audio event listeners are now managed centrally in PlayerContext

  // Auto-play new songs
  useEffect(() => {
    if (songurl && audioRef.current) {
      try {
        audioRef.current.load();
        audioRef.current.play().catch((error) =>
          console.warn("Auto-play failed", error)
        );
      } catch (err) {
        console.warn("Footer audio handling error:", err);
      }
    }
  }, [songurl]);

  // Apply volume to audio element when it mounts and whenever volume changes
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume / 100;
  }, [volume]);

  const handleProgressChange = (e) => {
    const newTime = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
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
        className="fixed left-1/2 bottom-4 transform -translate-x-1/2 w-10/12 max-w-4xl z-50 hidden md:flex items-center justify-center"
        style={{ paddingBottom: "env(safe-area-inset-bottom)"}
      }
      >
        <div className="w-full bg-white border-4 border-black shadow-brutal p-4 flex items-center justify-between gap-4 relative" style={{transform: 'rotate(-0.5deg)'}}>
          {/* Decorative corner elements */}
          <div className="absolute -top-2 -left-2 w-8 h-8 bg-yellow-400 border-2 border-black" style={{transform: 'rotate(45deg)'}}></div>
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-pink-500 border-2 border-black"></div>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 border-2 border-black"></div>

          {imgurl ? (
            <>
              <div className="flex items-center gap-4 relative z-10">
                <div className="relative">
                  <img
                    src={imgurl}
                    alt="Song cover"
                    className="w-16 h-16 bg-black object-cover border-3 border-black"
                    style={{border: '3px solid var(--brutal-black)', transform: 'rotate(-2deg)'}}
                  />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white border-2 border-black"></div>
                </div>
                <div className="flex flex-col min-w-0 max-w-[200px]">
                  <h4 className="font-bold text-sm uppercase tracking-wider truncate" style={{fontFamily: 'Space Mono, monospace'}}>
                    {(name || '').replace(/&amp;/g, "&").replace(/&#039;/g, "'").replace(/&quot;/g, '"')}
                  </h4>
                  <h5 className="text-xs font-bold uppercase tracking-wider opacity-70 truncate">
                    {(artist || '').replace(/&amp;/g, "&").replace(/&#039;/g, "'").replace(/&quot;/g, '"')}
                  </h5>
                  <div className="mt-1 flex items-center gap-1">
                    <div className="w-8 h-1 bg-black border border-pink-500"></div>
                    <span className="text-xs font-bold uppercase">NOW PLAYING</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="w-24 h-16 bg-gray-200 border-3 border-black flex items-center justify-center">
              <span className="text-xs font-bold uppercase">NO TRACK</span>
            </div>
          )}
          {/* Global audio element - now managed by PlayerContext */}
          <audio id="global-audio" ref={audioRef} src={songurl} />

          <div className="flex flex-col items-center flex-1 mx-6 relative z-10">
            <div className="flex gap-3 w-full items-center mb-3">
              <span className="text-xs font-bold font-mono bg-yellow-300 px-2 py-1 border-2 border-black">
                {formatTime(currentTime)}
              </span>
              <div className="flex-1 relative">
                <input
                  type="range"
                  min="0"
                  max={duration || duration || 0}
                  step="0.1"
                  value={currentTime}
                  onChange={handleProgressChange}
                  className="w-full h-3 cursor-pointer appearance-none bg-white border-2 border-black"
                  style={{
                    background: (() => {
                      const total = duration || duration || 1;
                      const pct = Math.max(0, Math.min(100, (currentTime / total) * 100));
                      return `linear-gradient(90deg, var(--brutal-black) ${pct}%, var(--brutal-light-gray) ${pct}%)`;
                    })(),
                  }}
                />
                <div className="absolute -top-1 left-0 w-full h-1 bg-pink-500 border border-black" style={{width: `${Math.max(0, Math.min(100, (currentTime / (duration || duration || 1)) * 100))}%`}}></div>
              </div>
              <span className="text-xs font-bold font-mono bg-blue-300 px-2 py-1 border-2 border-black">
                {formatTime(duration || duration)}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                className="brutal-button p-3 bg-white text-black hover:bg-yellow-300 group border-2 border-black"
                onClick={goToPrev}
                style={{transform: 'rotate(-3deg)'}}
              >
                <SkipBack className="size-4 text-black group-hover:scale-110 transition-transform" />
              </button>

              <button
                className="brutal-button p-4 bg-white text-black hover:bg-pink-500 border-2 border-black"
                onClick={togglePlayPause}
                aria-label={isPlaying ? "Pause" : "Play"}
                style={{transform: 'rotate(1deg) scale(1.1)'}}
              >
                {isPlaying ? (
                  <Pause className="size-6 text-black" />
                ) : (
                  <Play className="size-6 text-black" />
                )}
              </button>

              <button
                className="brutal-button p-3 bg-white text-black hover:bg-yellow-300 group border-2 border-black"
                onClick={goToNext}
                style={{transform: 'rotate(3deg)'}}
              >
                <SkipForward className="size-4 text-black group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>

          <div className="flex gap-2 items-center relative z-10">
            <div className="brutal-button p-2 bg-white text-black hover:bg-blue-400 border-2 border-black">
              <Volume2 className="size-4 text-black" />
            </div>
            <div className="relative">
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={volume}
                onChange={(e) => handleVolumeChange(e.target.value)}
                className="w-20 h-6 appearance-none bg-white border-2 border-black cursor-pointer"
                style={{
                  background: (() => {
                    const pct = Math.max(0, Math.min(100, Number(volume)));
                    return `linear-gradient(90deg, var(--brutal-green) ${pct}%, var(--brutal-light-gray) ${pct}%)`;
                  })(),
                }}
              />
              <div className="absolute -bottom-1 right-0 w-3 h-3 bg-green-400 border-2 border-black"></div>
            </div>
          </div>
        </div>
      </footer>
      {/* Mobile components (hidden on md+) */}
      <div className="md:hidden">
        <MobileBottomBar onOpenPlayer={() => setShowFullscreenPlayer(true)} />
        {showFullscreenPlayer && (
          <MobileFullscreenPlayer onClose={() => setShowFullscreenPlayer(false)} />
        )}
      </div>
    </>
  );
}

export default Footer;
