import { X, Play, Pause, SkipBack, SkipForward, Volume2 } from "lucide-react";
import { usePlayer } from "../context/PlayerContext";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";

function MobileFullscreenPlayer({ onClose }) {
  const {
    name,
    artist,
    imgurl,
    isPlaying,
    currentTime,
    duration,
    volume,
    togglePlayPause,
    handleVolumeChange,
    goToNext,
    goToPrev,
    setCurrentTime,
  } = usePlayer();

  const [localVolume, setLocalVolume] = useState(volume);
  const [state, setState] = useState({
    dragOffset: 0,
    isAnimating: false
  });

  const dragRef = useRef({
    isDragging: false,
    startY: 0,
    isClosing: false,
    isOpening: false
  });

  const sheetRef = useRef(null);
  const animationTimeoutRef = useRef(null);

  const ANIMATION_DURATION = 300;
  const CLOSE_THRESHOLD_RATIO = 0.33;
  const MIN_CLOSE_THRESHOLD = 150;
  const MAX_SHEET_HEIGHT = window.innerHeight * 0.9;

  useEffect(() => {
    setLocalVolume(volume);
  }, [volume]);

  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    dragRef.current.isDragging = true;
    dragRef.current.startY = e.clientY;
  }, []);

  const handleTouchStart = useCallback((e) => {
    dragRef.current.isDragging = true;
    dragRef.current.startY = e.touches[0].clientY;
  }, []);

  const closeWithAnimation = useCallback(() => {
    dragRef.current.isClosing = true;
    setState(prev => ({ ...prev, dragOffset: window.innerHeight, isAnimating: true }));
    
    if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);
    
    animationTimeoutRef.current = setTimeout(() => {
      onClose();
      dragRef.current.isClosing = false;
      setState({ dragOffset: 0, isAnimating: false });
    }, ANIMATION_DURATION);
  }, [onClose, ANIMATION_DURATION]);

  const handleDragEnd = useCallback(() => {
    if (!dragRef.current.isDragging) return;
    dragRef.current.isDragging = false;
    
    const sheetHeight = sheetRef.current?.offsetHeight || MAX_SHEET_HEIGHT;
    const threshold = Math.min(MIN_CLOSE_THRESHOLD, sheetHeight * CLOSE_THRESHOLD_RATIO);
    
    if (state.dragOffset > threshold) {
      closeWithAnimation();
    } else {
      setState(prev => ({ ...prev, dragOffset: 0 }));
      dragRef.current.startY = 0;
    }
  }, [state.dragOffset, closeWithAnimation, MAX_SHEET_HEIGHT, MIN_CLOSE_THRESHOLD, CLOSE_THRESHOLD_RATIO]);

  const handleProgressChange = (e) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);

    const audio = document.getElementById("global-audio");
    if (audio) {
      audio.currentTime = newTime;
    }
  };

  const handleVolumeSliderChange = (e) => {
    const newVolume = parseInt(e.target.value);
    setLocalVolume(newVolume);
    handleVolumeChange(newVolume);
  };

  const formatTime = (time) => {
    if (!time) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${String(seconds).padStart(2, "0")}`;
  };

  // Combined effect for drag handling and scroll prevention
  useEffect(() => {
    const drag = dragRef.current;
    
    const handleMouseMove = (e) => {
      if (!drag.isDragging) return;
      e.preventDefault();
      const offset = Math.max(0, e.clientY - drag.startY);
      setState(prev => ({ ...prev, dragOffset: offset }));
    };

    const handleTouchMove = (e) => {
      if (!drag.isDragging) return;
      e.preventDefault();
      const offset = Math.max(0, e.touches[0].clientY - drag.startY);
      setState(prev => ({ ...prev, dragOffset: offset }));
    };

    const handleEnd = () => {
      if (!drag.isDragging) return;
      handleDragEnd();
    };

    const preventScroll = (e) => {
      if (drag.isDragging) e.preventDefault();
    };

    // Add all listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleEnd);
    document.addEventListener('wheel', preventScroll, { passive: false });
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleEnd);
      document.removeEventListener('wheel', preventScroll);
    };
  }, [handleDragEnd]);

  // Opening animation effect
  useEffect(() => {
    Object.assign(dragRef.current, { isOpening: true, isClosing: false, isDragging: false, startY: 0 });
    setState({ dragOffset: window.innerHeight, isAnimating: true });
    document.body.style.overflow = 'hidden';
    
    const openTimer = setTimeout(() => {
      setState({ dragOffset: 0, isAnimating: true });
      setTimeout(() => {
        dragRef.current.isOpening = false;
        setState(prev => ({ ...prev, isAnimating: false }));
      }, ANIMATION_DURATION);
    }, 10);
    
    return () => {
      clearTimeout(openTimer);
      document.body.style.overflow = 'unset';
    };
  }, [ANIMATION_DURATION]);

  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      closeWithAnimation();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end justify-center"
      onClick={handleBackdropClick}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div 
        ref={sheetRef}
        className="w-full bg-white border-t-4 border-black rounded-t-3xl max-h-[90vh] overflow-hidden flex flex-col"
        style={{
          transform: `translateY(${state.dragOffset}px)`,
          transition: (dragRef.current.isDragging && !dragRef.current.isClosing && !dragRef.current.isOpening) 
            ? 'none' 
            : `transform ${ANIMATION_DURATION}ms ease-out`,
        }}
      >
        {/* Draggable Header with close button */}
        <div 
          className="sticky top-0 bg-white border-b-2 border-black px-4 py-3 flex justify-between items-center"
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          style={{ 
            cursor: dragRef.current.isDragging ? 'grabbing' : 'grab',
          }}
        >
          {/* Drag pill indicator */}
          <div 
            className="absolute top-2 left-1/2 transform -translate-x-1/2 w-10 h-1 bg-gray-400 rounded-full"
            style={{ pointerEvents: 'none' }}
          />
          
          <h2
            className="font-bold text-lg uppercase tracking-wider text-black"
            style={{ fontFamily: "Space Mono, monospace" }}
          >
            NOW PLAYING
          </h2>
          <button
            className="brutal-button p-2 bg-white hover:bg-gray-200 border-2 border-black"
            onClick={closeWithAnimation}
            aria-label="Close player"
          >
            <X className="size-5 text-black" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col items-center space-y-6 overflow-y-auto flex-1">
          {/* Album artwork */}
          <div className="relative">
            <img
              src={imgurl || "/music-logo.svg"}
              alt="Song cover"
              className="w-64 h-64 bg-black object-cover rounded-2xl border-4 border-black shadow-lg"
              style={{ boxShadow: "8px 8px 0px rgba(0,0,0,1)" }}
              onError={(e) => {
                e.target.src = "/music-logo.svg";
              }}
            />
            {/* Decorative corner element */}
            <div
              className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 border-2 border-black"
              style={{ transform: "rotate(12deg)" }}
            ></div>
          </div>

          {/* Song info */}
          <div className="text-center space-y-2 max-w-full">
            <h3
              className="font-bold text-xl uppercase tracking-wider text-black break-words"
              style={{ fontFamily: "Space Mono, monospace" }}
            >
              {(name || "Unknown Track")
                .replace(/&amp;/g, "&")
                .replace(/&#039;/g, "'")
                .replace(/&quot;/g, '"')}
            </h3>
            <p
              className="text-lg font-bold uppercase tracking-wide text-gray-700"
              style={{ fontFamily: "IBM Plex Mono, monospace" }}
            >
              {(artist || "Unknown Artist")
                .replace(/&amp;/g, "&")
                .replace(/&#039;/g, "'")
                .replace(/&quot;/g, '"')}
            </p>
          </div>

          {/* Progress bar */}
          <div className="w-full space-y-2">
            <div className="flex items-center gap-3">
              <span
                className="text-sm font-bold font-mono bg-yellow-300 px-2 py-1 border-2 border-black min-w-[50px] text-center"
                style={{ fontFamily: "IBM Plex Mono, monospace" }}
              >
                {formatTime(currentTime)}
              </span>
              <div className="flex-1 relative">
                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  step="0.1"
                  value={currentTime}
                  onChange={handleProgressChange}
                  className="w-full h-3 cursor-pointer appearance-none bg-white border-2 border-black"
                  style={{
                    background: (() => {
                      const total = duration || 1;
                      const pct = Math.max(
                        0,
                        Math.min(100, (currentTime / total) * 100)
                      );
                      return `linear-gradient(90deg, #000000 ${pct}%, #f3f4f6 ${pct}%)`;
                    })(),
                  }}
                />
              </div>
              <span
                className="text-sm font-bold font-mono bg-blue-300 px-2 py-1 border-2 border-black min-w-[50px] text-center"
                style={{ fontFamily: "IBM Plex Mono, monospace" }}
              >
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Control buttons */}
          <div className="flex items-center gap-6">
            <button
              className="brutal-button p-4 bg-white hover:bg-yellow-300 border-2 border-black"
              onClick={goToPrev}
              style={{ transform: "rotate(-3deg)" }}
            >
              <SkipBack className="size-6 text-black" />
            </button>

            <button
              className="brutal-button p-6 bg-white text-black hover:bg-pink-500 border-2 border-black"
              onClick={togglePlayPause}
              aria-label={isPlaying ? "Pause" : "Play"}
              style={{ transform: "rotate(1deg) scale(1.1)" }}
            >
              {isPlaying ? (
                <Pause className="size-8 text-black" />
              ) : (
                <Play className="size-8 text-black" />
              )}
            </button>

            <button
              className="brutal-button p-4 bg-white hover:bg-yellow-300 border-2 border-black"
              onClick={goToNext}
              style={{ transform: "rotate(3deg)" }}
            >
              <SkipForward className="size-6 text-black" />
            </button>
          </div>

          {/* Volume control */}
          <div className="w-full flex flex-col items-center gap-3 max-w-xs">
            <div className="flex items-center gap-3 w-full">
              <Volume2 className="size-6 text-black flex-shrink-0 self-start" />
              <div className="flex-1 relative">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={localVolume}
                  onChange={handleVolumeSliderChange}
                  className="w-full h-6 appearance-none bg-white border-2 border-black cursor-pointer"
                  style={{
                    background: (() => {
                      const pct = Math.max(0, Math.min(100, localVolume));
                      return `linear-gradient(90deg, #10b981 ${pct}%, #f3f4f6 ${pct}%)`;
                    })(),
                  }}
                />
                {/* Volume indicator */}
                <div className="text-center mt-2">
                  <span
                    className="text-sm font-bold uppercase"
                    style={{ fontFamily: "IBM Plex Mono, monospace" }}
                  >
                    Volume: {localVolume}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MobileFullscreenPlayer;
