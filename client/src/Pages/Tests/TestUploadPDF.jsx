import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import FileUpload from "../../Components/FileUpload";
import axiosInstance from "../../Helper/axiosInstance";
import Layout from "../../Layout/Layout";

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
    formData.append("optionsCount", config.optionsCount);
    formData.append("marksPerQuestion", config.marksPerQuestion);
    const { data } = await axiosInstance.post("/tests/ingest", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    setParsed(data);
    setConfig((prev) => ({
      ...prev,
      title: prev.title || `Imported from ${data.originalName}`,
    }));
    toast.success(`Parsed ${data.questions?.length || 0} questions`);
  };

  const updateQuestion = (index, patch) => {
    setParsed((prev) => ({
      ...prev,
      questions: prev.questions.map((question, qi) => (qi === index ? { ...question, ...patch } : question)),
    }));
  };

  const publish = async () => {
    if (!parsed?.questions?.length) return toast.error("Parse a file first");
    setSaving(true);
    try {
      const { data } = await axiosInstance.post("/tests/from-ingestion", {
        ...config,
        questions: parsed.questions,
      });
      toast.success("Exam created from ingestion");
      navigate(`/tests/take/${data.test._id}`);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to create exam");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div className="mx-auto max-w-6xl space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold">AI Upload Test Builder</h1>
          <p className="text-sm text-gray-500">Upload PDF, Excel, CSV, JPG, or PNG. Invalid questions enter manual review.</p>
        </div>

        <section className="grid gap-4 rounded-lg bg-white p-5 shadow md:grid-cols-4">
          <input value={config.title} onChange={(e) => setConfig({ ...config, title: e.target.value })} className="rounded border p-2 md:col-span-2" placeholder="Test title" />
          <select value={config.examPattern} onChange={(e) => setConfig({ ...config, examPattern: e.target.value })} className="rounded border p-2">
            {["SSC", "UPSC", "BPSC", "CUSTOM"].map((item) => <option key={item}>{item}</option>)}
          </select>
          <select value={config.optionsCount} onChange={(e) => setConfig({ ...config, optionsCount: Number(e.target.value) })} className="rounded border p-2">
            <option value={4}>4 options</option>
            <option value={5}>5 options</option>
          </select>
          <select value={config.marksPerQuestion} onChange={(e) => setConfig({ ...config, marksPerQuestion: Number(e.target.value) })} className="rounded border p-2">
            <option value={1}>1 mark</option>
            <option value={4}>4 marks</option>
          </select>
          <select value={config.penaltyRatio} onChange={(e) => setConfig({ ...config, penaltyRatio: Number(e.target.value), negativeMarkingEnabled: Number(e.target.value) > 0 })} className="rounded border p-2">
            <option value={4}>4 wrong = -1</option>
            <option value={3}>3 wrong = -1</option>
            <option value={0}>No negative</option>
          </select>
          <input type="number" value={config.durationSeconds} onChange={(e) => setConfig({ ...config, durationSeconds: Number(e.target.value) })} className="rounded border p-2" placeholder="Duration seconds" />
          <textarea value={config.description} onChange={(e) => setConfig({ ...config, description: e.target.value })} className="rounded border p-2 md:col-span-4" placeholder="Description" />
        </section>

        <FileUpload type="any" fieldName="file" onUpload={ingestFile} />

        {parsed && (
          <section className="rounded-lg bg-white p-5 shadow">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Review Queue</h2>
                <p className="text-sm text-gray-500">
                  {parsed.questions.length} parsed · {parsed.reviewQueue.length} need review · {parsed.duplicates.length} duplicates
                </p>
              </div>
              <button onClick={publish} disabled={saving} className="rounded bg-indigo-600 px-4 py-2 font-semibold text-white disabled:opacity-60">
                {saving ? "Creating" : "Create Test"}
              </button>
            </div>

            <div className="space-y-3">
              {parsed.questions.map((question, index) => (
                <div key={index} className={`rounded border p-3 ${question.reviewStatus === "VALID" ? "border-green-200" : "border-yellow-300 bg-yellow-50"}`}>
                  <textarea value={question.text} onChange={(e) => updateQuestion(index, { text: e.target.value })} className="mb-2 w-full rounded border p-2" />
                  <div className="grid gap-2 md:grid-cols-2">
                    {question.options.map((option, oi) => (
                      <div key={oi} className="flex items-center gap-2 rounded border bg-white p-2">
                        <input
                          type="checkbox"
                          checked={question.correctAnswers.includes(oi)}
                          onChange={() => {
                            const exists = question.correctAnswers.includes(oi);
                            updateQuestion(index, {
                              correctAnswers: exists
                                ? question.correctAnswers.filter((item) => item !== oi)
                                : [...question.correctAnswers, oi],
                            });
                          }}
                        />
                        <input
                          value={option.text}
                          onChange={(e) =>
                            updateQuestion(index, {
                              options: question.options.map((item, itemIndex) => itemIndex === oi ? { ...item, text: e.target.value } : item),
                            })
                          }
                          className="flex-1 outline-none"
                        />
                      </div>
                    ))}
                  </div>
                  {question.reviewNotes?.length > 0 && <p className="mt-2 text-sm text-yellow-700">{question.reviewNotes.join(", ")}</p>}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
}
