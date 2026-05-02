import React, { useEffect, useState } from 'react';
import Layout from '../../Layout/Layout';
import api from '../../Helper/axiosInstance';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

export default function AdminDashboardFull(){
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState({});
  const [loadingUser, setLoadingUser] = useState({});

  useEffect(()=>{ load(); }, []);

  const load = async () => {
    setLoading(true);
    try{
      const res = await api.get('/admin/dashboard-full');
      setUsers(res.data.users || []);
    }catch(e){
      console.error(e);
      setUsers([]);
    }
    setLoading(false);
  }

  const toggle = async (id) => {
    setExpanded((s) => ({ ...s, [id]: !s[id] }));
    // if expanding, load details
    const isExpanding = !expanded[id];
    if (isExpanding) await loadUserDetails(id);
  };

  const loadUserDetails = async (id) => {
    const u = users.find(x => String(x.user._id) === String(id));
    if (!u) return;
    if (u._loaded || loadingUser[id]) return;

    setLoadingUser(s => ({ ...s, [id]: true }));
    try{
      const res = await api.get(`/admin/user/${id}/activity?attemptLimit=20&postsLimit=10&commentsLimit=10`);
      const payload = res.data;
      setUsers(prev => prev.map(p => String(p.user._id) === String(id) ? ({ ...p, _loaded: true, details: payload }) : p));
    }catch(err){
      console.error('Failed to load user details', err);
    }
    setLoadingUser(s => ({ ...s, [id]: false }));
  }

  return (
    <Layout>
      <div className="p-6 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Admin — All Users Activity</h1>
        {loading ? <div>Loading...</div> : (
          <div className="space-y-3">
            {users.map(u => (
              <div key={u.user._id} className="bg-white/5 rounded p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{u.user.fullName || u.user.name || u.user.email}</div>
                    <div className="text-sm text-gray-400">{u.user.email} • {u.user.role} • {u.attemptsCount || 0} tests • {u.postsCount || 0} posts • {u.likesCount || 0} likes • {u.commentsCount || 0} comments</div>
                  </div>
                  <button onClick={() => toggle(u.user._id)} className="p-2 rounded bg-white/3">
                    {expanded[u.user._id] ? <FiChevronUp /> : <FiChevronDown />}
                  </button>
                </div>

                {expanded[u.user._id] && (
                  <div className="mt-3 space-y-2">
                    {loadingUser[u.user._id] ? <div>Loading details...</div> : null}

                    <div className="p-2 bg-white/3 rounded">
                      <div className="font-semibold">Tests Attempted</div>
                      {u.details ? (
                        u.details.attempts.items.length === 0 ? <div className="text-sm text-gray-400">None</div> : (
                          <ul className="text-sm list-disc ml-5">
                            {u.details.attempts.items.map(a => <li key={a._id}>{a.test?.title || 'Test'} — {a.score}/{a.maxScore} on {new Date(a.createdAt).toLocaleString()}</li>)}
                          </ul>
                        )
                      ) : (
                        <div className="text-sm text-gray-400">Summary only — expand to load details</div>
                      )}
                    </div>

                    <div className="p-2 bg-white/3 rounded">
                      <div className="font-semibold">Posts</div>
                      {u.details ? (
                        u.details.posts.items.length === 0 ? <div className="text-sm text-gray-400">None</div> : (
                          <ul className="text-sm list-disc ml-5">
                            {u.details.posts.items.map(p => <li key={p._id}>{p.title} — {new Date(p.createdAt).toLocaleString()}</li>)}
                          </ul>
                        )
                      ) : (
                        <div className="text-sm text-gray-400">Summary only — expand to load details</div>
                      )}
                    </div>

                    <div className="p-2 bg-white/3 rounded">
                      <div className="font-semibold">Liked Posts</div>
                      {u.details ? (
                        u.details.likes.items.length === 0 ? <div className="text-sm text-gray-400">None</div> : (
                          <ul className="text-sm list-disc ml-5">
                            {u.details.likes.items.map(p => <li key={p._id}>{p.title}</li>)}
                          </ul>
                        )
                      ) : (
                        <div className="text-sm text-gray-400">Summary only — expand to load details</div>
                      )}
                    </div>

                    <div className="p-2 bg-white/3 rounded">
                      <div className="font-semibold">Comments</div>
                      {u.details ? (
                        u.details.comments.items.length === 0 ? <div className="text-sm text-gray-400">None</div> : (
                          <ul className="text-sm list-disc ml-5">
                            {u.details.comments.items.map(c => <li key={c._id}>{c.comment || c.text} — {new Date(c.createdAt).toLocaleString()}</li>)}
                          </ul>
                        )
                      ) : (
                        <div className="text-sm text-gray-400">Summary only — expand to load details</div>
                      )}
                    </div>

                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
