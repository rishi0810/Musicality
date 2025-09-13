import { useEffect, useState } from 'react';
import SongItem from './SongItem.jsx';
import PropTypes from 'prop-types';
import { usePlayer } from '../context/PlayerContext';

const UpNextQueue = ({ album, setpid, formatTime, currentSong }) => {
  const { artistid } = usePlayer();
  const [moreByArtist, setMoreByArtist] = useState([]);

  useEffect(() => {
    let mounted = true;
    const fetchMore = async () => {
      try {
        if (!artistid) {
          setMoreByArtist([]);
          return;
        }
        const res = await fetch(`https://saavn.dev/api/artists/${artistid}/songs`);
        const json = await res.json();
        const songs = json.data?.songs || [];
        if (mounted) setMoreByArtist(songs);
      } catch (err) {
        console.error('Failed to fetch artist songs', err);
        if (mounted) setMoreByArtist([]);
      }
    };
    fetchMore();
    return () => { mounted = false; };
  }, [artistid]);

  const filteredMore = moreByArtist.filter((s) => !album.some((a) => a.id === s.id));

  return (
    <div className="text-white px-2 py-2">
      <div className="max-h-[calc(100vh-360px)] overflow-y-auto styled-scrollbar">
        {album.map((song) => (
          <SongItem
            key={song.id}
            song={song}
            setpid={setpid}
            formatTime={formatTime}
            isActive={song.name === currentSong.name}
          />
        ))}

        {filteredMore.length > 0 && (
          <div className="mt-4">
            {filteredMore.slice(0, 20).map((song) => (
              <SongItem
                key={song.id}
                song={song}
                setpid={setpid}
                formatTime={formatTime}
                isActive={song.name === currentSong.name}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UpNextQueue;

UpNextQueue.propTypes = {
  album: PropTypes.arrayOf(PropTypes.object),
  setpid: PropTypes.func,
  formatTime: PropTypes.func,
  currentSong: PropTypes.shape({ name: PropTypes.string }),
};
