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
  const [syncedLyrics, setSyncedLyrics] = useState(null);
  const [isLoadingLyrics, setIsLoadingLyrics] = useState(false);
  const [currentLyricIndex, setCurrentLyricIndex] = useState(-1);
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
    // If we have album with songs, navigate within it
    if (Array.isArray(album) && album.length > 0) {
      const idx = album.findIndex(
        (s) => s && (s.id === pid || s.songid === pid || s.enc_song_id === pid)
      );
      const nextIndex = idx === -1 ? 0 : (idx + 1) % album.length;
      const next = album[nextIndex];
      if (next && next.id) {
        setPid(next.id);
        return;
      }
    }

    // Fallback: if we have an artist, try to fetch their songs and go to next
    if (artistid) {
      const fetchArtistSongsAndGoNext = async () => {
        try {
          const albumresponse = await fetch(
            `https://saavn.sumit.co/api/artists/${artistid}/songs`
          );
          const album_json = await albumresponse.json();
          const album_data =
            (album_json && album_json.data && album_json.data.songs) ||
            album_json.data ||
            [];

          if (Array.isArray(album_data) && album_data.length > 1) {
            setAlbum(album_data);
            const idx = album_data.findIndex(
              (s) => s && (s.id === pid || s.songid === pid || s.enc_song_id === pid)
            );
            const nextIndex = idx === -1 ? 0 : (idx + 1) % album_data.length;
            const next = album_data[nextIndex];
            if (next && next.id) {
              setPid(next.id);
            }
          }
        } catch (e) {
          console.warn("Failed to fetch artist songs for next track", e);
        }
      };
      fetchArtistSongsAndGoNext();
    }
  }, [album, pid, setPid, artistid]);

  const goToPrev = useCallback(() => {
    // If we have album with songs, navigate within it
    if (Array.isArray(album) && album.length > 0) {
      const idx = album.findIndex(
        (s) => s && (s.id === pid || s.songid === pid || s.enc_song_id === pid)
      );
      const prevIndex = idx === -1 ? 0 : (idx - 1 + album.length) % album.length;
      const prev = album[prevIndex];
      if (prev && prev.id) {
        setPid(prev.id);
        return;
      }
    }

    // Fallback: if we have an artist, try to fetch their songs and go to previous
    if (artistid) {
      const fetchArtistSongsAndGoPrev = async () => {
        try {
          const albumresponse = await fetch(
            `https://saavn.sumit.co/api/artists/${artistid}/songs`
          );
          const album_json = await albumresponse.json();
          const album_data =
            (album_json && album_json.data && album_json.data.songs) ||
            album_json.data ||
            [];

          if (Array.isArray(album_data) && album_data.length > 1) {
            setAlbum(album_data);
            const idx = album_data.findIndex(
              (s) => s && (s.id === pid || s.songid === pid || s.enc_song_id === pid)
            );
            const prevIndex = idx === -1 ? 0 : (idx - 1 + album_data.length) % album_data.length;
            const prev = album_data[prevIndex];
            if (prev && prev.id) {
              setPid(prev.id);
            }
          }
        } catch (e) {
          console.warn("Failed to fetch artist songs for previous track", e);
        }
      };
      fetchArtistSongsAndGoPrev();
    }
  }, [album, pid, setPid, artistid]);

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

  // Helper function to parse synced lyrics
  const parseSyncedLyrics = (syncedLyricsText) => {
    if (!syncedLyricsText) return [];

    const lines = syncedLyricsText.split('\n');
    const parsedLines = [];

    for (const line of lines) {
      const match = line.match(/^\[(\d{2}):(\d{2}\.\d{2})\](.*)$/);
      if (match) {
        const minutes = parseInt(match[1], 10);
        const seconds = parseFloat(match[2]);
        const timestamp = minutes * 60 + seconds;
        const text = match[3].trim();

        if (text) {
          parsedLines.push({
            timestamp,
            text,
            originalLine: line
          });
        }
      }
    }

    return parsedLines.sort((a, b) => a.timestamp - b.timestamp);
  };

  // Helper function to find best lyrics match
  const findBestLyricsMatch = (items, targetName, targetArtist) => {
    if (!Array.isArray(items) || items.length === 0) return null;

    // If only one item, return it
    if (items.length === 1) return items[0];

    // Create normalized search strings
    const normalizedTarget = `${targetName} ${targetArtist}`.toLowerCase().replace(/[^a-z0-9\s]/g, '');

    let bestMatch = items[0];
    let bestScore = 0;

    for (const item of items) {
      const itemString = `${item.name} ${item.artistName}`.toLowerCase().replace(/[^a-z0-9\s]/g, '');

      // Simple similarity score based on common words
      const targetWords = normalizedTarget.split(/\s+/);
      const itemWords = itemString.split(/\s+/);

      const commonWords = targetWords.filter(word =>
        word.length > 2 && itemWords.some(itemWord => itemWord.includes(word) || word.includes(itemWord))
      );

      const score = commonWords.length;

      if (score > bestScore) {
        bestScore = score;
        bestMatch = item;
      }
    }

    return bestMatch;
  };

  useEffect(() => {
    const fetch_song_lyrics = async () => {
      // Reset lyrics state when song changes
      setLyrics("Lyrics...");
      setSyncedLyrics(null);
      setCurrentLyricIndex(-1);
      setIsLoadingLyrics(true);

      try {
        if (artist && name) {
          const query = encodeURIComponent(`${name} ${artist}`);
          const response = await axios.get(
            `https://lrclib.net/api/search?q=${query}`
          );
          const items = response.data;

          if (Array.isArray(items) && items.length > 0) {
            // Find best match instead of just taking first item
            const best = findBestLyricsMatch(items, name, artist);

            if (best) {
              // Set plain lyrics as fallback
              setLyrics(sanitizeLyrics(best.plainLyrics) || "No lyrics available");

              // Parse and set synced lyrics if available
              if (best.syncedLyrics) {
                const parsed = parseSyncedLyrics(best.syncedLyrics);
                setSyncedLyrics(parsed);
              }
            }
          } else {
            setLyrics("No lyrics available");
          }
        }
      } catch (err) {
        console.error("Error fetching lyrics:", err);
        setLyrics("Error loading lyrics");
      } finally {
        setIsLoadingLyrics(false);
      }
    };

    fetch_song_lyrics();
  }, [artist, name]);

  // Sync lyrics with current playback time
  useEffect(() => {
    if (!syncedLyrics || syncedLyrics.length === 0) return;

    const findCurrentLyricIndex = () => {
      const currentIndex = syncedLyrics.findIndex(
        (lyric, index) => {
          const nextLyric = syncedLyrics[index + 1];
          return currentTime >= lyric.timestamp && (!nextLyric || currentTime < nextLyric.timestamp);
        }
      );
      setCurrentLyricIndex(currentIndex);
    };

    findCurrentLyricIndex();
  }, [currentTime, syncedLyrics]);

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
        syncedLyrics,
        isLoadingLyrics,
        currentLyricIndex,
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
