import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import Layout from "../../Layout/Layout";
import { fetchTest, submitAttempt } from "../../Redux/testSlice";

const formatTime = (seconds) =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

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

  useEffect(() => {
    dispatch(fetchTest(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (test) setTimeLeft(test.durationSeconds || 300);
  }, [test]);

  const persistQuestionTime = () => {
    const questionId = test?.questions?.[currentIndex]?._id;
    if (!questionId) return;
    const elapsed = Math.max(0, Math.round((Date.now() - questionStartedAt.current) / 1000));
    timeSpent.current[questionId] = (timeSpent.current[questionId] || 0) + elapsed;
    questionStartedAt.current = Date.now();
  };

  const goTo = (index) => {
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
    const payload = buildPayload(autoSubmitted);
    const response = await dispatch(submitAttempt({ id, payload })).unwrap();
    navigate(`/tests/result/${response.attempt?._id}`, {
      state: { analysis: response.analysis, attempt: response.attempt },
    });
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
          if (test?.pattern?.antiCheat?.autoSubmitOnViolation && next.tabSwitches > limit) {
            setTimeout(() => handleSubmit(true), 0);
          }
          return next;
        });
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [test, violations]);

  const currentQuestion = test?.questions?.[currentIndex];
  const selected = answers[currentQuestion?._id] || [];
  const answeredCount = useMemo(
    () => Object.values(answers).filter((value) => value.length).length,
    [answers]
  );

  const toggleOption = (optionIndex) => {
    const questionId = currentQuestion._id;
    setAnswers((prev) => {
      const current = prev[questionId] || [];
      const multi = currentQuestion.options.length === 5;
      const next = multi
        ? current.includes(optionIndex)
          ? current.filter((idx) => idx !== optionIndex)
          : [...current, optionIndex]
        : [optionIndex];
      return { ...prev, [questionId]: next };
    });
  };

  if (loading || !test) return <div className="p-6">Loading exam...</div>;

  return (
    <Layout>
      <div className="grid gap-6 p-6 lg:grid-cols-[1fr_320px]">
        <main className="rounded-lg bg-white p-6 shadow">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold">{test.title}</h1>
              <p className="text-sm text-gray-500">
                Q{currentIndex + 1}/{test.questions.length} · Marks {currentQuestion.marks || test.marksPerQuestion || 1}
              </p>
            </div>
            <div className="rounded bg-gray-900 px-4 py-2 font-mono text-lg text-white">{formatTime(timeLeft)}</div>
          </div>

          <div className="mb-5 text-lg font-medium">{currentQuestion.text}</div>

          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                type="button"
                onClick={() => toggleOption(index)}
                className={`flex w-full items-center gap-3 rounded border p-3 text-left transition ${
                  selected.includes(index) ? "border-indigo-600 bg-indigo-50" : "hover:bg-gray-50"
                }`}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 font-semibold">
                  {String.fromCharCode(65 + index)}
                </span>
                {option.text}
              </button>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap justify-between gap-3">
            <div className="flex gap-2">
              <button type="button" onClick={() => goTo(currentIndex - 1)} className="rounded border px-4 py-2">Previous</button>
              <button type="button" onClick={() => goTo(currentIndex + 1)} className="rounded border px-4 py-2">Save & Next</button>
              <button type="button" onClick={() => setMarked((prev) => ({ ...prev, [currentQuestion._id]: !prev[currentQuestion._id] }))} className="rounded bg-purple-100 px-4 py-2 text-purple-700">
                {marked[currentQuestion._id] ? "Unmark" : "Mark for Review"}
              </button>
            </div>
            <button type="button" onClick={() => window.confirm("Submit exam now?") && handleSubmit(false)} className="rounded bg-green-600 px-5 py-2 font-semibold text-white">
              Submit
            </button>
          </div>
        </main>

        <aside className="space-y-4">
          <div className="rounded-lg bg-white p-4 shadow">
            <div className="text-sm text-gray-500">Progress</div>
            <div className="mt-2 text-xl font-semibold">{answeredCount}/{test.questions.length}</div>
            <div className="mt-3 text-xs text-red-600">Tab switches: {violations.tabSwitches}</div>
          </div>
          <div className="rounded-lg bg-white p-4 shadow">
            <div className="mb-3 text-sm font-medium">Question Navigator</div>
            <div className="grid grid-cols-5 gap-2">
              {test.questions.map((question, index) => {
                const isAnswered = answers[question._id]?.length;
                const isMarked = marked[question._id];
                return (
                  <button
                    key={question._id}
                    type="button"
                    onClick={() => goTo(index)}
                    className={`rounded p-2 text-sm ${
                      index === currentIndex
                        ? "bg-indigo-600 text-white"
                        : isMarked
                        ? "bg-purple-100 text-purple-700"
                        : isAnswered
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100"
                    }`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </aside>
      </div>
    </Layout>
  );
}
