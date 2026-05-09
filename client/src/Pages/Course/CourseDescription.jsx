import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { BookOpen, PlayCircle, Star, UserRound } from "lucide-react";
import Layout from "../../Layout/Layout";
import { CinematicPage, GlassPanel, StatCard } from "../../Components/Premium/PremiumShell";
import { PrimaryButton, SecondaryButton } from "../../Components/Premium/Buttons";

const CourseDescription = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { role, data } = useSelector((state) => state.auth);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  if (!state) {
    return <Layout><CinematicPage className="grid place-items-center p-6"><GlassPanel className="max-w-xl p-8 text-center"><h1 className="text-2xl font-black">Course not found</h1><SecondaryButton className="mt-4" onClick={() => navigate("/courses")}>Back to courses</SecondaryButton></GlassPanel></CinematicPage></Layout>;
  }

  const canWatch = role === "ADMIN" || role === "SUPERADMIN" || data?.subscription?.status === "active";

  return (
    <Layout>
      <CinematicPage className="p-4 sm:p-6 lg:p-10">
        <section className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <GlassPanel className="overflow-hidden">
            <div className="relative aspect-video bg-gradient-to-br from-red-700 to-sky-700">
              {state?.thumbnail?.secure_url && <img className="h-full w-full object-cover" src={state.thumbnail.secure_url} alt={state.title} />}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/15 to-transparent" />
              <button className="absolute bottom-5 left-5 grid h-14 w-14 place-items-center rounded-full bg-white text-black shadow-premium"><PlayCircle size={28} /></button>
            </div>
            <div className="grid gap-4 p-5 sm:grid-cols-3">
              <StatCard icon={BookOpen} label="Lectures" value={state.numberOfLectures || 0} />
              <StatCard icon={UserRound} label="Instructor" value={state.createdBy || "Expert"} accent="text-emerald-200" />
              <StatCard icon={Star} label="Rating" value="4.8" accent="text-yellow-200" />
            </div>
          </GlassPanel>

          <GlassPanel className="p-5 md:p-8">
            <p className="text-xs uppercase tracking-[0.28em] text-sky-200">{state.category || "Premium Course"}</p>
            <h1 className="mt-3 text-4xl font-black leading-tight text-primary md:text-5xl">{state.title}</h1>
            <p className="mt-5 text-base leading-8 text-secondary">{state.description}</p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              {canWatch ? (
                <PrimaryButton onClick={() => navigate("/course/displaylectures", { state: { ...state } })}><PlayCircle size={18} /> Watch Lectures</PrimaryButton>
              ) : (
                <PrimaryButton onClick={() => navigate("/checkout")}>Subscribe to Course</PrimaryButton>
              )}
              <SecondaryButton onClick={() => navigate("/courses")}>Related Courses</SecondaryButton>
            </div>
            <div className="mt-8 rounded-premium border border-white/10 bg-white/[0.04] p-4">
              <h2 className="font-bold text-primary">What you will get</h2>
              <div className="mt-3 grid gap-2 text-sm text-secondary">
                <span>Premium lecture cards and progress-ready playback</span>
                <span>Timestamp notes, subtitles, quizzes, and AI summary placeholders</span>
                <span>Instructor-led path with related course recommendations</span>
              </div>
            </div>
          </GlassPanel>
        </section>
      </CinematicPage>
    </Layout>
  );
};

export default CourseDescription;
