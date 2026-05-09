import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BookOpen, Filter, Search, Sparkles } from "lucide-react";
import Layout from "../../Layout/Layout";
import { getAllCourses } from "../../Redux/courseSlice";
import { CinematicPage, GlassPanel, PremiumInput, SectionHeader, SkeletonCard } from "../../Components/Premium/PremiumShell";
import { ContentCard } from "../../Components/Premium/ContentRail";

const Courses = () => {
  const dispatch = useDispatch();
  const { coursesData = [] } = useSelector((state) => state.course || {});
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await dispatch(getAllCourses());
      setLoading(false);
    })();
  }, [dispatch]);

  const filteredCourses = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return coursesData;
    return coursesData.filter((course) => `${course?.title || ""} ${course?.description || ""} ${course?.category || ""}`.toLowerCase().includes(q));
  }, [coursesData, query]);

  return (
    <Layout>
      <CinematicPage>
        <section className="px-4 py-6 sm:px-6 lg:px-10">
          <GlassPanel className="overflow-hidden p-5 md:p-8">
            <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-end">
              <div>
                <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.28em] text-sky-200"><Sparkles size={14} /> Course Cinema</p>
                <h1 className="mt-3 max-w-3xl text-4xl font-black leading-tight md:text-6xl">Choose your next premium learning stream.</h1>
                <p className="mt-4 max-w-2xl text-slate-300">OTT-style course discovery with AI-ready recommendations, progress rails, and immersive learning paths.</p>
              </div>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <PremiumInput value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search course, category, instructor..." className="pl-11" />
              </div>
            </div>
          </GlassPanel>

          <div className="mt-8">
            <SectionHeader
              eyebrow="Trending Courses"
              title="Industry expert playlists"
              action={<div className="hidden items-center gap-2 rounded-premium bg-white/10 px-3 py-2 text-sm text-slate-300 md:flex"><Filter size={15} /> Smart filters</div>}
            />
            {loading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 8 }).map((_, index) => <SkeletonCard key={index} />)}</div>
            ) : filteredCourses.length ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredCourses.map((course, index) => (
                  <ContentCard key={course._id} item={course} index={index} to="/course/description" type="course" />
                ))}
              </div>
            ) : (
              <GlassPanel className="p-10 text-center text-slate-400">
                <BookOpen className="mx-auto mb-3 h-8 w-8" />
                No courses match your search.
              </GlassPanel>
            )}
          </div>
        </section>
      </CinematicPage>
    </Layout>
  );
};

export default Courses;
