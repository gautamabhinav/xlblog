import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, BrainCircuit, Clapperboard, Flame, Play, Radio, Search, Sparkles, Trophy, UsersRound } from "lucide-react";
import Layout from "../Layout/Layout";
import { getAllBlogs } from "../Redux/blogSlice";
import { getAllCourses } from "../Redux/courseSlice";
import { CinematicPage, GlassPanel, PremiumButton, PremiumInput, SectionHeader, SkeletonCard, StatCard } from "../Components/Premium/PremiumShell";
import { ContentRail } from "../Components/Premium/ContentRail";
import VoiceCommandPanel from "../Components/Voice/VoiceCommandPanel";

const categoryTiles = ["AI Tutor", "System Design", "MERN", "Exam Prep", "Live Classes", "Analytics"];

const heroSlides = [
  {
    title: "Stream premium courses, master exams, and learn with AI.",
    meta: "OTT-grade LMS • live-ready classrooms • AI study layer",
    gradient: "from-red-700 via-slate-950 to-sky-700",
  },
  {
    title: "Your personalized learning cinema is ready.",
    meta: "Continue watching • notes • transcripts • smart tests",
    gradient: "from-sky-700 via-slate-950 to-fuchsia-700",
  },
  {
    title: "Practice like a pro with adaptive exams.",
    meta: "Leaderboards • voice answers • analytics • anti-cheat ready",
    gradient: "from-emerald-700 via-slate-950 to-red-700",
  },
];

export default function Homepage() {
  const dispatch = useDispatch();
  const blogsData = useSelector((state) => state.blog?.blogsData || []);
  const coursesData = useSelector((state) => state.course?.coursesData || []);
  const [query, setQuery] = useState("");
  const [activeHero, setActiveHero] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.allSettled([dispatch(getAllBlogs()), dispatch(getAllCourses())]);
      setLoading(false);
    })();
  }, [dispatch]);

  useEffect(() => {
    const timer = setInterval(() => setActiveHero((value) => (value + 1) % heroSlides.length), 5200);
    return () => clearInterval(timer);
  }, []);

  const featuredBlogs = useMemo(() => blogsData.slice(0, 8), [blogsData]);
  const trendingCourses = useMemo(() => coursesData.slice(0, 10), [coursesData]);
  const suggestions = useMemo(() => {
    const source = [...coursesData, ...blogsData];
    if (!query.trim()) return source.slice(0, 5);
    const q = query.toLowerCase();
    return source.filter((item) => (item?.title || "").toLowerCase().includes(q)).slice(0, 5);
  }, [blogsData, coursesData, query]);

  const slide = heroSlides[activeHero];

  return (
    <Layout>
      <CinematicPage>
        <section className="px-4 pb-8 pt-5 sm:px-6 lg:px-10">
          <GlassPanel className="relative min-h-[76vh] overflow-hidden p-5 md:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeHero}
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.7 }}
                className={`absolute inset-0 bg-gradient-to-br ${slide.gradient}`}
              />
            </AnimatePresence>
            <div className="absolute inset-0 bg-[linear-gradient(90deg,#050608_0%,rgba(5,6,8,.76)_42%,rgba(5,6,8,.24)_100%)]" />
            <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-premium-black to-transparent" />

            <div className="relative z-10 grid min-h-[70vh] content-between gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
              <div className="max-w-4xl self-center">
                <motion.p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.24em] text-sky-100 backdrop-blur">
                  <Sparkles size={14} /> XLStream AI
                </motion.p>
                <h1 className="mt-5 max-w-4xl text-4xl font-black leading-[0.98] tracking-tight md:text-7xl">
                  {slide.title}
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-7 text-slate-200 md:text-lg">{slide.meta}</p>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <Link to="/ott">
                    <PremiumButton className="w-full sm:w-auto"><Play size={18} fill="currentColor" /> Start streaming</PremiumButton>
                  </Link>
                  <Link to="/courses">
                    <PremiumButton variant="ghost" className="w-full sm:w-auto">Browse courses <ArrowRight size={18} /></PremiumButton>
                  </Link>
                </div>

                <div className="relative mt-7 max-w-xl">
                  <Search className="absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <PremiumInput value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search courses, tests, blogs, educators..." className="pl-11" />
                  {query && (
                    <div className="absolute left-0 right-0 top-[110%] z-30 overflow-hidden rounded-premium border border-white/10 bg-slate-950/95 shadow-premium backdrop-blur">
                      {suggestions.map((item, index) => (
                        <Link key={item?._id || index} to={item?.numberOfLectures !== undefined ? "/courses" : "/blogs"} className="block px-4 py-3 text-sm text-slate-200 hover:bg-white/10">
                          {item?.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid gap-4 self-end sm:grid-cols-2">
                <StatCard icon={Clapperboard} label="OTT lessons ready" value={`${Math.max(coursesData.length, 12)}+`} />
                <StatCard icon={Trophy} label="Exam tracks" value="24/7" accent="text-red-200" />
                <StatCard icon={UsersRound} label="Community learning" value="Live" accent="text-emerald-200" />
                <StatCard icon={BrainCircuit} label="AI workflows" value="8+" accent="text-fuchsia-200" />
              </div>
            </div>

            <div className="absolute bottom-5 left-5 z-20 flex gap-2">
              {heroSlides.map((_, index) => (
                <button key={index} onClick={() => setActiveHero(index)} className={`h-1.5 rounded-full transition-all ${index === activeHero ? "w-10 bg-white" : "w-4 bg-white/35"}`} />
              ))}
            </div>
          </GlassPanel>
        </section>

        <section className="px-4 sm:px-6 lg:px-10">
          {loading ? (
            <div className="grid gap-4 md:grid-cols-4">{Array.from({ length: 4 }).map((_, index) => <SkeletonCard key={index} />)}</div>
          ) : (
            <>
              <ContentRail eyebrow="Continue Watching" title="Resume your learning journey" items={trendingCourses.slice(0, 6)} type="course" toBuilder={() => "/course/description"} emptyText="Enroll in a course to start your continue watching rail." />
              <ContentRail eyebrow="Trending Now" title="Courses people are watching" items={trendingCourses} type="course" toBuilder={() => "/course/description"} />
              <ContentRail eyebrow="Recommended" title="AI-picked reads and lessons" items={featuredBlogs} type="blog" toBuilder={() => "/blog/description"} />
            </>
          )}
        </section>

        <section className="grid gap-5 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-10">
          <GlassPanel className="p-5">
            <SectionHeader eyebrow="Popular Categories" title="Browse by mood, goal, or skill" />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {categoryTiles.map((category, index) => (
                <motion.div whileHover={{ y: -4 }} key={category} className="rounded-premium border border-white/10 bg-gradient-to-br from-white/[0.11] to-white/[0.035] p-5">
                  <Flame className={index % 2 ? "h-5 w-5 text-sky-200" : "h-5 w-5 text-red-300"} />
                  <h3 className="mt-4 font-bold">{category}</h3>
                  <p className="mt-1 text-sm text-slate-400">Curated tracks, videos, tests, and smart practice.</p>
                </motion.div>
              ))}
            </div>
          </GlassPanel>

          <div className="grid gap-5">
            <VoiceCommandPanel context="search" onTranscript={setQuery} />
            <GlassPanel className="p-5">
              <div className="flex items-center gap-3">
                <Radio className="h-5 w-5 text-red-300" />
                <div>
                  <h3 className="font-bold">Live classrooms</h3>
                  <p className="text-sm text-slate-400">Realtime chat, presence, reactions, and quiz updates are UI-ready.</p>
                </div>
              </div>
            </GlassPanel>
          </div>
        </section>
      </CinematicPage>
    </Layout>
  );
}
