import { useState, useRef, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { sanitizeSongMetadata } from '../utils/sanitize';

const Header = ({ setpid, render = false, setartistid, setchangealbum, setalbum }) => {
  const [searchresults, setsearchresults] = useState(false);
  const [results, setresults] = useState([]);
  const [data, setdata] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  const navigate = useNavigate();

  const handleevent = (e) => {
    const newData = e.target.value;
    setdata(newData);

    if (newData.trim() === "") {
      setsearchresults(false);
      setresults([]);
      return;
    }

    const fetch_song_url = async () => {
      try {
        // Mirror playlist priority: prefer a proxied/local endpoint first to avoid direct upstream calls in the browser
        const proxyVar = import.meta.env.VITE_PROXY_SEARCH_SONGS_URL || '';
        const viteVar = import.meta.env.VITE_SEARCH_SONGS_URL || '';
        const serverVar = import.meta.env.SEARCH_SONGS_URL || '';
        // Prefer proxy var -> vite var -> server env; if none provided, use the local saavn proxy/function
        const baseEnv = proxyVar || viteVar || serverVar || '';
        let url = '';
        if (baseEnv) {
          url = baseEnv || '';
          // If the template already contains a query= param, replace or append value
          if (/query=[^&]*/.test(url)) {
            if (/query=$/.test(url)) {
              url = url + encodeURIComponent(newData);
            } else {
              url = url.replace(/(query=)[^&]*/, `$1${encodeURIComponent(newData)}`);
            }
          } else {
            url = url + (url.includes('?') ? '&' : '?') + `query=${encodeURIComponent(newData)}`;
          }
        } else {
          // Fallback to the same dev/prod proxy used by playlists: /api/saavn/api.php with autocomplete call
          url = `/api/saavn/api.php?__call=autocomplete.get&_format=json&_marker=0&cc=in&includeMetaTags=1&query=${encodeURIComponent(newData)}`;
        }

        const response = await fetch(url, { headers: { Accept: 'application/json' } });
        const api_data = await response.json();

        // New API returns an object with `songs.data` being the array of results
        const rawResults = (api_data && api_data.songs && Array.isArray(api_data.songs.data)) ? api_data.songs.data : [];

        // Normalize each result to the shape the rest of the UI expects (id, title/name, image, more_info)
        const mapped = rawResults.map((r) => ({
          id: r.id,
          title: r.title,
          name: r.title, // keep `name` for any old consumers
          image: r.image,
          more_info: r.more_info || {},
        }));

        setresults(mapped);
        setsearchresults(mapped.length > 0);
      } catch (err) {
        console.warn('Search fetch failed', err && err.message);
        setresults([]);
        setsearchresults(false);
      }
    };

    fetch_song_url();

    if (typeof setchangealbum === 'function') setchangealbum(true);
  };

  const getBestImage = (img) => {
    if (!img) return '/logo.webp';
    if (typeof img === 'string') return img;
    if (Array.isArray(img)) {
      for (let i = img.length - 1; i >= 0; i--) {
        const it = img[i];
        if (!it) continue;
        if (typeof it === 'string') return it;
        if (it.url) return it.url;
      }
    }
    if (img.url) return img.url;
    return '/logo.webp';
  };


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setsearchresults(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between gap-4 bg-gradient-to-b from-zinc-900/80 to-transparent backdrop-blur border-b border-zinc-800/60 rounded-b-xl">
          <div className="flex items-center gap-3">
            <NavLink className="relative" to="/">
              <img src="/logo.webp" alt="logo" className="w-10 h-10 rounded-md" />
            </NavLink>
            <Link to="/" className="hidden md:block text-lg font-medium text-white tracking-tight">Musicality</Link>
          </div>

          <div className="flex-1 max-w-xl mx-2 md:mx-4 h-[44px] flex items-center">
            {render ? (
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-zinc-400">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="search"
                  placeholder="Search songs, artists..."
                  className="pl-10 pr-4 py-2 w-full rounded-full bg-zinc-900/70 text-slate-200 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-600/60"
                  onChange={handleevent}
                  value={data}
                  aria-label="Search songs"
                />
              </div>
            ) : (
              <NavLink to="/song" className="w-full h-11 flex items-center rounded-full bg-zinc-900/60 text-slate-200 hover:bg-zinc-900/70 px-4 gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-800/60">
                  <Search className="w-4 h-4 text-zinc-400" />
                </div>
                <span className="text-sm text-zinc-300">Search</span>
              </NavLink>
            )}
          </div>

          <nav className="hidden sm:flex items-center gap-4">
            <a href="https://www.linkedin.com/in/rishiraj2003/" className="text-sm text-zinc-300 hover:text-white">Contact</a>
            <a href="https://github.com/rishi0810" className="text-sm text-zinc-300 hover:text-white">Github</a>
          </nav>
          <div className="sm:hidden relative" ref={mobileMenuRef}>
            <button
              className="p-2 rounded-md bg-zinc-900/50"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg className="w-5 h-5 text-zinc-300" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
            </button>
            {mobileMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-zinc-900 rounded-lg p-2 shadow-2xl z-50">
                <a href="https://www.linkedin.com/in/rishiraj2003/" className="block px-4 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 rounded">Contact</a>
                <a href="https://github.com/rishi0810" className="block px-4 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 rounded">Github</a>
              </div>
            )}
          </div>
        </div>

        {render && searchresults && (
          <div ref={dropdownRef} className="absolute left-1/2 transform -translate-x-1/2 mt-2 w-[445px] bg-zinc-900 rounded-lg p-2 shadow-2xl z-50">
            {results.length > 0 ? (
              <ul className="flex flex-col gap-2">
                {results.slice(0, 6).map((result) => (
                  <li key={result.id} className="flex items-center gap-3 p-2 rounded hover:bg-zinc-800 cursor-pointer" onClick={() => {
            // When user clicks a search result, replace the current album with the artist's songs
                      if (typeof setalbum === 'function') setalbum([]);
                      if (typeof setpid === 'function') setpid(result.id);
                      setsearchresults(false);
                      if (typeof setartistid === 'function') setartistid(result.more_info && result.more_info.primary_artists ? result.more_info.primary_artists : '');
                      if (typeof setchangealbum === 'function') setchangealbum(true);
                      // Navigate to the song page so PlayerView is shown (works from Home or anywhere)
                      try { navigate('/song'); } catch { /* ignore */ }
                    }}>
                    <img src={getBestImage(result.image)} alt={result.title} className="w-12 h-12 rounded-md" />
                    <div className="flex flex-col">
                      <span className="text-sm text-white font-medium">{sanitizeSongMetadata(result.title || result.name || '')}</span>
                      <span className="text-xs text-zinc-400">{sanitizeSongMetadata((result.more_info && result.more_info.primary_artists) || '')}</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-zinc-400 px-4 py-2">No results</div>
            )}
          </div>
        )}
      </header>
    </>
  );
};

export default Header;
