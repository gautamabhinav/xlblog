// import { useEffect, useMemo, useState } from "react";
// import { useLocation, useNavigate, useParams } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
// import { Download, Medal, Printer, RotateCcw, Trophy } from "lucide-react";
// import Layout from "../../Layout/Layout";
// import { fetchAttempt } from "../../Redux/testSlice";
// import { CinematicPage, GlassPanel, StatCard, SkeletonCard } from "../../Components/Premium/PremiumShell";
// import { PrimaryButton, SecondaryButton } from "../../Components/Premium/Buttons";

// export default function TestResult() {
//   const { id } = useParams();
//   const loc = useLocation();
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const auth = useSelector((state) => state.auth || {});
//   const [showAnswers, setShowAnswers] = useState(true);
//   const attempt = useSelector((s) => s.tests.attempt);
//   const loading = useSelector((s) => s.tests.loading.attempt);

//   useEffect(() => { if (!loc.state?.analysis && id) dispatch(fetchAttempt(id)); }, [dispatch, id, loc.state]);

//   const raw = loc.state?.analysis ? { analysis: loc.state.analysis, attempt: loc.state.attempt } : attempt || {};
//   const analysis = raw.analysis || attempt?.analysis || null;
//   const attemptObj = raw.attempt || attempt || null;
//   const currentUserRole = auth?.role || "";

//   const data = useMemo(() => {
//     if (analysis) return analysis;
//     const score = attemptObj?.score ?? 0;
//     const maxScore = attemptObj?.maxScore ?? attemptObj?.test?.questions?.length ?? 0;
//     const percent = maxScore ? Math.round((score / Math.max(1, maxScore)) * 100) : 0;
//     let perQuestion = attemptObj?.analysis?.perQuestion || attemptObj?.perQuestion || [];
//     if ((!perQuestion || perQuestion.length === 0) && attemptObj?.answers && attemptObj?.test?.questions) {
//       perQuestion = attemptObj.test.questions.map((q) => {
//         const provided = (attemptObj.answers || []).find((a) => String(a.questionId) === String(q._id));
//         const correctIndex = (q.options || []).findIndex((o) => o.isCorrect);
//         const selected = provided?.selectedOptionIndex ?? null;
//         return { questionId: q._id, text: q.text, correctIndex, selected, got: selected === correctIndex ? 1 : 0, options: q.options?.map((o) => o.text) || [] };
//       });
//     }
//     return { score, maxScore, percent, perQuestion, topicWise: attemptObj?.analytics?.topicWise || [], heatmap: attemptObj?.analytics?.heatmap || [] };
//   }, [analysis, attemptObj]);

//   const timeTaken = attemptObj?.durationSeconds ?? null;
//   const formattedTime = timeTaken !== null ? `${Math.floor(timeTaken / 60)}m ${timeTaken % 60}s` : "—";
//   const correctCount = data.perQuestion?.filter((p) => p.got === 1).length ?? 0;
//   const handleRetake = () => { const testId = attemptObj?.test?._id || attemptObj?.test; navigate(testId ? `/tests/take/${testId}` : "/tests"); };
//   const handleDownload = () => {
//     const blob = new Blob([JSON.stringify({ attempt: attemptObj, analysis: data }, null, 2)], { type: "application/json" });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = `test-result-${attemptObj?._id || "result"}.json`;
//     a.click();
//     URL.revokeObjectURL(url);
//   };

//   if (loading || (!analysis && !attemptObj)) return <Layout><CinematicPage className="p-6"><SkeletonCard /></CinematicPage></Layout>;

//   return (
//     <Layout>
//       <CinematicPage className="p-4 sm:p-6 lg:p-10">
//         <div className="mx-auto max-w-6xl">
//           <GlassPanel className="mb-6 p-5">
//             <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
//               <div>
//                 <p className="text-xs uppercase tracking-[0.28em] text-sky-200">Exam Result</p>
//                 <h1 className="mt-2 text-3xl font-black md:text-5xl">{attemptObj?.test?.title || "Test Result"}</h1>
//                 <p className="mt-2 text-sm text-secondary">Taken on {attemptObj?.createdAt ? new Date(attemptObj.createdAt).toLocaleString() : "—"}</p>
//               </div>
//               <div className="flex flex-wrap gap-2">
//                 <PrimaryButton onClick={handleRetake}><RotateCcw size={16} /> Retake</PrimaryButton>
//                 <SecondaryButton onClick={() => { const testId = attemptObj?.test?._id || attemptObj?.test; if (testId) navigate(`/tests/${testId}/leaderboard`); }}><Trophy size={16} /> Leaderboard</SecondaryButton>
//                 {currentUserRole === "USER" && <SecondaryButton onClick={() => navigate("/tests/attempts")}>Attempts</SecondaryButton>}
//                 <SecondaryButton onClick={handleDownload}><Download size={16} /> Download</SecondaryButton>
//                 <SecondaryButton onClick={() => window.print()}><Printer size={16} /> Print</SecondaryButton>
//               </div>
//             </div>
//           </GlassPanel>

//           <div className="mb-6 grid gap-4 md:grid-cols-4">
//             <StatCard icon={Medal} label="Score" value={`${data.score}/${data.maxScore}`} />
//             <StatCard icon={Trophy} label="Accuracy" value={`${data.percent}%`} accent="text-yellow-200" />
//             <StatCard icon={Medal} label="Correct" value={correctCount} accent="text-emerald-200" />
//             <StatCard icon={RotateCcw} label="Time" value={formattedTime} accent="text-red-200" />
//           </div>

//           <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
//             <main className="space-y-6">
//               <GlassPanel className="p-5">
//                 <h2 className="mb-4 text-lg font-bold">Topic-wise Performance</h2>
//                 <div className="h-72">
//                   <ResponsiveContainer width="100%" height="100%">
//                     <BarChart data={data.topicWise || []}>
//                       <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.08)" />
//                       <XAxis dataKey="name" stroke="#94a3b8" />
//                       <YAxis stroke="#94a3b8" />
//                       <Tooltip contentStyle={{ background: "#020617", border: "1px solid rgba(255,255,255,.12)", borderRadius: 8 }} />
//                       <Bar dataKey="accuracy" fill="#38bdf8" name="Accuracy %" />
//                     </BarChart>
//                   </ResponsiveContainer>
//                 </div>
//               </GlassPanel>

//               <div className="space-y-4">
//                 {(data.perQuestion || []).map((q, idx) => (
//                   <GlassPanel key={q.questionId || idx} className="p-4">
//                     <div className="mb-3 flex items-start justify-between gap-4">
//                       <h3 className="font-semibold text-primary">{idx + 1}. {q.text}</h3>
//                       <span className={`rounded-full px-3 py-1 text-xs font-bold ${q.got === 1 ? "bg-emerald-400/15 text-emerald-200" : "bg-red-400/15 text-red-200"}`}>{q.got === 1 ? "Correct" : "Incorrect"}</span>
//                     </div>
//                     {showAnswers && <div className="space-y-2">{(q.options || []).map((optText, oi) => {
//                       const isSelected = q.selected === oi;
//                       const isAnswer = q.correctIndex === oi;
//                       return <div key={oi} className={`flex items-center gap-3 rounded-premium border p-3 ${isAnswer ? "border-emerald-300/40 bg-emerald-400/10 text-emerald-100" : isSelected ? "border-yellow-300/40 bg-yellow-400/10 text-yellow-100" : "border-white/10 bg-white/[0.035] text-slate-300"}`}><span className="grid h-7 w-7 place-items-center rounded-full bg-white/10 text-sm font-bold">{String.fromCharCode(65 + oi)}</span><span className="flex-1">{optText}</span>{isSelected && <span className="text-xs">Your choice</span>}{isAnswer && <span className="text-xs">Correct</span>}</div>;
//                     })}</div>}
//                   </GlassPanel>
//                 ))}
//               </div>
//             </main>

//             <aside className="space-y-4">
//               <GlassPanel className="p-4">
//                 <div className="text-sm text-secondary">Review Options</div>
//                 <button onClick={() => setShowAnswers((s) => !s)} className="mt-3 w-full rounded-premium bg-white/10 px-3 py-2 text-sm font-bold text-white hover:bg-white/15">Toggle answers: {showAnswers ? "On" : "Off"}</button>
//               </GlassPanel>
//               <GlassPanel className="p-4">
//                 <div className="mb-3 text-sm font-bold">Attempt Heatmap</div>
//                 <div className="grid grid-cols-5 gap-2">
//                   {(data.heatmap || data.perQuestion || []).map((item, index) => {
//                     const status = item.status || (item.got === 1 ? "CORRECT" : "WRONG");
//                     return <div key={item.questionNumber || item.questionId || index} className={`rounded-premium p-2 text-center text-xs font-bold ${status === "CORRECT" ? "bg-emerald-400/15 text-emerald-200" : status === "WRONG" ? "bg-red-400/15 text-red-200" : "bg-white/10 text-slate-300"}`}>{item.questionNumber || index + 1}</div>;
//                   })}
//                 </div>
//               </GlassPanel>
//             </aside>
//           </div>
//         </div>
//       </CinematicPage>
//     </Layout>
//   );
// }



import { useEffect, useMemo, useState } from "react";
import {
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import { useDispatch, useSelector } from "react-redux";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  Download,
  Medal,
  Printer,
  RotateCcw,
  Trophy,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Sparkles,
  Clock3,
} from "lucide-react";

import Layout from "../../Layout/Layout";
import { fetchAttempt } from "../../Redux/testSlice";

import {
  CinematicPage,
  GlassPanel,
  StatCard,
  SkeletonCard,
} from "../../Components/Premium/PremiumShell";

import {
  PrimaryButton,
  SecondaryButton,
} from "../../Components/Premium/Buttons";

export default function TestResult() {
  const { id } = useParams();

  const loc = useLocation();

  const dispatch = useDispatch();

  const navigate = useNavigate();

  const auth = useSelector(
    (state) => state.auth || {}
  );

  const [showAnswers, setShowAnswers] =
    useState(true);

  const attempt = useSelector(
    (s) => s.tests.attempt
  );

  const loading = useSelector(
    (s) => s.tests.loading.attempt
  );

  useEffect(() => {
    if (!loc.state?.analysis && id) {
      dispatch(fetchAttempt(id));
    }
  }, [dispatch, id, loc.state]);

  const raw = loc.state?.analysis
    ? {
        analysis: loc.state.analysis,
        attempt: loc.state.attempt,
      }
    : attempt || {};

  const analysis =
    raw.analysis ||
    attempt?.analysis ||
    null;

  const attemptObj =
    raw.attempt || attempt || null;

  const currentUserRole =
    auth?.role || "";

  const data = useMemo(() => {
    if (analysis) return analysis;

    const score =
      attemptObj?.score ?? 0;

    const maxScore =
      attemptObj?.maxScore ??
      attemptObj?.test?.questions?.length ??
      0;

    const percent = maxScore
      ? Math.round(
          (score / Math.max(1, maxScore)) *
            100
        )
      : 0;

    let perQuestion =
      attemptObj?.analysis?.perQuestion ||
      attemptObj?.perQuestion ||
      [];

    if (
      (!perQuestion ||
        perQuestion.length === 0) &&
      attemptObj?.answers &&
      attemptObj?.test?.questions
    ) {
      perQuestion =
        attemptObj.test.questions.map((q) => {
          const provided = (
            attemptObj.answers || []
          ).find(
            (a) =>
              String(a.questionId) ===
              String(q._id)
          );

          const correctIndex = (
            q.options || []
          ).findIndex((o) => o.isCorrect);

          const selected =
            provided?.selectedOptionIndex ??
            null;

          return {
            questionId: q._id,
            text: q.text,
            correctIndex,
            selected,
            got:
              selected === correctIndex
                ? 1
                : 0,
            options:
              q.options?.map(
                (o) => o.text
              ) || [],
          };
        });
    }

    return {
      score,
      maxScore,
      percent,
      perQuestion,
      topicWise:
        attemptObj?.analytics
          ?.topicWise || [],
      heatmap:
        attemptObj?.analytics
          ?.heatmap || [],
    };
  }, [analysis, attemptObj]);

  const timeTaken =
    attemptObj?.durationSeconds ??
    null;

  const formattedTime =
    timeTaken !== null
      ? `${Math.floor(
          timeTaken / 60
        )}m ${timeTaken % 60}s`
      : "—";

  const correctCount =
    data.perQuestion?.filter(
      (p) => p.got === 1
    ).length ?? 0;

  const handleRetake = () => {
    const testId =
      attemptObj?.test?._id ||
      attemptObj?.test;

    navigate(
      testId
        ? `/tests/take/${testId}`
        : "/tests"
    );
  };

  const handleDownload = () => {
    const blob = new Blob(
      [
        JSON.stringify(
          {
            attempt: attemptObj,
            analysis: data,
          },
          null,
          2
        ),
      ],
      {
        type: "application/json",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const a =
      document.createElement("a");

    a.href = url;

    a.download = `test-result-${
      attemptObj?._id || "result"
    }.json`;

    a.click();

    URL.revokeObjectURL(url);
  };

  if (
    loading ||
    (!analysis && !attemptObj)
  ) {
    return (
      <Layout>
        <CinematicPage className="p-6">
          <SkeletonCard />
        </CinematicPage>
      </Layout>
    );
  }

  return (
    <Layout>
      <CinematicPage className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-zinc-900 p-4 sm:p-6 lg:p-10 text-white">
        <div className="mx-auto max-w-7xl">
          
          {/* HERO */}
          <GlassPanel className="relative overflow-hidden border border-white/10 bg-gradient-to-br from-white/10 via-white/[0.03] to-transparent p-6 md:p-8">
            
            {/* Glow */}
            <div className="absolute -right-20 top-0 h-72 w-72 rounded-full bg-indigo-500/10 blur-[120px]" />

            <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
              
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-1 text-xs font-bold uppercase tracking-[0.24em] text-indigo-200">
                  <Sparkles size={14} />
                  Premium Result Analytics
                </div>

                <h1 className="mt-5 text-4xl font-black md:text-6xl">
                  {attemptObj?.test?.title ||
                    "Test Result"}
                </h1>

                <p className="mt-4 text-base text-slate-400">
                  Completed on{" "}
                  {attemptObj?.createdAt
                    ? new Date(
                        attemptObj.createdAt
                      ).toLocaleString()
                    : "—"}
                </p>
              </div>

              {/* ACTIONS */}
              <div className="flex flex-wrap gap-3">
                <PrimaryButton
                  onClick={handleRetake}
                >
                  <RotateCcw size={16} />
                  Retake
                </PrimaryButton>

                <SecondaryButton
                  onClick={() => {
                    const testId =
                      attemptObj?.test?._id ||
                      attemptObj?.test;

                    if (testId) {
                      navigate(
                        `/tests/${testId}/leaderboard`
                      );
                    }
                  }}
                >
                  <Trophy size={16} />
                  Leaderboard
                </SecondaryButton>

                {currentUserRole ===
                  "USER" && (
                  <SecondaryButton
                    onClick={() =>
                      navigate(
                        "/tests/attempts"
                      )
                    }
                  >
                    Attempts
                  </SecondaryButton>
                )}

                <SecondaryButton
                  onClick={handleDownload}
                >
                  <Download size={16} />
                  Download
                </SecondaryButton>

                <SecondaryButton
                  onClick={() =>
                    window.print()
                  }
                >
                  <Printer size={16} />
                  Print
                </SecondaryButton>
              </div>
            </div>
          </GlassPanel>

          {/* STATS */}
          <div className="mt-8 grid gap-5 md:grid-cols-4">
            <StatCard
              icon={Medal}
              label="Score"
              value={`${data.score}/${data.maxScore}`}
            />

            <StatCard
              icon={Trophy}
              label="Accuracy"
              value={`${data.percent}%`}
              accent="text-yellow-200"
            />

            <StatCard
              icon={CheckCircle2}
              label="Correct"
              value={correctCount}
              accent="text-emerald-200"
            />

            <StatCard
              icon={Clock3}
              label="Time"
              value={formattedTime}
              accent="text-red-200"
            />
          </div>

          {/* MAIN */}
          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
            
            {/* LEFT */}
            <main className="space-y-6">
              
              {/* CHART */}
              <GlassPanel className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
                <div className="mb-5">
                  <h2 className="text-2xl font-bold">
                    Topic-wise Performance
                  </h2>

                  <p className="mt-1 text-sm text-slate-400">
                    Accuracy analysis by
                    subjects
                  </p>
                </div>

                <div className="h-80">
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >
                    <BarChart
                      data={
                        data.topicWise || []
                      }
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(255,255,255,.08)"
                      />

                      <XAxis
                        dataKey="name"
                        stroke="#94a3b8"
                      />

                      <YAxis
                        stroke="#94a3b8"
                      />

                      <Tooltip
                        contentStyle={{
                          background:
                            "#020617",
                          border:
                            "1px solid rgba(255,255,255,.12)",
                          borderRadius: 16,
                        }}
                      />

                      <Bar
                        dataKey="accuracy"
                        fill="#6366f1"
                        radius={[
                          10, 10, 0, 0,
                        ]}
                        name="Accuracy %"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </GlassPanel>

              {/* QUESTIONS */}
              <div className="space-y-5">
                {(data.perQuestion || []).map(
                  (q, idx) => (
                    <GlassPanel
                      key={
                        q.questionId || idx
                      }
                      className="rounded-3xl border border-white/10 bg-white/[0.04] p-5"
                    >
                      <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        
                        <div className="flex-1">
                          <h3 className="text-lg font-bold leading-8 text-white">
                            {idx + 1}.{" "}
                            {q.text}
                          </h3>
                        </div>

                        <div
                          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ${
                            q.got === 1
                              ? "bg-emerald-500/15 text-emerald-200"
                              : "bg-red-500/15 text-red-200"
                          }`}
                        >
                          {q.got === 1 ? (
                            <CheckCircle2 size={16} />
                          ) : (
                            <XCircle size={16} />
                          )}

                          {q.got === 1
                            ? "Correct"
                            : "Incorrect"}
                        </div>
                      </div>

                      {showAnswers && (
                        <div className="space-y-3">
                          {(
                            q.options || []
                          ).map(
                            (
                              optText,
                              oi
                            ) => {
                              const isSelected =
                                q.selected ===
                                oi;

                              const isAnswer =
                                q.correctIndex ===
                                oi;

                              return (
                                <div
                                  key={oi}
                                  className={`flex items-center gap-4 rounded-2xl border p-4 transition-all ${
                                    isAnswer
                                      ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-100"
                                      : isSelected
                                      ? "border-yellow-400/30 bg-yellow-500/10 text-yellow-100"
                                      : "border-white/10 bg-white/[0.03] text-slate-300"
                                  }`}
                                >
                                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 font-bold">
                                    {String.fromCharCode(
                                      65 + oi
                                    )}
                                  </div>

                                  <div className="flex-1">
                                    {optText}
                                  </div>

                                  {isSelected && (
                                    <span className="rounded-full bg-yellow-500/20 px-3 py-1 text-xs font-bold text-yellow-200">
                                      Your Choice
                                    </span>
                                  )}

                                  {isAnswer && (
                                    <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-200">
                                      Correct
                                    </span>
                                  )}
                                </div>
                              );
                            }
                          )}
                        </div>
                      )}
                    </GlassPanel>
                  )
                )}
              </div>
            </main>

            {/* RIGHT SIDEBAR */}
            <aside className="space-y-5">
              
              {/* TOGGLE */}
              <GlassPanel className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                <div className="text-sm font-semibold text-slate-300">
                  Review Settings
                </div>

                <button
                  onClick={() =>
                    setShowAnswers(
                      (s) => !s
                    )
                  }
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white transition-all hover:border-indigo-500/30 hover:bg-indigo-500/10"
                >
                  {showAnswers ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}

                  {showAnswers
                    ? "Hide Answers"
                    : "Show Answers"}
                </button>
              </GlassPanel>

              {/* HEATMAP */}
              <GlassPanel className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                <div className="mb-4">
                  <h3 className="text-lg font-bold">
                    Attempt Heatmap
                  </h3>

                  <p className="mt-1 text-sm text-slate-400">
                    Quick overview of your
                    answers
                  </p>
                </div>

                <div className="grid grid-cols-5 gap-3">
                  {(
                    data.heatmap ||
                    data.perQuestion ||
                    []
                  ).map(
                    (item, index) => {
                      const status =
                        item.status ||
                        (item.got === 1
                          ? "CORRECT"
                          : "WRONG");

                      return (
                        <div
                          key={
                            item.questionNumber ||
                            item.questionId ||
                            index
                          }
                          className={`flex h-12 items-center justify-center rounded-2xl text-sm font-bold ${
                            status ===
                            "CORRECT"
                              ? "bg-emerald-500/15 text-emerald-200"
                              : status ===
                                "WRONG"
                              ? "bg-red-500/15 text-red-200"
                              : "bg-white/10 text-slate-300"
                          }`}
                        >
                          {item.questionNumber ||
                            index + 1}
                        </div>
                      );
                    }
                  )}
                </div>
              </GlassPanel>
            </aside>
          </div>
        </div>
      </CinematicPage>
    </Layout>
  );
}