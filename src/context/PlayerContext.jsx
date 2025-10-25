/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const PlayerContext = createContext(null);

export const PlayerProvider = ({ children }) => {
  const placeholder_song_url = '/music-logo.svg';

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

  // Helper to pick best url/image from various shapes (string, object, array)
  const pickBestUrl = (input) => {
    if (!input && input !== 0) return null;
    // string URL
    if (typeof input === 'string') return input;
    // object with url/vlink
    if (typeof input === 'object' && !Array.isArray(input)) {
      if (input.url) return input.url;
      if (input.vlink) return input.vlink;
      for (const k of ['cover', 'image', 'thumbnail']) {
        if (input[k]) return input[k];
      }
      return null;
    }
    // array of variants - prefer last item that has a url/vlink or is a string
    if (Array.isArray(input)) {
      for (let i = input.length - 1; i >= 0; i--) {
        const it = input[i];
        if (!it) continue;
        if (typeof it === 'string' && it) return it;
        if (it.url) return it.url;
        if (it.vlink) return it.vlink;
      }
    }
    return null;
  };

  useEffect(() => {
    const fetch_song_url = async () => {
      try {
        if (!pid) return;

        // If we already have an album (playlist) loaded, try to find the song there
        let song = null;
        if (Array.isArray(album) && album.length > 0) {
          song = album.find((s) => {
            if (!s) return false;
            const sid = s.id || s.songid || s.enc_song_id;
            return String(sid) === String(pid);
          });
        }

        

  // If we found a song object from album, try to reuse its fields.
  // Only skip the remote song API fetch when the album song provides a download URL, a duration, and an image.
        // If we have an album item for this pid, apply its fields immediately
        if (song) {
          const possibleDownload = pickBestUrl(song.downloadUrl || song.download_url || (song.vlink ? [{ vlink: song.vlink }] : null)) || pickBestUrl((song.more_info && song.more_info.downloadUrl) || song.downloadUrl || (song.more_info && song.more_info.download_url));
          const possibleImage = pickBestUrl(song.image || song.images || (song.more_info && song.more_info.images) || song.imageUrl || song.image_url || (song.more_info && song.more_info.images));
          if (possibleDownload) setSongurl(possibleDownload);
          if (possibleImage) setImgurl(possibleImage);
          if (song.duration) setDuration(Number(song.duration) || 0);
          if (song.duration_in_seconds) setDuration(Number(song.duration_in_seconds) || 0);
          if (song.name) setName(song.name);
          if (song.artists && song.artists.primary && song.artists.primary[0] && song.artists.primary[0].name) setArtist(song.artists.primary[0].name);
          if (song.artists && song.artists.primary && song.artists.primary[0]) setArtistid(song.artists.primary[0].id || '');
        }

        // Always fetch the authoritative song metadata from saavn.sumit.co for the selected pid.
        // This ensures we get download URLs, duration, images and canonical artist info
        // even if the album entry had partial data.
        const response = await fetch(`https://saavn.sumit.co/api/songs/${pid}`);
        const api_data = await response.json();

        // If requested, refresh the album based on the artist's songs
        if (changealbum && artistid) {
          try {
            const albumresponse = await fetch(`https://saavn.sumit.co/api/artists/${artistid}/songs`);
            const album_json = await albumresponse.json();
            const album_data = (album_json && album_json.data && album_json.data.songs) || album_json.data || [];
            setAlbum(album_data);
          } catch (e) {
            console.warn('Failed to fetch artist songs for album update', e);
          }
        }

        const maybeData = api_data && (api_data.data || api_data.song || api_data.songs) ;
        const songObj = Array.isArray(maybeData) ? maybeData[0] : maybeData;
        if (songObj) {
          const download = pickBestUrl(songObj.downloadUrl || songObj.download_url || (songObj.vlink ? [{ vlink: songObj.vlink }] : null)) || pickBestUrl((songObj.more_info && songObj.more_info.downloadUrl) || songObj.downloadUrl || (songObj.more_info && songObj.more_info.download_url)) || null;
          const image = pickBestUrl(songObj.image || songObj.images || (songObj.more_info && songObj.more_info.images) || songObj.imageUrl || songObj.image_url) || null;
          if (download) setSongurl(download);
          if (image) setImgurl(image);
          if (songObj.duration) setDuration(Number(songObj.duration) || 0);
          if (songObj.duration_in_seconds) setDuration(Number(songObj.duration_in_seconds) || 0);
          if (songObj.name) setName(songObj.name);
          if (songObj.artists && songObj.artists.primary && songObj.artists.primary[0] && songObj.artists.primary[0].name) setArtist(songObj.artists.primary[0].name);
          if (songObj.artists && songObj.artists.primary && songObj.artists.primary[0]) setArtistid(songObj.artists.primary[0].id || '');
        }
      } catch (err) {
        console.error("Error fetching song:", err);
      }
    };

    fetch_song_url();
    if (changealbum) setChangeAlbum(false);
  }, [pid, changealbum, artistid, album]);

  // Helper: go to next/previous song in album
  const goToNext = () => {
    if (!Array.isArray(album) || album.length === 0) return;
    const idx = album.findIndex((s) => s && (s.id === pid || s.songid === pid || s.enc_song_id === pid));
    const nextIndex = idx === -1 ? 0 : (idx + 1) % album.length;
    const next = album[nextIndex];
    if (next && next.id) setPid(next.id);
  };

  const goToPrev = () => {
    if (!Array.isArray(album) || album.length === 0) return;
    const idx = album.findIndex((s) => s && (s.id === pid || s.songid === pid || s.enc_song_id === pid));
    const prevIndex = idx === -1 ? 0 : (idx - 1 + album.length) % album.length;
    const prev = album[prevIndex];
    if (prev && prev.id) setPid(prev.id);
  };

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
          setLyrics(best.plainLyrics);
        }
      } catch (err) {
        console.error("Error fetching lyrics:", err);
      }
    };

    fetch_song_lyrics();
  }, [artist, name]);

  // Enrich album items: if album items are missing duration or download info,
  // fetch song metadata for those IDs and merge fields into the album array.
  useEffect(() => {
    let mounted = true;
    const enrichAlbum = async () => {
      try {
        if (!Array.isArray(album) || album.length === 0) return;
        const missing = album.filter((s) => !(s && (s.duration || s.duration_in_seconds || s.length)));
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
            console.warn('Failed to fetch song metadata for album enrichment', e);
            return null;
          }
        });

        const results = await Promise.all(promises);
        if (!mounted) return;
        const merged = album.map((orig) => {
          const found = results.find((r) => r && r.id && String(r.id) === String(orig.id));
          if (!found || !found.songObj) return orig;
          const so = found.songObj;
          return {
            ...orig,
            duration: orig.duration || so.duration || so.duration_in_seconds || orig.duration_in_seconds,
            image: orig.image || pickBestUrl(so.image || so.images || so.more_info && so.more_info.images) || orig.image || (orig.more_info && orig.more_info.images),
            downloadUrl: orig.downloadUrl || pickBestUrl(so.downloadUrl || so.more_info && so.more_info.downloadUrl) || orig.downloadUrl,
            name: orig.name || so.name || orig.title,
            artists: orig.artists || so.artists,
          };
        });
        setAlbum(merged);
      } catch (err) {
        console.error('Error enriching album:', err);
      }
    };
    enrichAlbum();
    return () => { mounted = false; };
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
