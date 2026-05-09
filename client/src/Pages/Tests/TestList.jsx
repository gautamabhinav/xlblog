import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { BrainCircuit, Clock3, FileQuestion, Search, Trophy } from "lucide-react";
import Layout from "../../Layout/Layout";
import { fetchTests } from "../../Redux/testSlice";
import { CinematicPage, GlassPanel, PremiumButton, PremiumInput, SectionHeader, SkeletonCard, StatCard } from "../../Components/Premium/PremiumShell";

export default function TestList() {
  const dispatch = useDispatch();
  const tests = useSelector((state) => state?.tests?.list || []);
  const loading = useSelector((state) => state?.tests?.loading?.list);
  const [query, setQuery] = useState("");

  useEffect(() => {
    dispatch(fetchTests());
  }, [dispatch]);

  const filteredTests = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return tests;
    return tests.filter((test) => `${test?.title || ""} ${test?.description || ""}`.toLowerCase().includes(q));
  }, [query, tests]);

  return (
    <Layout>
      <CinematicPage>
        <section className="px-4 py-6 sm:px-6 lg:px-10">
          <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
            <GlassPanel className="p-5 md:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-red-200">Exam Arena</p>
              <h1 className="mt-3 text-4xl font-black md:text-6xl">Practice with cinematic focus.</h1>
              <p className="mt-4 max-w-2xl text-slate-300">Timed tests, leaderboards, progress analytics, AI hints placeholder, and voice answer architecture.</p>
              <div className="relative mt-6 max-w-xl">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <PremiumInput value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tests..." className="pl-11" />
              </div>
            </GlassPanel>
            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              <StatCard icon={FileQuestion} label="Available tests" value={tests.length || 0} />
              <StatCard icon={Trophy} label="Leaderboard ready" value="Live" accent="text-yellow-200" />
              <StatCard icon={BrainCircuit} label="AI exam layer" value="Ready" accent="text-fuchsia-200" />
            </div>
          </div>

          <div className="mt-8">
            <SectionHeader eyebrow="Available Tests" title="Pick your challenge" />
            {loading ? (
              <div className="grid gap-4 md:grid-cols-3">{Array.from({ length: 6 }).map((_, index) => <SkeletonCard key={index} />)}</div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredTests.map((test) => (
                  <GlassPanel key={test._id} hover className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="line-clamp-2 text-xl font-bold">{test.title}</h3>
                        <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-400">{test.description || "Adaptive assessment with instant results."}</p>
                      </div>
                      <div className="rounded-full bg-red-500/15 p-3 text-red-200"><FileQuestion size={20} /></div>
                    </div>
                    <div className="mt-5 flex items-center justify-between gap-3">
                      <span className="inline-flex items-center gap-2 text-sm text-slate-400"><Clock3 size={15} /> {Math.ceil((test.durationSeconds || 300) / 60)} min</span>
                      <Link to={`/tests/take/${test._id}`}>
                        <PremiumButton>Take Test</PremiumButton>
                      </Link>
                    </div>
                  </GlassPanel>
                ))}
              </div>
            )}
          </div>
        </section>
      </CinematicPage>
    </Layout>
  );
}
