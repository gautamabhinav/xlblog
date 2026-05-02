import React, { useEffect, useState } from 'react';
import api from '../../Helper/axiosInstance';

export default function FormGenerator({ model, id, onCancel, onSaved }){
  const [schema, setSchema] = useState(null);
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);
  const [refsCache, setRefsCache] = useState({});

  useEffect(()=>{ loadSchema(); if (id) loadData(); }, [id, model]);

  const loadSchema = async () => {
    try{
      const res = await api.get(`/admin/${model}/schema`);
      setSchema(res.data.schema || {});
      // prefetch ref lists
      for (const [k,v] of Object.entries(res.data.schema || {})){
        if (v.ref){
          try{
            const list = await api.get(`/admin/${v.ref.toLowerCase()}?limit=50`);
            setRefsCache(rc => ({ ...rc, [k]: list.data.data || [] }));
          }catch(e){ /* ignore */ }
        }
      }
    }catch(e){ console.error('schema load failed', e); }
  }

  const loadData = async () => {
    setLoading(true);
    try{
      const res = await api.get(`/admin/${model}/${id}`);
      setData(res.data.data || {});
    }catch(e){ console.error(e); }
    setLoading(false);
  }

  const save = async () => {
    try{
      if (id) await api.put(`/admin/${model}/${id}`, data);
      else await api.post(`/admin/${model}`, data);
      onSaved && onSaved();
    }catch(e){ console.error(e); alert('Save failed'); }
  }

  const renderField = (key, desc) => {
    const val = data[key];
    const onChange = (v) => setData(d => ({ ...d, [key]: v }));

    if (desc.enum){
      return (
        <select value={val || ''} onChange={e=>onChange(e.target.value)} className="w-full p-2 rounded bg-white/10">
          <option value="">--</option>
          {desc.enum.map(e => <option key={e} value={e}>{e}</option>)}
        </select>
      );
    }

    switch(desc.type){
      case 'number': return <input type="number" value={val||''} onChange={e=>onChange(Number(e.target.value))} className="w-full p-2 rounded bg-white/10" />;
      case 'date': return <input type="date" value={val? new Date(val).toISOString().slice(0,10): ''} onChange={e=>onChange(e.target.value)} className="w-full p-2 rounded bg-white/10" />;
      case 'boolean': return <input type="checkbox" checked={!!val} onChange={e=>onChange(e.target.checked)} />;
      case 'string':
      default:
        if (desc.ref){
          const options = refsCache[key] || [];
          return (
            <select value={val || ''} onChange={e=>onChange(e.target.value)} className="w-full p-2 rounded bg-white/10">
              <option value="">--</option>
              {options.map(o => <option key={o._id} value={o._id}>{o.title || o.name || o.email || o._id}</option>)}
            </select>
          );
        }
        return <input value={val||''} onChange={e=>onChange(e.target.value)} className="w-full p-2 rounded bg-white/10" />;
    }
  }

  return (
    <div className="p-3 bg-white/5 rounded mb-3">
      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold">{id ? 'Edit' : 'Create'} {model}</div>
        <div>
          <button className="px-2 py-1 bg-white/5 rounded mr-2" onClick={onCancel}>Cancel</button>
          <button className="px-2 py-1 bg-green-600 rounded" onClick={save}>Save</button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {schema ? Object.entries(schema).slice(0,16).map(([k,desc]) => (
          <div key={k}>
            <label className="block text-xs text-gray-400">{k}</label>
            {renderField(k, desc)}
          </div>
        )) : <div>Loading schema...</div>}
      </div>
    </div>
  )
}
