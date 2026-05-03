import React, { useEffect, useState } from 'react';
import api from '../../Helper/axiosInstance';
import { Link } from 'react-router-dom';
import UserAvatar from '../Common/UserAvatar';
import FormGenerator from './FormGenerator';

export default function DynamicTable({ model }){
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);

  useEffect(()=>{ load(); }, [model, page]);

  const load = async () => {
    setLoading(true);
    try{
      const res = await api.get(`/admin/${model}?page=${page}&limit=${limit}`);
      setRows(res.data.data || []);
    }catch(e){
      console.error(e);
      setRows([]);
    }
    setLoading(false);
  }

  const remove = async (id) => {
    if (!confirm('Delete this record?')) return;
    try{
      await api.delete(`/admin/${model}/${id}`);
      load();
    }catch(e){ console.error(e); alert('Delete failed'); }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-bold text-xl">{model}</h2>
        <div>
          <button className="px-3 py-1 bg-green-600 rounded" onClick={()=>setCreating(true)}>Create</button>
        </div>
      </div>

      {creating && <FormGenerator model={model} onCancel={()=>{setCreating(false); load();}} onSaved={()=>{setCreating(false); load();}} />}
      {editing && <FormGenerator model={model} id={editing} onCancel={()=>{setEditing(null); load();}} onSaved={()=>{setEditing(null); load();}} />}

      {loading ? <div>Loading...</div> : (
        <div className="overflow-x-auto bg-white/5 rounded p-3">
          <table className="w-full text-sm">
            <thead>
              <tr>
                {rows[0] ? Object.keys(rows[0]).slice(0,8).map(k => <th key={k} className="text-left p-2">{k}</th>) : <th className="p-2">No data</th>}
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r._id} className="border-t border-white/5">
                  {Object.keys(r).slice(0,8).map(k => {
                    const val = r[k];
                    // avatar handling: support object ({ secure_url, url }) or string URL
                    const renderCell = () => {
                      // treat user-like keys specially (link + hover card)
                      const isUserKey = ['user', 'owner', 'author', 'createdBy', 'created_by'].includes(k) || k.toLowerCase().includes('user') || k.toLowerCase().includes('author') || k.toLowerCase().includes('owner');
                      if (isUserKey && val) {
                        const userObj = (typeof val === 'string') ? null : val;
                        const userId = (userObj && (userObj._id || userObj.id)) || (typeof val === 'string' && /^[0-9a-fA-F]{24}$/.test(val) ? val : null);
                        const displayName = (userObj && (userObj.name || userObj.fullName || userObj.email)) || String(val || 'User');

                        const inner = (
                          <div className="flex items-center gap-3">
                            {/* avatar (if present) */}
                            <UserAvatar user={userObj || val} size={32} />
                            <div className="text-sm">{displayName}</div>
                          </div>
                        );

                        // tooltip / hover card
                        const hoverCard = (
                          <div className="hidden group-hover:block absolute z-50 left-0 mt-10 w-64 bg-white text-black p-3 rounded shadow-lg">
                            <div className="font-semibold">{displayName}</div>
                            {userObj?.email && <div className="text-xs text-gray-600">{userObj.email}</div>}
                            {userObj?.role && <div className="text-xs text-gray-600 mt-1">Role: {userObj.role}</div>}
                            {userObj?._id && <div className="text-xs text-gray-500 mt-2">ID: {String(userObj._id)}</div>}
                          </div>
                        );

                        // If we have a user id, link to their profile; otherwise just render the inner content
                        if (userId) {
                          return (
                            <div className="relative group inline-block">
                              <Link to={`/user/${userId}`} className="inline-flex items-center gap-2">{inner}</Link>
                              {hoverCard}
                            </div>
                          );
                        }

                        return (
                          <div className="relative group inline-block">
                            <div className="inline-flex items-center gap-2">{inner}</div>
                            {hoverCard}
                          </div>
                        );
                      }

                      // avatar handling: support object ({ secure_url, url }) or string URL
                      if ((k === 'avatar' || k.toLowerCase().includes('avatar')) && val) {
                        const avatarUrl = (typeof val === 'string') ? val : (val?.secure_url || val?.url || val?.path || null);
                        if (avatarUrl) {
                          return <img src={avatarUrl} alt="avatar" className="w-10 h-10 rounded-full object-cover" />;
                        }
                        // fallback to initials if user object present
                        const name = (typeof val === 'object' && val?.name) ? val.name : (r?.name || r?.fullName || r?.email || 'U');
                        const initials = String(name).charAt(0).toUpperCase();
                        return <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center font-bold text-black">{initials}</div>;
                      }

                      // for referenced user objects or nested objects, try to display a meaningful string
                      if (val && typeof val === 'object') {
                        // common shapes: { name, email } or { _id, name }
                        const maybeName = val?.name || val?.fullName || val?.email || val?.title || val?.label;
                        if (maybeName) return String(maybeName);
                        // if it's a Mongoose ref populated object, stringify id
                        if (val._id) return String(val._id);
                        return JSON.stringify(val);
                      }

                      return String(val ?? '');
                    };

                    return <td key={k} className="p-2">{renderCell()}</td>;
                  })}
                  <td className="p-2">
                    <button className="mr-2 px-2 py-1 bg-blue-600 rounded" onClick={()=>setEditing(r._id)}>Edit</button>
                    <button className="px-2 py-1 bg-red-600 rounded" onClick={()=>remove(r._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-3 flex gap-2">
        <button disabled={page===1} onClick={()=>setPage(p=>Math.max(1,p-1))} className="px-3 py-1 bg-white/5 rounded">Prev</button>
        <button onClick={()=>setPage(p=>p+1)} className="px-3 py-1 bg-white/5 rounded">Next</button>
      </div>
    </div>
  )
}
