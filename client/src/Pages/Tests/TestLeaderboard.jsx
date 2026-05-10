// import React, { useEffect, useMemo, useState } from 'react';
// import Layout from '../../Layout/Layout';
// import api from '../../Helper/axiosInstance';
// import { useParams, Link } from 'react-router-dom';
// import { useSelector } from 'react-redux';

// function downloadCsv(filename, rows) {
//   if (!rows || rows.length === 0) return;
//   const headers = ['rank', 'userId', 'name', 'email', 'bestScore', 'bestDuration', 'lastAttemptAt'];
//   const lines = [headers.join(',')];
//   rows.forEach((r, idx) => {
//     const user = r.user || {};
//     const row = [
//       idx + 1,
//       user._id || '',
//       '"' + (user.name || '').replace(/"/g, '""') + '"',
//       '"' + (user.email || '').replace(/"/g, '""') + '"',
//       r.bestScore ?? '',
//       r.bestDuration ?? '',
//       r.lastAttemptAt ? new Date(r.lastAttemptAt).toISOString() : '',
//     ];
//     lines.push(row.join(','));
//   });
//   const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
//   const url = URL.createObjectURL(blob);
//   const a = document.createElement('a');
//   a.href = url;
//   a.download = filename;
//   a.click();
//   URL.revokeObjectURL(url);
// }

// export default function TestLeaderboard(){
//   const { id } = useParams();
//   const [rows, setRows] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [testTitle, setTestTitle] = useState('Leaderboard');
//   const [query, setQuery] = useState('');

//   const authUser = useSelector(s => s.auth?.data || {});

//   useEffect(()=>{ if (id) load(); },[id]);

//   const load = async () => {
//     setLoading(true);
//     try{
//       const [lbRes, testRes] = await Promise.all([
//         api.get(`/tests/${id}/leaderboard`),
//         api.get(`/tests/${id}`),
//       ]);
//       setRows(lbRes.data.leaderboard || []);
//       setTestTitle(testRes.data?.test?.title || 'Leaderboard');
//     }catch(e){
//       console.error(e);
//       setRows([]);
//     }
//     setLoading(false);
//   }

//   const filtered = useMemo(() => {
//     if (!query) return rows;
//     const q = query.toLowerCase();
//     return rows.filter(r => {
//       const u = r.user || {};
//       return (u.name || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q);
//     });
//   }, [rows, query]);

//   const top3 = filtered.slice(0,3);

//   return (
//     <Layout>
//       <div className="p-6 max-w-6xl mx-auto">
//         <div className="flex items-center justify-between mb-6">
//           <div>
//             <h1 className="text-2xl font-bold">{testTitle}</h1>
//             <div className="text-sm text-gray-500">Leaderboard — Top performers for this test</div>
//           </div>

//           <div className="flex items-center gap-2">
//             <input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search name or email" className="border px-3 py-2 rounded" />
//             <button onClick={() => downloadCsv(`leaderboard-${id}.csv`, rows)} className="px-3 py-2 rounded bg-gray-200">Export CSV</button>
//             <Link to="/tests" className="px-3 py-2 rounded bg-indigo-600 text-white">Back to tests</Link>
//           </div>
//         </div>

//         {loading ? <div>Loading leaderboard...</div> : (
//           <>
//             {/* Top 3 cards */}
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//               {top3.map((r, idx) => {
//                 const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉';
//                 const u = r.user || {};
//                 const isMe = String(u._id) === String(authUser?._id);
//                 return (
//                   <div key={String(u._id || idx)} className={`p-4 rounded shadow ${isMe ? 'ring-2 ring-indigo-400' : ''}`}>
//                     <div className="text-sm text-gray-500">{medal} Rank #{idx+1}</div>
//                     <div className="mt-2 text-lg font-semibold">{u.name || u.email || 'Anonymous'}</div>
//                     <div className="text-sm text-gray-500">Score: <span className="font-semibold">{r.bestScore}</span></div>
//                     <div className="text-sm text-gray-500">Time: <span className="font-semibold">{r.bestDuration ?? '-'}</span>s</div>
//                   </div>
//                 )
//               })}
//             </div>

//             {/* Full table */}
//             <div className="bg-white rounded shadow overflow-x-auto">
//               <table className="w-full text-left text-sm">
//                 <thead className="bg-gray-100">
//                   <tr>
//                     <th className="px-4 py-2">Rank</th>
//                     <th className="px-4 py-2">User</th>
//                     <th className="px-4 py-2">Best Score</th>
//                     <th className="px-4 py-2">Duration (s)</th>
//                     <th className="px-4 py-2">Last Attempt</th>
//                     <th className="px-4 py-2">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {filtered.map((r, idx) => {
//                     const user = r.user || {};
//                     const isMe = String(user._id) === String(authUser?._id);
//                     return (
//                       <tr key={String(user._id || idx)} className={`border-t ${isMe ? 'bg-indigo-50' : ''}`}>
//                         <td className="px-4 py-2">{idx + 1}</td>
//                         <td className="px-4 py-2">{user.name || user.email || 'Anonymous'}</td>
//                         <td className="px-4 py-2">{r.bestScore}</td>
//                         <td className="px-4 py-2">{r.bestDuration ?? '-'}</td>
//                         <td className="px-4 py-2">{r.lastAttemptAt ? new Date(r.lastAttemptAt).toLocaleString() : '-'}</td>
//                         <td className="px-4 py-2">
//                           {/* Could link to user's attempts or profile */}
//                           <Link to={`/tests/attempts?testId=${id}&userId=${user._id}`} className="text-indigo-600">View Attempts</Link>
//                         </td>
//                       </tr>
//                     )
//                   })}
//                 </tbody>
//               </table>
//             </div>
//           </>
//         )}
//       </div>
//     </Layout>
//   )
// }



import React, { useEffect, useMemo, useState } from "react";
import Layout from "../../Layout/Layout";
import api from "../../Helper/axiosInstance";
import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";

import {
  Trophy,
  Crown,
  Medal,
  Search,
  Download,
  ArrowLeft,
  Timer,
  Star,
} from "lucide-react";

function downloadCsv(filename, rows) {
  if (!rows || rows.length === 0) return;

  const headers = [
    "rank",
    "userId",
    "name",
    "email",
    "bestScore",
    "bestDuration",
    "lastAttemptAt",
  ];

  const lines = [headers.join(",")];

  rows.forEach((r, idx) => {
    const user = r.user || {};

    const row = [
      idx + 1,
      user._id || "",
      `"${(user.name || "").replace(/"/g, '""')}"`,
      `"${(user.email || "").replace(/"/g, '""')}"`,
      r.bestScore ?? "",
      r.bestDuration ?? "",
      r.lastAttemptAt
        ? new Date(r.lastAttemptAt).toISOString()
        : "",
    ];

    lines.push(row.join(","));
  });

  const blob = new Blob([lines.join("\n")], {
    type: "text/csv",
  });

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");

  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}

export default function TestLeaderboard() {
  const { id } = useParams();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [testTitle, setTestTitle] =
    useState("Leaderboard");

  const [query, setQuery] = useState("");

  const authUser = useSelector(
    (s) => s.auth?.data || {}
  );

  useEffect(() => {
    if (id) load();
  }, [id]);

  const load = async () => {
    setLoading(true);

    try {
      const [lbRes, testRes] = await Promise.all([
        api.get(`/tests/${id}/leaderboard`),
        api.get(`/tests/${id}`),
      ]);

      setRows(lbRes.data.leaderboard || []);

      setTestTitle(
        testRes.data?.test?.title ||
          "Leaderboard"
      );
    } catch (e) {
      console.error(e);
      setRows([]);
    }

    setLoading(false);
  };

  const filtered = useMemo(() => {
    if (!query) return rows;

    const q = query.toLowerCase();

    return rows.filter((r) => {
      const u = r.user || {};

      return (
        (u.name || "")
          .toLowerCase()
          .includes(q) ||
        (u.email || "")
          .toLowerCase()
          .includes(q)
      );
    });
  }, [rows, query]);

  const top3 = filtered.slice(0, 3);

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-zinc-900 text-white px-4 py-8 md:px-8">
        <div className="mx-auto max-w-7xl">
          
          {/* Header */}
          <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-yellow-500/20 bg-yellow-500/10 px-4 py-1 text-sm text-yellow-300 backdrop-blur-xl">
                <Trophy size={15} />
                Premium Leaderboard
              </div>

              <h1 className="mt-4 text-4xl font-black tracking-tight">
                {testTitle}
              </h1>

              <p className="mt-2 text-zinc-400">
                Compete with top performers
              </p>
            </div>

            <div className="flex flex-col gap-3 md:flex-row">
              
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />

                <input
                  value={query}
                  onChange={(e) =>
                    setQuery(e.target.value)
                  }
                  placeholder="Search player..."
                  className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-white placeholder:text-zinc-500 backdrop-blur-xl outline-none transition-all focus:border-indigo-500"
                />
              </div>

              {/* Export */}
              <button
                onClick={() =>
                  downloadCsv(
                    `leaderboard-${id}.csv`,
                    rows
                  )
                }
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-medium text-white backdrop-blur-xl transition-all hover:border-indigo-500/30 hover:bg-indigo-500/10"
              >
                <Download size={18} />
                Export
              </button>

              {/* Back */}
              <Link
                to="/tests"
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-3 font-medium text-white shadow-xl shadow-indigo-500/20 transition-all hover:scale-[1.02]"
              >
                <ArrowLeft size={18} />
                Back
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="grid gap-5 md:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-56 animate-pulse rounded-3xl border border-white/10 bg-white/5"
                />
              ))}
            </div>
          ) : (
            <>
              
              {/* Top 3 */}
              <div className="mb-10 grid gap-6 md:grid-cols-3">
                {top3.map((r, idx) => {
                  const user = r.user || {};

                  const isMe =
                    String(user._id) ===
                    String(authUser?._id);

                  const styles = [
                    "from-yellow-500/20 to-yellow-700/10 border-yellow-500/30",
                    "from-zinc-400/20 to-zinc-600/10 border-zinc-400/20",
                    "from-amber-700/20 to-amber-900/10 border-amber-700/30",
                  ];

                  const icons = [
                    <Crown className="text-yellow-400" />,
                    <Medal className="text-zinc-300" />,
                    <Medal className="text-amber-600" />,
                  ];

                  return (
                    <div
                      key={String(user._id || idx)}
                      className={`relative overflow-hidden rounded-3xl border bg-gradient-to-br ${styles[idx]} p-6 backdrop-blur-2xl transition-all duration-300 hover:scale-[1.02] ${
                        isMe
                          ? "ring-2 ring-indigo-400"
                          : ""
                      }`}
                    >
                      
                      {/* Glow */}
                      <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-30" />

                      <div className="relative z-10">
                        
                        {/* Rank */}
                        <div className="flex items-center justify-between">
                          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-xl">
                            {icons[idx]}
                          </div>

                          <div className="rounded-full bg-black/30 px-3 py-1 text-sm font-semibold">
                            #{idx + 1}
                          </div>
                        </div>

                        {/* User */}
                        <div className="mt-6">
                          <h2 className="text-2xl font-bold">
                            {user.name ||
                              user.email ||
                              "Anonymous"}
                          </h2>

                          <p className="mt-1 text-sm text-zinc-400">
                            Elite Performer
                          </p>
                        </div>

                        {/* Stats */}
                        <div className="mt-6 space-y-3">
                          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 p-3">
                            <div className="flex items-center gap-2 text-zinc-300">
                              <Star size={16} />
                              Score
                            </div>

                            <div className="font-bold text-white">
                              {r.bestScore}
                            </div>
                          </div>

                          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 p-3">
                            <div className="flex items-center gap-2 text-zinc-300">
                              <Timer size={16} />
                              Time
                            </div>

                            <div className="font-bold text-white">
                              {r.bestDuration ??
                                "-"}
                              s
                            </div>
                          </div>
                        </div>

                        {isMe && (
                          <div className="mt-5 rounded-2xl border border-indigo-500/30 bg-indigo-500/10 px-4 py-2 text-center text-sm font-medium text-indigo-300">
                            Your Rank
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Full Leaderboard */}
              <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl">
                
                {/* Table Header */}
                <div className="border-b border-white/10 bg-white/5 px-6 py-5">
                  <h2 className="text-2xl font-bold">
                    Global Rankings
                  </h2>

                  <p className="mt-1 text-sm text-zinc-400">
                    Real-time leaderboard standings
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px]">
                    <thead>
                      <tr className="border-b border-white/10 text-left text-sm text-zinc-400">
                        <th className="px-6 py-4">
                          Rank
                        </th>

                        <th className="px-6 py-4">
                          Player
                        </th>

                        <th className="px-6 py-4">
                          Score
                        </th>

                        <th className="px-6 py-4">
                          Duration
                        </th>

                        <th className="px-6 py-4">
                          Last Attempt
                        </th>

                        <th className="px-6 py-4">
                          Action
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {filtered.map((r, idx) => {
                        const user = r.user || {};

                        const isMe =
                          String(user._id) ===
                          String(
                            authUser?._id
                          );

                        return (
                          <tr
                            key={String(
                              user._id || idx
                            )}
                            className={`border-b border-white/5 transition-all hover:bg-white/5 ${
                              isMe
                                ? "bg-indigo-500/10"
                                : ""
                            }`}
                          >
                            <td className="px-6 py-5">
                              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 font-bold">
                                #{idx + 1}
                              </div>
                            </td>

                            <td className="px-6 py-5">
                              <div>
                                <div className="font-semibold text-white">
                                  {user.name ||
                                    user.email ||
                                    "Anonymous"}
                                </div>

                                <div className="mt-1 text-sm text-zinc-500">
                                  {user.email}
                                </div>
                              </div>
                            </td>

                            <td className="px-6 py-5">
                              <div className="inline-flex rounded-xl bg-green-500/10 px-4 py-2 font-semibold text-green-400">
                                {r.bestScore}
                              </div>
                            </td>

                            <td className="px-6 py-5 text-zinc-300">
                              {r.bestDuration ??
                                "-"}{" "}
                              sec
                            </td>

                            <td className="px-6 py-5 text-zinc-400">
                              {r.lastAttemptAt
                                ? new Date(
                                    r.lastAttemptAt
                                  ).toLocaleString()
                                : "-"}
                            </td>

                            <td className="px-6 py-5">
                              <Link
                                to={`/tests/attempts?testId=${id}&userId=${user._id}`}
                                className="inline-flex items-center rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-sm font-medium text-white transition-all hover:scale-[1.02]"
                              >
                                View Attempts
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}