import React, { useState, useRef, useEffect } from "react";
import { Pause, Play, SkipForward, SkipBack, Volume2 } from "lucide-react";

function Footer({ songurl, name, artist, imgurl, album, setpid }) {
  const audioRef = useRef(null);
  //Defining Volume Control States
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(100);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  //Song List Control
  const [index, setindex] = useState(0);

  //Autoplay on Selecting a Song
  useEffect(() => {
    if (songurl) {
      audioRef.current.load();
      audioRef.current
        .play()
        .catch((error) => console.log("Auto-play failed", error));
      setIsPlaying(true);
    }
  }, [songurl]);

  // Handling Song Forward or Backward from User
  const songchangefwd = () => {
    setindex((prevIndex) => {
      const newIndex = prevIndex < album.length - 1 ? prevIndex + 1 : 0;
      setpid(album[newIndex].id);
      return newIndex;
    });
  };

  const songchangebwd = () => {
    setindex((prevIndex) => {
      const newIndex = prevIndex > 0 ? prevIndex - 1 : album.length - 1;
      setpid(album[newIndex].id);
      return newIndex;
    });
  };

  // Handle Resume and Pause
  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  //Handle Volume Slider
  const handleVolumeChange = (e) => {
    const newVolume = e.target.value;
    setVolume(newVolume);
    if (audioRef.current) audioRef.current.volume = newVolume / 100;
  };

  //Handle Progressbar Change
  useEffect(() => {
    const audio = audioRef.current;

    // Updating Current Time and Duration
    const updateTime = () => {
      setCurrentTime(audio.currentTime);
      setDuration(audio.duration);
    };

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", () => {
      setDuration(audio.duration);
    });

    //Removing Event Listener on Unmount
    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", () => {
        setDuration(audio.duration);
      });
    };
  }, []);

  //Extracting new current time
  const handleProgressChange = (e) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    audioRef.current.currentTime = newTime;
  };

  //Function to format the Duration and Current Progress
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
      <footer className="fixed bottom-0 w-full bg-zinc-950 border-t border-zinc-800 py-2">
        <div className="max-w-full px-8 flex justify-between items-center">
          {imgurl ? (
            <>
              <div className="flex items-center gap-4 ">
                <img
                  src={imgurl}
                  alt="Song cover"
                  className="w-12 h-12 rounded-md p-1 bg-zinc-900"
                />
                <div>
                  <h4 className="text-white font-semibold ">
                    {name
                      .replace(/&amp;/g, "&")
                      .replace(/&#039;/g, "'")
                      .replace(/&quot;/g, '"')}
                  </h4>

                  <h5 className="text-zinc-400 text-sm">
                    {artist
                      .replace(/&amp;/g, "&")
                      .replace(/&#039;/g, "'")
                      .replace(/&quot;/g, '"')}
                  </h5>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="w-1/12 h-full"></div>
            </>
          )}
          <audio ref={audioRef} src={songurl} onEnded={songchangefwd} />

          <div className="flex flex-col items-center w-1/2">
            <div className="flex gap-2 w-2/3 items-center">
              <span className="text-slate-400 text-sm font-mono">
                {formatTime(currentTime)}
              </span>
              <input
                type="range"
                min="0"
                max={duration}
                step="0.1"
                value={currentTime}
                onChange={handleProgressChange}
                className="w-full h-1 rounded-full cursor-pointer bg-transparent"
              />
              <span className="text-slate-400 text-sm font-mono">
                {formatTime(duration)}
              </span>
            </div>
            <div className="flex items-center gap-6">
              <button
                className="text-zinc-400 hover:text-white transition-colors"
                onClick={songchangebwd}
              >
                <SkipBack className="size-5" />
              </button>

              <button
                className="text-white bg-blue-600 rounded-full p-3 hover:bg-blue-700 transition-colors"
                onClick={togglePlayPause}
              >
                {isPlaying ? (
                  <Pause className="size-4" />
                ) : (
                  <Play className="size-4" />
                )}
              </button>

              <button
                className="text-zinc-400 hover:text-white transition-colors"
                onClick={songchangefwd}
              >
                <SkipForward className="size-5" />
              </button>
            </div>
          </div>

          <div className="p-1 flex gap-2 items-center">
            <button className="text-zinc-400 hover:text-white">
              <Volume2 className="size-5" />
            </button>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={volume}
              onChange={handleVolumeChange}
              className="w-28 h-1 accent-blue-600"
            />
          </div>
        </div>
      </footer>
    </>
  );
}

export default Footer;
