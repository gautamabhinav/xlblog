import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Plus, Save, Trash2 } from "lucide-react";

import axiosInstance from "../../Helper/axiosInstance";
import Layout from "../../Layout/Layout";

const questionCounts = [10, 20, 50, 80, 100, 120, 150];
const durations = [
  { label: "1 min", value: 60 },
  { label: "2 min", value: 120 },
  { label: "5 min", value: 300 },
  { label: "10 min", value: 600 },
  { label: "20 min", value: 1200 },
  { label: "30 min", value: 1800 },
  { label: "1 hr", value: 3600 },
  { label: "2 hr", value: 7200 },
  { label: "2.5 hr", value: 9000 },
];

const createQuestion = (optionsCount = 4, marks = 1) => ({
  text: "",
  topic: "General",
  difficulty: "MEDIUM",
  marks,
  options: Array.from({ length: optionsCount }, () => ({ text: "" })),
  correctAnswers: [0],
});

export default function TestCreate() {
  const navigate = useNavigate();
  const [config, setConfig] = useState({
    title: "",
    description: "",
    examPattern: "SSC",
    totalQuestions: 10,
    durationSeconds: 600,
    optionsCount: 4,
    marksPerQuestion: 1,
    negativeMarkingEnabled: true,
    penaltyRatio: 4,
    status: "PUBLISHED",
    fullscreenRequired: false,
    maxTabSwitches: 3,
    autoSubmitOnViolation: false,
  });
  const [questions, setQuestions] = useState([createQuestion(4, 1)]);
  const [saving, setSaving] = useState(false);

  const scoreFormula = useMemo(() => {
    if (!config.negativeMarkingEnabled) return "score = correct * marks";
    return `score = correct * ${config.marksPerQuestion} - (wrong / ${config.penaltyRatio})`;
  }, [config]);

  const updateConfig = (key, value) => {
    setConfig((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "examPattern") {
        if (value === "SSC") next.penaltyRatio = 4;
        if (value === "UPSC") next.penaltyRatio = 3;
        if (value === "BPSC") next.negativeMarkingEnabled = false;
      }
      if (key === "optionsCount") {
        setQuestions((qs) =>
          qs.map((q) => ({
            ...q,
            options: Array.from({ length: Number(value) }, (_, i) => q.options[i] || { text: "" }),
            correctAnswers: q.correctAnswers.filter((idx) => idx < Number(value)).length
              ? q.correctAnswers.filter((idx) => idx < Number(value))
              : [0],
          }))
        );
      }
      if (key === "marksPerQuestion") {
        setQuestions((qs) => qs.map((q) => ({ ...q, marks: Number(value) })));
      }
      return next;
    });
  };

  const updateQuestion = (index, patch) => {
    setQuestions((qs) => qs.map((q, i) => (i === index ? { ...q, ...patch } : q)));
  };

  const updateOption = (questionIndex, optionIndex, text) => {
    setQuestions((qs) =>
      qs.map((q, qi) =>
        qi === questionIndex
          ? {
              ...q,
              options: q.options.map((option, oi) => (oi === optionIndex ? { text } : option)),
            }
          : q
      )
    );
  };

  const toggleCorrect = (questionIndex, optionIndex) => {
    setQuestions((qs) =>
      qs.map((q, qi) => {
        if (qi !== questionIndex) return q;
        const exists = q.correctAnswers.includes(optionIndex);
        const correctAnswers = exists
          ? q.correctAnswers.filter((idx) => idx !== optionIndex)
          : [...q.correctAnswers, optionIndex];
        return { ...q, correctAnswers: correctAnswers.length ? correctAnswers : [optionIndex] };
      })
    );
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...config,
        questions: questions.map((question) => ({
          ...question,
          options: question.options.map((option, index) => ({
            text: option.text,
            isCorrect: question.correctAnswers.includes(index),
          })),
        })),
      };
      await axiosInstance.post("/tests", payload);
      toast.success("Exam created successfully");
      navigate("/tests");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to create exam");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <form onSubmit={submit} className="mx-auto max-w-6xl space-y-6 p-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Manual Govt Exam Builder</h1>
            <p className="text-sm text-gray-500">{scoreFormula}</p>
          </div>
          <button disabled={saving} className="inline-flex items-center gap-2 rounded bg-indigo-600 px-4 py-2 font-semibold text-white disabled:opacity-60">
            <Save size={18} /> {saving ? "Saving" : "Create Exam"}
          </button>
        </div>

        <section className="grid gap-4 rounded-lg bg-white p-5 shadow md:grid-cols-4">
          <label className="md:col-span-2">
            <span className="text-sm font-medium">Title</span>
            <input value={config.title} onChange={(e) => updateConfig("title", e.target.value)} className="mt-1 w-full rounded border p-2" required />
          </label>
          <label>
            <span className="text-sm font-medium">Pattern</span>
            <select value={config.examPattern} onChange={(e) => updateConfig("examPattern", e.target.value)} className="mt-1 w-full rounded border p-2">
              {["SSC", "UPSC", "BPSC", "CUSTOM"].map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label>
            <span className="text-sm font-medium">Questions</span>
            <select value={config.totalQuestions} onChange={(e) => updateConfig("totalQuestions", Number(e.target.value))} className="mt-1 w-full rounded border p-2">
              {questionCounts.map((count) => <option key={count} value={count}>{count}</option>)}
            </select>
          </label>
          <label>
            <span className="text-sm font-medium">Duration</span>
            <select value={config.durationSeconds} onChange={(e) => updateConfig("durationSeconds", Number(e.target.value))} className="mt-1 w-full rounded border p-2">
              {durations.map((duration) => <option key={duration.value} value={duration.value}>{duration.label}</option>)}
            </select>
          </label>
          <label>
            <span className="text-sm font-medium">Options</span>
            <select value={config.optionsCount} onChange={(e) => updateConfig("optionsCount", Number(e.target.value))} className="mt-1 w-full rounded border p-2">
              <option value={4}>4 options</option>
              <option value={5}>5 options</option>
            </select>
          </label>
          <label>
            <span className="text-sm font-medium">Marks</span>
            <select value={config.marksPerQuestion} onChange={(e) => updateConfig("marksPerQuestion", Number(e.target.value))} className="mt-1 w-full rounded border p-2">
              <option value={1}>1 mark</option>
              <option value={4}>4 marks</option>
            </select>
          </label>
          <label>
            <span className="text-sm font-medium">Penalty</span>
            <select value={config.negativeMarkingEnabled ? config.penaltyRatio : 0} onChange={(e) => {
              const ratio = Number(e.target.value);
              updateConfig("negativeMarkingEnabled", ratio > 0);
              updateConfig("penaltyRatio", ratio);
            }} className="mt-1 w-full rounded border p-2">
              <option value={4}>4 wrong = -1</option>
              <option value={3}>3 wrong = -1</option>
              <option value={0}>No negative</option>
            </select>
          </label>
          <label className="md:col-span-4">
            <span className="text-sm font-medium">Description</span>
            <textarea value={config.description} onChange={(e) => updateConfig("description", e.target.value)} className="mt-1 w-full rounded border p-2" rows={2} />
          </label>
        </section>

        <section className="space-y-4">
          {questions.map((question, qi) => (
            <div key={qi} className="rounded-lg bg-white p-5 shadow">
              <div className="mb-3 flex items-center justify-between">
                <div className="font-semibold">Question {qi + 1}</div>
                <button type="button" onClick={() => setQuestions((qs) => qs.filter((_, i) => i !== qi))} className="rounded p-2 text-red-600 hover:bg-red-50">
                  <Trash2 size={18} />
                </button>
              </div>
              <textarea value={question.text} onChange={(e) => updateQuestion(qi, { text: e.target.value })} placeholder="Question text" className="mb-3 w-full rounded border p-2" required />
              <div className="mb-3 grid gap-3 md:grid-cols-3">
                <input value={question.topic} onChange={(e) => updateQuestion(qi, { topic: e.target.value })} className="rounded border p-2" placeholder="Topic" />
                <select value={question.difficulty} onChange={(e) => updateQuestion(qi, { difficulty: e.target.value })} className="rounded border p-2">
                  {["EASY", "MEDIUM", "HARD"].map((item) => <option key={item}>{item}</option>)}
                </select>
                <select value={question.marks} onChange={(e) => updateQuestion(qi, { marks: Number(e.target.value) })} className="rounded border p-2">
                  <option value={1}>1 mark</option>
                  <option value={4}>4 marks</option>
                </select>
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                {question.options.map((option, oi) => (
                  <label key={oi} className="flex items-center gap-2 rounded border p-2">
                    <input type="checkbox" checked={question.correctAnswers.includes(oi)} onChange={() => toggleCorrect(qi, oi)} />
                    <span className="w-6 text-sm font-semibold">{String.fromCharCode(65 + oi)}</span>
                    <input value={option.text} onChange={(e) => updateOption(qi, oi, e.target.value)} className="flex-1 outline-none" placeholder={`Option ${oi + 1}`} required />
                  </label>
                ))}
              </div>
            </div>
          ))}
        </section>

        <button type="button" onClick={() => setQuestions((qs) => [...qs, createQuestion(config.optionsCount, config.marksPerQuestion)])} className="inline-flex items-center gap-2 rounded bg-gray-200 px-4 py-2 font-semibold">
          <Plus size={18} /> Add Question
        </button>
      </form>
    </Layout>
  );
}
