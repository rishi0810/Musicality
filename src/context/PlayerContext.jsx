/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { sanitizeSongMetadata, sanitizeLyrics } from "../utils/sanitize";

const PlayerContext = createContext(null);

export const PlayerProvider = ({ children }) => {
  const placeholder_song_url = "/music-logo.svg";

  const [pid, setPid] = useState("");
  const [songurl, setSongurl] = useState("");
  const [duration, setDuration] = useState(0);
  const [name, setName] = useState("");
  const [artist, setArtist] = useState("");
  const [imgurl, setImgurl] = useState(placeholder_song_url);
  const [lyrics, setLyrics] = useState("Lyrics....");
  const [artistid, setArtistid] = useState("");

  const [album, setAlbum] = useState([]);
  const [changealbum, setChangeAlbum] = useState(false);
  const [autoNext, setAutoNext] = useState(true);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(100);
  const audioRef = useRef(null);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(console.warn);
      }
    }
  };

  const handleVolumeChange = (newVolume) => {
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
    }
  };

  // Helper to get highest quality audio URL (last item in downloadUrl array)
  const getHighestQualityAudioUrl = (downloadUrlArray) => {
    if (!Array.isArray(downloadUrlArray) || downloadUrlArray.length === 0) {
      return null;
    }
    const lastItem = downloadUrlArray[downloadUrlArray.length - 1];
    return lastItem?.url || null;
  };

  // Helper to get image URL from array
  const getImageUrl = (imageArray) => {
    if (!Array.isArray(imageArray) || imageArray.length === 0) {
      return null;
    }
    // Return the highest quality image (last item)
    const lastItem = imageArray[imageArray.length - 1];
    return lastItem?.url || null;
  };

  useEffect(() => {
    const fetch_song_url = async () => {
      try {
        if (!pid) return;

        const response = await fetch(`https://saavn.sumit.co/api/songs/${pid}`);
        const api_data = await response.json();

        if (changealbum && artistid) {
          try {
            const albumresponse = await fetch(
              `https://saavn.sumit.co/api/artists/${artistid}/songs`
            );
            const album_json = await albumresponse.json();
            const album_data =
              (album_json && album_json.data && album_json.data.songs) ||
              album_json.data ||
              [];
            setAlbum(album_data);
          } catch (e) {
            console.warn("Failed to fetch artist songs for album update", e);
          }
        }

        // Extract data array from API response
        const dataArray = api_data?.data;
        if (Array.isArray(dataArray) && dataArray.length > 0) {
          const songObj = dataArray[0];

          // Only use highest quality audio from downloadUrl array (last item = 320kbps)
          const audioUrl = getHighestQualityAudioUrl(songObj.downloadUrl);
          if (audioUrl) {
            setSongurl(audioUrl);
          }

          // Get highest quality image
          const imageUrl = getImageUrl(songObj.image);
          if (imageUrl) {
            setImgurl(imageUrl);
          }

          // Set metadata
          if (songObj.duration) setDuration(Number(songObj.duration) || 0);
          if (songObj.name) setName(sanitizeSongMetadata(songObj.name));
          if (
            songObj.artists &&
            songObj.artists.primary &&
            songObj.artists.primary[0] &&
            songObj.artists.primary[0].name
          ) {
            setArtist(sanitizeSongMetadata(songObj.artists.primary[0].name));
          }
          if (
            songObj.artists &&
            songObj.artists.primary &&
            songObj.artists.primary[0]
          ) {
            setArtistid(songObj.artists.primary[0].id || "");
          }
        }
      } catch (err) {
        console.error("Error fetching song:", err);
      }
    };

    fetch_song_url();
    if (changealbum) setChangeAlbum(false);
  }, [pid, changealbum, artistid, album]);

  const goToNext = useCallback(() => {
    if (!Array.isArray(album) || album.length === 0) return;
    const idx = album.findIndex(
      (s) => s && (s.id === pid || s.songid === pid || s.enc_song_id === pid)
    );
    const nextIndex = idx === -1 ? 0 : (idx + 1) % album.length;
    const next = album[nextIndex];
    if (next && next.id) setPid(next.id);
  }, [album, pid, setPid]);

  const goToPrev = useCallback(() => {
    if (!Array.isArray(album) || album.length === 0) return;
    const idx = album.findIndex(
      (s) => s && (s.id === pid || s.songid === pid || s.enc_song_id === pid)
    );
    const prevIndex = idx === -1 ? 0 : (idx - 1 + album.length) % album.length;
    const prev = album[prevIndex];
    if (prev && prev.id) setPid(prev.id);
  }, [album, pid, setPid]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      if (autoNext) {
        goToNext();
      }
    };

    const updateTime = () => {
      setCurrentTime(audio.currentTime || 0);
      setDuration(audio.duration || 0);
    };

    const onLoadedMetadata = () => setDuration(audio.duration || 0);

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);

    return () => {
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
    };
  }, [autoNext, goToNext, setCurrentTime, setDuration, setIsPlaying]);

  useEffect(() => {
    const fetch_song_lyrics = async () => {
      try {
        if (artist && name) {
          const query = encodeURIComponent(`${name} ${artist}`);
          const response = await axios.get(
            `https://lrclib.net/api/search?q=${query}`
          );
          const items = response.data;
          const best = items[0] || { plainLyrics: "No lyrics available" };
          setLyrics(sanitizeLyrics(best.plainLyrics));
        }
      } catch (err) {
        console.error("Error fetching lyrics:", err);
      }
    };

    fetch_song_lyrics();
  }, [artist, name]);


  useEffect(() => {
    let mounted = true;
    const enrichAlbum = async () => {
      try {
        if (!Array.isArray(album) || album.length === 0) return;
        const missing = album.filter(
          (s) => !(s && (s.duration || s.duration_in_seconds || s.length))
        );
        if (missing.length === 0) return;

        const promises = missing.map(async (s) => {
          try {
            const id = s.id || s.songid || s.enc_song_id;
            if (!id) return null;
            const res = await fetch(`https://saavn.sumit.co/api/songs/${id}`);
            const data = await res.json();
            const maybe = data && (data.data || data.song || data.songs);
            const songObj = Array.isArray(maybe) ? maybe[0] : maybe;
            return { id, songObj };
          } catch (e) {
            console.warn(
              "Failed to fetch song metadata for album enrichment",
              e
            );
            return null;
          }
        });

        const results = await Promise.all(promises);
        if (!mounted) return;
        const merged = album.map((orig) => {
          const found = results.find(
            (r) => r && r.id && String(r.id) === String(orig.id)
          );
          if (!found || !found.songObj) return orig;
          const so = found.songObj;
          return {
            ...orig,
            duration:
              orig.duration ||
              so.duration ||
              so.duration_in_seconds ||
              orig.duration_in_seconds,
            image: orig.image || getImageUrl(so.image) || orig.image,
            downloadUrl: orig.downloadUrl || so.downloadUrl || orig.downloadUrl,
            name: orig.name || so.name || orig.title,
            artists: orig.artists || so.artists,
          };
        });
        setAlbum(merged);
      } catch (err) {
        console.error("Error enriching album:", err);
      }
    };
    enrichAlbum();
    return () => {
      mounted = false;
    };
  }, [album]);

  return (
    <PlayerContext.Provider
      value={{
        pid,
        setPid,
        songurl,
        duration,
        name,
        artist,
        imgurl,
        lyrics,
        artistid,
        setArtistid,
        album,
        setAlbum,
        changealbum,
        setChangeAlbum,
        goToNext,
        goToPrev,
        autoNext,
        setAutoNext,
        isPlaying,
        setIsPlaying,
        currentTime,
        setCurrentTime,
        volume,
        audioRef,
        togglePlayPause,
        handleVolumeChange,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
};

export default PlayerContext;
