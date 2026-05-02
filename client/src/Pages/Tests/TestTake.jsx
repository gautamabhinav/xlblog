import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../Layout/Layout';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTest, submitAttempt } from '../../Redux/testSlice';

export default function TestTake(){
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const test = useSelector((s) => s.tests.current);
  const loading = useSelector((s) => s.tests.loading.current);
  const auth = useSelector((s) => s.auth || {});

  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const timerRef = useRef();
  const [existingAttempt, setExistingAttempt] = useState(null);

  useEffect(()=>{
    dispatch(fetchTest(id));
  },[dispatch, id]);

  // fetch if current user has attempts for this test
  useEffect(()=>{
    let mounted = true;
    async function check() {
      try{
        const res = await fetch(`/api/v1/tests/attempts/me?testId=${id}`, { credentials: 'include' });
        if (!mounted) return;
        if (res.ok) {
          const data = await res.json();
          const arr = data.attempts || [];
          if (arr.length>0) setExistingAttempt(arr[0]);
        }
      }catch(e){ console.error(e); }
    }
    check();
    return ()=> { mounted = false }
  },[id]);

  useEffect(()=>{
    if(test) setTimeLeft(test.durationSeconds || 300);
  },[test]);

  useEffect(()=>{
    if(!timeLeft) return;
    timerRef.current = setInterval(()=>{
      setTimeLeft(t=>{
        if(t<=1){ clearInterval(timerRef.current); handleSubmit(); return 0 }
        return t-1;
      })
    },1000);
    return ()=> clearInterval(timerRef.current);
  },[timeLeft]);

  const selectOption = (qId, idx)=>{
    setAnswers(prev=>{
      const others = prev.filter(a=>String(a.questionId)!==String(qId));
      return [...others, { questionId: qId, selectedOptionIndex: idx }];
    })
  }

  const handleSubmit = async ()=>{
    try{
      const payload = { testId: id, answers, durationSeconds: (test?.durationSeconds - timeLeft) };
      const res = await dispatch(submitAttempt({ id, payload })).unwrap();
      const attemptId = res.attempt?._id || res.attemptId || (res.attempt && res.attempt._id);
      navigate(`/tests/result/${attemptId}`, { state: { analysis: res.analysis } });
    }catch(err){ console.error(err); }
  }

  if(loading || !test) return <div className="p-6">Loading test...</div>

  const q = test.questions[currentIndex];
  const selectedForQ = answers.find(a=>String(a.questionId)===String(q._id))?.selectedOptionIndex;

  return (
    <Layout>
      <div className="p-6 max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* If user already took this test show banner */}
        {existingAttempt && (
          <div className="lg:col-span-3 mb-4">
            <div className="p-4 bg-yellow-100 rounded border-l-4 border-yellow-400 flex items-center justify-between">
              <div>
                <div className="font-semibold">You have already taken this test.</div>
                <div className="text-sm text-gray-700">Score: {existingAttempt.score} / {existingAttempt.maxScore} • Taken at: {new Date(existingAttempt.createdAt).toLocaleString()}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={()=> navigate(`/tests/result/${existingAttempt._id}`)} className="px-3 py-2 rounded bg-indigo-600 text-white">View Result</button>
                <button onClick={()=>{ setExistingAttempt(null); setAnswers([]); setTimeLeft(test.durationSeconds || 300); }} className="px-3 py-2 rounded bg-green-600 text-white">Retake</button>
              </div>
            </div>
          </div>
        )}
        {/* Main */}
        <div className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold">{test.title}</h2>
            <div className="text-sm text-gray-600">Time left: {Math.floor(timeLeft/60)}:{String(timeLeft%60).padStart(2,'0')}</div>
          </div>

          <div className="bg-white p-6 rounded shadow">
            <div className="text-lg font-medium mb-3">Question {currentIndex+1} of {test.questions.length}</div>
            <div className="mb-4 text-gray-800">{q.text}</div>
            <div className="grid gap-3">
              {q.options.map((opt, oi)=> (
                <button key={oi} onClick={()=>selectOption(q._id, oi)} className={`text-left p-3 rounded border ${selectedForQ===oi? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white hover:bg-gray-100'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full border flex items-center justify-center ${selectedForQ===oi? 'bg-white text-indigo-600':'text-gray-600'}`}>
                      {String.fromCharCode(65+oi)}
                    </div>
                    <div>{opt.text}</div>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between">
              <div className="flex gap-2">
                <button onClick={()=>setCurrentIndex(i=>Math.max(0,i-1))} className="px-3 py-2 rounded border">Previous</button>
                <button onClick={()=>setCurrentIndex(i=>Math.min(test.questions.length-1,i+1))} className="px-3 py-2 rounded border">Next</button>
              </div>
              <div className="flex gap-2">
                <button onClick={handleSubmit} className="px-4 py-2 rounded bg-green-600 text-white">Submit Test</button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          <div className="p-4 bg-white rounded shadow text-center">
            <div className="text-sm text-gray-500">Progress</div>
            <div className="mt-2 font-semibold">{answers.length} answered / {test.questions.length}</div>
            <div className="w-full h-3 bg-gray-200 rounded mt-3 overflow-hidden">
              <div className="h-full bg-indigo-600" style={{ width: `${(answers.length/test.questions.length)*100}%` }} />
            </div>
          </div>

          <div className="p-4 bg-white rounded shadow">
            <div className="text-sm text-gray-500">Jump to question</div>
            <div className="mt-3 grid grid-cols-6 gap-2">
              {test.questions.map((qq, i) => (
                <button key={qq._id} onClick={()=>setCurrentIndex(i)} className={`p-2 rounded ${answers.find(a=>String(a.questionId)===String(qq._id))? 'bg-green-100':'bg-gray-100'}`}>{i+1}</button>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </Layout>
  )
}
