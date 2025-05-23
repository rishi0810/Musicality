import { useState, useEffect } from "react";
import Footer from "../layout/Footer";
import Header from "../layout/Header";
import axios from "axios";
function Song({ homeAlbum }) {
  const placeholder_song_url =
    "https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png";
  const placeholder_artist_url =
    "https://static.vecteezy.com/system/resources/thumbnails/036/594/092/small/man-empty-avatar-photo-placeholder-for-social-networks-resumes-forums-and-dating-sites-male-and-female-no-photo-images-for-unfilled-user-profile-free-vector.jpg";

  // States for song details
  const [pid, setpid] = useState("");
  const [songurl, setsongurl] = useState("");
  const [name, setname] = useState("");
  const [artist, setartist] = useState("");
  const [imgurl, setimgurl] = useState(placeholder_song_url);
  const [lyrics, setlyrics] = useState("Lyrics....");
  const [artistid, setartistid] = useState("");
  const [toggle, settoggle] = useState(false);
  const [artistimgurl, setartistimgurl] = useState(placeholder_artist_url);

  //States for album and toggle to change album
  const [album, setalbum] = useState(homeAlbum || []);
  const [changealbum, setchangealbum] = useState(false);

  //Function to format the time in xx:xx in the divs
  const formatTime = (time) => {
    if (!time) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}`;
  };

  //Fetching the album from the home component
  useEffect(() => {
    if (album instanceof Promise) {
      album.then((resolvedAlbum) => setalbum(resolvedAlbum));
    }
  }, [album]);

  //On selecting a pid, artist or name of the song, the song is fetched with lyrics
  useEffect(() => {
    const fetch_song_url = async () => {
      if (pid) {
        const response = await fetch(`https://saavn.dev/api/songs/${pid}`);
        const api_data = await response.json();
        if (changealbum) {
          const albumresponse = await fetch(
            `https://saavn.dev/api/artists/${artistid}/songs`
          );
          const album_data = (await albumresponse.json()).data.songs;
          setalbum(album_data);
        }
        setartistimgurl(api_data.data[0].artists.primary[0].image[2].url);
        setsongurl(api_data.data[0].downloadUrl[4].url);
        setimgurl(api_data.data[0].image[2].url);
        setname(api_data.data[0].name);
        setartist(api_data.data[0].artists.primary[0].name);
      }
    };

    fetch_song_url();
  }, [pid]);

  useEffect(() => {
    const fetch_song_lyrics = async () => {
      if (artist && name) {
        const query = encodeURIComponent(`${name} ${artist}`);
        const response = await axios.get(
          `https://lrclib.net/api/search?q=${query}`
        );
        const items = response.data;
        const best = items[0] || { plainLyrics: "No lyrics available" };
        setlyrics(best.plainLyrics);
      }
    };

    fetch_song_lyrics();
  }, [artist, name]);

 

  return (
    <>
      <Header
        setpid={setpid}
        render={true}
        setartistid={setartistid}
        setchangealbum={setchangealbum}
      />
      <div className="bg-zinc-950 min-h-screen flex w-full">
        {pid || album ? (
          <>
            <div className="flex-1 min-h-svh">
              <div className="flex gap-3 px-5 py-3">
                <button
                  className={`min-w-16 p-4 text-white ${
                    toggle ? "border-b" : null
                  } hover:border-b hover:border-slate-300`}
                  onClick={() => {
                    settoggle(true);
                  }}
                >
                  Lyrics
                </button>
                <button
                  className={`min-w-16 p-4 text-white ${
                    toggle ? "" : "border-b"
                  } hover:border-b hover:border-slate-300`}
                  onClick={() => {
                    settoggle(false);
                  }}
                >
                  More Songs
                </button>
              </div>

              {toggle ? (
                <div
                  className="text-slate-300 max-h-[calc(100vh-150px)] overflow-y-auto text-left py-5 px-10"
                  style={{ whiteSpace: "pre-wrap" }}
                >
                  {lyrics}
                </div>
              ) : (
                <div className="flex flex-col gap-5 max-h-[calc(100vh-150px)] overflow-y-auto pb-20 px-5">
                  {album.map((song, index) => (
                    <div
                      key={index}
                      className="flex py-2 px-5 justify-between hover:bg-zinc-900 hover:cursor-pointer items-center"
                      onClick={() => {
                        setpid(song.id);
                      }}
                    >
                      <div className="flex gap-4 min-w-[305px] items-center flex-1">
                        <span className="text-slate-500 flex items-center w-6">
                          {index + 1}
                        </span>
                        <img
                          src={song.image[2].url}
                          className="size-10 rounded"
                          alt={song.name}
                        />
                        <h3 className="text-white font-bold truncate w-[200px]">
                          {song.name
                            .replace(/&amp;/g, "&")
                            .replace(/&#039;/g, "'")
                            .replace(/&quot;/g, '"')}
                        </h3>
                      </div>
                      <h5 className="text-white w-[200px] text-left truncate flex-1">
                        {song.artists.primary[0].name
                          .replace(/&amp;/g, "&")
                          .replace(/&#039;/g, "'")
                          .replace(/&quot;/g, '"')}
                      </h5>
                      <h3 className="text-white w-16 text-right">
                        {formatTime(song.duration)}
                      </h3>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {pid ? (
              <>
                <div className="flex flex-col gap-5 w-1/5 items-center bg-zinc-900 px-5 py-10 max-h-[calc(100vh-4rem)] overflow-y-auto">
                  <img
                    src={imgurl}
                    className="w-full rounded-md p-2 bg-zinc-900 ring ring-inset ring-blue-700 ring-opacity-40"
                    alt="Album Cover"
                  />
                  <div className="flex flex-col gap-1 p-2 w-full">
                    <h1 className="text-xl font-bold text-slate-200">
                      {name
                        .replace(/&amp;/g, "&")
                        .replace(/&#039;/g, "'")
                        .replace(/&quot;/g, '"')}
                    </h1>
                    <h4 className="text-md font-semibold text-slate-400">
                      {artist
                        .replace(/&amp;/g, "&")
                        .replace(/&#039;/g, "'")
                        .replace(/&quot;/g, '"')}
                    </h4>
                  </div>
                  <img
                    src={artistimgurl}
                    alt=""
                    className="rounded p-2 ring ring-inset ring-blue-700 ring-opacity-20"
                  />
                </div>
              </>
            ) : null}
          </>
        ) : null}
      </div>
      <Footer
        songurl={songurl}
        name={name}
        artist={artist}
        imgurl={imgurl}
        album={album}
        setpid={setpid}
      />
    </>
  );
}

export default Song;
