import { useNavigate } from 'react-router-dom';
import { Music, Play } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import useCurrentRoute from '../hooks/useCurrentRoute';

const BackToSong = () => {
  const navigate = useNavigate();
  const { pid, isPlaying } = usePlayer();
  const { isSongPage } = useCurrentRoute();

  // Only show if:
  // 1. A song is currently playing (pid exists)
  // 2. We're not already on the song page
  if (!pid || isSongPage) {
    return null;
  }

  const handleBackToSong = () => {
    // Navigate to /song - context is preserved because PlayerContext wraps the entire app
    navigate('/song');
  };

  return (
    <button
      onClick={handleBackToSong}
      className="group relative bg-white border-4 border-black shadow-brutal p-3 hover:bg-yellow-100 transition-all duration-200 hover:shadow-lg"
      style={{ transform: 'rotate(1deg)' }}
      title="Back to Song"
    >
      {/* Decorative corner elements */}
      <div className="absolute -top-2 -right-2 w-4 h-4 bg-pink-400 border-2 border-black group-hover:bg-pink-500 transition-colors" style={{ transform: 'rotate(45deg)' }}></div>
      <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-400 border-2 border-black group-hover:bg-blue-500 transition-colors"></div>

      <div className="flex items-center gap-2 relative z-10">
        {/* Music/Play icon with animation */}
        <div className="relative">
          <div className={`p-2 rounded-lg border-2 border-black transition-all duration-300 ${
            isPlaying ? 'bg-green-400' : 'bg-yellow-400'
          } group-hover:scale-110`}>
            {isPlaying ? (
              <Music className="w-4 h-4 text-black" />
            ) : (
              <Play className="w-4 h-4 text-black" />
            )}
          </div>
          {isPlaying && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 border border-black rounded-full animate-pulse"></div>
          )}
        </div>

        {/* Back to Song text */}
        <div className="flex flex-col items-start text-left">
          <div className="text-sm font-bold font-mono text-black uppercase tracking-wider">
            BACK TO SONG
          </div>
          <div className="text-xs font-mono text-gray-600">
            {isPlaying ? 'Now Playing' : 'Paused'}
          </div>
        </div>

        {/* Arrow indicator */}
        <div className="ml-2 p-1 border-2 border-black rounded bg-white group-hover:bg-blue-400 transition-colors">
          <svg className="w-3 h-3 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6"/>
          </svg>
        </div>
      </div>

      {/* Hover effect border highlight */}
      <div className="absolute inset-0 border-4 border-transparent group-hover:border-blue-500 transition-colors rounded pointer-events-none"></div>
    </button>
  );
};

export default BackToSong;