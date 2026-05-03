import React, { useEffect, useState } from 'react';
import Layout from '../../Layout/Layout';
import api from '../../Helper/axiosInstance';
import DynamicTable from '../../Components/Admin/DynamicTable';

export default function AdminDashboard(){
  const [models, setModels] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(()=>{ loadModels(); }, []);

  const loadModels = async () => {
    setLoading(true);
    try{
      const res = await api.get('/admin/models');
      setModels(res.data.models || []);
      if (res.data.models && res.data.models.length) setSelected(res.data.models[0]);
    }catch(e){
      console.error(e);
      setModels([]);
    }
    setLoading(false);
  }

  return (
    <Layout>
      <div className="p-6 max-w-6xl mx-auto flex gap-6">
        <aside className="w-48">
          <h2 className="font-bold mb-2">Models</h2>
          {loading ? <div>Loading...</div> : (
            <ul className="space-y-2">
              {models.map(m => (
                <li key={m}>
                  <button className={`w-full text-left p-2 rounded ${selected===m? 'bg-blue-600 text-white':'bg-white/5'}`} onClick={()=>setSelected(m)}>{m}</button>
                </li>
              ))}
            </ul>
          )}
        </aside>

        <main className="flex-1">
          {selected ? <DynamicTable model={selected} /> : <div>Select a model</div>}
        </main>
      </div>
    </Layout>
  )
}
