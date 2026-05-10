// import { useEffect, useMemo, useState } from "react";
// import { Link } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import { BrainCircuit, Clock3, FileQuestion, Search, Trophy } from "lucide-react";
// import Layout from "../../Layout/Layout";
// import { fetchTests } from "../../Redux/testSlice";
// import { CinematicPage, GlassPanel, PremiumButton, PremiumInput, SectionHeader, SkeletonCard, StatCard } from "../../Components/Premium/PremiumShell";

// export default function TestList() {
//   const dispatch = useDispatch();
//   const tests = useSelector((state) => state?.tests?.list || []);
//   const loading = useSelector((state) => state?.tests?.loading?.list);
//   const [query, setQuery] = useState("");

//   useEffect(() => {
//     dispatch(fetchTests());
//   }, [dispatch]);

//   const filteredTests = useMemo(() => {
//     const q = query.toLowerCase().trim();
//     if (!q) return tests;
//     return tests.filter((test) => `${test?.title || ""} ${test?.description || ""}`.toLowerCase().includes(q));
//   }, [query, tests]);

//   return (
//     <Layout>
//       <CinematicPage>
//         <section className="px-4 py-6 sm:px-6 lg:px-10">
//           <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
//             <GlassPanel className="p-5 md:p-8">
//               <p className="text-xs font-bold uppercase tracking-[0.28em] text-red-200">Exam Arena</p>
//               <h1 className="mt-3 text-4xl font-black md:text-6xl">Practice with cinematic focus.</h1>
//               <p className="mt-4 max-w-2xl text-slate-300">Timed tests, leaderboards, progress analytics, AI hints placeholder, and voice answer architecture.</p>
//               <div className="relative mt-6 max-w-xl">
//                 <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
//                 <PremiumInput value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tests..." className="pl-11" />
//               </div>
//             </GlassPanel>
//             <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
//               <StatCard icon={FileQuestion} label="Available tests" value={tests.length || 0} />
//               <StatCard icon={Trophy} label="Leaderboard ready" value="Live" accent="text-yellow-200" />
//               <StatCard icon={BrainCircuit} label="AI exam layer" value="Ready" accent="text-fuchsia-200" />
//             </div>
//           </div>

//           <div className="mt-8">
//             <SectionHeader eyebrow="Available Tests" title="Pick your challenge" />
//             {loading ? (
//               <div className="grid gap-4 md:grid-cols-3">{Array.from({ length: 6 }).map((_, index) => <SkeletonCard key={index} />)}</div>
//             ) : (
//               <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
//                 {filteredTests.map((test) => (
//                   <GlassPanel key={test._id} hover className="p-5">
//                     <div className="flex items-start justify-between gap-4">
//                       <div>
//                         <h3 className="line-clamp-2 text-xl font-bold">{test.title}</h3>
//                         <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-400">{test.description || "Adaptive assessment with instant results."}</p>
//                       </div>
//                       <div className="rounded-full bg-red-500/15 p-3 text-red-200"><FileQuestion size={20} /></div>
//                     </div>
//                     <div className="mt-5 flex items-center justify-between gap-3">
//                       <span className="inline-flex items-center gap-2 text-sm text-slate-400"><Clock3 size={15} /> {Math.ceil((test.durationSeconds || 300) / 60)} min</span>
//                       <Link to={`/tests/take/${test._id}`}>
//                         <PremiumButton>Take Test</PremiumButton>
//                       </Link>
//                     </div>
//                   </GlassPanel>
//                 ))}
//               </div>
//             )}
//           </div>
//         </section>
//       </CinematicPage>
//     </Layout>
//   );
// }


import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  BrainCircuit,
  Clock3,
  FileQuestion,
  Search,
  Trophy,
  PlayCircle,
  Sparkles,
  ChevronRight,
  Flame,
  ShieldCheck,
} from "lucide-react";

import Layout from "../../Layout/Layout";
import { fetchTests } from "../../Redux/testSlice";

import {
  CinematicPage,
  GlassPanel,
  PremiumButton,
  PremiumInput,
  SectionHeader,
  SkeletonCard,
  StatCard,
} from "../../Components/Premium/PremiumShell";

export default function TestList() {
  const dispatch = useDispatch();

  const tests = useSelector(
    (state) => state?.tests?.list || []
  );

  const loading = useSelector(
    (state) => state?.tests?.loading?.list
  );

  const [query, setQuery] = useState("");

  useEffect(() => {
    dispatch(fetchTests());
  }, [dispatch]);

  const filteredTests = useMemo(() => {
    const q = query.toLowerCase().trim();

    if (!q) return tests;

    return tests.filter((test) =>
      `${test?.title || ""} ${
        test?.description || ""
      }`
        .toLowerCase()
        .includes(q)
    );
  }, [query, tests]);

  return (
    <Layout>
      <CinematicPage>
        <div className="relative overflow-hidden">
          
          {/* Background Glow */}
          <div className="absolute left-0 top-0 h-[500px] w-[500px] rounded-full bg-red-500/10 blur-[140px]" />

          <div className="absolute right-0 top-40 h-[400px] w-[400px] rounded-full bg-indigo-500/10 blur-[120px]" />

          <section className="relative z-10 px-4 py-6 sm:px-6 lg:px-10">
            
            {/* HERO */}
            <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
              
              <GlassPanel className="relative overflow-hidden border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-6 md:p-10">
                
                {/* Floating Glow */}
                <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-red-500/10 blur-[90px]" />

                <div className="relative z-10">
                  
                  <div className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-4 py-1 text-xs font-bold uppercase tracking-[0.24em] text-red-200 backdrop-blur-xl">
                    <Sparkles size={14} />
                    Premium Exam Arena
                  </div>

                  <h1 className="mt-6 max-w-4xl text-4xl font-black leading-tight text-white md:text-6xl">
                    Master competitive exams with cinematic focus.
                  </h1>

                  <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
                    AI-powered test engine with leaderboards,
                    instant analytics, cinematic UI, voice-ready
                    architecture, and premium examination
                    experience.
                  </p>

                  {/* Search */}
                  <div className="relative mt-8 max-w-2xl">
                    <Search className="absolute left-5 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-slate-500" />

                    <PremiumInput
                      value={query}
                      onChange={(event) =>
                        setQuery(event.target.value)
                      }
                      placeholder="Search tests, categories, exams..."
                      className="h-16 rounded-2xl border border-white/10 bg-black/30 pl-14 text-white placeholder:text-slate-500 backdrop-blur-xl"
                    />
                  </div>

                  {/* CTA */}
                  <div className="mt-8 flex flex-wrap gap-4">
                    <PremiumButton className="group h-14 rounded-2xl px-7 text-base font-semibold">
                      <PlayCircle
                        size={20}
                        className="mr-2 transition-transform group-hover:scale-110"
                      />
                      Start Practicing
                    </PremiumButton>

                    <button className="inline-flex h-14 items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 font-medium text-white backdrop-blur-xl transition-all hover:border-red-500/30 hover:bg-red-500/10">
                      <Trophy size={18} />
                      Global Rankings
                    </button>
                  </div>
                </div>
              </GlassPanel>

              {/* Stats */}
              <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
                
                <StatCard
                  icon={FileQuestion}
                  label="Available Tests"
                  value={tests.length || 0}
                />

                <StatCard
                  icon={Trophy}
                  label="Leaderboard"
                  value="LIVE"
                  accent="text-yellow-200"
                />

                <StatCard
                  icon={BrainCircuit}
                  label="AI Exam Layer"
                  value="READY"
                  accent="text-fuchsia-200"
                />
              </div>
            </div>

            {/* SECTION HEADER */}
            <div className="mt-12">
              <SectionHeader
                eyebrow="Premium Test Collection"
                title="Choose Your Challenge"
                description="Modern cinematic examinations designed for deep focus and competitive excellence."
              />
            </div>

            {/* LOADING */}
            {loading ? (
              <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map(
                  (_, index) => (
                    <SkeletonCard key={index} />
                  )
                )}
              </div>
            ) : filteredTests.length === 0 ? (
              
              /* EMPTY */
              <GlassPanel className="mt-10 flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/5 px-6 py-24 text-center">
                <Search
                  size={60}
                  className="text-slate-600"
                />

                <h2 className="mt-6 text-3xl font-bold text-white">
                  No Tests Found
                </h2>

                <p className="mt-3 max-w-md text-slate-400">
                  Try searching with different keywords
                  or explore all available categories.
                </p>
              </GlassPanel>
            ) : (
              
              /* TEST GRID */
              <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredTests.map((test, index) => (
                  <GlassPanel
                    key={test._id}
                    hover
                    className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 via-white/[0.03] to-transparent p-6 transition-all duration-500 hover:-translate-y-1 hover:border-red-500/30"
                  >
                    
                    {/* Background Glow */}
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/[0.03] to-indigo-500/[0.03] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                    {/* Floating Effect */}
                    <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-red-500/10 blur-3xl transition-all duration-500 group-hover:scale-150" />

                    <div className="relative z-10">
                      
                      {/* Top */}
                      <div className="flex items-start justify-between gap-4">
                        
                        <div className="flex-1">
                          
                          <div className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-200">
                            <ShieldCheck size={12} />
                            Premium Test
                          </div>

                          <h3 className="mt-4 line-clamp-2 text-2xl font-black leading-tight text-white">
                            {test.title}
                          </h3>

                          <p className="mt-4 line-clamp-3 text-sm leading-7 text-slate-400">
                            {test.description ||
                              "Adaptive cinematic assessment engine with instant analytics and premium examination experience."}
                          </p>
                        </div>

                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500/20 to-indigo-500/20 text-red-200 shadow-lg shadow-red-500/10">
                          <FileQuestion size={24} />
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="mt-6 grid grid-cols-2 gap-3">
                        
                        <div className="rounded-2xl border border-white/10 bg-black/20 p-4 backdrop-blur-xl">
                          <div className="flex items-center gap-2 text-slate-400">
                            <Clock3 size={15} />
                            Duration
                          </div>

                          <div className="mt-2 text-lg font-bold text-white">
                            {Math.ceil(
                              (test.durationSeconds ||
                                300) / 60
                            )}{" "}
                            min
                          </div>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-black/20 p-4 backdrop-blur-xl">
                          <div className="flex items-center gap-2 text-slate-400">
                            <Flame size={15} />
                            Difficulty
                          </div>

                          <div className="mt-2 text-lg font-bold text-white">
                            Medium
                          </div>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="mt-7 flex items-center justify-between">
                        
                        <div className="text-sm text-slate-500">
                          Test #{index + 1}
                        </div>

                        <Link
                          to={`/tests/take/${test._id}`}
                        >
                          <button className="group/button inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-red-600 to-indigo-600 px-5 py-3 font-semibold text-white shadow-xl shadow-red-500/20 transition-all duration-300 hover:scale-[1.03] hover:from-red-500 hover:to-indigo-500">
                            Take Test

                            <ChevronRight
                              size={18}
                              className="transition-transform group-hover/button:translate-x-1"
                            />
                          </button>
                        </Link>
                      </div>
                    </div>
                  </GlassPanel>
                ))}
              </div>
            )}
          </section>
        </div>
      </CinematicPage>
    </Layout>
  );
}