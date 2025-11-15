import { useEffect, useState } from 'react';
import SongItem from './SongItem.jsx';
import { usePlayer } from '../context/PlayerContext';

const UpNextQueue = ({ album, setpid, formatTime, currentSong }) => {
  const { artistid, pid } = usePlayer();
  const [moreByArtist, setMoreByArtist] = useState([]);

  useEffect(() => {
    let mounted = true;
    const fetchMore = async () => {
      try {
        if (!artistid) {
          setMoreByArtist([]);
          return;
        }
        const res = await fetch(`https://saavn.sumit.co/api/artists/${artistid}/songs`);
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
    <div className="text-black">
        {album.length > 0 && (
          <div className="mb-6">
            <h3 className="font-bold text-xs uppercase tracking-wider mb-3" style={{fontFamily: 'Space Mono, monospace'}}>
              // CURRENT QUEUE
            </h3>
            {album.map((song) => (
              <SongItem
                key={song.id}
                song={song}
                setpid={setpid}
                formatTime={formatTime}
                isActive={String(song.id) === String(pid) || String(song.id) === String(currentSong.id) || (song.name && currentSong.name && String(song.name) === String(currentSong.name))}
              />
            ))}
          </div>
        )}

        {filteredMore.length > 0 && (
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider mb-3" style={{fontFamily: 'Space Mono, monospace'}}>
              // MORE BY ARTIST
            </h3>
            {filteredMore.slice(0, 20).map((song) => (
              <SongItem
                key={song.id}
                song={song}
                setpid={setpid}
                formatTime={formatTime}
                isActive={String(song.id) === String(pid) || String(song.id) === String(currentSong.id) || (song.name && currentSong.name && String(song.name) === String(currentSong.name))}
              />
            ))}
          </div>
        )}

        {album.length === 0 && filteredMore.length === 0 && (
          <div className="text-center py-8">
            <div className="text-sm font-bold uppercase opacity-60">No songs in queue</div>
          </div>
        )}
    </div>
  );
};

export default UpNextQueue;

