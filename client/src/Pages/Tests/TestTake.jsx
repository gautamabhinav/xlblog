// import { useEffect, useMemo, useRef, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { useNavigate, useParams } from "react-router-dom";
// import { AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight, Clock3, Flag, Send, ShieldAlert } from "lucide-react";
// import Layout from "../../Layout/Layout";
// import { fetchTest, submitAttempt } from "../../Redux/testSlice";
// import { CinematicPage, GlassPanel, SkeletonCard } from "../../Components/Premium/PremiumShell";
// import { DangerButton, SecondaryButton, PrimaryButton } from "../../Components/Premium/Buttons";

// const formatTime = (seconds) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

// export default function TestTake() {
//   const { id } = useParams();
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const test = useSelector((state) => state.tests.current);
//   const loading = useSelector((state) => state.tests.loading.current);
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [answers, setAnswers] = useState({});
//   const [marked, setMarked] = useState({});
//   const [timeLeft, setTimeLeft] = useState(0);
//   const [violations, setViolations] = useState({ tabSwitches: 0, fullscreenExits: 0, autoSubmitted: false });
//   const questionStartedAt = useRef(Date.now());
//   const timeSpent = useRef({});
//   const submitted = useRef(false);

//   useEffect(() => { dispatch(fetchTest(id)); }, [dispatch, id]);
//   useEffect(() => { if (test) setTimeLeft(test.durationSeconds || 300); }, [test]);

//   const persistQuestionTime = () => {
//     const questionId = test?.questions?.[currentIndex]?._id;
//     if (!questionId) return;
//     const elapsed = Math.max(0, Math.round((Date.now() - questionStartedAt.current) / 1000));
//     timeSpent.current[questionId] = (timeSpent.current[questionId] || 0) + elapsed;
//     questionStartedAt.current = Date.now();
//   };

//   const goTo = (index) => {
//     if (!test?.questions?.length) return;
//     persistQuestionTime();
//     setCurrentIndex(Math.max(0, Math.min(test.questions.length - 1, index)));
//   };

//   const buildPayload = (autoSubmitted = false) => {
//     persistQuestionTime();
//     return {
//       testId: id,
//       durationSeconds: Math.max(0, (test?.durationSeconds || 0) - timeLeft),
//       violations: { ...violations, autoSubmitted },
//       answers: (test?.questions || []).map((question) => ({
//         questionId: question._id,
//         selectedOptionIndexes: answers[question._id] || [],
//         selectedOptionIndex: answers[question._id]?.[0],
//         markedForReview: Boolean(marked[question._id]),
//         timeSpentSeconds: timeSpent.current[question._id] || 0,
//       })),
//     };
//   };

//   const handleSubmit = async (autoSubmitted = false) => {
//     if (submitted.current || !test) return;
//     submitted.current = true;
//     const response = await dispatch(submitAttempt({ id, payload: buildPayload(autoSubmitted) })).unwrap();
//     navigate(`/tests/result/${response.attempt?._id}`, { state: { analysis: response.analysis, attempt: response.attempt } });
//   };

//   useEffect(() => {
//     if (!timeLeft || !test) return undefined;
//     const timer = setInterval(() => {
//       setTimeLeft((value) => {
//         if (value <= 1) {
//           clearInterval(timer);
//           handleSubmit(true);
//           return 0;
//         }
//         return value - 1;
//       });
//     }, 1000);
//     return () => clearInterval(timer);
//   }, [timeLeft, test]);

//   useEffect(() => {
//     const onVisibility = () => {
//       if (document.hidden) {
//         setViolations((prev) => {
//           const next = { ...prev, tabSwitches: prev.tabSwitches + 1 };
//           const limit = test?.pattern?.antiCheat?.maxTabSwitches ?? 3;
//           if (test?.pattern?.antiCheat?.autoSubmitOnViolation && next.tabSwitches > limit) setTimeout(() => handleSubmit(true), 0);
//           return next;
//         });
//       }
//     };
//     document.addEventListener("visibilitychange", onVisibility);
//     return () => document.removeEventListener("visibilitychange", onVisibility);
//   }, [test]);

//   const currentQuestion = test?.questions?.[currentIndex];
//   const selected = answers[currentQuestion?._id] || [];
//   const answeredCount = useMemo(() => Object.values(answers).filter((value) => value.length).length, [answers]);
//   const progress = test?.questions?.length ? Math.round((answeredCount / test.questions.length) * 100) : 0;

//   const toggleOption = (optionIndex) => {
//     const questionId = currentQuestion._id;
//     setAnswers((prev) => {
//       const current = prev[questionId] || [];
//       const multi = currentQuestion.options.length === 5;
//       const next = multi ? current.includes(optionIndex) ? current.filter((idx) => idx !== optionIndex) : [...current, optionIndex] : [optionIndex];
//       return { ...prev, [questionId]: next };
//     });
//   };

//   if (loading || !test) {
//     return <Layout><CinematicPage className="p-6"><div className="grid gap-4 md:grid-cols-3"><SkeletonCard /><SkeletonCard /><SkeletonCard /></div></CinematicPage></Layout>;
//   }

//   return (
//     <Layout>
//       <CinematicPage className="p-4 sm:p-6 lg:p-8">
//         <div className="grid gap-6 lg:grid-cols-[1fr_330px]">
//           <main className="space-y-5">
//             <GlassPanel className="sticky top-24 z-20 p-4">
//               <div className="flex flex-wrap items-center justify-between gap-4">
//                 <div>
//                   <h1 className="text-2xl font-black text-primary">{test.title}</h1>
//                   <p className="text-sm text-secondary">Question {currentIndex + 1} of {test.questions.length} • Marks {currentQuestion.marks || test.marksPerQuestion || 1}</p>
//                 </div>
//                 <div className={`inline-flex items-center gap-2 rounded-premium px-4 py-2 font-mono text-lg font-black ${timeLeft < 60 ? "bg-red-500/20 text-red-200" : "bg-white/10 text-sky-100"}`}>
//                   <Clock3 size={18} /> {formatTime(timeLeft)}
//                 </div>
//               </div>
//               <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-gradient-to-r from-red-500 to-sky-300" style={{ width: `${progress}%` }} /></div>
//             </GlassPanel>

//             <GlassPanel className="p-5 md:p-7">
//               <div className="mb-5 flex items-start gap-3">
//                 <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-red-600 to-sky-500 font-black">{currentIndex + 1}</div>
//                 <div className="text-xl font-semibold leading-8 text-primary">{currentQuestion.text}</div>
//               </div>
//               <div className="space-y-3">
//                 {currentQuestion.options.map((option, index) => {
//                   const active = selected.includes(index);
//                   return (
//                     <button key={index} type="button" onClick={() => toggleOption(index)} className={`flex w-full items-center gap-3 rounded-premium border p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-sky-300/30 ${active ? "border-sky-300 bg-sky-400/15 text-white shadow-glow-blue" : "border-white/10 bg-white/[0.045] text-slate-200 hover:bg-white/[0.08]"}`}>
//                       <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full font-bold ${active ? "bg-sky-300 text-slate-950" : "bg-white/10 text-slate-200"}`}>{String.fromCharCode(65 + index)}</span>
//                       <span className="flex-1">{option.text}</span>
//                       {active && <CheckCircle2 className="h-5 w-5 text-sky-200" />}
//                     </button>
//                   );
//                 })}
//               </div>
//             </GlassPanel>

//             <div className="flex flex-wrap justify-between gap-3">
//               <div className="flex flex-wrap gap-2">
//                 <SecondaryButton onClick={() => goTo(currentIndex - 1)} disabled={currentIndex === 0}><ChevronLeft size={16} /> Previous</SecondaryButton>
//                 <SecondaryButton onClick={() => goTo(currentIndex + 1)} disabled={currentIndex === test.questions.length - 1}>Save & Next <ChevronRight size={16} /></SecondaryButton>
//                 <SecondaryButton onClick={() => setMarked((prev) => ({ ...prev, [currentQuestion._id]: !prev[currentQuestion._id] }))}><Flag size={16} /> {marked[currentQuestion._id] ? "Unmark" : "Mark for Review"}</SecondaryButton>
//               </div>
//               <DangerButton onClick={() => window.confirm("Submit exam now?") && handleSubmit(false)}><Send size={16} /> Submit</DangerButton>
//             </div>
//           </main>

//           <aside className="space-y-4">
//             <GlassPanel className="p-4">
//               <div className="text-sm text-secondary">Progress</div>
//               <div className="mt-2 text-3xl font-black">{answeredCount}/{test.questions.length}</div>
//               <div className="mt-3 flex items-center gap-2 text-xs text-red-200"><ShieldAlert size={14} /> Tab switches: {violations.tabSwitches}</div>
//             </GlassPanel>
//             <GlassPanel className="p-4">
//               <div className="mb-3 font-semibold text-primary">Question Palette</div>
//               <div className="grid grid-cols-5 gap-2">
//                 {test.questions.map((question, index) => {
//                   const isAnswered = answers[question._id]?.length;
//                   const isMarked = marked[question._id];
//                   const tone = index === currentIndex ? "bg-sky-400 text-slate-950" : isMarked ? "bg-fuchsia-400/20 text-fuchsia-100" : isAnswered ? "bg-emerald-400/20 text-emerald-100" : "bg-white/10 text-slate-300";
//                   return <button key={question._id} type="button" onClick={() => goTo(index)} className={`rounded-premium p-2 text-sm font-bold transition hover:scale-105 ${tone}`}>{index + 1}</button>;
//                 })}
//               </div>
//               <div className="mt-4 grid gap-2 text-xs text-slate-400">
//                 <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-300" /> Answered</span>
//                 <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-fuchsia-300" /> Review</span>
//                 <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-sky-300" /> Current</span>
//               </div>
//             </GlassPanel>
//             <GlassPanel className="p-4 text-sm text-amber-100">
//               <AlertTriangle className="mb-2 h-5 w-5" />
//               Avoid switching tabs. Anti-cheat events are tracked.
//             </GlassPanel>
//           </aside>
//         </div>
//         <PrimaryButton onClick={() => window.confirm("Submit exam now?") && handleSubmit(false)} className="fixed bottom-24 right-4 z-40 md:hidden"><Send size={16} /> Submit</PrimaryButton>
//       </CinematicPage>
//     </Layout>
//   );
// }


// import {
//   useEffect,
//   useMemo,
//   useRef,
//   useState,
// } from "react";

// import {
//   useDispatch,
//   useSelector,
// } from "react-redux";

// import {
//   useNavigate,
//   useParams,
// } from "react-router-dom";

// import {
//   AlertTriangle,
//   CheckCircle2,
//   ChevronLeft,
//   ChevronRight,
//   Clock3,
//   Flag,
//   Send,
//   ShieldAlert,
//   Sparkles,
//   BrainCircuit,
//   Trophy,
//   Eye,
// } from "lucide-react";

// import Layout from "../../Layout/Layout";

// import {
//   fetchTest,
//   submitAttempt,
// } from "../../Redux/testSlice";

// import {
//   CinematicPage,
//   GlassPanel,
//   SkeletonCard,
// } from "../../Components/Premium/PremiumShell";

// import {
//   DangerButton,
//   SecondaryButton,
//   PrimaryButton,
// } from "../../Components/Premium/Buttons";

// const formatTime = (seconds) =>
//   `${Math.floor(seconds / 60)}:${String(
//     seconds % 60
//   ).padStart(2, "0")}`;

// export default function TestTake() {
//   const { id } = useParams();

//   const dispatch = useDispatch();

//   const navigate = useNavigate();

//   const test = useSelector(
//     (state) => state.tests.current
//   );

//   const loading = useSelector(
//     (state) => state.tests.loading.current
//   );

//   const [currentIndex, setCurrentIndex] =
//     useState(0);

//   const [answers, setAnswers] =
//     useState({});

//   const [marked, setMarked] =
//     useState({});

//   const [timeLeft, setTimeLeft] =
//     useState(0);

//   const [violations, setViolations] =
//     useState({
//       tabSwitches: 0,
//       fullscreenExits: 0,
//       autoSubmitted: false,
//     });

//   const questionStartedAt =
//     useRef(Date.now());

//   const timeSpent = useRef({});

//   const submitted = useRef(false);

//   useEffect(() => {
//     dispatch(fetchTest(id));
//   }, [dispatch, id]);

//   useEffect(() => {
//     if (test) {
//       setTimeLeft(
//         test.durationSeconds || 300
//       );
//     }
//   }, [test]);

//   const persistQuestionTime = () => {
//     const questionId =
//       test?.questions?.[
//         currentIndex
//       ]?._id;

//     if (!questionId) return;

//     const elapsed = Math.max(
//       0,
//       Math.round(
//         (Date.now() -
//           questionStartedAt.current) /
//           1000
//       )
//     );

//     timeSpent.current[questionId] =
//       (timeSpent.current[
//         questionId
//       ] || 0) + elapsed;

//     questionStartedAt.current =
//       Date.now();
//   };

//   const goTo = (index) => {
//     if (!test?.questions?.length)
//       return;

//     persistQuestionTime();

//     setCurrentIndex(
//       Math.max(
//         0,
//         Math.min(
//           test.questions.length - 1,
//           index
//         )
//       )
//     );
//   };

//   const buildPayload = (
//     autoSubmitted = false
//   ) => {
//     persistQuestionTime();

//     return {
//       testId: id,

//       durationSeconds: Math.max(
//         0,
//         (test?.durationSeconds || 0) -
//           timeLeft
//       ),

//       violations: {
//         ...violations,
//         autoSubmitted,
//       },

//       answers: (
//         test?.questions || []
//       ).map((question) => ({
//         questionId: question._id,

//         selectedOptionIndexes:
//           answers[
//             question._id
//           ] || [],

//         selectedOptionIndex:
//           answers[
//             question._id
//           ]?.[0],

//         markedForReview:
//           Boolean(
//             marked[question._id]
//           ),

//         timeSpentSeconds:
//           timeSpent.current[
//             question._id
//           ] || 0,
//       })),
//     };
//   };

//   const handleSubmit = async (
//     autoSubmitted = false
//   ) => {
//     if (
//       submitted.current ||
//       !test
//     )
//       return;

//     submitted.current = true;

//     try {
//       const response =
//         await dispatch(
//           submitAttempt({
//             id,
//             payload:
//               buildPayload(
//                 autoSubmitted
//               ),
//           })
//         ).unwrap();

//       navigate(
//         `/tests/result/${response.attempt?._id}`,
//         {
//           state: {
//             analysis:
//               response.analysis,
//             attempt:
//               response.attempt,
//           },
//         }
//       );
//     } catch (error) {
//       console.error(error);

//       submitted.current = false;
//     }
//   };

//   useEffect(() => {
//     if (!timeLeft || !test)
//       return undefined;

//     const timer = setInterval(() => {
//       setTimeLeft((value) => {
//         if (value <= 1) {
//           clearInterval(timer);

//           handleSubmit(true);

//           return 0;
//         }

//         return value - 1;
//       });
//     }, 1000);

//     return () =>
//       clearInterval(timer);
//   }, [timeLeft, test]);

//   useEffect(() => {
//     const onVisibility = () => {
//       if (document.hidden) {
//         setViolations((prev) => {
//           const next = {
//             ...prev,
//             tabSwitches:
//               prev.tabSwitches + 1,
//           };

//           const limit =
//             test?.pattern
//               ?.antiCheat
//               ?.maxTabSwitches ??
//             3;

//           if (
//             test?.pattern
//               ?.antiCheat
//               ?.autoSubmitOnViolation &&
//             next.tabSwitches >
//               limit
//           ) {
//             setTimeout(
//               () =>
//                 handleSubmit(true),
//               0
//             );
//           }

//           return next;
//         });
//       }
//     };

//     document.addEventListener(
//       "visibilitychange",
//       onVisibility
//     );

//     return () =>
//       document.removeEventListener(
//         "visibilitychange",
//         onVisibility
//       );
//   }, [test]);

//   const currentQuestion =
//     test?.questions?.[
//       currentIndex
//     ];

//   const selected =
//     answers[
//       currentQuestion?._id
//     ] || [];

//   const answeredCount =
//     useMemo(
//       () =>
//         Object.values(
//           answers
//         ).filter(
//           (value) => value.length
//         ).length,
//       [answers]
//     );

//   const progress =
//     test?.questions?.length
//       ? Math.round(
//           (answeredCount /
//             test.questions
//               .length) *
//             100
//         )
//       : 0;

//   const toggleOption = (
//     optionIndex
//   ) => {
//     const questionId =
//       currentQuestion._id;

//     setAnswers((prev) => {
//       const current =
//         prev[questionId] || [];

//       const multi =
//         currentQuestion.options
//           .length === 5;

//       const next = multi
//         ? current.includes(
//             optionIndex
//           )
//           ? current.filter(
//               (idx) =>
//                 idx !== optionIndex
//             )
//           : [
//               ...current,
//               optionIndex,
//             ]
//         : [optionIndex];

//       return {
//         ...prev,
//         [questionId]: next,
//       };
//     });
//   };

//   if (loading || !test) {
//     return (
//       <Layout>
//         <CinematicPage className="p-6">
//           <div className="grid gap-4 md:grid-cols-3">
//             <SkeletonCard />
//             <SkeletonCard />
//             <SkeletonCard />
//           </div>
//         </CinematicPage>
//       </Layout>
//     );
//   }

//   return (
//     <Layout>
//       <CinematicPage className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-zinc-900 p-4 text-white sm:p-6 lg:p-8">
        
//         {/* Background Glow */}
//         <div className="absolute left-0 top-0 h-[400px] w-[400px] rounded-full bg-indigo-500/10 blur-[120px]" />

//         <div className="absolute right-0 top-40 h-[350px] w-[350px] rounded-full bg-red-500/10 blur-[120px]" />

//         <div className="relative z-10 grid gap-6 lg:grid-cols-[1fr_340px]">
          
//           {/* MAIN */}
//           <main className="space-y-5">
            
//             {/* HEADER */}
//             <GlassPanel className="sticky top-24 z-20 overflow-hidden border border-white/10 bg-gradient-to-br from-white/10 via-white/[0.04] to-transparent p-5 backdrop-blur-2xl">
              
//               <div className="absolute -right-10 top-0 h-52 w-52 rounded-full bg-indigo-500/10 blur-[100px]" />

//               <div className="relative z-10 flex flex-wrap items-center justify-between gap-5">
                
//                 <div>
//                   <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-1 text-xs font-bold uppercase tracking-[0.24em] text-indigo-200">
//                     <Sparkles size={13} />
//                     Premium Exam Mode
//                   </div>

//                   <h1 className="mt-4 text-3xl font-black md:text-4xl">
//                     {test.title}
//                   </h1>

//                   <p className="mt-2 text-sm text-slate-400">
//                     Question{" "}
//                     {currentIndex + 1}{" "}
//                     of{" "}
//                     {
//                       test.questions
//                         .length
//                     }{" "}
//                     • Marks{" "}
//                     {currentQuestion.marks ||
//                       test.marksPerQuestion ||
//                       1}
//                   </p>
//                 </div>

//                 {/* TIMER */}
//                 <div
//                   className={`inline-flex items-center gap-3 rounded-2xl border px-5 py-3 font-mono text-2xl font-black shadow-lg ${
//                     timeLeft < 60
//                       ? "border-red-500/30 bg-red-500/15 text-red-200"
//                       : "border-indigo-500/20 bg-indigo-500/10 text-indigo-100"
//                   }`}
//                 >
//                   <Clock3 size={22} />
//                   {formatTime(
//                     timeLeft
//                   )}
//                 </div>
//               </div>

//               {/* Progress */}
//               <div className="mt-6">
//                 <div className="mb-2 flex items-center justify-between text-sm text-slate-400">
//                   <span>
//                     Progress
//                   </span>

//                   <span>
//                     {progress}%
//                   </span>
//                 </div>

//                 <div className="h-3 overflow-hidden rounded-full bg-white/10">
//                   <div
//                     className="h-full rounded-full bg-gradient-to-r from-red-500 via-indigo-500 to-cyan-400 transition-all duration-500"
//                     style={{
//                       width: `${progress}%`,
//                     }}
//                   />
//                 </div>
//               </div>
//             </GlassPanel>

//             {/* QUESTION */}
//             <GlassPanel className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 md:p-8">
              
//               <div className="mb-8 flex items-start gap-4">
                
//                 <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-indigo-500 text-lg font-black text-white shadow-lg shadow-indigo-500/20">
//                   {currentIndex + 1}
//                 </div>

//                 <div className="text-xl font-semibold leading-9 text-white md:text-2xl">
//                   {currentQuestion.text}
//                 </div>
//               </div>

//               {/* OPTIONS */}
//               <div className="space-y-4">
//                 {currentQuestion.options.map(
//                   (
//                     option,
//                     index
//                   ) => {
//                     const active =
//                       selected.includes(
//                         index
//                       );

//                     return (
//                       <button
//                         key={index}
//                         type="button"
//                         onClick={() =>
//                           toggleOption(
//                             index
//                           )
//                         }
//                         className={`group flex w-full items-center gap-4 rounded-3xl border p-5 text-left transition-all duration-300 ${
//                           active
//                             ? "border-indigo-400 bg-indigo-500/15 text-white shadow-xl shadow-indigo-500/10"
//                             : "border-white/10 bg-white/[0.03] text-slate-200 hover:border-indigo-500/30 hover:bg-white/[0.06]"
//                         }`}
//                       >
                        
//                         <div
//                           className={`flex h-11 w-11 items-center justify-center rounded-2xl text-sm font-black transition-all ${
//                             active
//                               ? "bg-indigo-300 text-black"
//                               : "bg-white/10 text-white"
//                           }`}
//                         >
//                           {String.fromCharCode(
//                             65 +
//                               index
//                           )}
//                         </div>

//                         <div className="flex-1 text-base leading-7">
//                           {
//                             option.text
//                           }
//                         </div>

//                         {active && (
//                           <CheckCircle2 className="h-6 w-6 text-indigo-200" />
//                         )}
//                       </button>
//                     );
//                   }
//                 )}
//               </div>
//             </GlassPanel>

//             {/* NAVIGATION */}
//             <div className="flex flex-wrap items-center justify-between gap-4">
              
//               <div className="flex flex-wrap gap-3">
//                 <SecondaryButton
//                   onClick={() =>
//                     goTo(
//                       currentIndex -
//                         1
//                     )
//                   }
//                   disabled={
//                     currentIndex ===
//                     0
//                   }
//                 >
//                   <ChevronLeft
//                     size={16}
//                   />
//                   Previous
//                 </SecondaryButton>

//                 <SecondaryButton
//                   onClick={() =>
//                     goTo(
//                       currentIndex +
//                         1
//                     )
//                   }
//                   disabled={
//                     currentIndex ===
//                     test.questions
//                       .length -
//                       1
//                   }
//                 >
//                   Save & Next
//                   <ChevronRight
//                     size={16}
//                   />
//                 </SecondaryButton>

//                 <SecondaryButton
//                   onClick={() =>
//                     setMarked(
//                       (prev) => ({
//                         ...prev,
//                         [
//                           currentQuestion._id
//                         ]:
//                           !prev[
//                             currentQuestion
//                               ._id
//                           ],
//                       })
//                     )
//                   }
//                 >
//                   <Flag size={16} />

//                   {marked[
//                     currentQuestion
//                       ._id
//                   ]
//                     ? "Unmark"
//                     : "Mark Review"}
//                 </SecondaryButton>
//               </div>

//               <DangerButton
//                 onClick={() =>
//                   window.confirm(
//                     "Submit exam now?"
//                   ) &&
//                   handleSubmit(
//                     false
//                   )
//                 }
//               >
//                 <Send size={16} />
//                 Submit Exam
//               </DangerButton>
//             </div>
//           </main>

//           {/* SIDEBAR */}
//           <aside className="space-y-5">
            
//             {/* STATS */}
//             <GlassPanel className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
              
//               <div className="flex items-center gap-3">
//                 <BrainCircuit className="text-indigo-300" />

//                 <div>
//                   <div className="text-sm text-slate-400">
//                     Progress
//                   </div>

//                   <div className="mt-1 text-3xl font-black">
//                     {
//                       answeredCount
//                     }
//                     /
//                     {
//                       test.questions
//                         .length
//                     }
//                   </div>
//                 </div>
//               </div>

//               <div className="mt-5 flex items-center gap-2 rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-200">
//                 <ShieldAlert
//                   size={16}
//                 />
//                 Tab switches:{" "}
//                 {
//                   violations.tabSwitches
//                 }
//               </div>
//             </GlassPanel>

//             {/* QUESTION PALETTE */}
//             <GlassPanel className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
              
//               <div className="mb-5 flex items-center justify-between">
                
//                 <div>
//                   <h3 className="text-lg font-bold">
//                     Question Palette
//                   </h3>

//                   <p className="mt-1 text-sm text-slate-400">
//                     Navigate quickly
//                   </p>
//                 </div>

//                 <Eye className="text-indigo-300" />
//               </div>

//               <div className="grid grid-cols-5 gap-3">
//                 {test.questions.map(
//                   (
//                     question,
//                     index
//                   ) => {
//                     const isAnswered =
//                       answers[
//                         question
//                           ._id
//                       ]?.length;

//                     const isMarked =
//                       marked[
//                         question
//                           ._id
//                       ];

//                     const tone =
//                       index ===
//                       currentIndex
//                         ? "bg-indigo-400 text-black"
//                         : isMarked
//                         ? "bg-fuchsia-500/20 text-fuchsia-200"
//                         : isAnswered
//                         ? "bg-emerald-500/20 text-emerald-200"
//                         : "bg-white/10 text-slate-300";

//                     return (
//                       <button
//                         key={
//                           question._id
//                         }
//                         type="button"
//                         onClick={() =>
//                           goTo(
//                             index
//                           )
//                         }
//                         className={`flex h-12 items-center justify-center rounded-2xl text-sm font-black transition-all hover:scale-105 ${tone}`}
//                       >
//                         {index + 1}
//                       </button>
//                     );
//                   }
//                 )}
//               </div>

//               {/* Legend */}
//               <div className="mt-6 space-y-2 text-xs text-slate-400">
                
//                 <div className="flex items-center gap-2">
//                   <span className="h-3 w-3 rounded-full bg-emerald-400" />
//                   Answered
//                 </div>

//                 <div className="flex items-center gap-2">
//                   <span className="h-3 w-3 rounded-full bg-fuchsia-400" />
//                   Review
//                 </div>

//                 <div className="flex items-center gap-2">
//                   <span className="h-3 w-3 rounded-full bg-indigo-400" />
//                   Current
//                 </div>
//               </div>
//             </GlassPanel>

//             {/* WARNING */}
//             <GlassPanel className="rounded-3xl border border-amber-500/20 bg-amber-500/10 p-5 text-amber-100">
              
//               <div className="flex items-start gap-3">
//                 <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />

//                 <div>
//                   <div className="font-bold">
//                     Anti-Cheat Enabled
//                   </div>

//                   <p className="mt-2 text-sm leading-6 text-amber-100/80">
//                     Avoid switching
//                     tabs or leaving
//                     fullscreen mode.
//                     Suspicious
//                     activity may
//                     trigger automatic
//                     submission.
//                   </p>
//                 </div>
//               </div>
//             </GlassPanel>

//             {/* SCORE PANEL */}
//             <GlassPanel className="rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-500/10 to-red-500/10 p-5">
              
//               <div className="flex items-center gap-3">
//                 <Trophy className="text-yellow-300" />

//                 <div>
//                   <div className="text-sm text-slate-300">
//                     Exam Status
//                   </div>

//                   <div className="mt-1 text-xl font-black">
//                     In Progress
//                   </div>
//                 </div>
//               </div>

//               <PrimaryButton
//                 onClick={() =>
//                   window.confirm(
//                     "Submit exam now?"
//                   ) &&
//                   handleSubmit(
//                     false
//                   )
//                 }
//                 className="mt-5 w-full"
//               >
//                 <Send size={16} />
//                 Final Submit
//               </PrimaryButton>
//             </GlassPanel>
//           </aside>
//         </div>

//         {/* MOBILE SUBMIT */}
//         <PrimaryButton
//           onClick={() =>
//             window.confirm(
//               "Submit exam now?"
//             ) &&
//             handleSubmit(false)
//           }
//           className="fixed bottom-24 right-4 z-50 shadow-2xl md:hidden"
//         >
//           <Send size={16} />
//           Submit
//         </PrimaryButton>
//       </CinematicPage>
//     </Layout>
//   );
// }



import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Flag,
  Send,
  ShieldAlert,
  Sparkles,
  BrainCircuit,
  Trophy,
  Eye,
} from "lucide-react";

import Layout from "../../Layout/Layout";

import {
  fetchTest,
  submitAttempt,
} from "../../Redux/testSlice";

const formatTime = (seconds) =>
  `${Math.floor(seconds / 60)}:${String(
    seconds % 60
  ).padStart(2, "0")}`;

export default function TestTake() {
  const { id } = useParams();

  const dispatch = useDispatch();

  const navigate = useNavigate();

  const test = useSelector(
    (state) => state.tests.current
  );

  const loading = useSelector(
    (state) => state.tests.loading.current
  );

  const [currentIndex, setCurrentIndex] =
    useState(0);

  const [answers, setAnswers] =
    useState({});

  const [marked, setMarked] =
    useState({});

  const [timeLeft, setTimeLeft] =
    useState(0);

  const [violations, setViolations] =
    useState({
      tabSwitches: 0,
      fullscreenExits: 0,
    });

  const questionStartedAt =
    useRef(Date.now());

  const timeSpent = useRef({});

  const submitted = useRef(false);

  useEffect(() => {
    dispatch(fetchTest(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (test) {
      setTimeLeft(
        test.durationSeconds || 300
      );
    }
  }, [test]);

  const persistQuestionTime = () => {
    const questionId =
      test?.questions?.[
        currentIndex
      ]?._id;

    if (!questionId) return;

    const elapsed = Math.max(
      0,
      Math.round(
        (Date.now() -
          questionStartedAt.current) /
          1000
      )
    );

    timeSpent.current[questionId] =
      (timeSpent.current[
        questionId
      ] || 0) + elapsed;

    questionStartedAt.current =
      Date.now();
  };

  const goTo = (index) => {
    if (!test?.questions?.length)
      return;

    persistQuestionTime();

    setCurrentIndex(
      Math.max(
        0,
        Math.min(
          test.questions.length - 1,
          index
        )
      )
    );
  };

  const buildPayload = (
    autoSubmitted = false
  ) => {
    persistQuestionTime();

    return {
      testId: id,

      durationSeconds: Math.max(
        0,
        (test?.durationSeconds || 0) -
          timeLeft
      ),

      violations: {
        ...violations,
        autoSubmitted,
      },

      answers: (
        test?.questions || []
      ).map((question) => ({
        questionId: question._id,

        selectedOptionIndexes:
          answers[
            question._id
          ] || [],

        selectedOptionIndex:
          answers[
            question._id
          ]?.[0],

        markedForReview:
          Boolean(
            marked[question._id]
          ),

        timeSpentSeconds:
          timeSpent.current[
            question._id
          ] || 0,
      })),
    };
  };

  const handleSubmit = async (
    autoSubmitted = false
  ) => {
    if (
      submitted.current ||
      !test
    )
      return;

    submitted.current = true;

    try {
      const response =
        await dispatch(
          submitAttempt({
            id,
            payload:
              buildPayload(
                autoSubmitted
              ),
          })
        ).unwrap();

      navigate(
        `/tests/result/${response.attempt?._id}`,
        {
          state: {
            analysis:
              response.analysis,
            attempt:
              response.attempt,
          },
        }
      );
    } catch (error) {
      console.error(error);
      submitted.current = false;
    }
  };

  useEffect(() => {
    if (!timeLeft || !test)
      return;

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

    return () =>
      clearInterval(timer);
  }, [timeLeft, test]);

  const currentQuestion =
    test?.questions?.[
      currentIndex
    ];

  const selected =
    answers[
      currentQuestion?._id
    ] || [];

  const answeredCount =
    useMemo(
      () =>
        Object.values(
          answers
        ).filter(
          (value) => value.length
        ).length,
      [answers]
    );

  const progress =
    test?.questions?.length
      ? Math.round(
          (answeredCount /
            test.questions
              .length) *
            100
        )
      : 0;

  const toggleOption = (
    optionIndex
  ) => {
    if (!currentQuestion) return;

    const questionId =
      currentQuestion._id;

    setAnswers((prev) => {
      const current =
        prev[questionId] || [];

      const multi =
        currentQuestion.options
          ?.length === 5;

      const next = multi
        ? current.includes(
            optionIndex
          )
          ? current.filter(
              (idx) =>
                idx !== optionIndex
            )
          : [
              ...current,
              optionIndex,
            ]
        : [optionIndex];

      return {
        ...prev,
        [questionId]: next,
      };
    });
  };

  if (loading || !test) {
    return (
      <Layout>
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          Loading Test...
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-black text-white overflow-hidden">

        {/* Background Effects */}
        <div className="fixed left-0 top-0 h-[400px] w-[400px] rounded-full bg-indigo-500/10 blur-[120px]" />

        <div className="fixed right-0 top-40 h-[400px] w-[400px] rounded-full bg-red-500/10 blur-[120px]" />

        <div className="relative z-10 grid gap-6 p-4 lg:grid-cols-[1fr_340px] lg:p-8">

          {/* MAIN */}
          <main className="space-y-6">

            {/* HEADER */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 backdrop-blur-xl">

              <div className="flex flex-wrap items-center justify-between gap-5">

                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.25em] text-indigo-200">
                    <Sparkles size={14} />
                    Premium Exam
                  </div>

                  <h1 className="mt-5 text-4xl font-black text-white">
                    {test?.title || "Exam"}
                  </h1>

                  <p className="mt-2 text-slate-300">
                    Question {currentIndex + 1} of{" "}
                    {test.questions.length}
                  </p>
                </div>

                {/* TIMER */}
                <div
                  className={`rounded-2xl border px-5 py-4 text-3xl font-black shadow-xl ${
                    timeLeft < 60
                      ? "border-red-500/30 bg-red-500/15 text-red-200"
                      : "border-indigo-500/30 bg-indigo-500/10 text-indigo-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Clock3 size={24} />
                    {formatTime(timeLeft)}
                  </div>
                </div>
              </div>

              {/* PROGRESS */}
              <div className="mt-6">
                <div className="mb-2 flex justify-between text-sm text-slate-400">
                  <span>Progress</span>
                  <span>{progress}%</span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-red-500 via-indigo-500 to-cyan-400 transition-all duration-500"
                    style={{
                      width: `${progress}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* QUESTION CARD */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 backdrop-blur-xl">

              <div className="mb-8 flex gap-4">

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-indigo-500 text-lg font-black">
                  {currentIndex + 1}
                </div>

                {/* FIXED QUESTION VISIBILITY */}
                <div className="flex-1">
                  <h2 className="text-2xl font-bold leading-9 text-white break-words">
                    {currentQuestion?.text ||
                      "Question not available"}
                  </h2>
                </div>
              </div>

              {/* OPTIONS */}
              <div className="space-y-4">
                {currentQuestion?.options?.map(
                  (option, index) => {
                    const active =
                      selected.includes(
                        index
                      );

                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() =>
                          toggleOption(
                            index
                          )
                        }
                        className={`group flex w-full items-center gap-4 rounded-3xl border p-5 text-left transition-all duration-300 ${
                          active
                            ? "border-indigo-400 bg-indigo-500/15 shadow-xl shadow-indigo-500/10"
                            : "border-white/10 bg-white/[0.03] hover:border-indigo-500/40 hover:bg-white/[0.06]"
                        }`}
                      >
                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-sm font-black ${
                            active
                              ? "bg-indigo-300 text-black"
                              : "bg-white/10 text-white"
                          }`}
                        >
                          {String.fromCharCode(
                            65 + index
                          )}
                        </div>

                        {/* FIXED OPTION VISIBILITY */}
                        <div className="flex-1 text-base leading-7 text-white break-words">
                          {option?.text ||
                            `Option ${
                              index + 1
                            }`}
                        </div>

                        {active && (
                          <CheckCircle2 className="h-6 w-6 text-indigo-200" />
                        )}
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            {/* BUTTONS */}
            <div className="flex flex-wrap items-center justify-between gap-4">

              <div className="flex flex-wrap gap-3">

                <button
                  onClick={() =>
                    goTo(
                      currentIndex - 1
                    )
                  }
                  disabled={
                    currentIndex === 0
                  }
                  className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-semibold text-white transition hover:bg-white/10 disabled:opacity-40"
                >
                  <div className="flex items-center gap-2">
                    <ChevronLeft size={18} />
                    Previous
                  </div>
                </button>

                <button
                  onClick={() =>
                    goTo(
                      currentIndex + 1
                    )
                  }
                  disabled={
                    currentIndex ===
                    test.questions.length -
                      1
                  }
                  className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-semibold text-white transition hover:bg-white/10 disabled:opacity-40"
                >
                  <div className="flex items-center gap-2">
                    Next
                    <ChevronRight size={18} />
                  </div>
                </button>

                <button
                  onClick={() =>
                    setMarked(
                      (prev) => ({
                        ...prev,
                        [
                          currentQuestion._id
                        ]:
                          !prev[
                            currentQuestion
                              ._id
                          ],
                      })
                    )
                  }
                  className="rounded-2xl border border-fuchsia-500/20 bg-fuchsia-500/10 px-5 py-3 font-semibold text-fuchsia-200"
                >
                  <div className="flex items-center gap-2">
                    <Flag size={18} />
                    Review
                  </div>
                </button>
              </div>

              <button
                onClick={() =>
                  window.confirm(
                    "Submit exam?"
                  ) &&
                  handleSubmit(false)
                }
                className="rounded-2xl bg-gradient-to-r from-red-500 to-pink-500 px-6 py-3 font-bold text-white shadow-xl transition hover:scale-105"
              >
                <div className="flex items-center gap-2">
                  <Send size={18} />
                  Submit Exam
                </div>
              </button>
            </div>
          </main>

          {/* SIDEBAR */}
          <aside className="space-y-5">

            {/* STATUS */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-5 backdrop-blur-xl">

              <div className="flex items-center gap-3">
                <BrainCircuit className="text-indigo-300" />

                <div>
                  <div className="text-sm text-slate-400">
                    Progress
                  </div>

                  <div className="text-3xl font-black text-white">
                    {answeredCount}/
                    {
                      test.questions.length
                    }
                  </div>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-2 rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-200">
                <ShieldAlert size={16} />
                Tab Switches:{" "}
                {violations.tabSwitches}
              </div>
            </div>

            {/* PALETTE */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-5 backdrop-blur-xl">

              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">
                  Questions
                </h3>

                <Eye className="text-indigo-300" />
              </div>

              <div className="grid grid-cols-5 gap-3">
                {test.questions.map(
                  (
                    question,
                    index
                  ) => {
                    const isAnswered =
                      answers[
                        question._id
                      ]?.length;

                    const isMarked =
                      marked[
                        question._id
                      ];

                    return (
                      <button
                        key={
                          question._id
                        }
                        onClick={() =>
                          goTo(index)
                        }
                        className={`flex h-12 items-center justify-center rounded-2xl text-sm font-black transition hover:scale-105 ${
                          index ===
                          currentIndex
                            ? "bg-indigo-400 text-black"
                            : isMarked
                            ? "bg-fuchsia-500/20 text-fuchsia-200"
                            : isAnswered
                            ? "bg-emerald-500/20 text-emerald-200"
                            : "bg-white/10 text-slate-300"
                        }`}
                      >
                        {index + 1}
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            {/* WARNING */}
            <div className="rounded-3xl border border-amber-500/20 bg-amber-500/10 p-5 text-amber-100">

              <div className="flex gap-3">
                <AlertTriangle className="mt-1 h-5 w-5 shrink-0" />

                <div>
                  <div className="font-bold">
                    Anti Cheat Active
                  </div>

                  <p className="mt-2 text-sm leading-6 text-amber-100/80">
                    Avoid tab switching.
                    Suspicious activity
                    may auto-submit the
                    exam.
                  </p>
                </div>
              </div>
            </div>

            {/* FINAL PANEL */}
            <div className="rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 to-red-500/10 p-5">

              <div className="flex items-center gap-3">
                <Trophy className="text-yellow-300" />

                <div>
                  <div className="text-sm text-slate-300">
                    Status
                  </div>

                  <div className="text-xl font-black text-white">
                    In Progress
                  </div>
                </div>
              </div>

              <button
                onClick={() =>
                  window.confirm(
                    "Submit exam?"
                  ) &&
                  handleSubmit(false)
                }
                className="mt-5 w-full rounded-2xl bg-gradient-to-r from-indigo-500 to-red-500 px-5 py-4 font-bold text-white shadow-xl transition hover:scale-[1.02]"
              >
                Final Submit
              </button>
            </div>
          </aside>
        </div>
      </div>
    </Layout>
  );
}