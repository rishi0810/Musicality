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
        {/* Main Header */}
        <div className="relative bg-white border-b-4 border-black shadow-lg">
          {/* Subtle accent dots */}
          <div className="absolute top-2 left-2 w-3 h-3 bg-yellow-400 border-2 border-black"></div>
          <div className="absolute top-2 right-2 w-2 h-2 bg-pink-400 border border-black"></div>
          <div className="absolute bottom-1 left-1/4 w-2 h-2 bg-blue-400 border border-black"></div>

          <div className="px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between">
            {/* Logo and Brand */}
            <div className="flex items-center gap-2 sm:gap-3">
              <NavLink
                className="relative group"
                to="/"
              >
                <div className="relative">
                  <img
                    src="/logo.webp"
                    alt="Musicality"
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg border-2 border-black transition-transform group-hover:scale-105"
                  />
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-yellow-300 border-2 border-black rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
              </NavLink>
              <Link
                to="/"
                className="hidden sm:block text-lg sm:text-xl font-bold text-black tracking-tight hover:text-blue-600 transition-colors"
                style={{ fontFamily: 'Space Mono, monospace' }}
              >
                Musicality
              </Link>
            </div>

            {/* Search Section */}
            <div className="flex-1 max-w-md mx-3 sm:mx-6">
              {render ? (
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <Search className="w-4 h-4 text-gray-500" />
                  </div>
                  <input
                    type="search"
                    placeholder="Search songs, artists..."
                    className="w-full pl-10 pr-4 py-2 sm:py-2.5 text-sm sm:text-base font-mono bg-white border-2 border-black placeholder-gray-400 text-black focus:outline-none focus:bg-yellow-50 focus:border-blue-500 transition-colors rounded-lg"
                    onChange={handleevent}
                    value={data}
                    aria-label="Search songs"
                  />
                  {/* Input accent */}
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-pink-400 border border-black rounded-full"></div>
                </div>
              ) : (
                <NavLink
                  to="/song"
                  className="flex items-center justify-center w-full h-10 sm:h-11 bg-white border-2 border-black hover:bg-yellow-100 hover:border-blue-500 transition-all rounded-lg group relative"
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 bg-black rounded-md group-hover:bg-blue-600 transition-colors">
                      <Search className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                    </div>
                    <span className="text-sm sm:text-base font-mono font-medium text-black">Search</span>
                  </div>
                  {/* Button accent */}
                  <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-yellow-400 border border-black rounded-full group-hover:bg-blue-400 transition-colors"></div>
                </NavLink>
              )}
            </div>

            {/* Navigation Links - Desktop */}
            <nav className="hidden lg:flex items-center gap-4">
              <a
                href="https://www.linkedin.com/in/rishiraj2003/"
                className="text-sm font-mono font-medium text-black hover:text-blue-600 hover:bg-yellow-100 px-3 py-1.5 border border-transparent hover:border-black transition-all rounded-lg"
              >
                Contact
              </a>
              <a
                href="https://github.com/rishi0810"
                className="text-sm font-mono font-medium text-black hover:text-blue-600 hover:bg-yellow-100 px-3 py-1.5 border border-transparent hover:border-black transition-all rounded-lg"
              >
                Github
              </a>
            </nav>

            {/* Mobile Menu Button */}
            <div className="lg:hidden relative" ref={mobileMenuRef}>
              <button
                className="p-2 bg-white border-2 border-black hover:bg-yellow-100 transition-colors rounded-lg relative"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                <svg className="w-5 h-5 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
                </svg>
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-pink-400 border border-black rounded-full"></div>
              </button>

              {mobileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border-2 border-black rounded-lg shadow-2xl z-50">
                  <div className="absolute -top-2 -right-2 w-3 h-3 bg-yellow-400 border-2 border-black rounded-full"></div>
                  <div className="p-2">
                    <a
                      href="https://www.linkedin.com/in/rishiraj2003/"
                      className="block w-full text-left px-4 py-2 text-sm font-mono font-medium text-black hover:bg-yellow-100 hover:text-blue-600 transition-colors rounded"
                    >
                      Contact
                    </a>
                    <a
                      href="https://github.com/rishi0810"
                      className="block w-full text-left px-4 py-2 text-sm font-mono font-medium text-black hover:bg-yellow-100 hover:text-blue-600 transition-colors rounded"
                    >
                      Github
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Search Results Dropdown */}
        {render && searchresults && (
          <div
            ref={dropdownRef}
            className="absolute left-1/2 transform -translate-x-1/2 mt-2 w-[90vw] sm:w-[445px] max-w-md bg-white border-2 border-black shadow-2xl z-50 rounded-lg"
          >
            <div className="absolute -top-2 -right-2 w-3 h-3 bg-yellow-400 border-2 border-black rounded-full"></div>
            <div className="p-2">
              {results.length > 0 ? (
                <ul className="flex flex-col gap-1">
                  {results.slice(0, 6).map((result) => (
                    <li
                      key={result.id}
                      className="flex items-center gap-3 p-2 sm:p-3 hover:bg-yellow-50 cursor-pointer transition-colors rounded border border-transparent hover:border-black group"
                      onClick={() => {
                        // When user clicks a search result, replace the current album with the artist's songs
                        if (typeof setalbum === 'function') setalbum([]);
                        if (typeof setpid === 'function') setpid(result.id);
                        setsearchresults(false);
                        if (typeof setartistid === 'function') setartistid(result.more_info && result.more_info.primary_artists ? result.more_info.primary_artists : '');
                        if (typeof setchangealbum === 'function') setchangealbum(true);
                        // Navigate to the song page so PlayerView is shown (works from Home or anywhere)
                        try { navigate('/song'); } catch { /* ignore */ }
                      }}
                    >
                      <div className="relative">
                        <img
                          src={getBestImage(result.image)}
                          alt={result.title}
                          className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg border-2 border-black group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-pink-400 border border-black rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </div>
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-sm sm:text-base font-mono font-medium text-black truncate">
                          {sanitizeSongMetadata(result.title || result.name || '')}
                        </span>
                        <span className="text-xs text-gray-600 truncate">
                          {sanitizeSongMetadata((result.more_info && result.more_info.primary_artists) || '')}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-4 sm:py-6">
                  <div className="w-8 h-8 bg-gray-200 border-2 border-black rounded-full mx-auto mb-2"></div>
                  <div className="text-sm font-mono text-gray-600">No results found</div>
                </div>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default Header;
