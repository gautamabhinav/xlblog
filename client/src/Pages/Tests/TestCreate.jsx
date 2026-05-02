import React, { useState } from 'react';
import Layout from '../../Layout/Layout';
import axiosInstance from '../../Helper/axiosInstance';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function TestCreate(){
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(5);
  const [questions, setQuestions] = useState([
    { text: '', options: [{ text: '' }, { text: '' }, { text: '' }, { text: '' }], correctIndex: 0 }
  ]);

  const navigate = useNavigate();

  const addQuestion = () => setQuestions(qs => ([...qs, { text: '', options: [{ text: '' }, { text: '' }, { text: '' }, { text: '' }], correctIndex: 0 }]));
  const removeQuestion = (i) => setQuestions(qs => qs.filter((_, idx) => idx !== i));

  const updateQuestionText = (i, val) => setQuestions(qs => qs.map((q, idx) => idx===i ? { ...q, text: val } : q));
  const updateOptionText = (qi, oi, val) => setQuestions(qs => qs.map((q, idx) => idx===qi ? { ...q, options: q.options.map((o, j)=> j===oi? { text: val } : o), correctIndex: q.correctIndex } : q));
  const setCorrect = (qi, oi) => setQuestions(qs => qs.map((q, idx) => idx===qi ? { ...q, correctIndex: oi } : q));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try{
      const payload = {
        title,
        description,
        durationSeconds: Number(duration)*60,
        questions: questions.map(q => ({ text: q.text, options: q.options.map(o=> ({ text: o.text, isCorrect: false })), }))
      };
      // set correct flags
      payload.questions.forEach((q, qi)=>{
        const idx = questions[qi].correctIndex || 0;
        if(q.options[idx]) q.options[idx].isCorrect = true;
      });

      const res = await axiosInstance.post('/tests', payload);
      toast.success('Test created');
      navigate('/tests');
    }catch(err){
      console.error(err);
      toast.error(err?.response?.data?.message || 'Failed to create test');
    }
  }

  return (
    <Layout>
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Create Test</h1>
        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded shadow">
          <div>
            <label className="block text-sm font-medium">Title</label>
            <input value={title} onChange={e=>setTitle(e.target.value)} className="mt-1 w-full p-2 border rounded" required />
          </div>
          <div>
            <label className="block text-sm font-medium">Description</label>
            <textarea value={description} onChange={e=>setDescription(e.target.value)} className="mt-1 w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium">Duration (minutes)</label>
            <input type="number" min={1} value={duration} onChange={e=>setDuration(e.target.value)} className="mt-1 p-2 border rounded w-32" />
          </div>

          <div className="space-y-4">
            {questions.map((q, qi) => (
              <div key={qi} className="p-4 border rounded">
                <div className="flex justify-between items-center mb-2">
                  <div className="font-semibold">Question {qi+1}</div>
                  <div className="flex gap-2">
                    <button type="button" onClick={()=>removeQuestion(qi)} className="text-red-600">Remove</button>
                  </div>
                </div>
                <input value={q.text} onChange={e=>updateQuestionText(qi, e.target.value)} placeholder="Question text" className="w-full p-2 border rounded mb-3" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {q.options.map((opt, oi) => (
                    <div key={oi} className="flex items-center gap-2">
                      <input type="radio" name={`correct-${qi}`} checked={q.correctIndex===oi} onChange={()=>setCorrect(qi, oi)} />
                      <input value={opt.text} onChange={e=>updateOptionText(qi, oi, e.target.value)} placeholder={`Option ${oi+1}`} className="flex-1 p-2 border rounded" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={addQuestion} className="px-4 py-2 bg-gray-200 rounded">Add Question</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded">Create Test</button>
          </div>
        </form>
      </div>
    </Layout>
  )
}
