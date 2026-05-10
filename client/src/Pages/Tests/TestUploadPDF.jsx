// import { useState } from "react";
// import toast from "react-hot-toast";
// import { useNavigate } from "react-router-dom";

// import FileUpload from "../../Components/FileUpload";
// import axiosInstance from "../../Helper/axiosInstance";
// import Layout from "../../Layout/Layout";

// export default function TestUploadPDF() {
//   const navigate = useNavigate();
//   const [parsed, setParsed] = useState(null);
//   const [config, setConfig] = useState({
//     title: "",
//     description: "",
//     examPattern: "SSC",
//     optionsCount: 4,
//     marksPerQuestion: 1,
//     durationSeconds: 600,
//     negativeMarkingEnabled: true,
//     penaltyRatio: 4,
//     status: "DRAFT",
//   });
//   const [saving, setSaving] = useState(false);

//   const ingestFile = async ({ formData }) => {
//     formData.append("optionsCount", config.optionsCount);
//     formData.append("marksPerQuestion", config.marksPerQuestion);
//     const { data } = await axiosInstance.post("/tests/ingest", formData, {
//       headers: { "Content-Type": "multipart/form-data" },
//     });
//     setParsed(data);
//     setConfig((prev) => ({
//       ...prev,
//       title: prev.title || `Imported from ${data.originalName}`,
//     }));
//     toast.success(`Parsed ${data.questions?.length || 0} questions`);
//   };

//   const updateQuestion = (index, patch) => {
//     setParsed((prev) => ({
//       ...prev,
//       questions: prev.questions.map((question, qi) => (qi === index ? { ...question, ...patch } : question)),
//     }));
//   };

//   const publish = async () => {
//     if (!parsed?.questions?.length) return toast.error("Parse a file first");
//     setSaving(true);
//     try {
//       const { data } = await axiosInstance.post("/tests/from-ingestion", {
//         ...config,
//         questions: parsed.questions,
//       });
//       toast.success("Exam created from ingestion");
//       navigate(`/tests/take/${data.test._id}`);
//     } catch (error) {
//       toast.error(error?.response?.data?.message || "Failed to create exam");
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <Layout>
//       <div className="mx-auto max-w-6xl space-y-6 p-6">
//         <div>
//           <h1 className="text-3xl font-bold">AI Upload Test Builder</h1>
//           <p className="text-sm text-gray-500">Upload PDF, Excel, CSV, JPG, or PNG. Invalid questions enter manual review.</p>
//         </div>

//         <section className="grid gap-4 rounded-lg bg-white p-5 shadow md:grid-cols-4">
//           <input value={config.title} onChange={(e) => setConfig({ ...config, title: e.target.value })} className="rounded border p-2 md:col-span-2" placeholder="Test title" />
//           <select value={config.examPattern} onChange={(e) => setConfig({ ...config, examPattern: e.target.value })} className="rounded border p-2">
//             {["SSC", "UPSC", "BPSC", "CUSTOM"].map((item) => <option key={item}>{item}</option>)}
//           </select>
//           <select value={config.optionsCount} onChange={(e) => setConfig({ ...config, optionsCount: Number(e.target.value) })} className="rounded border p-2">
//             <option value={4}>4 options</option>
//             <option value={5}>5 options</option>
//           </select>
//           <select value={config.marksPerQuestion} onChange={(e) => setConfig({ ...config, marksPerQuestion: Number(e.target.value) })} className="rounded border p-2">
//             <option value={1}>1 mark</option>
//             <option value={4}>4 marks</option>
//           </select>
//           <select value={config.penaltyRatio} onChange={(e) => setConfig({ ...config, penaltyRatio: Number(e.target.value), negativeMarkingEnabled: Number(e.target.value) > 0 })} className="rounded border p-2">
//             <option value={4}>4 wrong = -1</option>
//             <option value={3}>3 wrong = -1</option>
//             <option value={0}>No negative</option>
//           </select>
//           <input type="number" value={config.durationSeconds} onChange={(e) => setConfig({ ...config, durationSeconds: Number(e.target.value) })} className="rounded border p-2" placeholder="Duration seconds" />
//           <textarea value={config.description} onChange={(e) => setConfig({ ...config, description: e.target.value })} className="rounded border p-2 md:col-span-4" placeholder="Description" />
//         </section>

//         <FileUpload type="any" fieldName="file" onUpload={ingestFile} />

//         {parsed && (
//           <section className="rounded-lg bg-white p-5 shadow">
//             <div className="mb-4 flex items-center justify-between">
//               <div>
//                 <h2 className="text-xl font-semibold">Review Queue</h2>
//                 <p className="text-sm text-gray-500">
//                   {parsed.questions.length} parsed · {parsed.reviewQueue.length} need review · {parsed.duplicates.length} duplicates
//                 </p>
//               </div>
//               <button onClick={publish} disabled={saving} className="rounded bg-indigo-600 px-4 py-2 font-semibold text-white disabled:opacity-60">
//                 {saving ? "Creating" : "Create Test"}
//               </button>
//             </div>

//             <div className="space-y-3">
//               {parsed.questions.map((question, index) => (
//                 <div key={index} className={`rounded border p-3 ${question.reviewStatus === "VALID" ? "border-green-200" : "border-yellow-300 bg-yellow-50"}`}>
//                   <textarea value={question.text} onChange={(e) => updateQuestion(index, { text: e.target.value })} className="mb-2 w-full rounded border p-2" />
//                   <div className="grid gap-2 md:grid-cols-2">
//                     {question.options.map((option, oi) => (
//                       <div key={oi} className="flex items-center gap-2 rounded border bg-white p-2">
//                         <input
//                           type="checkbox"
//                           checked={question.correctAnswers.includes(oi)}
//                           onChange={() => {
//                             const exists = question.correctAnswers.includes(oi);
//                             updateQuestion(index, {
//                               correctAnswers: exists
//                                 ? question.correctAnswers.filter((item) => item !== oi)
//                                 : [...question.correctAnswers, oi],
//                             });
//                           }}
//                         />
//                         <input
//                           value={option.text}
//                           onChange={(e) =>
//                             updateQuestion(index, {
//                               options: question.options.map((item, itemIndex) => itemIndex === oi ? { ...item, text: e.target.value } : item),
//                             })
//                           }
//                           className="flex-1 outline-none"
//                         />
//                       </div>
//                     ))}
//                   </div>
//                   {question.reviewNotes?.length > 0 && <p className="mt-2 text-sm text-yellow-700">{question.reviewNotes.join(", ")}</p>}
//                 </div>
//               ))}
//             </div>
//           </section>
//         )}
//       </div>
//     </Layout>
//   );
// }


import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  UploadCloud,
  FileSpreadsheet,
  FileImage,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  BrainCircuit,
  Rocket,
  Clock3,
} from "lucide-react";

import FileUpload from "../../Components/FileUpload";
import axiosInstance from "../../Helper/axiosInstance";
import Layout from "../../Layout/Layout";

import {
  CinematicPage,
  GlassPanel,
} from "../../Components/Premium/PremiumShell";

import {
  PrimaryButton,
  SecondaryButton,
} from "../../Components/Premium/Buttons";

export default function TestUploadPDF() {
  const navigate = useNavigate();

  const [parsed, setParsed] = useState(null);

  const [config, setConfig] = useState({
    title: "",
    description: "",
    examPattern: "SSC",
    optionsCount: 4,
    marksPerQuestion: 1,
    durationSeconds: 600,
    negativeMarkingEnabled: true,
    penaltyRatio: 4,
    status: "DRAFT",
  });

  const [saving, setSaving] = useState(false);

  const ingestFile = async ({ formData }) => {
    try {
      formData.append("optionsCount", config.optionsCount);
      formData.append("marksPerQuestion", config.marksPerQuestion);

      const { data } = await axiosInstance.post(
        "/tests/ingest",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setParsed(data);

      setConfig((prev) => ({
        ...prev,
        title:
          prev.title ||
          `Imported from ${data.originalName}`,
      }));

      toast.success(
        `Successfully parsed ${
          data.questions?.length || 0
        } questions`
      );
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ||
          "File upload failed"
      );
    }
  };

  const updateQuestion = (index, patch) => {
    setParsed((prev) => ({
      ...prev,
      questions: prev.questions.map((question, qi) =>
        qi === index
          ? { ...question, ...patch }
          : question
      ),
    }));
  };

  const publish = async () => {
    if (!parsed?.questions?.length) {
      return toast.error("Please upload a file first");
    }

    setSaving(true);

    try {
      const { data } = await axiosInstance.post(
        "/tests/from-ingestion",
        {
          ...config,
          questions: parsed.questions,
        }
      );

      toast.success("Premium AI Test Created");

      navigate(`/tests/take/${data.test._id}`);
    } catch (error) {
      console.error(error);

      toast.error(
        error?.response?.data?.message ||
          "Failed to create test"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <CinematicPage className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-6">

          {/* HERO */}

          <GlassPanel className="overflow-hidden p-6 md:p-8">
            <div className="grid gap-8 lg:grid-cols-[1fr_320px]">

              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.25em] text-cyan-200">
                  <Sparkles size={14} />
                  AI Powered Upload Engine
                </div>

                <h1 className="max-w-3xl text-4xl font-black leading-tight text-white md:text-6xl">
                  Premium AI Test Builder
                </h1>

                <p className="mt-5 max-w-3xl text-base leading-8 text-slate-300">
                  Upload PDF, DOCX, CSV, Excel, PNG, JPG or scanned documents.
                  AI automatically extracts questions, validates answers,
                  detects duplicates, creates review queues and generates
                  production-ready exams.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-200">
                    ⚡ OCR + AI Parsing
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-200">
                    🚀 Million User Ready
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-200">
                    🧠 Smart Validation
                  </div>
                </div>
              </div>

              {/* RIGHT PANEL */}

              <div className="grid gap-4">
                <GlassPanel className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-cyan-500/15 p-3 text-cyan-200">
                      <FileText size={22} />
                    </div>

                    <div>
                      <div className="text-sm text-slate-400">
                        Supported Docs
                      </div>

                      <div className="font-bold text-white">
                        PDF / DOCX / TXT
                      </div>
                    </div>
                  </div>
                </GlassPanel>

                <GlassPanel className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-emerald-500/15 p-3 text-emerald-200">
                      <FileSpreadsheet size={22} />
                    </div>

                    <div>
                      <div className="text-sm text-slate-400">
                        Spreadsheet
                      </div>

                      <div className="font-bold text-white">
                        XLSX / CSV
                      </div>
                    </div>
                  </div>
                </GlassPanel>

                <GlassPanel className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-pink-500/15 p-3 text-pink-200">
                      <FileImage size={22} />
                    </div>

                    <div>
                      <div className="text-sm text-slate-400">
                        Images + OCR
                      </div>

                      <div className="font-bold text-white">
                        JPG / PNG
                      </div>
                    </div>
                  </div>
                </GlassPanel>
              </div>
            </div>
          </GlassPanel>

          {/* CONFIG */}

          <GlassPanel className="p-6 md:p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-2xl bg-white/10 p-3">
                <BrainCircuit className="text-cyan-200" size={22} />
              </div>

              <div>
                <h2 className="text-2xl font-black text-white">
                  Test Configuration
                </h2>

                <p className="text-sm text-slate-400">
                  Configure exam settings before AI generation
                </p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">

              {/* TITLE */}

              <div className="xl:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-300">
                  Test Title
                </label>

                <input
                  value={config.title}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      title: e.target.value,
                    })
                  }
                  placeholder="Enter premium test title..."
                  className="h-14 w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 text-white outline-none transition focus:border-cyan-300/40 focus:bg-white/[0.08]"
                />
              </div>

              {/* PATTERN */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-300">
                  Exam Pattern
                </label>

                <select
                  value={config.examPattern}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      examPattern: e.target.value,
                    })
                  }
                  className="h-14 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 text-white outline-none"
                >
                  {["SSC", "UPSC", "BPSC", "CUSTOM"].map(
                    (item) => (
                      <option key={item}>
                        {item}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* OPTIONS */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-300">
                  Options Count
                </label>

                <select
                  value={config.optionsCount}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      optionsCount: Number(
                        e.target.value
                      ),
                    })
                  }
                  className="h-14 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 text-white outline-none"
                >
                  <option value={4}>4 Options</option>
                  <option value={5}>5 Options</option>
                </select>
              </div>

              {/* MARKS */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-300">
                  Marks
                </label>

                <select
                  value={config.marksPerQuestion}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      marksPerQuestion: Number(
                        e.target.value
                      ),
                    })
                  }
                  className="h-14 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 text-white outline-none"
                >
                  <option value={1}>1 Mark</option>
                  <option value={2}>2 Marks</option>
                  <option value={4}>4 Marks</option>
                </select>
              </div>

              {/* NEGATIVE */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-300">
                  Negative Marking
                </label>

                <select
                  value={config.penaltyRatio}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      penaltyRatio: Number(
                        e.target.value
                      ),
                      negativeMarkingEnabled:
                        Number(e.target.value) > 0,
                    })
                  }
                  className="h-14 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 text-white outline-none"
                >
                  <option value={4}>
                    4 Wrong = -1
                  </option>

                  <option value={3}>
                    3 Wrong = -1
                  </option>

                  <option value={0}>
                    No Negative
                  </option>
                </select>
              </div>

              {/* DURATION */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-300">
                  Duration
                </label>

                <div className="relative">
                  <Clock3
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                  />

                  <input
                    type="number"
                    value={config.durationSeconds}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        durationSeconds: Number(
                          e.target.value
                        ),
                      })
                    }
                    className="h-14 w-full rounded-2xl border border-white/10 bg-white/[0.05] pl-11 pr-4 text-white outline-none"
                  />
                </div>
              </div>

              {/* DESCRIPTION */}

              <div className="md:col-span-2 xl:col-span-4">
                <label className="mb-2 block text-sm font-semibold text-slate-300">
                  Description
                </label>

                <textarea
                  value={config.description}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      description: e.target.value,
                    })
                  }
                  rows={4}
                  placeholder="Describe this premium exam..."
                  className="w-full rounded-3xl border border-white/10 bg-white/[0.05] p-4 text-white outline-none"
                />
              </div>
            </div>
          </GlassPanel>

          {/* UPLOAD */}

          <GlassPanel className="overflow-hidden p-6 md:p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-2xl bg-cyan-500/15 p-3 text-cyan-200">
                <UploadCloud size={22} />
              </div>

              <div>
                <h2 className="text-2xl font-black text-white">
                  Upload Question File
                </h2>

                <p className="text-sm text-slate-400">
                  Drag & drop files with AI auto extraction
                </p>
              </div>
            </div>

            <FileUpload
              type="any"
              fieldName="file"
              onUpload={ingestFile}
            />
          </GlassPanel>

          {/* REVIEW */}

          {parsed && (
            <GlassPanel className="p-6 md:p-8">
              <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-200">
                    <ShieldCheck size={14} />
                    AI Validation Complete
                  </div>

                  <h2 className="mt-4 text-3xl font-black text-white">
                    Review Queue
                  </h2>

                  <p className="mt-2 text-slate-400">
                    {parsed.questions.length} Questions •{" "}
                    {parsed.reviewQueue.length} Need Review •{" "}
                    {parsed.duplicates.length} Duplicates
                  </p>
                </div>

                <PrimaryButton
                  onClick={publish}
                  disabled={saving}
                  className="h-14 px-8"
                >
                  <Rocket size={18} />
                  {saving
                    ? "Creating Premium Test..."
                    : "Create Test"}
                </PrimaryButton>
              </div>

              <div className="space-y-5">
                {parsed.questions.map(
                  (question, index) => {

                    const valid =
                      question.reviewStatus ===
                      "VALID";

                    return (
                      <div
                        key={index}
                        className={`rounded-3xl border p-5 transition ${
                          valid
                            ? "border-emerald-400/20 bg-emerald-500/[0.05]"
                            : "border-yellow-400/20 bg-yellow-500/[0.05]"
                        }`}
                      >

                        {/* TOP */}

                        <div className="mb-4 flex items-start justify-between gap-4">

                          <div className="flex items-center gap-3">
                            <div
                              className={`grid h-10 w-10 place-items-center rounded-2xl font-black ${
                                valid
                                  ? "bg-emerald-500/20 text-emerald-200"
                                  : "bg-yellow-500/20 text-yellow-200"
                              }`}
                            >
                              {index + 1}
                            </div>

                            <div>
                              <div className="font-bold text-white">
                                Question {index + 1}
                              </div>

                              <div className="text-xs text-slate-400">
                                AI Processed
                              </div>
                            </div>
                          </div>

                          {valid ? (
                            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-200">
                              <CheckCircle2 size={14} />
                              Valid
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-2 rounded-full bg-yellow-500/15 px-3 py-1 text-xs font-bold text-yellow-200">
                              <AlertTriangle size={14} />
                              Needs Review
                            </div>
                          )}
                        </div>

                        {/* QUESTION */}

                        <textarea
                          value={question.text}
                          onChange={(e) =>
                            updateQuestion(index, {
                              text: e.target.value,
                            })
                          }
                          className="mb-5 min-h-[120px] w-full rounded-3xl border border-white/10 bg-white/[0.04] p-4 text-white outline-none"
                        />

                        {/* OPTIONS */}

                        <div className="grid gap-3 md:grid-cols-2">

                          {question.options.map(
                            (option, oi) => (
                              <div
                                key={oi}
                                className={`flex items-center gap-3 rounded-2xl border p-4 ${
                                  question.correctAnswers.includes(
                                    oi
                                  )
                                    ? "border-emerald-400/30 bg-emerald-500/[0.08]"
                                    : "border-white/10 bg-white/[0.03]"
                                }`}
                              >

                                <input
                                  type="checkbox"
                                  checked={question.correctAnswers.includes(
                                    oi
                                  )}
                                  onChange={() => {
                                    const exists =
                                      question.correctAnswers.includes(
                                        oi
                                      );

                                    updateQuestion(
                                      index,
                                      {
                                        correctAnswers:
                                          exists
                                            ? question.correctAnswers.filter(
                                                (
                                                  item
                                                ) =>
                                                  item !==
                                                  oi
                                              )
                                            : [
                                                ...question.correctAnswers,
                                                oi,
                                              ],
                                      }
                                    );
                                  }}
                                  className="h-5 w-5"
                                />

                                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/10 font-bold text-white">
                                  {String.fromCharCode(
                                    65 + oi
                                  )}
                                </span>

                                <input
                                  value={option.text}
                                  onChange={(e) =>
                                    updateQuestion(
                                      index,
                                      {
                                        options:
                                          question.options.map(
                                            (
                                              item,
                                              itemIndex
                                            ) =>
                                              itemIndex ===
                                              oi
                                                ? {
                                                    ...item,
                                                    text: e
                                                      .target
                                                      .value,
                                                  }
                                                : item
                                          ),
                                      }
                                    )
                                  }
                                  className="flex-1 bg-transparent text-white outline-none"
                                />
                              </div>
                            )
                          )}
                        </div>

                        {/* NOTES */}

                        {question.reviewNotes
                          ?.length > 0 && (
                          <div className="mt-4 rounded-2xl border border-yellow-400/20 bg-yellow-500/[0.08] p-4 text-sm text-yellow-100">
                            <div className="mb-1 font-bold">
                              AI Review Notes
                            </div>

                            {question.reviewNotes.join(
                              ", "
                            )}
                          </div>
                        )}
                      </div>
                    );
                  }
                )}
              </div>

              <div className="mt-8 flex flex-wrap justify-end gap-3">
                <SecondaryButton
                  onClick={() =>
                    navigate("/tests")
                  }
                >
                  Cancel
                </SecondaryButton>

                <PrimaryButton
                  onClick={publish}
                  disabled={saving}
                >
                  <Rocket size={18} />
                  {saving
                    ? "Publishing..."
                    : "Publish Premium Test"}
                </PrimaryButton>
              </div>
            </GlassPanel>
          )}
        </div>
      </CinematicPage>
    </Layout>
  );
}