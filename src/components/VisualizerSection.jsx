import { useEffect, useState, useMemo } from "react";
import { sanitizeSongMetadata, decodeHtmlEntities } from "../utils/sanitize";

const VisualizerSection = ({ currentSong }) => {
  const cover = currentSong.cover;
  const [glowRgb, setGlowRgb] = useState([59, 130, 246]);

  useEffect(() => {
    let mounted = true;
    if (!cover) {
      setGlowRgb([59, 130, 246]);
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = cover;
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const w = (canvas.width = Math.min(100, img.width));
        const h = (canvas.height = Math.min(100, img.height));
        ctx.drawImage(img, 0, 0, w, h);
        const data = ctx.getImageData(0, 0, w, h).data;
        const colorCount = {};
        for (let i = 0; i < data.length; i += 4 * 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const brightness = (r + g + b) / 3;
          if (brightness < 30 || brightness > 230) continue;
          const key = `${Math.round(r / 16) * 16},${Math.round(g / 16) * 16},${
            Math.round(b / 16) * 16
          }`;
          colorCount[key] = (colorCount[key] || 0) + 1;
        }
        const sorted = Object.entries(colorCount).sort((a, b) => b[1] - a[1]);
        if (sorted.length > 0) {
          const [r, g, b] = sorted[0][0].split(",").map((v) => parseInt(v, 10));
          if (mounted) setGlowRgb([r, g, b]);
        } else {
          if (mounted) setGlowRgb([59, 130, 246]);
        }
      } catch {
        if (mounted) setGlowRgb([59, 130, 246]);
      }
    };
    img.onerror = () => {
      if (mounted) setGlowRgb([59, 130, 246]);
    };
    return () => {
      mounted = false;
    };
  }, [cover]);

  const displayName = useMemo(() => {
    return sanitizeSongMetadata(
      currentSong && currentSong.name ? String(currentSong.name) : ""
    );
  }, [currentSong.name]);

  const displayArtist = useMemo(() => {
    return sanitizeSongMetadata(currentSong.artist || "UNKNOWN ARTIST");
  }, [currentSong.artist]);
  return (
    <div className="relative h-full min-h-[420px] flex flex-col items-center justify-center p-4 sm:p-6 relative z-10 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div
          className="absolute top-4 left-4 w-6 h-6 sm:w-8 sm:h-8 bg-yellow-400 border-2 border-black animate-pulse"
          style={{ transform: "rotate(15deg)" }}
        ></div>
        <div className="absolute top-12 right-8 w-4 h-4 sm:w-6 sm:h-6 bg-pink-500 border-2 border-black"></div>
        <div className="absolute bottom-16 left-8 sm:left-12 w-3 h-3 sm:w-4 sm:h-4 bg-blue-400 border-2 border-black animate-bounce"></div>
        <div
          className="absolute bottom-8 right-4 w-6 h-6 sm:w-10 sm:h-10 bg-green-400 border-2 sm:border-3 border-black"
          style={{ transform: "rotate(-20deg)" }}
        ></div>
      </div>

      <div className="relative group mb-6 sm:mb-8 max-w-full">
        <div
          className="absolute -inset-2 sm:-inset-4 border-2 sm:border-4 border-black opacity-80 group-hover:opacity-100 transition-all duration-200"
          style={{
            transform: "rotate(-2deg)",
            background: `linear-gradient(45deg, rgba(${glowRgb.join(
              ","
            )},0.1), rgba(${glowRgb.join(",")},0.3))`,
            boxShadow: `4px 4px 0px rgba(${glowRgb.join(
              ","
            )},0.5), 8px 8px 0px rgba(0,0,0,0.2)`,
          }}
        />

        <div
          className="relative w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-64 lg:w-96 lg:h-80 overflow-hidden border-4 sm:border-6 border-black bg-white"
          style={{ transform: "rotate(1deg)" }}
        >
          {cover ? (
            <>
              <img
                src={cover}
                alt="Album Art"
                className="w-full h-full object-cover select-none pointer-events-none"
                draggable={false}
                style={{
                  filter: "contrast(1.1) saturate(1.2)",
                  mixBlendMode: "multiply",
                }}
              />

              <div className="absolute top-2 right-2 w-4 h-4 sm:w-8 sm:h-8 bg-white border-2 border-black flex items-center justify-center">
                <div className="w-1 h-1 sm:w-2 sm:h-2 bg-black"></div>
              </div>
              <div className="absolute bottom-2 left-2 w-3 h-3 sm:w-6 sm:h-6 bg-yellow-300 border-2 border-black animate-pulse"></div>
              <div className="absolute inset-0 border-b-2 border-r-2 sm:border-b-4 sm:border-r-4 border-black opacity-20"></div>
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-200 border-2 sm:border-4 border-black">
              <div
                className="text-2xl sm:text-4xl font-bold mb-2"
                style={{ fontFamily: "Space Mono, monospace" }}
              >
                NO ART
              </div>
              <div className="w-8 h-1 sm:w-16 bg-black border-2 border-pink-500"></div>
            </div>
          )}
        </div>

        <div
          className="absolute -inset-1 sm:-inset-2 border-2 sm:border-4 border-black pointer-events-none"
          style={{
            transform: "rotate(-1deg)",
            background: "transparent",
          }}
        ></div>
      </div>

      <div className="text-center px-4 max-w-md relative z-10">
        <div className="relative mb-4">
          <h2
            className="brutal-heading text-2xl md:text-3xl relative z-10 break-words"
            style={{ fontFamily: "Space Mono, monospace" }}
          >
            {displayName || "SELECT A TRACK"}
          </h2>
          <div
            className="absolute -bottom-2 left-0 w-full h-3 bg-pink-400 border-2 border-black"
            style={{ transform: "rotate(-1deg)" }}
          ></div>
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 border-2 border-black animate-pulse"></div>
        </div>

        <div className="relative mb-4">
          <h4
            className="text-lg md:text-xl font-bold uppercase tracking-wider opacity-80 relative z-10 break-words"
            style={{ fontFamily: "IBM Plex Mono, monospace" }}
          >
            {displayArtist}
          </h4>
          <div
            className="absolute -bottom-1 left-0 w-full h-2 bg-blue-400 border border-black opacity-60"
            style={{ transform: "rotate(0.5deg)" }}
          ></div>
        </div>

        <div className="mt-4 flex items-center justify-center gap-3">
          <div className="w-8 h-8 bg-green-400 border-2 border-black animate-bounce"></div>
          <div className="w-16 h-1 bg-black border-2 border-yellow-500"></div>
          <div className="w-8 h-8 bg-red-400 border-2 border-black"></div>
        </div>
      </div>
    </div>
  );
};

export default VisualizerSection;
