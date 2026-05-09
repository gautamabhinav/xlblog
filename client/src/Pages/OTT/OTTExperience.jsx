import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Activity, BellRing, BrainCircuit, Clapperboard, Globe2, Radio, ShieldCheck, Sparkles, TrendingUp, Video } from "lucide-react";
import Layout from "../../Layout/Layout";
import api from "../../Helper/axiosInstance";
import OTTVideoPlayer from "../../Components/OTT/OTTVideoPlayer";
import VoiceCommandPanel from "../../Components/Voice/VoiceCommandPanel";

const demoRows = [
  { title: "System Design for Scale", meta: "HLS ready • 42 min", gradient: "from-cyan-400 to-blue-500" },
  { title: "AI Tutor: Prompt Patterns", meta: "Transcript • Quiz", gradient: "from-fuchsia-400 to-rose-500" },
  { title: "MongoDB Sharding Labs", meta: "Hands-on • Notes", gradient: "from-emerald-300 to-teal-500" },
  { title: "Exam Anti-Cheat Drill", meta: "Live quiz • Voice", gradient: "from-amber-300 to-orange-500" },
];

const stats = [
  { label: "Edge ready regions", value: "12+", icon: Globe2 },
  { label: "Realtime events/min", value: "1M", icon: Radio },
  { label: "AI workflows", value: "8", icon: BrainCircuit },
  { label: "Security layers", value: "9", icon: ShieldCheck },
];

const OTTExperience = () => {
  const [architecture, setArchitecture] = useState(null);
  const [activeVideo, setActiveVideo] = useState(null);

  useEffect(() => {
    api.get("/platform/architecture", { skipAuthRedirect: true }).then((res) => setArchitecture(res.data)).catch(() => {});
    api.get("/videos", { skipAuthRedirect: true }).then((res) => setActiveVideo(res.data?.videos?.[0] || null)).catch(() => {});
  }, []);

  const featurePills = useMemo(
    () => ["Adaptive HLS", "DASH placeholder", "Resume playback", "AI subtitles", "Timestamp notes", "Live classroom", "Voice exams", "CDN tokenization"],
    []
  );

  return (
    <Layout>
      <main className="min-h-screen bg-[#06080d] text-white">
        <section className="relative overflow-hidden px-4 py-6 sm:px-6 lg:px-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.18),transparent_30%),radial-gradient(circle_at_80%_10%,rgba(244,114,182,0.14),transparent_28%)]" />
          <div className="relative grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
            <div className="min-h-[76vh] rounded-[8px] border border-white/10 bg-white/[0.04] p-4 shadow-2xl backdrop-blur-xl md:p-6">
              <div className="flex flex-wrap items-center gap-2">
                {featurePills.map((pill) => (
                  <span key={pill} className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs text-slate-200">
                    {pill}
                  </span>
                ))}
              </div>

              <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-cyan-200">XL Stream AI</p>
                  <h1 className="mt-3 max-w-3xl text-4xl font-black leading-tight md:text-6xl">
                    Premium LMS, OTT, tests, and AI learning in one scalable surface.
                  </h1>
                  <p className="mt-5 max-w-2xl text-base text-slate-300 md:text-lg">
                    A modular Netflix-style learning layer with video progress, realtime events, voice input, and CDN-first streaming contracts.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link to="/courses" className="rounded-[8px] bg-cyan-300 px-5 py-3 text-sm font-bold text-slate-950 hover:bg-cyan-200">
                      Explore courses
                    </Link>
                    <Link to="/tests" className="rounded-[8px] border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white hover:bg-white/15">
                      Take test
                    </Link>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {stats.map(({ label, value, icon: Icon }) => (
                    <motion.div whileHover={{ y: -4 }} key={label} className="rounded-[8px] border border-white/10 bg-black/25 p-4">
                      <Icon className="h-5 w-5 text-cyan-200" />
                      <p className="mt-4 text-3xl font-black">{value}</p>
                      <p className="text-sm text-slate-400">{label}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="mt-8">
                <OTTVideoPlayer videoId={activeVideo?._id} fallbackSrc={activeVideo?.playback?.mp4Url || ""} poster={activeVideo?.thumbnailUrl || ""} />
              </div>
            </div>

            <aside className="grid content-start gap-4">
              <VoiceCommandPanel context="assistant" />
              <section className="rounded-[8px] border border-white/10 bg-white/[0.06] p-4 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Realtime Command Center</h2>
                  <Activity className="h-5 w-5 text-emerald-300" />
                </div>
                <div className="mt-4 grid gap-3">
                  {[
                    ["Presence", "Redis adapter-ready rooms"],
                    ["Live classrooms", "Chat, reactions, typing"],
                    ["Quiz updates", "Low-latency event fan-out"],
                    ["Notifications", "Role/user targeted"],
                  ].map(([title, body]) => (
                    <div key={title} className="rounded-[8px] bg-black/25 p-3">
                      <p className="font-semibold">{title}</p>
                      <p className="text-sm text-slate-400">{body}</p>
                    </div>
                  ))}
                </div>
              </section>
            </aside>
          </div>
        </section>

        <section className="px-4 pb-10 sm:px-6 lg:px-10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-cyan-200">Continue Watching</p>
              <h2 className="text-2xl font-bold">Personalized learning rails</h2>
            </div>
            <Sparkles className="h-6 w-6 text-cyan-200" />
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {demoRows.map((item) => (
              <motion.article whileHover={{ scale: 1.02 }} key={item.title} className="group overflow-hidden rounded-[8px] border border-white/10 bg-white/[0.05]">
                <div className={`flex aspect-video items-center justify-center bg-gradient-to-br ${item.gradient}`}>
                  <Clapperboard className="h-12 w-12 text-white/90" />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="mt-1 text-sm text-slate-400">{item.meta}</p>
                  <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full w-2/3 bg-cyan-300" />
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </section>

        <section className="grid gap-4 px-4 pb-12 sm:px-6 lg:grid-cols-3 lg:px-10">
          {[
            { icon: Video, title: "Streaming Pipeline", body: "Cloudinary source uploads can enqueue FFmpeg workers for HLS ladders, previews, subtitles, and thumbnails." },
            { icon: TrendingUp, title: "Analytics Heatmaps", body: "Watch progress and interactions are indexed for dashboards, recommendations, and course completion intelligence." },
            { icon: BellRing, title: "AI Assistant Ready", body: "Voice notes, transcript contracts, summaries, moderation, tutor, and search are separated into upgradeable service boundaries." },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-[8px] border border-white/10 bg-white/[0.05] p-5">
              <Icon className="h-6 w-6 text-cyan-200" />
              <h3 className="mt-4 text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">{body}</p>
            </div>
          ))}
        </section>

        {architecture && (
          <div className="px-4 pb-10 text-xs text-slate-500 sm:px-6 lg:px-10">
            Cache: {architecture.cache?.enabled ? "Redis configured" : "memory fallback"} • Queue: {architecture.queue?.driver}
          </div>
        )}
      </main>
    </Layout>
  );
};

export default OTTExperience;
