import PropTypes from 'prop-types';

const LyricsDisplay = ({ lyrics }) => {
  return (
    <div className="relative h-full max-h-[calc(100vh-220px)]">
      <div className="absolute inset-0 overflow-y-auto px-8 py-6 whitespace-pre-wrap leading-relaxed tracking-wide text-[0.85rem] md:text-sm text-slate-300 font-light styled-scrollbar lyric-scroll">
        {lyrics || 'No lyrics available'}
      </div>
      <div className="pointer-events-none absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-zinc-900/80 to-transparent" />
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-zinc-900/80 to-transparent" />
    </div>
  );
};

export default LyricsDisplay;

LyricsDisplay.propTypes = {
  lyrics: PropTypes.string
};
