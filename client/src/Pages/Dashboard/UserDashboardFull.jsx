import React, { useEffect, useState } from 'react';
import Layout from '../../Layout/Layout';
import api from '../../Helper/axiosInstance';
import SectionContainer from '../../Components/Dashboard/SectionContainer';
import ActivityCard from '../../Components/Dashboard/ActivityCard';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function UserDashboardFull(){
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [attemptLimit, setAttemptLimit] = useState(50);
  const [postsLimit, setPostsLimit] = useState(20);

  useEffect(()=>{ load(); },[]);

  const load = async ()=>{
    setLoading(true); setError(null);
    try{
      const res = await api.get(`/user/dashboard?attemptLimit=${attemptLimit}&postsLimit=${postsLimit}`);
      setData(res.data);
    }catch(e){
      console.error(e);
      setError(e?.response?.data?.message || e.message || 'Failed to load');
    }
    setLoading(false);
  }

  if (loading) return <Layout><div className="p-6">Loading dashboard...</div></Layout>
  if (error) return <Layout><div className="p-6 text-red-400">{error}</div></Layout>

  const user = data?.user || {};
  const attempts = data?.testsAttempted || [];
  const posts = data?.postsCreated || [];
  const liked = data?.likedPosts || [];
  const comments = data?.comments || [];
  const notifications = data?.notifications || [];
  const analytics = data?.analytics || { perTest: [] };

  // build timeline from notifications are not returned here; only server-side aggregated items available
  const timeline = [
    ...attempts.map(a => ({ type: 'attempt', id: a._id, title: a.test?.title || 'Test', desc: `${a.score} / ${a.maxScore}`, date: a.createdAt, meta: a })),
    ...posts.map(p => ({ type: 'post', id: p._id, title: `Posted: ${p.title}`, desc: p.description || '', date: p.createdAt, meta: p })),
    ...liked.map(p => ({ type: 'liked', id: p._id, title: `Liked: ${p.title}`, desc: p.description || '', date: p.createdAt, meta: p })),
    ...comments.map(c => ({ type: 'comment', id: c._id, title: `Commented: ${c.comment || c.text || ''}`, desc: '', date: c.createdAt, meta: c })),
  ];
  timeline.sort((a,b)=> new Date(b.date) - new Date(a.date));

  return (
    <Layout>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="mb-4 flex gap-3 items-center">
          <label className="text-sm">Attempts:</label>
          <input type="number" value={attemptLimit} onChange={(e)=>setAttemptLimit(Number(e.target.value||0))} className="w-24 text-black px-2 py-1 rounded" />
          <label className="text-sm">Posts:</label>
          <input type="number" value={postsLimit} onChange={(e)=>setPostsLimit(Number(e.target.value||0))} className="w-24 text-black px-2 py-1 rounded" />
          <button onClick={load} className="px-3 py-1 rounded bg-indigo-600 text-white">Refresh</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-1">
            <SectionContainer title="Profile Summary">
              <div className="space-y-2">
                <div className="text-lg font-semibold">{user.name || user.email}</div>
                <div className="text-sm text-gray-400">{user.email}</div>
                <div className="text-sm text-gray-400">Joined: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}</div>
                <div className="mt-3">
                  <div>Tests Attempted: <strong>{attempts.length}</strong></div>
                  <div>Posts: <strong>{posts.length}</strong></div>
                  <div>Likes: <strong>{liked.length}</strong></div>
                  <div>Comments: <strong>{comments.length}</strong></div>
                </div>
              </div>
            </SectionContainer>
          </div>

          <div className="col-span-2">
            <SectionContainer title="Recent Activity">
              {timeline.length === 0 ? <div className="text-sm text-gray-400">No recent activity</div> : (
                <div className="space-y-3">
                  {timeline.map(t => <ActivityCard key={t.type + '-' + t.id} item={t} />)}
                </div>
              )}
            </SectionContainer>

            <SectionContainer title="Test Activity">
              {attempts.length === 0 ? <div className="text-sm text-gray-400">No attempts</div> : (
                <div className="overflow-x-auto bg-white/5 rounded">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2">Test</th>
                        <th className="px-4 py-2">Score</th>
                        <th className="px-4 py-2">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attempts.map(a => (
                        <tr key={a._id} className="border-t">
                          <td className="px-4 py-2">{a.test?.title}</td>
                          <td className="px-4 py-2">{a.score} / {a.maxScore}</td>
                          <td className="px-4 py-2">{new Date(a.createdAt).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </SectionContainer>

            <SectionContainer title="Test Performance (per-test avg)">
              {analytics.perTest.length === 0 ? <div className="text-sm text-gray-400">No analytics</div> : (
                <div>
                  <Bar
                    data={{
                      labels: analytics.perTest.map(p => p.testTitle || p.testId),
                      datasets: [{ label: 'Avg Score', data: analytics.perTest.map(p => p.avgScore || 0), backgroundColor: 'rgba(59,130,246,0.7)' }]
                    }}
                    options={{ responsive: true, plugins: { legend: { position: 'top' } } }}
                  />
                </div>
              )}
            </SectionContainer>

            <SectionContainer title="Posts Created">
              {posts.length === 0 ? <div className="text-sm text-gray-400">No posts</div> : (
                <div className="space-y-3">
                  {posts.map(p => (
                    <div key={p._id} className="p-3 bg-white/5 rounded">
                      <div className="font-semibold">{p.title}</div>
                      <div className="text-xs text-gray-300">{p.description}</div>
                      <div className="text-xs text-gray-500 mt-1">{new Date(p.createdAt).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              )}
            </SectionContainer>

            <SectionContainer title="Liked Posts">
              {liked.length === 0 ? <div className="text-sm text-gray-400">No liked posts</div> : (
                <div className="space-y-3">
                  {liked.map(p => (
                    <div key={p._id} className="p-3 bg-white/5 rounded">
                      <div className="font-semibold">{p.title}</div>
                      <div className="text-xs text-gray-300">{p.description}</div>
                      <div className="text-xs text-gray-500 mt-1">{new Date(p.createdAt).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              )}
            </SectionContainer>

            <SectionContainer title="Comments">
              {comments.length === 0 ? <div className="text-sm text-gray-400">No comments</div> : (
                <div className="space-y-3">
                  {comments.map(c => (
                    <div key={c._id} className="p-3 bg-white/5 rounded">
                      <div className="text-sm">{c.comment || c.text}</div>
                      <div className="text-xs text-gray-500 mt-1">{new Date(c.createdAt).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              )}
            </SectionContainer>

          </div>
        </div>
      </div>
    </Layout>
  )
}
