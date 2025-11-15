import { Play, Pause } from "lucide-react";
import { usePlayer } from "../context/PlayerContext";

function MobileBottomBar({ onOpenPlayer }) {
  const { name, imgurl, isPlaying, togglePlayPause, currentTime, duration } =
    usePlayer();

  const progressPercentage =
    duration > 0
      ? Math.min(100, Math.max(0, (currentTime / duration) * 100))
      : 0;

  if (!name && !imgurl) return null;

  return (
    <>
      <div
        className="fixed bottom-[72px] left-0 right-0 h-2  bg-gradient-to-r from-pink-500 to-blue-500 transition-all duration-300 ease-out z-50"
        style={{ width: `${progressPercentage}%` }}
        onClick={onOpenPlayer}
      />
      <div
        className="fixed bottom-0 left-0 right-0 bg-white border-black z-0 px-4 py-3 flex items-center justify-between"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 12px)" }}
      >
        <div
          className="flex items-center gap-3 flex-1 cursor-pointer"
          onClick={(e) => {
            if (
              e.target === e.currentTarget ||
              e.target.closest("[data-bar-content]")
            ) {
              onOpenPlayer();
            }
          }}
          data-bar-content
        >
          <div className="relative">
            <img
              src={imgurl || "/music-logo.svg"}
              alt="Song cover"
              className="w-12 h-12 bg-black object-cover border-2 border-black"
              onError={(e) => {
                e.target.src = "/music-logo.svg";
              }}
            />
          </div>
          <div className="flex flex-col min-w-0 max-w-[200px]" data-bar-content>
            <h4
              className="font-bold text-sm uppercase tracking-wider truncate text-black"
              style={{ fontFamily: "Space Mono, monospace" }}
              data-bar-content
            >
              {(name || "Unknown Track")
                .replace(/&amp;/g, "&")
                .replace(/&#039;/g, "'")
                .replace(/&quot;/g, '"')}
            </h4>
          </div>
        </div>

        <button
          className="brutal-button p-2 bg-white text-black hover:bg-pink-500 border-2 border-black flex-shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            togglePlayPause();
          }}
          aria-label={isPlaying ? "Pause" : "Play"}
          style={{ transform: "rotate(1deg)" }}
        >
          {isPlaying ? (
            <Pause className="size-5 text-black" />
          ) : (
            <Play className="size-5 text-black" />
          )}
        </button>
      </div>
    </>
  );
}

export default MobileBottomBar;
