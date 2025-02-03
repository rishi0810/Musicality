import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { NavLink } from "react-router";
import logo from "../assets/icon.png"

const Header = ({ setpid, render, setartistid, setchangealbum }) => {
  const [searchresults, setsearchresults] = useState(false);
  //States for dropdown search menu and input field
  const [results, setresults] = useState([]);
  const [data, setdata] = useState("");
  const dropdownRef = useRef(null);

  //Handling searching of song according to input field
  const handleevent = (e) => {
    const newData = e.target.value;
    setdata(newData);

    if (newData.trim() === "") {
      setsearchresults(false);
      setresults([]);
      return;
    }

    //Fetching song and song lyrics
    const fetch_song_url = async () => {
      const response = await fetch(
        `https://saavn.dev/api/search/songs?query=${newData}`
      );
      const api_data = await response.json();
      setresults(api_data.data.results);
    };

    fetch_song_url();

    if (results.length > 0) {
      setsearchresults(true);
    }

    setchangealbum(true);
  };

  //Handling removal of dropdown menu on clicking outside the menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setsearchresults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    //Removal on unmount
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <header className="sticky top-0 bg-zinc-950 px-20 py-2 z-40 border-b border-zinc-600">
        <div className="flex justify-between px-3 items-center">
          <span className="flex gap-2">
          <img src={logo} className="size-14"/>
            <Link
              to="/"
              className="text-xl font-poppins font-bold text-slate-300 self-center"
            >
              Musicality
            </Link>
          </span>

          <div className="w-1/3 h-[40px] flex items-center">
            {render ? (
              <input
                type="search"
                placeholder="what're you feeling like today?..."
                className="bg-zinc-900 placeholder:text-slate-400 placeholder:font-serif placeholder:opacity-60 py-2 px-5 text-slate-200 rounded-full w-full focus:outline focus:outline-blue-600 focus:outline-2"
                onChange={handleevent}
                value={data}
              />
            ) : (
              <>
                <NavLink
                  to={"/song"}
                  className="px-3 py-2 rounded-full flex-1 bg-zinc-900 text-zinc-200 text-md flex items-center justify-center hover:cursor-text"
                >
                  <span className="flex gap-1 items-center text-slate-400 hover:text-white">
                    <Search className="size-[18px]" />
                    Search
                  </span>
                </NavLink>
              </>
            )}
          </div>

          <div className="flex gap-5">
            <Link 
            to={"https://www.linkedin.com/in/rishiraj2003/"}
            className="text-lg  font-semibold text-slate-300 self-center hover:text-white rounded font-poppins">
              Contact
            </Link>
            <Link 
            to={"https://github.com/rishi0810"}
            className="text-lg  font-semibold text-slate-300 self-center hover:text-white rounded font-poppins">
              Github
            </Link>
          </div>
        </div>

        {render && searchresults && (
          <div
            ref={dropdownRef}
            className="absolute top-full left-1/2 transform -translate-x-1/2 w-[445px] bg-zinc-900 rounded p-1 shadow shadow-zinc-800 z-50"
          >
            {results.length > 0 && (
              <div className="flex flex-col gap-3">
                {results.slice(0, 5).map((result) => (
                  <div
                    key={result.id}
                    className="flex gap-3 p-1 hover:bg-zinc-800 hover:cursor-pointer"
                    onClick={() => {
                      setpid(result.id);
                      setsearchresults(false);
                      setartistid(result.artists.primary[0].id);
                    }}
                  >
                    <img
                      src={result.image[2].url}
                      className="size-16 rounded"
                      alt={result.name}
                    />
                    <div className="flex flex-col justify-center">
                      <h3 className="text-white text-md font-bold">
                        {result.name
                          .replace(/&amp;/g, "&")
                          .replace(/&#039;/g, "'")
                          .replace(/&quot;/g, '"')}
                      </h3>
                      <h5 className="text-white text-sm">
                        {result.artists.primary[0].name
                          .replace(/&amp;/g, "&")
                          .replace(/&#039;/g, "'")
                          .replace(/&quot;/g, '"')}
                      </h5>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </header>
    </>
  );
};

export default Header;
