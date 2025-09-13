import { usePlayer } from "../context/PlayerContext";
import VisualizerSection from './VisualizerSection.jsx';
import QueueAndLyricsSection from './QueueAndLyricsSection.jsx';
import Header from '../layout/Header';
import { useEffect } from 'react';

const PlayerView = () => {
  const {
    name,
    artist,
    imgurl,
    lyrics,
    album,
    setPid,
    setArtistid,
    setChangeAlbum,
    setAlbum,
  } = usePlayer();

  const formatTime = (time) => {
    if (!time) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}`;
  };

  const currentSong = {
    cover: imgurl,
    name: name,
    artist: artist,
    lyrics: lyrics,
  };

  useEffect(() => {
    // Toggle desktop-no-scroll on desktop viewports to prevent page scroll when player view is active
    const mq = window.matchMedia('(min-width: 768px)');
    const apply = () => {
      if (mq.matches) document.documentElement.classList.add('desktop-no-scroll');
      else document.documentElement.classList.remove('desktop-no-scroll');
    };
    apply();
    mq.addEventListener('change', apply);
    return () => {
      mq.removeEventListener('change', apply);
      document.documentElement.classList.remove('desktop-no-scroll');
    };
  }, []);

  return (
    <>
      <Header
        setpid={setPid}
        render={true}
        setartistid={setArtistid}
        setchangealbum={setChangeAlbum}
        setalbum={setAlbum}
      />
  <div className="min-h-screen bg-zinc-950">
        <div className="mx-auto max-w-7xl px-6 py-4 md:py-8 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
          <div className="md:col-span-2 rounded-xl bg-zinc-900/60 backdrop-blur-sm border border-zinc-800 shadow-lg overflow-hidden p-6 md:p-6">
            <VisualizerSection currentSong={currentSong} />
          </div>
          <div className="rounded-xl bg-zinc-900/60 backdrop-blur-sm border border-zinc-800 shadow-lg overflow-hidden p-6 md:p-6">
            <QueueAndLyricsSection
              album={album}
              lyrics={lyrics}
              setpid={setPid}
              formatTime={formatTime}
              currentSong={currentSong}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default PlayerView;
