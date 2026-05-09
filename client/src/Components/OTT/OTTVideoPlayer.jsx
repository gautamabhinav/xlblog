import { useEffect, useRef, useState } from "react";
import { Bookmark, Captions, Gauge, Maximize, Minimize, NotebookPen, Pause, PictureInPicture2, Play, Settings, SkipBack, SkipForward, Subtitles } from "lucide-react";
import { motion } from "framer-motion";
import api from "../../Helper/axiosInstance";

const formatTime = (seconds = 0) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
};

const OTTVideoPlayer = ({ videoId, fallbackSrc = "", poster = "" }) => {
  const videoRef = useRef(null);
  const [manifest, setManifest] = useState(null);
  const [theater, setTheater] = useState(false);
  const [note, setNote] = useState("");
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!videoId) return;
    api.get(`/videos/${videoId}/playback`, { skipAuthRedirect: true }).then((res) => setManifest(res.data)).catch(() => {});
  }, [videoId]);

  useEffect(() => {
    const handler = (event) => {
      const video = videoRef.current;
      if (!video) return;
      if (event.key === " ") {
        event.preventDefault();
        video.paused ? video.play() : video.pause();
      }
      if (event.key === "ArrowRight") video.currentTime += 10;
      if (event.key === "ArrowLeft") video.currentTime -= 10;
      if (event.key.toLowerCase() === "f") video.requestFullscreen?.();
      if (event.key.toLowerCase() === "t") setTheater((value) => !value);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const source = manifest?.playback?.hls || manifest?.playback?.mp4 || fallbackSrc;

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setTimeout(() => setShowControls(false), 2400);
    return () => clearTimeout(timer);
  }, [isPlaying, showControls]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const saveProgress = () => {
    const video = videoRef.current;
    if (!videoId || !video) return;
    api.patch(`/videos/${videoId}/progress`, {
      currentTime: video.currentTime,
      duration: video.duration || 0,
      playbackRate,
    }).catch(() => {});
  };

  const saveInteraction = (type, body = "") => {
    const video = videoRef.current;
    if (!videoId || !video) return;
    api.post(`/videos/${videoId}/interactions`, {
      type,
      timestamp: video.currentTime || 0,
      body,
    }).catch(() => {});
  };

  const updateRate = () => {
    const next = playbackRate >= 2 ? 0.75 : playbackRate + 0.25;
    setPlaybackRate(next);
    if (videoRef.current) videoRef.current.playbackRate = next;
  };

  return (
    <div className={theater ? "fixed inset-0 z-[70] bg-black p-4 md:p-8" : ""}>
      <section className="overflow-hidden rounded-[8px] border border-white/10 bg-black shadow-2xl">
        <div className="relative bg-black" onMouseMove={() => setShowControls(true)} onTouchStart={() => setShowControls(true)}>
          <video
            ref={videoRef}
            className="aspect-video w-full bg-black object-contain"
            poster={poster || manifest?.video?.thumbnailUrl}
            src={source}
            playsInline
            onClick={togglePlay}
            onPause={() => { setIsPlaying(false); saveProgress(); }}
            onPlay={() => setIsPlaying(true)}
            onTimeUpdate={(event) => {
              const video = event.currentTarget;
              setProgress(video.duration ? (video.currentTime / video.duration) * 100 : 0);
              if (Math.round(event.currentTarget.currentTime) % 20 === 0) saveProgress();
            }}
          />
          {!source && (
            <div className="absolute inset-0 grid place-items-center bg-black">
              <div className="h-14 w-14 animate-spin rounded-full border-4 border-white/10 border-t-sky-300" />
            </div>
          )}
          <div className="pointer-events-none absolute left-4 top-4 rounded-[8px] bg-black/45 px-3 py-1 text-xs text-white backdrop-blur">
            {manifest?.features?.drmReady ? "DRM-ready" : "Secure playback"}
          </div>
          <div className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/65 to-transparent p-4 transition duration-300 ${showControls ? "opacity-100" : "opacity-0"}`}>
            <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-white/20">
              <div className="h-full bg-gradient-to-r from-red-500 to-sky-300" style={{ width: `${progress}%` }} />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button onClick={togglePlay} className="grid h-11 w-11 place-items-center rounded-full bg-white text-black shadow-xl">
                  {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
                </button>
                <button onClick={() => { if (videoRef.current) videoRef.current.currentTime -= 10; }} className="ott-control"><SkipBack size={16} /></button>
                <button onClick={() => { if (videoRef.current) videoRef.current.currentTime += 10; }} className="ott-control"><SkipForward size={16} /></button>
                <button onClick={updateRate} className="ott-control"><Gauge size={16} />{playbackRate}x</button>
              </div>
              <div className="flex items-center gap-2">
                <button className="ott-control"><Subtitles size={16} />CC</button>
                <button className="ott-control"><Settings size={16} />Auto</button>
                <button onClick={() => videoRef.current?.requestPictureInPicture?.()} className="ott-control"><PictureInPicture2 size={16} /></button>
                <button onClick={() => setTheater((value) => !value)} className="ott-control">{theater ? <Minimize size={16} /> : <Maximize size={16} />}</button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 border-t border-white/10 bg-slate-950 p-4 text-white lg:grid-cols-[1fr_320px]">
          <div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => videoRef.current?.play()} className="ott-control"><Play size={16} />Play</button>
              <button onClick={() => { if (videoRef.current) videoRef.current.currentTime -= 10; }} className="ott-control"><SkipBack size={16} />10s</button>
              <button onClick={() => { if (videoRef.current) videoRef.current.currentTime += 10; }} className="ott-control"><SkipForward size={16} />10s</button>
              <button onClick={updateRate} className="ott-control"><Gauge size={16} />{playbackRate}x</button>
              <button onClick={() => videoRef.current?.requestPictureInPicture?.()} className="ott-control"><PictureInPicture2 size={16} />Mini</button>
              <button onClick={() => setTheater((value) => !value)} className="ott-control">{theater ? <Minimize size={16} /> : <Maximize size={16} />}Theater</button>
              <button onClick={() => saveInteraction("bookmark")} className="ott-control"><Bookmark size={16} />Bookmark</button>
              <button className="ott-control"><Captions size={16} />AI subtitles</button>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              {(manifest?.playback?.chapters || [{ title: "Intro", startTime: 0 }, { title: "Core lesson", startTime: 90 }, { title: "Quiz", startTime: 240 }]).map((chapter) => (
                <button
                  key={`${chapter.title}-${chapter.startTime}`}
                  onClick={() => { if (videoRef.current) videoRef.current.currentTime = chapter.startTime; }}
                  className="rounded-[8px] border border-white/10 bg-white/[0.04] p-3 text-left text-sm hover:bg-white/[0.08]"
                >
                  <span className="block font-semibold">{chapter.title}</span>
                  <span className="text-xs text-slate-400">{formatTime(chapter.startTime)}</span>
                </button>
              ))}
            </div>
          </div>

          <aside className="rounded-[8px] border border-white/10 bg-white/[0.04] p-3">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <NotebookPen size={16} />
              Timestamp notes
            </div>
            <textarea value={note} onChange={(event) => setNote(event.target.value)} className="mt-3 h-24 w-full rounded-[8px] border border-white/10 bg-black/30 p-3 text-sm outline-none focus:border-cyan-300" />
            <motion.button whileTap={{ scale: 0.98 }} onClick={() => saveInteraction("note", note)} className="mt-3 w-full rounded-[8px] bg-cyan-300 px-3 py-2 text-sm font-semibold text-slate-950">
              Save note
            </motion.button>
            <div className="mt-4 rounded-[8px] bg-black/25 p-3 text-xs text-slate-300">
              Interactive quizzes, watch heatmaps, smart recommendations, LL-HLS, DASH, and forensic watermark policies are exposed as backend-ready contracts.
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
};

export default OTTVideoPlayer;
