// PropTypes removed for build cleanup
import { sanitizeSongMetadata } from "../utils/sanitize";

const SongItem = ({ song, setpid, formatTime, isActive }) => {
  const getBestImage = (img) => {
    if (!img) return "/logo.webp";
    if (typeof img === "string") return img;
    if (Array.isArray(img)) {
      for (let i = img.length - 1; i >= 0; i--) {
        const it = img[i];
        if (!it) continue;
        if (typeof it === "string" && it) return it;
        if (it.url) return it.url;
      }
    }
    if (img.url) return img.url;
    if (
      img.more_info &&
      Array.isArray(img.more_info.images) &&
      img.more_info.images.length
    )
      return img.more_info.images[img.more_info.images.length - 1];
    return "/logo.webp";
  };

  const imageSrc = getBestImage(
    song && (song.image || (song.more_info && song.more_info.images))
  );

  const title = sanitizeSongMetadata(
    song && (song.name || song.title || song.song)
  );
  const artist = sanitizeSongMetadata(
    song &&
      ((song.artists &&
        song.artists.primary &&
        song.artists.primary[0] &&
        song.artists.primary[0].name) ||
        song.more_info?.singers ||
        song.primary_artists ||
        "")
  );

  return (
    <button
      type="button"
      onClick={() => setpid(song.id)}
      className={`group w-full flex items-center gap-4 px-4 py-2 transition relative text-left rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/60 focus:ring-offset-0 ${
        isActive
          ? "bg-yellow-100 border-2 border-black"
          : "hover:bg-gray-100 border-2 border-transparent"
      }`}
    >
      <div className="relative shrink-0">
        <div
          className={`size-11 rounded-md overflow-hidden border-2 border-black ${
            isActive ? "ring-2 ring-yellow-400" : ""
          }`}
        >
          {isActive ? (
            <div className="w-full h-full flex items-center justify-center bg-pink-500">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 19V6l10 6.5-10 6.5z"
                />
              </svg>
            </div>
          ) : (
            <img
              src={imageSrc}
              className="w-full h-full object-cover"
              alt={title || "cover"}
              loading="lazy"
            />
          )}
        </div>
      </div>
      <div className="flex flex-col flex-1 min-w-0">
        <span
          className={`text-[0.85rem] font-bold uppercase tracking-wide truncate ${
            isActive ? "text-black" : "text-black group-hover:text-black"
          }`}
        >
          {title || "Unknown Title"}
        </span>
        <span
          className={`text-[0.75rem] font-bold uppercase opacity-70 group-hover:text-black truncate ${
            isActive ? "text-black" : ""
          }`}
        >
          {artist || "Unknown Artist"}
        </span>
      </div>
      <span className="text-[0.65rem] font-mono font-bold text-black opacity-70 w-12 text-right">
        {formatTime(
          (() => {
            const d =
              song &&
              (song.duration || song.duration_in_seconds || song.length);
            if (!d) return 0;

            const num = Number(d) || 0;
            if (num > 3600) return Math.round(num / 1000);
            return num;
          })()
        )}
      </span>
    </button>
  );
};

export default SongItem;

// PropTypes removed for build cleanup
