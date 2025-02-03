import React, { useEffect, useState } from "react";
import Header from "../layout/Header";
import { useNavigate } from "react-router";

function Home({ setalbum }) {
  //Array state variables for playlists
  const [indieplaylist, setIndieplaylist] = useState([]);
  const [rockplaylist, setRockplaylist] = useState([]);
  const [chillplaylist, setChillplaylist] = useState([]);
  const [partyplaylist, setPartyplaylist] = useState([]);
  const [playlistid, setplaylistid] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    //Getting local storage items to avoid re-rendering of the albums
    const cachedIndie = localStorage.getItem("indiePlaylist");
    const cachedRock = localStorage.getItem("rockPlaylist");
    const cachedChill = localStorage.getItem("chillPlaylist");
    const cachedParty = localStorage.getItem("partyPlaylist");

    //If they exist, parsing the cached playlist and updating the state variable as the fetched album
    if (cachedIndie && cachedRock && cachedChill && cachedParty) {
      setIndieplaylist(JSON.parse(cachedIndie));
      setRockplaylist(JSON.parse(cachedRock));
      setChillplaylist(JSON.parse(cachedChill));
      setPartyplaylist(JSON.parse(cachedParty));
      return;
    }
    //If not existing, the albums are fetched according to the list type
    const fetchPlaylists = async () => {
      try {
        const fetchAndSet = async (query, setter, storageKey) => {
          const response = await fetch(
            `https://saavn.dev/api/search/playlists?query=${query}`
          );
          const data = (await response.json()).data.results;
          setter(data);
          localStorage.setItem(storageKey, JSON.stringify(data));
        };

        await Promise.all([
          fetchAndSet("Indie", setIndieplaylist, "indiePlaylist"),
          fetchAndSet("Rock", setRockplaylist, "rockPlaylist"),
          fetchAndSet("Chill", setChillplaylist, "chillPlaylist"),
          fetchAndSet("Party", setPartyplaylist, "partyPlaylist"),
        ]);
      } catch (error) {
        console.error("Error fetching playlists:", error);
      }
    };

    fetchPlaylists();
  }, []);

  //If an album is selected, the album is sent over to the song component
  useEffect(() => {
    if (playlistid) {
      const album_fetch = async () => {
        const response = await fetch(
          `https://saavn.dev/api/playlists?id=${playlistid}`
        );
        const album_fetch_data = (await response.json()).data.songs;
        setalbum(album_fetch_data);
        navigate("song");
      };
      album_fetch();
    }
  }, [playlistid, setalbum]);

  return (
    <>
      <Header render={false} />
      <div className="bg-gradient-to-b from-zinc-900 to-zinc-950 min-h-screen flex flex-col gap-5 w-full px-4">
        <div className="flex flex-col px-5 py-10 min-h-screen justify-evenly">
          <span className="text-3xl text-white font-serif justify-self-start px-8 mb-5">
            Top Playlists
          </span>
          <div className="w-full px-4">
            <p className="text-xl px-5 text-white  font-poppins">Indie</p>
            <div className="flex justify-evenly">
              {indieplaylist.length > 0
                ? indieplaylist.map((playlist) => (
                    <div
                      className="p-4 rounded"
                      key={playlist.id}
                      onClick={() => {
                        setplaylistid(playlist.id);
                      }}
                    >
                      <img
                        className="rounded-md transition-transform duration-200 ease-in-out transform hover:scale-105 hover:brightness-75 hover:cursor-pointer"
                        src={playlist.image[2].url}
                        alt=""
                      />
                      <h5 className="text-slate-200 text-sm mt-1 font-inter">
                        {playlist.name}
                      </h5>
                    </div>
                  ))
                : null}
            </div>
          </div>
          <div className="w-full px-4 ">
            <p className="text-xl px-5 text-white  font-poppins">Rock</p>
            <div className="flex justify-evenly">
              {rockplaylist.length > 0
                ? rockplaylist.map((playlist) => (
                    <div
                      className="p-4 rounded"
                      key={playlist.id}
                      onClick={() => {
                        setplaylistid(playlist.id);
                      }}
                    >
                      <img
                        className="rounded-md transition-transform duration-200 ease-in-out transform hover:scale-105 hover:brightness-75 hover:cursor-pointer  "
                        src={playlist.image[2].url}
                        alt=""
                      />
                      <h5 className="text-slate-200 text-sm mt-1 font-inter">
                        {playlist.name}
                      </h5>
                    </div>
                  ))
                : null}
            </div>
          </div>
          <div className="w-full px-4">
            <p className="text-xl px-5 text-white  font-poppins ">Chill</p>
            <div className="flex justify-evenly">
              {chillplaylist.length > 0
                ? chillplaylist.map((playlist) => (
                    <div
                      className="p-4 rounded"
                      key={playlist.id}
                      onClick={() => {
                        setplaylistid(playlist.id);
                      }}
                    >
                      <img
                        className="rounded-md transition-transform duration-200 ease-in-out transform hover:scale-105 hover:brightness-75 hover:cursor-pointer  "
                        src={playlist.image[2].url}
                        alt=""
                      />
                      <h5 className="text-slate-200 text-sm mt-1 font-inter">
                        {playlist.name}
                      </h5>
                    </div>
                  ))
                : null}
            </div>
          </div>
          <div className="w-full px-4">
            <p className="text-xl px-5 text-white font-poppins ">Party</p>
            <div className="flex justify-evenly">
              {partyplaylist.length > 0
                ? partyplaylist.map((playlist) => (
                    <div
                      className="p-4 rounded"
                      key={playlist.id}
                      onClick={() => {
                        setplaylistid(playlist.id);
                      }}
                    >
                      <img
                        className="rounded-md transition-transform duration-200 ease-in-out transform hover:scale-105 hover:brightness-75 hover:cursor-pointer  "
                        src={playlist.image[2].url}
                        alt=""
                      />
                      <h5 className="text-slate-200 text-sm mt-1 font-inter">
                        {playlist.name}
                      </h5>
                    </div>
                  ))
                : null}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;
