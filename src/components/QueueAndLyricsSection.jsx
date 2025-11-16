import { useState } from 'react';
import UpNextQueue from './UpNextQueue.jsx';
import LyricsDisplay from './LyricsDisplay.jsx';

const tabs = [
  { id: 'UP_NEXT', label: 'Up Next' },
  { id: 'LYRICS', label: 'Lyrics' }
];

const QueueAndLyricsSection = ({ album, lyrics, setpid, formatTime, currentSong, syncedLyrics, isLoadingLyrics, currentLyricIndex }) => {
  const [activeTab, setActiveTab] = useState('UP_NEXT');

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-2 md:px-4 py-2 md:py-3 border-b-4 border-black bg-white flex-shrink-0">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative pb-2 text-sm font-bold uppercase tracking-wider transition-colors brutal-button px-3 py-1 ${
              activeTab === tab.id ? 'bg-yellow-300 text-black' : 'bg-white text-black hover:bg-yellow-300'
            }`}
            style={{transform: activeTab === tab.id ? 'rotate(-1deg)' : 'rotate(1deg)'}}
          >
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-pink-500 border-2 border-black animate-pulse" />
            )}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto styled-scrollbar px-1 py-1 md:px-2 md:py-2">
        {activeTab === 'UP_NEXT' ? (
          <UpNextQueue album={album} setpid={setpid} formatTime={formatTime} currentSong={currentSong} />
        ) : (
          <div className="p-2 md:p-4">
            <LyricsDisplay
              lyrics={lyrics}
              syncedLyrics={syncedLyrics}
              isLoadingLyrics={isLoadingLyrics}
              currentLyricIndex={currentLyricIndex}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default QueueAndLyricsSection;

