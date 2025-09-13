import { useState } from 'react';
import PropTypes from 'prop-types';
import UpNextQueue from './UpNextQueue.jsx';
import LyricsDisplay from './LyricsDisplay.jsx';

const tabs = [
  { id: 'UP_NEXT', label: 'Up Next' },
  { id: 'LYRICS', label: 'Lyrics' }
];

const QueueAndLyricsSection = ({ album, lyrics, setpid, formatTime, currentSong }) => {
  const [activeTab, setActiveTab] = useState('UP_NEXT');

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-6 pt-4 border-b border-zinc-800/80 backdrop-blur-sm">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative pb-3 text-sm font-medium tracking-wide transition-colors ${
              activeTab === tab.id ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute left-0 -bottom-px h-[2px] w-full bg-sky-500 rounded-full" />
            )}
          </button>
        ))}
      </div>
  <div className="flex-grow px-4 pb-4 flex flex-col">
        <div className="flex-1">
          {activeTab === 'UP_NEXT' ? (
            <UpNextQueue album={album} setpid={setpid} formatTime={formatTime} currentSong={currentSong} />
          ) : (
            <div className="h-full max-h-[calc(100vh-360px)] overflow-y-auto styled-scrollbar">
              <LyricsDisplay lyrics={lyrics} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QueueAndLyricsSection;

QueueAndLyricsSection.propTypes = {
  album: PropTypes.arrayOf(PropTypes.object),
  lyrics: PropTypes.string,
  setpid: PropTypes.func,
  formatTime: PropTypes.func,
  currentSong: PropTypes.shape({
    name: PropTypes.string,
    artist: PropTypes.string,
    cover: PropTypes.string,
    lyrics: PropTypes.string,
  })
};
