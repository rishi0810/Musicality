import { useEffect, useState, useRef, useMemo } from "react";
import Header from "../layout/Header";
import { useNavigate } from "react-router";
import { usePlayer } from "../context/PlayerContext";
import axios from "axios";
import { sanitizeSongMetadata } from "../utils/sanitize";

function Home() {
  const { setAlbum, setPid, setArtistid, setChangeAlbum } = usePlayer();
  const [languagePlaylists, setLanguagePlaylists] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Home useEffect: starting playlist fetch");
    const langs = ["english", "hindi", "punjabi", "haryanvi"];
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

    const allHaveData = cachedEntries.every(
      (e) => Array.isArray(e.parsed) && e.parsed.length > 0
    );
    if (allHaveData) {
      const obj = {};
      cachedEntries.forEach((e) => (obj[e.lang] = e.parsed));
      setLanguagePlaylists(obj);
      console.log("Home: loaded playlists from cache", Object.keys(obj));
      return;
    }

    console.log(
      "Home: cache missing or empty for languages",
      cachedEntries
        .filter((e) => !(Array.isArray(e.parsed) && e.parsed.length > 0))
        .map((e) => e.lang)
    );

    const fetchByLanguage = async (language) => {
      try {
        const baseUrl =
          "/api/saavn/api.php?__call=content.getFeaturedPlaylists&fetch_from_serialized_files=true&p=1&n=50&api_version=4&_format=json&ctx=web6dot0";
        const url = `${baseUrl}&languages=${encodeURIComponent(language)}`;
        console.log(
          `Home: fetching playlists for language=${language} from`,
          url
        );
        const headers = {
          Accept: "application/json, text/plain, */*",
          "Accept-Language": "en-US,en;q=0.9",
        };

        const res = await axios.get(url, { headers });
        console.log(`Home: response status for ${language}:`, res.status);
        const json = res.data || {};
        console.log(`Home: response data for ${language}:`, json);
        const data = json.data || [];

        const sorted = data.sort((a, b) => {
          const fa =
            parseInt((a.more_info && a.more_info.follower_count) || "0", 10) ||
            0;
          const fb =
            parseInt((b.more_info && b.more_info.follower_count) || "0", 10) ||
            0;
          return fb - fa;
        });
        const top6 = sorted.slice(0, 6);
        localStorage.setItem(`playlists_${language}`, JSON.stringify(top6));
        console.log(`Home: cached top6 for ${language}`, top6.length);
        return top6;
      } catch (err) {
        console.error("Error fetching playlists for", language, err);
        return [];
      }
    };

    (async () => {
      const entries = await Promise.all(
        langs.map(async (l) => [l, await fetchByLanguage(l)])
      );
      const obj = Object.fromEntries(entries);
      setLanguagePlaylists(obj);
    })();
  }, []);

  const handlePlaylistClick = async (plId) => {
    try {
      const encodedId = encodeURIComponent(String(plId || ""));

      const viteBase = import.meta.env.VITE_PLAYLIST_SONGS_URL || "";
      const serverlessFallback = "/api/playlist-songs";
      let base = viteBase || serverlessFallback;

      if (!base) {
        console.error(
          "No playlist backend configured (VITE_PLAYLIST_SONGS_URL or /api/playlist-songs)"
        );
        navigate("song");
        return;
      }

      const connector = base.includes("?") ? "&" : "?";
      const url = `${base}${connector}id=${encodedId}`;
      const headers = {
        Accept: "application/json, text/plain, */*",
        "Accept-Language": "en-US,en;q=0.9",
      };
      const res = await axios.get(url, { headers }).catch((e) => {
        console.warn("Playlist fetch failed for", url, e && e.message);
        return null;
      });
      const json = (res && res.data) || {};

      let songs = [];
      if (json.error) {
        console.warn("Playlist details returned error:", json.error);
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

      setAlbum(Array.isArray(songs) ? songs : []);
      if (Array.isArray(songs) && songs.length > 0 && songs[0].id) {
        setPid(songs[0].id);
      } else {
        console.warn("No songs found in playlist details for", plId);
      }
      navigate("song");
    } catch (err) {
      console.error("Error fetching playlist details", err);

      navigate("song");
    }
  };

  const genres = useMemo(() => {
    return Object.keys(languagePlaylists).map((lang) => ({
      id: lang,
      title: lang.charAt(0).toUpperCase() + lang.slice(1),
      items: languagePlaylists[lang] || [],
    }));
  }, [languagePlaylists]);

  const getPlaylistImage = (pl) => {
    if (!pl) return "/logo.webp";

    if (typeof pl.image === "string" && pl.image) return pl.image;

    if (pl.image && typeof pl.image === "object" && pl.image.url)
      return pl.image.url;

    if (Array.isArray(pl.image) && pl.image.length) {
      const it = pl.image[pl.image.length - 1];
      if (typeof it === "string" && it) return it;
      if (it && it.url) return it.url;
    }

    if (
      pl.more_info &&
      pl.more_info.images &&
      Array.isArray(pl.more_info.images) &&
      pl.more_info.images.length
    )
      return pl.more_info.images[pl.more_info.images.length - 1];
    if (pl.imageUrl) return pl.imageUrl;
    return "/logo.webp";
  };

  const containerRef = useRef(null);
  const [activeGenre, setActiveGenre] = useState(genres[0]?.id || "indie");

  const scrollToGenre = (idx) => {
    const container = containerRef.current;
    if (!container) return;
    const child = container.children[idx];
    if (!child) return;
    child.scrollIntoView({ behavior: "smooth", inline: "start" });
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
    container.addEventListener("scroll", onScroll, { passive: true });
    return () => container.removeEventListener("scroll", onScroll);
  }, [genres]);

  return (
    <>
      <Header
        render={true}
        setpid={setPid}
        setartistid={setArtistid}
        setchangealbum={setChangeAlbum}
        setalbum={setAlbum}
      />
      <main
        className="min-h-screen w-full p-4 md:p-8"
        style={{
          background:
            "linear-gradient(135deg, var(--brutal-white) 0%, var(--brutal-light-gray) 100%)",
        }}
      >
        <div className="mx-auto max-w-7xl">
          <header className="flex items-end justify-between mb-16 relative">
            <div className="relative">
              <div
                className="absolute -top-4 -left-4 w-32 h-32 bg-yellow-400 border-4 border-black"
                style={{ transform: "rotate(-15deg)" }}
              ></div>
              <h1
                className="brutal-heading text-4xl md:text-6xl relative z-10"
                style={{ textShadow: "4px 4px 0px rgb(255, 20, 147)" }}
              >
                // MUSIC PLAYER
              </h1>
              <div className="mt-2 flex items-center gap-2">
                <div className="w-16 h-1 bg-black border-2 border-blue-600"></div>
                <p className="hidden md:block md:text-sm md:text-base md:font-bold md:uppercase md:tracking-wider md:z-50 md:ml-[55px] ">
                  Explore brutal beats
                </p>
              </div>
            </div>
            <div className="hidden md:block">
              <div
                className="brutal-card p-4"
                style={{
                  background: "var(--brutal-blue)",
                  color: "var(--brutal-white)",
                  transform: "rotate(2deg)",
                }}
              >
                <div className="text-xs font-bold">NOW LOADING:</div>
                <div className="text-lg font-bold">{genres.length} LANGUAGES</div>
              </div>
            </div>
          </header>

          <div className="relative">
            <div
              ref={containerRef}
              className="flex gap-6 overflow-x-auto pb-8 scroll-snap-x snap-mandatory no-scrollbar"
              style={{ scrollSnapType: "x mandatory" }}
            >
              {genres.map((g) => (
                <section
                  key={g.id}
                  className="min-w-[90%] sm:min-w-[80%] md:min-w-[45%] lg:min-w-[30%] scroll-snap-start"
                  style={{ scrollSnapAlign: "start" }}
                >
                  <div className="relative mb-6">
                    <h2 className="brutal-heading text-2xl md:text-3xl relative inline-block">
                      {g.title === "English" && (
                        <>
                          <span style={{ color: "var(--brutal-blue)" }}>
                            //
                          </span>{" "}
                          ENG
                        </>
                      )}
                      {g.title === "Hindi" && (
                        <>
                          <span style={{ color: "var(--brutal-pink)" }}>
                            //
                          </span>{" "}
                          HINDI
                        </>
                      )}
                      {g.title === "Punjabi" && (
                        <>
                          <span style={{ color: "var(--brutal-yellow)" }}>
                            //
                          </span>{" "}
                          PJ
                        </>
                      )}
                      {g.title === "Haryanvi" && (
                        <>
                          <span style={{ color: "var(--brutal-green)" }}>
                            //
                          </span>{" "}
                          HR
                        </>
                      )}
                      {g.title !== "English" &&
                        g.title !== "Hindi" &&
                        g.title !== "Punjabi" &&
                        g.title !== "Haryanvi" && (
                          <>{`// ${g.title.toUpperCase()}`}</>
                        )}
                    </h2>
                    <div
                      className={`absolute -bottom-2 left-0 w-full h-1 ${
                        activeGenre === g.id ? "bg-black" : "bg-gray-400"
                      }`}
                    ></div>
                    {activeGenre === g.id && (
                      <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 border-2 border-black animate-pulse"></div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {(g.items || []).slice(0, 6).map((pl, index) => {
                      return (
                        <button
                          key={pl.id}
                          onClick={() => handlePlaylistClick(pl.id)}
                          className={`brutal-card group p-3 text-left relative overflow-hidden transition-all duration-200 hover:scale-105`}
                          style={{
                            borderColor: [
                              "#0066FF",
                              "#FF1493",
                              "#FFD700",
                              "#00FF00",
                              "#FF0000",
                              "#9400D3",
                            ][index % 6],
                            transform: `rotate(${
                              (index % 2 === 0 ? -1 : 1) * Math.random() * 2
                            }deg)`,
                            background:
                              index % 3 === 0
                                ? "#FFFFFF"
                                : index % 3 === 1
                                ? "#E5E5E5"
                                : "#FFFFFF",
                          }}
                          onMouseEnter={(e) =>
                            e.currentTarget.classList.add("glitch-effect")
                          }
                          onMouseLeave={(e) =>
                            e.currentTarget.classList.remove("glitch-effect")
                          }
                        >
                          <div
                            className="aspect-square overflow-hidden mb-3 relative"
                            style={{ border: "3px solid #000000" }}
                          >
                            <img
                              src={getPlaylistImage(pl)}
                              alt={sanitizeSongMetadata(pl.name || "")}
                              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-110"
                            />
                            <div className="absolute top-1 right-1 w-3 h-3 bg-white border-2 border-black"></div>
                          </div>
                          <div className="relative">
                            <div
                              className="text-xs font-bold uppercase truncate mb-1"
                              style={{ letterSpacing: "1px" }}
                            >
                              {sanitizeSongMetadata(pl.title || pl.name || "")}
                            </div>
                            <div className="text-xs opacity-60 uppercase">
                              {pl.more_info?.follower_count
                                ? `${Math.floor(
                                    parseInt(pl.more_info.follower_count) / 1000
                                  )}K FANS`
                                : "HOT TRACKS"}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export default Home;
