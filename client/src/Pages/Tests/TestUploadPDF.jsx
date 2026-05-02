import React, { useState, useMemo } from 'react';
import Layout from '../../Layout/Layout';
import api from '../../Helper/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { DndContext, closestCenter } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DragOverlay } from '@dnd-kit/core';
import toast from 'react-hot-toast';



// small helper to deep-clone parsed object and add local ids
const deepClone = (v) => {
  try { return structuredClone(v); } catch (e) { return JSON.parse(JSON.stringify(v)); }
}

const prepareEditable = (parsed) => {
  if (!parsed) return null;
  const parsedCopy = deepClone(parsed);
  const q = (parsedCopy.questions || []).map((question, qi) => ({
    _localId: question._id || `q-${Date.now()}-${qi}-${Math.random().toString(36).slice(2,7)}`,
    text: question.text || '',
    options: (question.options || []).map((o, oi) => ({ text: o.text || '', isCorrect: !!o.isCorrect })),
  }));
  return { title: parsedCopy.title || '', questions: q };
}

export default function TestUploadPDF(){
  const [file, setFile] = useState(null);
  const [files, setFiles] = useState([]); // for multiple PDFs
  const [useOcr, setUseOcr] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [created, setCreated] = useState(null);
  const [createdWarning, setCreatedWarning] = useState(null);
  const [createdDebug, setCreatedDebug] = useState(null);
  const [preview, setPreview] = useState(null); // original parsed data (immutable)
  const [editable, setEditable] = useState(null); // user editable copy
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [draggingId, setDraggingId] = useState(null);
  const [showConfirmImport, setShowConfirmImport] = useState(false);
  const [showConfirmUpload, setShowConfirmUpload] = useState(false);
  
  const navigate = useNavigate();

  // validation state derived from editable
  const validation = useMemo(() => {
    if (!editable) return { total: 0, valid: 0, invalid: 0, items: [] };
    const items = editable.questions.map((q, idx) => {
      const issues = [];
      if (!q.text || !q.text.trim()) issues.push('Question text is empty');
      if (!Array.isArray(q.options) || q.options.length < 2) issues.push('Must have 2–4 options');
      if (q.options && q.options.length > 4) issues.push('Must have 2–4 options');
      let correctCount = 0;
      if (Array.isArray(q.options)) {
        q.options.forEach((o, oi) => {
          if (!o.text || !o.text.trim()) issues.push(`Option ${oi+1} is empty`);
          if (o.isCorrect) correctCount += 1;
        });
      }
      if (correctCount !== 1) issues.push('Exactly one correct option required');
      return { idx, id: q._localId, ok: issues.length === 0, issues };
    });
    const total = items.length;
    const valid = items.filter(i=>i.ok).length;
    const invalid = total - valid;
    return { total, valid, invalid, items };
  }, [editable]);

  const isAllValid = validation.total > 0 && validation.invalid === 0;

  const onFile = (e) => {
    const f = e.target.files && e.target.files[0];
    if (f && f.type !== 'application/pdf') {
      setError('Please upload a PDF file');
      setFile(null);
      return;
    }
    setError(null);
    setFile(f);
  }

  const onFiles = (e) => {
    const list = e.target.files ? Array.from(e.target.files) : [];
    const bad = list.find(f => f.type !== 'application/pdf');
    if (bad) return setError('All files must be PDFs');
    setError(null);
    setFiles(list);
  }

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return setError('Select a PDF first');
    setLoading(true);
    setError(null);
    try {
  const form = new FormData();
  form.append('pdf', file);

  if (useOcr) form.append('useOcr', '1');
      // Step 1: parse only (preview)
      const { data } = await api.post('/tests/parse-pdf', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (data?.parsed) {
        setPreview(data.parsed);
        setEditable(prepareEditable(data.parsed));
      } else {
        setError('No parsed questions returned');
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  }

  const handleImport = async () => {
    if (!editable || !editable.questions || editable.questions.length === 0) return setError('Nothing to import');
    // Validation
    for (let i = 0; i < editable.questions.length; i++) {
      const q = editable.questions[i];
      if (!q.text || !q.text.trim()) return setError(`Question ${i+1} has empty text`);
      if (!Array.isArray(q.options) || q.options.length < 2) return setError(`Question ${i+1} must have at least 2 options`);
      if (q.options.length > 4) return setError(`Question ${i+1} can have at most 4 options`);
      let hasCorrect = false;
      for (let j = 0; j < q.options.length; j++) {
        const o = q.options[j];
        if (!o.text || !o.text.trim()) return setError(`Question ${i+1}, option ${j+1} is empty`);
        if (o.isCorrect) hasCorrect = true;
      }
      if (!hasCorrect) return setError(`Question ${i+1} must have a correct option selected`);
    }

    setLoading(true);
    setError(null);
    try {
      // Prepare payload: strip local ids
      const payload = {
        title: editable.title || preview?.title || `Imported from ${file?.name || 'PDF'}`,
        description: `Imported from ${file?.name || 'PDF'}`,
        durationSeconds: 300,
        questions: editable.questions.map(q => ({ text: q.text, options: q.options.map(o => ({ text: o.text, isCorrect: !!o.isCorrect })) })),
      };
  const { data } = await api.post('/tests/import-parsed', payload);
      if (data?.test) {
        setCreated(data.test);
        setCreatedWarning(data.warning || null);
        setCreatedDebug(data.debug || null);
        toast.success('Test created successfully');
        // Do not auto-navigate; show output on this page
      } else if (data?.parsed) {
        // server returned parsed (no create) — show preview so admin can edit
        setPreview(data.parsed);
        setEditable(prepareEditable(data.parsed));
        setCreatedWarning(data.message || 'Server returned a parsed preview, not a created test');
        setCreatedDebug(data._debug || data.debug || null);
      } else {
        setError(data?.message || 'Server did not return a created test');
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Import failed');
    } finally {
      setLoading(false);
    }
  }

  // Single-step upload + create using server endpoint /tests/upload-pdf
  const handleUploadAndCreate = async () => {
    if (!file) return setError('Select a PDF first');
    setLoading(true);
    setError(null);
    try {
  const form = new FormData();
  form.append('pdf', file);
  if (useOcr) form.append('useOcr', '1');
      const { data } = await api.post('/tests/upload-pdf', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (data?.test) {
        setCreated(data.test);
        setCreatedWarning(data.warning || null);
        setCreatedDebug(data.debug || null);
        toast.success('Test created from PDF');
        // clear preview/editable if present
        setPreview(null);
        setEditable(null);
      } else if (data?.parsed) {
        // server returned parsed preview only
        setPreview(data.parsed);
        setEditable(prepareEditable(data.parsed));
        setCreatedWarning(data.message || 'Parsed PDF returned but no test created');
        setCreatedDebug(data._debug || data.debug || null);
      } else {
        setError(data?.message || 'Server did not return a created test');
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Upload+Create failed');
    } finally {
      setLoading(false);
    }
  }

  // Editable helpers
  const updateQuestionText = (qid, value) => {
    setEditable(prev => ({ ...prev, questions: prev.questions.map(q => q._localId === qid ? { ...q, text: value } : q) }));
  }

  const updateOptionText = (qid, idx, value) => {
    setEditable(prev => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q._localId !== qid) return q;
        const opts = q.options.map((o, oi) => oi === idx ? { ...o, text: value } : o);
        return { ...q, options: opts };
      })
    }));
  }

  const toggleCorrect = (qid, idx) => {
    setEditable(prev => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q._localId !== qid) return q;
        const opts = q.options.map((o, oi) => ({ ...o, isCorrect: oi === idx })); // single correct
        return { ...q, options: opts };
      })
    }));
  }

  const addOption = (qid) => {
    setEditable(prev => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q._localId !== qid) return q;
        if (q.options.length >= 4) return q;
        return { ...q, options: [...q.options, { text: '', isCorrect: false }] };
      })
    }));
  }

  const removeOption = (qid, idx) => {
    setEditable(prev => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q._localId !== qid) return q;
        if (q.options.length <= 2) return q;
        const opts = q.options.filter((_, oi) => oi !== idx);
        return { ...q, options: opts };
      })
    }));
  }

  const removeQuestion = (qid) => {
    setEditable(prev => ({ ...prev, questions: prev.questions.filter(q => q._localId !== qid) }));
  }

  const moveQuestion = (qid, dir) => {
    setEditable(prev => {
      const arr = [...prev.questions];
      const idx = arr.findIndex(q => q._localId === qid);
      if (idx === -1) return prev;
      const to = idx + dir;
      if (to < 0 || to >= arr.length) return prev;
      const item = arr.splice(idx,1)[0];
      arr.splice(to,0,item);
      return { ...prev, questions: arr };
    });
  }

  // DnD handlers
  const onDragEnd = (event) => {
    const { active, over } = event;
    if (!active || !over) return;
    if (active.id === over.id) return;
    setEditable(prev => {
      const oldIndex = prev.questions.findIndex(q => q._localId === active.id);
      const newIndex = prev.questions.findIndex(q => q._localId === over.id);
      if (oldIndex === -1 || newIndex === -1) return prev;
      const newQuestions = arrayMove(prev.questions, oldIndex, newIndex);
      return { ...prev, questions: newQuestions };
    });
    setDraggingId(null);
  }

  const onDragStart = (event) => {
    setDraggingId(event.active?.id || null);
  }

  function SortableQuestion({ q, index }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: q._localId });
    const style = {
      transform: CSS.Transform.toString(transform),
      transition: transition || 'transform 200ms ease',
      opacity: isDragging ? 0.9 : 1,
      zIndex: isDragging ? 999 : 'auto',
    };

    const vItem = validation.items.find(it => it.id === q._localId);
    const invalidCls = vItem && !vItem.ok ? 'ring-2 ring-red-400' : '';

    return (
  <div ref={setNodeRef} style={style} {...attributes} className={`bg-white p-4 rounded shadow ${invalidCls} ${isDragging ? 'scale-105' : ''}`} >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div className="font-medium">Question {index+1}</div>
              <div className="flex gap-2">
                {!isPreviewMode && <button type="button" {...listeners} className="px-2 py-1 bg-indigo-100 rounded">Drag</button>}
                {!isPreviewMode && <button type="button" onClick={() => removeQuestion(q._localId)} className="px-2 py-1 bg-red-100 text-red-700 rounded">Remove</button>}
              </div>
            </div>

            {isPreviewMode ? (
              <div className="w-full mt-2 p-2">{q.text}</div>
            ) : (
              <textarea value={q.text} onChange={(e)=> updateQuestionText(q._localId, e.target.value)} className="w-full mt-2 p-2 border rounded" rows={2} />
            )}

            <div className="mt-3 space-y-2">
              {(q.options || []).map((opt, oi) => {
                const optionIssues = vItem ? vItem.issues.filter(s=>s.includes(`Option ${oi+1}`)) : [];
                const optInvalidCls = optionIssues.length > 0 ? 'ring-2 ring-red-400' : '';
                return (
                <div key={oi} className={`flex items-center gap-3 p-2 rounded ${opt.isCorrect ? 'bg-green-50 border border-green-200' : 'bg-gray-50'} ${optInvalidCls}`}>
                  <div className="w-6 text-sm font-semibold">{String.fromCharCode(65+oi)}</div>
                  {isPreviewMode ? (
                    <div className="flex-1">{opt.text}</div>
                  ) : (
                    <input value={opt.text} onChange={(e) => updateOptionText(q._localId, oi, e.target.value)} className="flex-1 p-1 border rounded" />
                  )}
                  <label className="flex items-center gap-1 text-sm">
                    <input type="radio" name={`correct-${q._localId}`} checked={!!opt.isCorrect} onChange={() => toggleCorrect(q._localId, oi)} disabled={isPreviewMode} />
                    <span className="text-xs">Correct</span>
                  </label>
                  {!isPreviewMode && <button type="button" onClick={() => removeOption(q._localId, oi)} disabled={q.options.length<=2} className="px-2 py-1 bg-red-50 text-red-600 rounded">Remove</button>}
                </div>
              )})}

              {!isPreviewMode && (
                <div className="mt-2">
                  <button type="button" onClick={() => addOption(q._localId)} disabled={q.options.length>=4} className="px-3 py-1 bg-blue-600 text-white rounded">Add option</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="p-6 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Upload Test PDF (Admin)</h2>

        <form onSubmit={handleUpload} className="bg-white p-6 rounded shadow">
          <div className="mb-4">
            <div className="flex flex-col gap-2">
              <input type="file" accept="application/pdf" onChange={onFile} />
              <div className="text-xs text-gray-500">Or select multiple PDFs below to merge and parse</div>
              <input type="file" accept="application/pdf" onChange={onFiles} multiple />
              <label className="text-sm mt-2 flex items-center gap-2"><input type="checkbox" checked={useOcr} onChange={(e)=>setUseOcr(e.target.checked)} /> Enable OCR (for scanned PDFs)</label>
            </div>
          </div>

          {error && <div className="text-red-600 mb-3">{error}</div>}

          <div className="flex gap-2">
            <button disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded">{loading ? 'Parsing...' : 'Parse & Preview'}</button>
            <button type="button" onClick={() => { setFile(null); setFiles([]); setError(null); setPreview(null); }} className="px-4 py-2 bg-gray-200 rounded">Reset</button>
            <button type="button" onClick={async () => {
              if (!files || files.length === 0) return setError('Select multiple PDFs to merge');
              setLoading(true); setError(null);
              try {
                const form = new FormData();
                files.forEach(f => form.append('pdfs', f));
                if (useOcr) form.append('useOcr', '1');
                const { data } = await api.post('/tests/merge-parse', form, { headers: { 'Content-Type': 'multipart/form-data' } });
                if (data?.parsed) {
                  setPreview(data.parsed);
                  setEditable(prepareEditable(data.parsed));
                } else {
                  setError('No parsed questions returned');
                }
              } catch (err) {
                setError(err?.response?.data?.message || err.message || 'Merge+Parse failed');
              } finally { setLoading(false); }
            }} className="px-4 py-2 bg-purple-600 text-white rounded">Merge & Parse</button>
          </div>
        </form>
        {editable ? (
          <div className="mt-6 space-y-4">
            <div className="bg-white p-4 rounded shadow">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Editable Preview: {editable.title || preview?.title}</h3>
                <div className="flex gap-2">
                  <button onClick={() => { setEditable(null); setPreview(null); }} className="px-3 py-1 bg-gray-200 rounded">Close</button>
                </div>
              </div>
            </div>

            <DndContext collisionDetection={closestCenter} onDragStart={onDragStart} onDragEnd={onDragEnd}>
              <SortableContext items={editable.questions.map(q=>q._localId)} strategy={verticalListSortingStrategy}>
                <div className="space-y-4">
                  {editable.questions.map((q, qi) => (
                    <SortableQuestion key={q._localId} q={q} index={qi} />
                  ))}
                </div>
              </SortableContext>
              <DragOverlay>{draggingId ? <div className="bg-white p-4 rounded shadow">Dragging...</div> : null}</DragOverlay>
            </DndContext>

            <div className="bg-white p-3 rounded shadow">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm">Validation: {validation.valid}/{validation.total} valid</div>
                  {validation.invalid > 0 && <div className="text-xs text-red-600">{validation.invalid} items invalid</div>}
                </div>
                <div className="flex gap-2">
          <button onClick={() => setShowConfirmImport(true)} disabled={loading || !isAllValid} className={`px-4 py-2 ${isAllValid ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'} rounded`}>{loading ? 'Importing...' : 'Confirm & Create Test'}</button>
        <button onClick={() => setShowConfirmUpload(true)} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">Upload & Create (one-step)</button>
                  <button onClick={() => { setEditable(null); setPreview(null); }} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
                </div>
              </div>
            </div>
          </div>
        ) : preview && (
          <div className="mt-6 bg-white p-4 rounded shadow">
            <h3 className="font-semibold">Preview: {preview.title}</h3>
            <ol className="mt-2 list-decimal pl-5 space-y-2">
              {preview.questions.map((q, i) => (
                <li key={i}>
                  <div className="font-medium">{q.text}</div>
                  <div className="text-sm text-gray-600">Options: {q.options?.map(o=>o.text).join(' | ')}</div>
                </li>
              ))}
            </ol>

              <div className="mt-4 flex gap-2">
              <button onClick={() => { setEditable(prepareEditable(preview)); }} className="px-4 py-2 bg-yellow-500 text-black rounded">Edit before import</button>
              <button onClick={() => setShowConfirmImport(true)} disabled={loading} className="px-4 py-2 bg-green-600 text-white rounded">{loading ? 'Importing...' : 'Confirm & Create Test'}</button>
              <button onClick={() => setShowConfirmUpload(true)} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">Upload & Create (one-step)</button>
              <button onClick={() => { setPreview(null); }} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
            </div>
          </div>
        )}

        {/* Server warning / debug panel */}
        {createdWarning && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <div className="font-medium text-yellow-800">Warning: {createdWarning}</div>
            {createdDebug && (
              <details className="mt-2 text-xs text-gray-700">
                <summary className="cursor-pointer">Show parser debug</summary>
                <pre className="whitespace-pre-wrap mt-2 max-h-64 overflow-auto text-xs bg-gray-100 p-2 rounded">{JSON.stringify(createdDebug, null, 2)}</pre>
              </details>
            )}
          </div>
        )}

        {created && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
            <div className="font-semibold">Test created: <strong>{created.title}</strong></div>
            {createdWarning && <div className="text-sm text-yellow-700">{createdWarning}</div>}
            <div className="text-sm text-gray-700">{created.description}</div>
            <ol className="mt-3 list-decimal pl-5 space-y-2">
              {created.questions?.map((q, qi) => (
                <li key={qi}>
                  <div className="font-medium">{q.text}</div>
                  <div className="text-sm text-gray-600">{q.options?.map((o, oi) => (
                    <div key={oi} className={`${o.isCorrect ? 'font-semibold text-green-700' : ''}`}>{String.fromCharCode(65+oi)}. {o.text}</div>
                  ))}</div>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Confirmation Modals */}
        {showConfirmImport && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
            <div className="bg-white p-6 rounded shadow max-w-lg w-full">
              <h4 className="font-semibold mb-2">Confirm create test</h4>
              <p className="text-sm text-gray-600 mb-4">This will create a test from the edited preview. Are you sure?</p>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setShowConfirmImport(false)} className="px-3 py-1 bg-gray-200 rounded">Cancel</button>
                <button onClick={async () => { setShowConfirmImport(false); await handleImport(); }} className="px-3 py-1 bg-green-600 text-white rounded">Yes, create</button>
              </div>
            </div>
          </div>
        )}

        {showConfirmUpload && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
            <div className="bg-white p-6 rounded shadow max-w-lg w-full">
              <h4 className="font-semibold mb-2">Confirm upload & create</h4>
              <p className="text-sm text-gray-600 mb-4">This will upload the PDF and create a test in one step (best-effort parsing). Continue?</p>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setShowConfirmUpload(false)} className="px-3 py-1 bg-gray-200 rounded">Cancel</button>
                <button onClick={async () => { setShowConfirmUpload(false); await handleUploadAndCreate(); }} className="px-3 py-1 bg-blue-600 text-white rounded">Yes, upload & create</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
