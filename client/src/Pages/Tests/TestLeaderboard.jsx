import React, { useEffect, useMemo, useState } from 'react';
import Layout from '../../Layout/Layout';
import api from '../../Helper/axiosInstance';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

function downloadCsv(filename, rows) {
  if (!rows || rows.length === 0) return;
  const headers = ['rank', 'userId', 'name', 'email', 'bestScore', 'bestDuration', 'lastAttemptAt'];
  const lines = [headers.join(',')];
  rows.forEach((r, idx) => {
    const user = r.user || {};
    const row = [
      idx + 1,
      user._id || '',
      '"' + (user.name || '').replace(/"/g, '""') + '"',
      '"' + (user.email || '').replace(/"/g, '""') + '"',
      r.bestScore ?? '',
      r.bestDuration ?? '',
      r.lastAttemptAt ? new Date(r.lastAttemptAt).toISOString() : '',
    ];
    lines.push(row.join(','));
  });
  const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function TestLeaderboard(){
  const { id } = useParams();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [testTitle, setTestTitle] = useState('Leaderboard');
  const [query, setQuery] = useState('');

  const authUser = useSelector(s => s.auth?.data || {});

  useEffect(()=>{ if (id) load(); },[id]);

  const load = async () => {
    setLoading(true);
    try{
      const [lbRes, testRes] = await Promise.all([
        api.get(`/tests/${id}/leaderboard`),
        api.get(`/tests/${id}`),
      ]);
      setRows(lbRes.data.leaderboard || []);
      setTestTitle(testRes.data?.test?.title || 'Leaderboard');
    }catch(e){
      console.error(e);
      setRows([]);
    }
    setLoading(false);
  }

  const filtered = useMemo(() => {
    if (!query) return rows;
    const q = query.toLowerCase();
    return rows.filter(r => {
      const u = r.user || {};
      return (u.name || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q);
    });
  }, [rows, query]);

  const top3 = filtered.slice(0,3);

  return (
    <Layout>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">{testTitle}</h1>
            <div className="text-sm text-gray-500">Leaderboard — Top performers for this test</div>
          </div>

          <div className="flex items-center gap-2">
            <input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search name or email" className="border px-3 py-2 rounded" />
            <button onClick={() => downloadCsv(`leaderboard-${id}.csv`, rows)} className="px-3 py-2 rounded bg-gray-200">Export CSV</button>
            <Link to="/tests" className="px-3 py-2 rounded bg-indigo-600 text-white">Back to tests</Link>
          </div>
        </div>

        {loading ? <div>Loading leaderboard...</div> : (
          <>
            {/* Top 3 cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {top3.map((r, idx) => {
                const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉';
                const u = r.user || {};
                const isMe = String(u._id) === String(authUser?._id);
                return (
                  <div key={String(u._id || idx)} className={`p-4 rounded shadow ${isMe ? 'ring-2 ring-indigo-400' : ''}`}>
                    <div className="text-sm text-gray-500">{medal} Rank #{idx+1}</div>
                    <div className="mt-2 text-lg font-semibold">{u.name || u.email || 'Anonymous'}</div>
                    <div className="text-sm text-gray-500">Score: <span className="font-semibold">{r.bestScore}</span></div>
                    <div className="text-sm text-gray-500">Time: <span className="font-semibold">{r.bestDuration ?? '-'}</span>s</div>
                  </div>
                )
              })}
            </div>

            {/* Full table */}
            <div className="bg-white rounded shadow overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2">Rank</th>
                    <th className="px-4 py-2">User</th>
                    <th className="px-4 py-2">Best Score</th>
                    <th className="px-4 py-2">Duration (s)</th>
                    <th className="px-4 py-2">Last Attempt</th>
                    <th className="px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r, idx) => {
                    const user = r.user || {};
                    const isMe = String(user._id) === String(authUser?._id);
                    return (
                      <tr key={String(user._id || idx)} className={`border-t ${isMe ? 'bg-indigo-50' : ''}`}>
                        <td className="px-4 py-2">{idx + 1}</td>
                        <td className="px-4 py-2">{user.name || user.email || 'Anonymous'}</td>
                        <td className="px-4 py-2">{r.bestScore}</td>
                        <td className="px-4 py-2">{r.bestDuration ?? '-'}</td>
                        <td className="px-4 py-2">{r.lastAttemptAt ? new Date(r.lastAttemptAt).toLocaleString() : '-'}</td>
                        <td className="px-4 py-2">
                          {/* Could link to user's attempts or profile */}
                          <Link to={`/tests/attempts?testId=${id}&userId=${user._id}`} className="text-indigo-600">View Attempts</Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </Layout>
  )
}
