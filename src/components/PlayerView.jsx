import { usePlayer } from "../context/PlayerContext";
import VisualizerSection from "./VisualizerSection.jsx";
import QueueAndLyricsSection from "./QueueAndLyricsSection.jsx";
import Header from "../layout/Header";
import { useEffect } from "react";

const PlayerView = () => {
  const {
    name,
    artist,
    imgurl,
    lyrics,
    syncedLyrics,
    isLoadingLyrics,
    currentLyricIndex,
    album,
    setPid,
    setArtistid,
    setChangeAlbum,
    setAlbum,
    pid,
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
    id: pid,
    cover: imgurl,
    name: name,
    artist: artist,
    lyrics: lyrics,
  };

  return (
    <>
      <Header
        setpid={setPid}
        render={true}
        setartistid={setArtistid}
        setchangealbum={setChangeAlbum}
        setalbum={setAlbum}
      />
      <div
        className="min-h-screen"
        style={{
          background:
            "linear-gradient(135deg, var(--brutal-white) 0%, var(--brutal-light-gray) 50%, var(--brutal-white) 100%)",
        }}
      >
        <div className="mx-auto max-w-7xl px-4 md:px-8 py-6 md:py-12 pb-32 md:pb-40">
          <div className="relative mb-8">
            <div
              className="absolute -top-4 -left-8 w-16 h-16 bg-yellow-400 border-4 border-black"
              style={{ transform: "rotate(-15deg)" }}
            ></div>
            <h1
              className="brutal-heading text-3xl md:text-5xl relative z-10"
              style={{ textShadow: "4px 4px 0px rgb(255, 20, 147)" }}
            >
              // NOW PLAYING
            </h1>
            <div className="mt-2 flex items-center gap-2">
              <div className="w-12 h-1 bg-black border-2 border-blue-500"></div>
              <span className="text-sm font-bold uppercase tracking-wider">
              La música es vida
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 lg:items-start">
            <div className="lg:col-span-1 relative">
              <div
                className="brutal-card p-6 md:p-8 relative overflow-hidden h-auto lg:h-[580px]"
                style={{
                  background:
                    "linear-gradient(45deg, var(--brutal-white) 0%, var(--brutal-light-gray) 100%)",
                  transform: "rotate(-0.5deg)",
                }}
              >
                <div
                  className="absolute top-4 right-4 w-8 h-8 bg-pink-500 border-2 border-black"
                  style={{ transform: "rotate(25deg)" }}
                ></div>
                <div className="absolute bottom-6 left-6 w-6 h-6 bg-blue-400 border-2 border-black"></div>
                <div
                  className="absolute -bottom-2 -right-2 w-32 h-32 bg-yellow-300 opacity-20 border-4 border-black"
                  style={{ transform: "rotate(45deg)" }}
                ></div>

                <VisualizerSection currentSong={currentSong} />
              </div>
            </div>

            <div className="relative">
              <div
                className="brutal-card p-6 h-auto lg:h-[580px] overflow-hidden flex flex-col"
                style={{
                  background: "var(--brutal-white)",
                  transform: "rotate(0.3deg)",
                }}
              >
                <div className="absolute -top-3 -right-3 w-6 h-6 bg-green-400 border-2 border-black animate-pulse"></div>
                <div className="absolute top-2 left-2 w-4 h-4 bg-red-500 border-2 border-black"></div>

                <QueueAndLyricsSection
                  album={album}
                  lyrics={lyrics}
                  syncedLyrics={syncedLyrics}
                  isLoadingLyrics={isLoadingLyrics}
                  currentLyricIndex={currentLyricIndex}
                  setpid={setPid}
                  formatTime={formatTime}
                  currentSong={currentSong}
                />
              </div>
            </div>
          </div>

          <div
            className="fixed top-20 right-8 w-12 h-12 bg-blue-500 border-4 border-black hidden lg:block"
            style={{ transform: "rotate(15deg)" }}
          ></div>
          <div className="fixed bottom-20 left-8 w-8 h-8 bg-pink-400 border-3 border-black hidden lg:block animate-bounce"></div>
        </div>
      </div>
    </>
  );
};

export default PlayerView;
