import { sanitizeLyrics } from '../utils/sanitize';

const LyricsDisplay = ({ lyrics }) => {
  return (
    <div className="relative h-full">
      <div className="h-full overflow-y-auto px-6 py-4 whitespace-pre-wrap leading-relaxed tracking-wide text-sm font-mono text-black bg-white border-2 border-black" style={{fontFamily: 'Space Mono, monospace', fontSize: '0.85rem', lineHeight: '1.6'}}>
        {lyrics ? (
          <div className="relative">
            <div className="absolute top-2 right-2 w-4 h-4 bg-yellow-400 border-2 border-black animate-pulse"></div>
            <div className="absolute bottom-2 left-2 w-3 h-3 bg-pink-400 border-2 border-black"></div>
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
    </div>
  );
};

export default LyricsDisplay;
