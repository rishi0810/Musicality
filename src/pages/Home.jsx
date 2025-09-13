import { useEffect, useState, useRef, useMemo } from "react";
import Header from "../layout/Header";
import { useNavigate } from "react-router";
import { usePlayer } from "../context/PlayerContext";
import axios from 'axios';

function Home() {
  const { setAlbum, setPid } = usePlayer();
  const [languagePlaylists, setLanguagePlaylists] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Home useEffect: starting playlist fetch');
    const langs = ['english','hindi','punjabi','haryanvi'];
    const cachedEntries = langs.map((l) => {
      const raw = localStorage.getItem(`playlists_${l}`);
      if (!raw) return { lang: l, parsed: null };
      try {
        const parsed = JSON.parse(raw);
        return { lang: l, parsed };
      } catch {
        return { lang: l, parsed: null };
      }
    });

    const allHaveData = cachedEntries.every(e => Array.isArray(e.parsed) && e.parsed.length > 0);
    if (allHaveData) {
      const obj = {};
      cachedEntries.forEach(e => obj[e.lang] = e.parsed);
      setLanguagePlaylists(obj);
      console.log('Home: loaded playlists from cache', Object.keys(obj));
      return;
    }

    console.log('Home: cache missing or empty for languages', cachedEntries.filter(e => !(Array.isArray(e.parsed) && e.parsed.length > 0)).map(e => e.lang));

    const fetchByLanguage = async (language) => {
      try {
    const base = import.meta.env.VITE_PROXY_PLAYLIST_URL || import.meta.env.VITE_PLAYLIST_URL || import.meta.env.PLAYLIST_URL || '';
      const finalUrl = base.includes('?') ? `${base}` : `${base}`;
      console.log(`Home: fetching playlists for language=${language} from`, finalUrl);
        const headers = {
          Accept: 'application/json, text/plain, */*',
          'Accept-Language': 'en-US,en;q=0.9'
        };

        const res = await axios.get(base, { params: { languages: language }, headers });
  console.log(`Home: response status for ${language}:`, res.status);
  const json = res.data || {};
  console.log(`Home: response data for ${language}:`, json); 
        console.log(json);
        const data = json.data || [];
        // sort by follower_count (more_info.follower_count or more_info.follower_count in string)
        const sorted = data.sort((a, b) => {
          const fa = parseInt((a.more_info && a.more_info.follower_count) || '0', 10) || 0;
          const fb = parseInt((b.more_info && b.more_info.follower_count) || '0', 10) || 0;
          return fb - fa;
        });
        const top6 = sorted.slice(0, 6);
        localStorage.setItem(`playlists_${language}`, JSON.stringify(top6));
        console.log(`Home: cached top6 for ${language}`, top6.length);
        return top6;
      } catch (err) {
        console.error('Error fetching playlists for', language, err);
        return [];
      }
    };

    (async () => {
      const entries = await Promise.all(langs.map(async (l) => [l, await fetchByLanguage(l)]));
      const obj = Object.fromEntries(entries);
      setLanguagePlaylists(obj);
    })();
  }, []);

  const handlePlaylistClick = async (plId) => {
    try {
  const template = import.meta.env.VITE_PROXY_GET_PLAYLIST_URL || import.meta.env.VITE_GET_PLAYLIST_URL || import.meta.env.GET_PLAYLIST_URL || '';
      console.log('Home: raw playlist-details template:', template);
      let url = template;
      const encodedId = encodeURIComponent(String(plId || ''));
      if (template.includes('$PLAYLIST_ID')) {
        url = template.replace('$PLAYLIST_ID', encodedId);
      } else if (template.includes('{PLAYLIST_ID}')) {
        url = template.replace('{PLAYLIST_ID}', encodedId);
      } else if (template.includes('__PLAYLIST_ID__')) {
        url = template.replace('__PLAYLIST_ID__', encodedId);
      } else if (template.includes('listid=')) {
        // replace whatever follows listid= until &
        url = template.replace(/(listid=)[^&]*/, `$1${encodedId}`);
      } else {
        // append listid param
        url = template + (template.includes('?') ? '&' : '?') + `listid=${encodedId}`;
      }
      console.log('Home: fetching playlist details for', plId, 'using', url);
      const headers = {
        Accept: 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9'
      };

      const res = await axios.get(url, { headers });
  console.log('Home: playlist details response status', res.status);
      const json = res.data || {};
      console.log('Home: playlist details json keys', Object.keys(json));
      console.log(json);
      // Defensive extraction of songs array
      let songs = [];
      if (json.error) {
        console.warn('Playlist details returned error:', json.error);
      }
      if (Array.isArray(json)) {
        songs = json;
      } else if (Array.isArray(json.list)) {
        songs = json.list;
      } else if (json.data && Array.isArray(json.data.list)) {
        songs = json.data.list;
      } else if (json.data && Array.isArray(json.data.songs)) {
        songs = json.data.songs;
      } else if (Array.isArray(json.more_info && json.more_info.contents)) {
        songs = json.more_info.contents;
      }

      // set album songs in context (always an array)
      setAlbum(songs);
      if (Array.isArray(songs) && songs.length > 0 && songs[0].id) {
        setPid(songs[0].id);
      } else {
        console.warn('No songs found in playlist details for', plId);
      }
      navigate('song');
    } catch (err) {
      console.error('Error fetching playlist details', err);
      // fallback: still navigate
      navigate('song');
    }
  };

  

  const genres = useMemo(() => {
    return Object.keys(languagePlaylists).map((lang) => ({ id: lang, title: lang.charAt(0).toUpperCase() + lang.slice(1), items: languagePlaylists[lang] || [] }));
  }, [languagePlaylists]);

  const getPlaylistImage = (pl) => {
    if (!pl) return '/logo.webp';
    // string URL
    if (typeof pl.image === 'string' && pl.image) return pl.image;
    // object with url
    if (pl.image && typeof pl.image === 'object' && pl.image.url) return pl.image.url;
    // array of variants e.g., [{url}, ...] or nested arrays
    if (Array.isArray(pl.image) && pl.image.length) {
      // prefer last (best quality)
      const it = pl.image[pl.image.length - 1];
      if (typeof it === 'string' && it) return it;
      if (it && it.url) return it.url;
    }
    // fallback to more_info or other possible fields
  if (pl.more_info && pl.more_info.images && Array.isArray(pl.more_info.images) && pl.more_info.images.length) return pl.more_info.images[pl.more_info.images.length - 1];
    if (pl.imageUrl) return pl.imageUrl;
    return '/logo.webp';
  };

  const containerRef = useRef(null);
  const [activeGenre, setActiveGenre] = useState(genres[0]?.id || 'indie');

  const scrollToGenre = (idx) => {
    const container = containerRef.current;
    if (!container) return;
    const child = container.children[idx];
    if (!child) return;
    child.scrollIntoView({ behavior: 'smooth', inline: 'start' });
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const onScroll = () => {
      const children = Array.from(container.children);
      const center = container.scrollLeft + container.clientWidth / 2;
      let nearestIdx = 0;
      let nearestDist = Infinity;
      children.forEach((c, i) => {
        const rect = c.getBoundingClientRect();
        const left = c.offsetLeft;
        const dist = Math.abs(left + rect.width / 2 - center);
        if (dist < nearestDist) {
          nearestDist = dist;
          nearestIdx = i;
        }
      });
      setActiveGenre(genres[nearestIdx]?.id || genres[0].id);
    };
    container.addEventListener('scroll', onScroll, { passive: true });
    return () => container.removeEventListener('scroll', onScroll);
  }, [genres]);

  return (
    <>
      <Header render={false} />
      <main className="bg-zinc-950 min-h-screen w-full px-6 py-10">
        <div className="mx-auto max-w-7xl">
          <header className="flex items-center justify-between mb-10">
            <div>
              <h1 className="text-3xl font-semibold text-white">Top Playlists</h1>
              <p className="text-sm text-zinc-400">Explore curated playlists across genres</p>
            </div>
          </header>

          <div className="relative">
            <div ref={containerRef} className="flex gap-6 overflow-x-auto pb-4 scroll-snap-x snap-mandatory no-scrollbar" style={{scrollSnapType: 'x mandatory'}}>
              {genres.map((g) => (
                <section key={g.id} className="min-w-[86%] sm:min-w-[78%] md:min-w-[48%] lg:min-w-[32%] scroll-snap-start" style={{scrollSnapAlign: 'start'}}>
                  <h2 className="text-xl text-white mb-4">{g.title}</h2>
                  <div className="grid grid-cols-2 gap-3">
                    {(g.items || []).slice(0,6).map((pl) => (
                      <button key={pl.id} onClick={() => handlePlaylistClick(pl.id)} className="group bg-zinc-900/40 rounded-lg p-2 text-left">
                        <div className="aspect-square rounded-md overflow-hidden bg-zinc-800">
                          <img src={getPlaylistImage(pl)} alt={pl.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="mt-2">
                          <div className="text-xs text-zinc-400 truncate">{pl.title || pl.name}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </section>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-center gap-3">
              {genres.map((g, i) => (
                <button key={g.id} onClick={() => scrollToGenre(i)} className={`w-3 h-3 rounded-full ${activeGenre === g.id ? 'bg-sky-500' : 'bg-zinc-700'}`}></button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export default Home;
