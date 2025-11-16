import { useState, useEffect, useRef } from 'react';
import { sanitizeLyrics } from '../utils/sanitize';

const LyricsDisplay = ({ lyrics, syncedLyrics, isLoadingLyrics, currentLyricIndex }) => {
  const [showSynced, setShowSynced] = useState(true);
  const lyricsContainerRef = useRef(null);

  // Auto-scroll to current lyric
  useEffect(() => {
    if (showSynced && syncedLyrics && syncedLyrics.length > 0 && currentLyricIndex >= 0) {
      const container = lyricsContainerRef.current;
      if (container) {
        const currentLyricElement = container.querySelector(`[data-lyric-index="${currentLyricIndex}"]`);
        if (currentLyricElement) {
          currentLyricElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }
      }
    }
  }, [currentLyricIndex, showSynced, syncedLyrics]);

  const handleToggleSync = () => {
    setShowSynced(!showSynced);
  };

  const renderSyncedLyrics = () => {
    if (!syncedLyrics || syncedLyrics.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="mb-4">
            <div className="w-16 h-16 bg-gray-200 border-4 border-black mx-auto mb-4" style={{transform: 'rotate(15deg)'}}></div>
          </div>
          <div className="font-bold uppercase tracking-wider">No synced lyrics available</div>
          <div className="text-sm opacity-60 mt-2">Showing plain lyrics instead</div>
        </div>
      );
    }

    return (
      <div className="relative">
        {syncedLyrics.map((lyric, index) => (
          <div
            key={index}
            data-lyric-index={index}
            className={`py-2 px-3 my-1 rounded transition-all duration-300 ${
              index === currentLyricIndex
                ? 'bg-yellow-300 border-2 border-black font-bold scale-105 shadow-lg'
                : index < currentLyricIndex
                ? 'opacity-50'
                : 'opacity-80 hover:opacity-100'
            }`}
            style={{
              transform: index === currentLyricIndex ? 'scale(1.02)' : 'scale(1)',
            }}
          >
            {sanitizeLyrics(lyric.text)}
          </div>
        ))}
      </div>
    );
  };

  const renderPlainLyrics = () => {
    return (
      <div className="relative">
        {lyrics && lyrics !== "Lyrics..." && lyrics !== "No lyrics available" ? (
          <div className="relative">
            <div className="absolute top-2 right-2 w-4 h-4 bg-yellow-400 border-2 border-black animate-pulse"></div>
            {sanitizeLyrics(lyrics)}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="mb-4">
              <div className="w-16 h-16 bg-gray-200 border-4 border-black mx-auto mb-4" style={{transform: 'rotate(15deg)'}}></div>
            </div>
            <div className="font-bold uppercase tracking-wider">No lyrics available</div>
            <div className="text-sm opacity-60 mt-2">Try another track</div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="relative h-full">
      {/* Toggle button for synced/plain lyrics */}
      {syncedLyrics && syncedLyrics.length > 0 && (
        <div className="absolute top-2 left-2 z-10">
          <button
            onClick={handleToggleSync}
            className="px-3 py-1 bg-blue-500 text-white text-xs font-bold border-2 border-black rounded hover:bg-blue-600 transition-colors"
          >
            {showSynced ? 'SYNCED' : 'PLAIN'}
          </button>
        </div>
      )}

      {/* Loading indicator */}
      {isLoadingLyrics && (
        <div className="absolute top-2 right-2 z-10">
          <div className="px-3 py-1 bg-yellow-400 text-black text-xs font-bold border-2 border-black rounded animate-pulse">
            Lyrics fetching...
          </div>
        </div>
      )}

      {/* Lyrics container */}
      <div
        ref={lyricsContainerRef}
        className="h-full overflow-y-auto px-6 py-4 whitespace-pre-wrap leading-relaxed tracking-wide text-sm font-mono text-black bg-white border-2 border-black"
        style={{fontFamily: 'Space Mono, monospace', fontSize: '0.85rem', lineHeight: '1.6'}}
      >
        {isLoadingLyrics ? (
          <div className="text-center py-12">
            <div className="mb-4">
              <div className="w-16 h-16 bg-yellow-300 border-4 border-black mx-auto mb-4 animate-pulse" style={{transform: 'rotate(15deg)'}}></div>
            </div>
            <div className="font-bold uppercase tracking-wider">Loading lyrics...</div>
            <div className="text-sm opacity-60 mt-2">Please wait</div>
          </div>
        ) : showSynced && syncedLyrics && syncedLyrics.length > 0 ? (
          renderSyncedLyrics()
        ) : (
          renderPlainLyrics()
        )}

        <div className="absolute bottom-2 left-2 w-3 h-3 bg-pink-400 border-2 border-black"></div>
      </div>
    </div>
  );
};

export default LyricsDisplay;
