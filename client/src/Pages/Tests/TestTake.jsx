import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight, Clock3, Flag, Send, ShieldAlert } from "lucide-react";
import Layout from "../../Layout/Layout";
import { fetchTest, submitAttempt } from "../../Redux/testSlice";
import { CinematicPage, GlassPanel, SkeletonCard } from "../../Components/Premium/PremiumShell";
import { DangerButton, SecondaryButton, PrimaryButton } from "../../Components/Premium/Buttons";

const formatTime = (seconds) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

export default function TestTake() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const test = useSelector((state) => state.tests.current);
  const loading = useSelector((state) => state.tests.loading.current);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [marked, setMarked] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [violations, setViolations] = useState({ tabSwitches: 0, fullscreenExits: 0, autoSubmitted: false });
  const questionStartedAt = useRef(Date.now());
  const timeSpent = useRef({});
  const submitted = useRef(false);

  useEffect(() => { dispatch(fetchTest(id)); }, [dispatch, id]);
  useEffect(() => { if (test) setTimeLeft(test.durationSeconds || 300); }, [test]);

  const persistQuestionTime = () => {
    const questionId = test?.questions?.[currentIndex]?._id;
    if (!questionId) return;
    const elapsed = Math.max(0, Math.round((Date.now() - questionStartedAt.current) / 1000));
    timeSpent.current[questionId] = (timeSpent.current[questionId] || 0) + elapsed;
    questionStartedAt.current = Date.now();
  };

  const goTo = (index) => {
    if (!test?.questions?.length) return;
    persistQuestionTime();
    setCurrentIndex(Math.max(0, Math.min(test.questions.length - 1, index)));
  };

  const buildPayload = (autoSubmitted = false) => {
    persistQuestionTime();
    return {
      testId: id,
      durationSeconds: Math.max(0, (test?.durationSeconds || 0) - timeLeft),
      violations: { ...violations, autoSubmitted },
      answers: (test?.questions || []).map((question) => ({
        questionId: question._id,
        selectedOptionIndexes: answers[question._id] || [],
        selectedOptionIndex: answers[question._id]?.[0],
        markedForReview: Boolean(marked[question._id]),
        timeSpentSeconds: timeSpent.current[question._id] || 0,
      })),
    };
  };

  const handleSubmit = async (autoSubmitted = false) => {
    if (submitted.current || !test) return;
    submitted.current = true;
    const response = await dispatch(submitAttempt({ id, payload: buildPayload(autoSubmitted) })).unwrap();
    navigate(`/tests/result/${response.attempt?._id}`, { state: { analysis: response.analysis, attempt: response.attempt } });
  };

  useEffect(() => {
    if (!timeLeft || !test) return undefined;
    const timer = setInterval(() => {
      setTimeLeft((value) => {
        if (value <= 1) {
          clearInterval(timer);
          handleSubmit(true);
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, test]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) {
        setViolations((prev) => {
          const next = { ...prev, tabSwitches: prev.tabSwitches + 1 };
          const limit = test?.pattern?.antiCheat?.maxTabSwitches ?? 3;
          if (test?.pattern?.antiCheat?.autoSubmitOnViolation && next.tabSwitches > limit) setTimeout(() => handleSubmit(true), 0);
          return next;
        });
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [test]);

  const currentQuestion = test?.questions?.[currentIndex];
  const selected = answers[currentQuestion?._id] || [];
  const answeredCount = useMemo(() => Object.values(answers).filter((value) => value.length).length, [answers]);
  const progress = test?.questions?.length ? Math.round((answeredCount / test.questions.length) * 100) : 0;

  const toggleOption = (optionIndex) => {
    const questionId = currentQuestion._id;
    setAnswers((prev) => {
      const current = prev[questionId] || [];
      const multi = currentQuestion.options.length === 5;
      const next = multi ? current.includes(optionIndex) ? current.filter((idx) => idx !== optionIndex) : [...current, optionIndex] : [optionIndex];
      return { ...prev, [questionId]: next };
    });
  };

  if (loading || !test) {
    return <Layout><CinematicPage className="p-6"><div className="grid gap-4 md:grid-cols-3"><SkeletonCard /><SkeletonCard /><SkeletonCard /></div></CinematicPage></Layout>;
  }

  return (
    <Layout>
      <CinematicPage className="p-4 sm:p-6 lg:p-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_330px]">
          <main className="space-y-5">
            <GlassPanel className="sticky top-24 z-20 p-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-black text-primary">{test.title}</h1>
                  <p className="text-sm text-secondary">Question {currentIndex + 1} of {test.questions.length} • Marks {currentQuestion.marks || test.marksPerQuestion || 1}</p>
                </div>
                <div className={`inline-flex items-center gap-2 rounded-premium px-4 py-2 font-mono text-lg font-black ${timeLeft < 60 ? "bg-red-500/20 text-red-200" : "bg-white/10 text-sky-100"}`}>
                  <Clock3 size={18} /> {formatTime(timeLeft)}
                </div>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-gradient-to-r from-red-500 to-sky-300" style={{ width: `${progress}%` }} /></div>
            </GlassPanel>

            <GlassPanel className="p-5 md:p-7">
              <div className="mb-5 flex items-start gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-red-600 to-sky-500 font-black">{currentIndex + 1}</div>
                <div className="text-xl font-semibold leading-8 text-primary">{currentQuestion.text}</div>
              </div>
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => {
                  const active = selected.includes(index);
                  return (
                    <button key={index} type="button" onClick={() => toggleOption(index)} className={`flex w-full items-center gap-3 rounded-premium border p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-sky-300/30 ${active ? "border-sky-300 bg-sky-400/15 text-white shadow-glow-blue" : "border-white/10 bg-white/[0.045] text-slate-200 hover:bg-white/[0.08]"}`}>
                      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full font-bold ${active ? "bg-sky-300 text-slate-950" : "bg-white/10 text-slate-200"}`}>{String.fromCharCode(65 + index)}</span>
                      <span className="flex-1">{option.text}</span>
                      {active && <CheckCircle2 className="h-5 w-5 text-sky-200" />}
                    </button>
                  );
                })}
              </div>
            </GlassPanel>

            <div className="flex flex-wrap justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                <SecondaryButton onClick={() => goTo(currentIndex - 1)} disabled={currentIndex === 0}><ChevronLeft size={16} /> Previous</SecondaryButton>
                <SecondaryButton onClick={() => goTo(currentIndex + 1)} disabled={currentIndex === test.questions.length - 1}>Save & Next <ChevronRight size={16} /></SecondaryButton>
                <SecondaryButton onClick={() => setMarked((prev) => ({ ...prev, [currentQuestion._id]: !prev[currentQuestion._id] }))}><Flag size={16} /> {marked[currentQuestion._id] ? "Unmark" : "Mark for Review"}</SecondaryButton>
              </div>
              <DangerButton onClick={() => window.confirm("Submit exam now?") && handleSubmit(false)}><Send size={16} /> Submit</DangerButton>
            </div>
          </main>

          <aside className="space-y-4">
            <GlassPanel className="p-4">
              <div className="text-sm text-secondary">Progress</div>
              <div className="mt-2 text-3xl font-black">{answeredCount}/{test.questions.length}</div>
              <div className="mt-3 flex items-center gap-2 text-xs text-red-200"><ShieldAlert size={14} /> Tab switches: {violations.tabSwitches}</div>
            </GlassPanel>
            <GlassPanel className="p-4">
              <div className="mb-3 font-semibold text-primary">Question Palette</div>
              <div className="grid grid-cols-5 gap-2">
                {test.questions.map((question, index) => {
                  const isAnswered = answers[question._id]?.length;
                  const isMarked = marked[question._id];
                  const tone = index === currentIndex ? "bg-sky-400 text-slate-950" : isMarked ? "bg-fuchsia-400/20 text-fuchsia-100" : isAnswered ? "bg-emerald-400/20 text-emerald-100" : "bg-white/10 text-slate-300";
                  return <button key={question._id} type="button" onClick={() => goTo(index)} className={`rounded-premium p-2 text-sm font-bold transition hover:scale-105 ${tone}`}>{index + 1}</button>;
                })}
              </div>
              <div className="mt-4 grid gap-2 text-xs text-slate-400">
                <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-300" /> Answered</span>
                <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-fuchsia-300" /> Review</span>
                <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-sky-300" /> Current</span>
              </div>
            </GlassPanel>
            <GlassPanel className="p-4 text-sm text-amber-100">
              <AlertTriangle className="mb-2 h-5 w-5" />
              Avoid switching tabs. Anti-cheat events are tracked.
            </GlassPanel>
          </aside>
        </div>
        <PrimaryButton onClick={() => window.confirm("Submit exam now?") && handleSubmit(false)} className="fixed bottom-24 right-4 z-40 md:hidden"><Send size={16} /> Submit</PrimaryButton>
      </CinematicPage>
    </Layout>
  );
}
