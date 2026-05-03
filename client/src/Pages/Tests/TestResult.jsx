import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import Layout from '../../Layout/Layout';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAttempt } from '../../Redux/testSlice';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export default function TestResult() {
  const { id } = useParams();
  const loc = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const auth = useSelector((state) => state.auth || {});

  const [showAnswers, setShowAnswers] = useState(true);
  const currentUserRole = auth?.role || "";

  const attempt = useSelector((s) => s.tests.attempt);
  const loading = useSelector((s) => s.tests.loading.attempt);

  /* ---------------- FETCH ATTEMPT ---------------- */
  useEffect(() => {
    if (!loc.state?.analysis && id) {
      dispatch(fetchAttempt(id));
    }
  }, [dispatch, id, loc.state]);

  /* ---------------- SAFE RAW DATA ---------------- */
  const raw = loc.state?.analysis
    ? {
        analysis: loc.state.analysis,
        attempt: loc.state.attempt,
      }
    : (attempt || {});

  const analysis = raw.analysis || attempt?.analysis || null;
  const attemptObj = raw.attempt || attempt || null;

  
  /* ---------------- SAFE COMPUTATION ---------------- */
  const data = useMemo(() => {
    if (analysis) return analysis;

    const score = attemptObj?.score ?? 0;
    const maxScore =
      attemptObj?.maxScore ??
      attemptObj?.test?.questions?.length ??
      0;

    const percent = maxScore
      ? Math.round((score / Math.max(1, maxScore)) * 100)
      : 0;

    let perQuestion =
      attemptObj?.analysis?.perQuestion ||
      attemptObj?.perQuestion ||
      [];

    /* reconstruct if missing */
    if (
      (!perQuestion || perQuestion.length === 0) &&
      attemptObj?.answers &&
      attemptObj?.test?.questions
    ) {
      perQuestion = attemptObj.test.questions.map((q) => {
        const provided = (attemptObj.answers || []).find(
          (a) => String(a.questionId) === String(q._id)
        );

        const correctIndex = (q.options || []).findIndex(
          (o) => o.isCorrect
        );

        const selected = provided?.selectedOptionIndex ?? null;

        const got = selected === correctIndex ? 1 : 0;

        return {
          questionId: q._id,
          text: q.text,
          correctIndex,
          selected,
          got,
          options: q.options?.map((o) => o.text) || [],
        };
      });
    }

    return {
      score,
      maxScore,
      percent,
      perQuestion,
      topicWise: attemptObj?.analytics?.topicWise || [],
      difficultyWise: attemptObj?.analytics?.difficultyWise || [],
      heatmap: attemptObj?.analytics?.heatmap || [],
      weakAreas: attemptObj?.analytics?.weakAreas || [],
      strongAreas: attemptObj?.analytics?.strongAreas || [],
      wrong: (perQuestion || []).filter((p) => p.got === 0),
    };
  }, [analysis, attemptObj]);

  /* ---------------- SAFE VALUES ---------------- */
  const timeTaken = attemptObj?.durationSeconds ?? null;

  const formattedTime =
    timeTaken !== null
      ? `${Math.floor(timeTaken / 60)}m ${timeTaken % 60}s`
      : '—';

  const correctCount =
    data.perQuestion?.filter((p) => p.got === 1).length ?? 0;

  /* ---------------- ACTIONS ---------------- */
  const handleRetake = () => {
    const testId = attemptObj?.test?._id || attemptObj?.test;

    if (testId) navigate(`/tests/take/${testId}`);
    else navigate('/tests');
  };

  const handleDownload = () => {
    const payload = { attempt: attemptObj, analysis: data };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `test-result-${attemptObj?._id || 'result'}.json`;
    a.click();

    URL.revokeObjectURL(url);
  };


  /* ---------------- LOADING GUARD ---------------- */
  if (loading || (!analysis && !attemptObj)) {
    return <div className="p-6">Loading result...</div>;
  }

  /* ---------------- UI ---------------- */
  return (
    <Layout>
      <div className="p-6 max-w-5xl mx-auto">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold">
              {attemptObj?.test?.title || 'Test Result'}
            </h2>
            <div className="text-sm text-gray-500">
              Taken on{' '}
              {attemptObj?.createdAt
                ? new Date(attemptObj.createdAt).toLocaleString()
                : '—'}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleRetake}
              className="px-3 py-2 rounded bg-indigo-600 text-white"
            >
              Retake
            </button>

              <button
                onClick={() => {
                  const testId = attemptObj?.test?._id || attemptObj?.test;
                  if (testId) navigate(`/tests/${testId}/leaderboard`);
                }}
                className="px-3 py-2 rounded bg-yellow-600 text-white"
              >
                Leaderboard
              </button>

            {( currentUserRole === 'USER') && (
                <>
                  <button onClick={() => navigate('/tests/attempts')} className="px-3 py-2 rounded bg-green-600 text-white">View Attempts</button>
                </>
              )}

            <button
              onClick={handleDownload}
              className="px-3 py-2 rounded bg-gray-200"
            >
              Download
            </button>

            <button
              onClick={() => window.print()}
              className="px-3 py-2 rounded bg-gray-200"
            >
              Print
            </button>
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT */}
          <div className="lg:col-span-2">

            {/* SCORE CARD */}
            <div className="bg-white p-6 rounded shadow mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-semibold">
                    Score: {data.score} / {data.maxScore}
                  </div>
                  <div className="text-sm text-gray-500">
                    Accuracy: {data.percent}% • Time: {formattedTime}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-green-600 font-semibold">
                    {correctCount} correct
                  </div>
                  <div className="text-red-600">
                    {(data.perQuestion?.length || 0) - correctCount} wrong
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded shadow mb-6">
              <h3 className="font-semibold mb-3">Topic-wise Performance</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.topicWise || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="accuracy" fill="#4f46e5" name="Accuracy %" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded shadow mb-6">
              <h3 className="font-semibold mb-3">Attempt Heatmap</h3>
              <div className="grid grid-cols-10 gap-2">
                {(data.heatmap || []).map((item) => (
                  <div
                    key={item.questionNumber}
                    title={`Q${item.questionNumber}: ${item.status}, ${item.timeSpentSeconds}s`}
                    className={`rounded p-2 text-center text-xs ${
                      item.status === 'CORRECT'
                        ? 'bg-green-100 text-green-700'
                        : item.status === 'WRONG'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {item.questionNumber}
                  </div>
                ))}
              </div>
            </div>

            {/* QUESTIONS */}
            <div className="space-y-4">
              {(data.perQuestion || []).map((q, idx) => {
                const correctIdx = q.correctIndex;
                const selected = q.selected;
                const isCorrect = q.got === 1;

                return (
                  <div
                    key={q.questionId || idx}
                    className="p-4 bg-white rounded shadow"
                  >
                    <div className="flex items-start justify-between">

                      <div>
                        <div className="font-medium">
                          {idx + 1}. {q.text}
                        </div>

                        <div className="mt-2 space-y-2">
                          {(q.options || []).map((optText, oi) => {
                            const isSelected = selected === oi;
                            const isAnswer = correctIdx === oi;

                            return (
                              <div
                                key={oi}
                                className={`p-3 rounded border flex items-center gap-3 ${
                                  isAnswer
                                    ? 'bg-green-100 border-green-400'
                                    : isSelected
                                    ? 'bg-yellow-100 border-yellow-400'
                                    : 'bg-white'
                                }`}
                              >
                                <div className="w-6 h-6 rounded-full flex items-center justify-center text-sm bg-gray-100">
                                  {String.fromCharCode(65 + oi)}
                                </div>

                                <div className="flex-1">
                                  {optText}
                                </div>

                                {isSelected && (
                                  <div className="text-sm text-indigo-700">
                                    Your choice
                                  </div>
                                )}

                                {isAnswer && (
                                  <div className="text-sm text-green-700">
                                    Correct
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="ml-4 text-sm text-right">
                        {isCorrect ? (
                          <div className="text-green-600 font-semibold">
                            Correct
                          </div>
                        ) : (
                          <div className="text-red-600 font-semibold">
                            Incorrect
                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SIDEBAR */}
          <aside>
            <div className="bg-white p-4 rounded shadow mb-4">
              <div className="text-sm text-gray-500">Summary</div>
              <div className="mt-2 font-semibold">
                {data.score} / {data.maxScore}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Accuracy: {data.percent}%
              </div>
              <div className="text-xs text-gray-500">
                Time: {formattedTime}
              </div>
            </div>

            <div className="bg-white p-4 rounded shadow">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium">
                  Review Options
                </div>
                <button
                  onClick={() => setShowAnswers((s) => !s)}
                  className="text-sm text-indigo-600"
                >
                  Toggle
                </button>
              </div>

              <div className="text-sm text-gray-600">
                Showing correct answers:{' '}
                {showAnswers ? 'Yes' : 'No'}
              </div>
            </div>
          </aside>

        </div>
      </div>
    </Layout>
  );
}
