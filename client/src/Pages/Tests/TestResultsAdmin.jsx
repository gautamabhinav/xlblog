// import React, { useEffect, useState } from 'react';
// import Layout from '../../Layout/Layout';
// // import testAPI from '../../Helper/testAPI';
// import { Link } from 'react-router-dom';
// import api from '../../Helper/axiosInstance';
// import { listAttempts } from '../../Helper/axiosInstance';

// export default function TestResultsAdmin(){
//   const [attempts, setAttempts] = useState([]);
//   const [loading, setLoading] = useState(false);

//   useEffect(()=>{ load() },[]);

//   const load = async () => {
//     setLoading(true);
//     const res = await listAttempts();
//     setAttempts(res.attempts || []);
//     setLoading(false);
//   }

//   return (
//     <Layout>
//       <div className="p-6 max-w-6xl mx-auto">
//         <div className="flex items-center justify-between mb-6">
//           <h1 className="text-2xl font-bold">Test Attempts</h1>
//         </div>

//         {loading ? <div>Loading...</div> : (
//           <div className="bg-white rounded shadow overflow-x-auto">
//             <table className="w-full text-left text-sm">
//               <thead className="bg-gray-100">
//                 <tr>
//                   <th className="px-4 py-2">User</th>
//                   <th className="px-4 py-2">Test</th>
//                   <th className="px-4 py-2">Score</th>
//                   <th className="px-4 py-2">Percent</th>
//                   <th className="px-4 py-2">Taken At</th>
//                   <th className="px-4 py-2">Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {attempts.map(a => (
//                   <tr key={a._id} className="border-t">
//                     <td className="px-4 py-2">{a.user?.name || a.user?.email || 'Anonymous'}</td>
//                     <td className="px-4 py-2">{a.test?.title}</td>
//                     <td className="px-4 py-2">{a.score} / {a.maxScore}</td>
//                     <td className="px-4 py-2">{Math.round((a.score / Math.max(1,a.maxScore))*100)}%</td>
//                     <td className="px-4 py-2">{new Date(a.createdAt).toLocaleString()}</td>
//                     <td className="px-4 py-2"><Link to={`/tests/result/${a._id}`} className="text-indigo-600">View</Link></td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
//     </Layout>
//   )
// }


import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import Layout from "../../Layout/Layout";

import { Link } from "react-router-dom";

import {
  Download,
  Eye,
  Search,
  Trophy,
  Users,
  Medal,
  Sparkles,
  Clock3,
  FileSpreadsheet,
} from "lucide-react";

import { listAttempts } from "../../Helper/axiosInstance";

import {
  CinematicPage,
  GlassPanel,
  StatCard,
  SkeletonCard,
} from "../../Components/Premium/PremiumShell";

export default function TestResultsAdmin() {
  const [attempts, setAttempts] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [query, setQuery] =
    useState("");

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);

      const res =
        await listAttempts();

      setAttempts(
        res?.attempts || []
      );
    } catch (error) {
      console.error(error);

      setAttempts([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredAttempts =
    useMemo(() => {
      const q = query
        .toLowerCase()
        .trim();

      if (!q) return attempts;

      return attempts.filter(
        (a) => {
          const user =
            a?.user?.name ||
            a?.user?.email ||
            "";

          const test =
            a?.test?.title || "";

          return `${user} ${test}`
            .toLowerCase()
            .includes(q);
        }
      );
    }, [attempts, query]);

  const averageScore =
    filteredAttempts.length > 0
      ? Math.round(
          filteredAttempts.reduce(
            (acc, item) =>
              acc +
              Number(
                item?.score || 0
              ),
            0
          ) /
            filteredAttempts.length
        )
      : 0;

  const exportCSV = () => {
    const headers = [
      "User",
      "Email",
      "Test",
      "Score",
      "Max Score",
      "Percent",
      "Date",
    ];

    const rows =
      filteredAttempts.map(
        (a) => [
          a?.user?.name || "",
          a?.user?.email || "",
          a?.test?.title || "",
          a?.score || 0,
          a?.maxScore || 0,
          `${Math.round(
            (a.score /
              Math.max(
                1,
                a.maxScore
              )) *
              100
          )}%`,
          new Date(
            a.createdAt
          ).toLocaleString(),
        ]
      );

    const csvContent = [
      headers.join(","),
      ...rows.map((r) =>
        r.join(",")
      ),
    ].join("\n");

    const blob = new Blob(
      [csvContent],
      {
        type: "text/csv",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const a =
      document.createElement("a");

    a.href = url;

    a.download =
      "test-attempts.csv";

    a.click();

    URL.revokeObjectURL(url);
  };

  return (
    <Layout>
      <CinematicPage className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-zinc-900 text-white">
        
        {/* Glow */}
        <div className="absolute left-0 top-0 h-[450px] w-[450px] rounded-full bg-indigo-500/10 blur-[120px]" />

        <div className="absolute right-0 top-40 h-[350px] w-[350px] rounded-full bg-red-500/10 blur-[120px]" />

        <div className="relative z-10 mx-auto max-w-7xl p-4 sm:p-6 lg:p-10">
          
          {/* HERO */}
          <GlassPanel className="relative overflow-hidden border border-white/10 bg-gradient-to-br from-white/10 via-white/[0.04] to-transparent p-6 md:p-8">
            
            <div className="absolute -right-10 top-0 h-60 w-60 rounded-full bg-indigo-500/10 blur-[100px]" />

            <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-1 text-xs font-bold uppercase tracking-[0.24em] text-indigo-200">
                  <Sparkles size={14} />
                  Premium Admin Analytics
                </div>

                <h1 className="mt-5 text-4xl font-black md:text-6xl">
                  Test Attempts
                </h1>

                <p className="mt-4 max-w-2xl text-base leading-7 text-slate-400">
                  Track student
                  performance,
                  analytics,
                  attempts,
                  rankings, and
                  complete test
                  insights with
                  cinematic premium
                  dashboard UI.
                </p>
              </div>

              {/* Search */}
              <div className="w-full max-w-md">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />

                  <input
                    type="text"
                    value={query}
                    onChange={(e) =>
                      setQuery(
                        e.target.value
                      )
                    }
                    placeholder="Search users or tests..."
                    className="h-14 w-full rounded-2xl border border-white/10 bg-black/30 pl-12 pr-4 text-white outline-none backdrop-blur-xl placeholder:text-slate-500 focus:border-indigo-500/40"
                  />
                </div>
              </div>
            </div>
          </GlassPanel>

          {/* STATS */}
          <div className="mt-8 grid gap-5 md:grid-cols-4">
            <StatCard
              icon={Users}
              label="Total Attempts"
              value={
                filteredAttempts.length
              }
            />

            <StatCard
              icon={Trophy}
              label="Average Score"
              value={averageScore}
              accent="text-yellow-200"
            />

            <StatCard
              icon={Medal}
              label="Top Performance"
              value="LIVE"
              accent="text-emerald-200"
            />

            <StatCard
              icon={Clock3}
              label="Realtime Data"
              value="ACTIVE"
              accent="text-red-200"
            />
          </div>

          {/* TABLE */}
          <div className="mt-8">
            <GlassPanel className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04]">
              
              {/* Header */}
              <div className="flex flex-col gap-4 border-b border-white/10 p-5 md:flex-row md:items-center md:justify-between">
                
                <div>
                  <h2 className="text-2xl font-bold">
                    Attempt Records
                  </h2>

                  <p className="mt-1 text-sm text-slate-400">
                    Complete list of
                    user examination
                    attempts
                  </p>
                </div>

                <button
                  onClick={exportCSV}
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-semibold text-white transition-all hover:border-indigo-500/30 hover:bg-indigo-500/10"
                >
                  <Download size={18} />
                  Export CSV
                </button>
              </div>

              {/* Loading */}
              {loading ? (
                <div className="grid gap-4 p-6 md:grid-cols-3">
                  {Array.from({
                    length: 6,
                  }).map(
                    (_, index) => (
                      <SkeletonCard
                        key={index}
                      />
                    )
                  )}
                </div>
              ) : filteredAttempts.length ===
                0 ? (
                <div className="flex flex-col items-center justify-center px-6 py-24 text-center">
                  
                  <FileSpreadsheet
                    size={60}
                    className="text-slate-600"
                  />

                  <h3 className="mt-5 text-2xl font-bold">
                    No Attempts Found
                  </h3>

                  <p className="mt-2 text-slate-400">
                    No records matched
                    your search query.
                  </p>
                </div>
              ) : (
                
                /* TABLE */
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1100px]">
                    
                    <thead className="border-b border-white/10 bg-white/[0.03]">
                      <tr>
                        {[
                          "User",
                          "Test",
                          "Score",
                          "Accuracy",
                          "Taken At",
                          "Actions",
                        ].map(
                          (item) => (
                            <th
                              key={item}
                              className="px-6 py-5 text-left text-xs font-bold uppercase tracking-[0.2em] text-slate-400"
                            >
                              {item}
                            </th>
                          )
                        )}
                      </tr>
                    </thead>

                    <tbody>
                      {filteredAttempts.map(
                        (
                          a,
                          index
                        ) => {
                          const percent =
                            Math.round(
                              (a.score /
                                Math.max(
                                  1,
                                  a.maxScore
                                )) *
                                100
                            );

                          return (
                            <tr
                              key={
                                a._id
                              }
                              className="border-b border-white/5 transition-all hover:bg-white/[0.03]"
                            >
                              
                              {/* USER */}
                              <td className="px-6 py-5">
                                <div className="flex items-center gap-4">
                                  
                                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/20 to-red-500/20 text-lg font-black text-white">
                                    {(
                                      a
                                        ?.user
                                        ?.name ||
                                      a
                                        ?.user
                                        ?.email ||
                                      "A"
                                    )
                                      .charAt(
                                        0
                                      )
                                      .toUpperCase()}
                                  </div>

                                  <div>
                                    <div className="font-semibold text-white">
                                      {a
                                        ?.user
                                        ?.name ||
                                        "Anonymous"}
                                    </div>

                                    <div className="mt-1 text-sm text-slate-400">
                                      {a
                                        ?.user
                                        ?.email ||
                                        "No email"}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              {/* TEST */}
                              <td className="px-6 py-5">
                                <div className="max-w-[250px] truncate font-medium text-slate-200">
                                  {a
                                    ?.test
                                    ?.title ||
                                    "Untitled Test"}
                                </div>
                              </td>

                              {/* SCORE */}
                              <td className="px-6 py-5">
                                <div className="inline-flex rounded-full bg-indigo-500/10 px-4 py-2 text-sm font-bold text-indigo-200">
                                  {a.score} /{" "}
                                  {
                                    a.maxScore
                                  }
                                </div>
                              </td>

                              {/* ACCURACY */}
                              <td className="px-6 py-5">
                                <div className="flex items-center gap-3">
                                  
                                  <div className="h-2 w-28 overflow-hidden rounded-full bg-white/10">
                                    <div
                                      className={`h-full rounded-full ${
                                        percent >=
                                        80
                                          ? "bg-emerald-400"
                                          : percent >=
                                            50
                                          ? "bg-yellow-400"
                                          : "bg-red-400"
                                      }`}
                                      style={{
                                        width: `${percent}%`,
                                      }}
                                    />
                                  </div>

                                  <span className="text-sm font-bold text-white">
                                    {
                                      percent
                                    }
                                    %
                                  </span>
                                </div>
                              </td>

                              {/* DATE */}
                              <td className="px-6 py-5">
                                <div className="text-sm text-slate-300">
                                  {new Date(
                                    a.createdAt
                                  ).toLocaleString()}
                                </div>
                              </td>

                              {/* ACTION */}
                              <td className="px-6 py-5">
                                <Link
                                  to={`/tests/result/${a._id}`}
                                >
                                  <button className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-red-600 px-5 py-3 font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.03] hover:from-indigo-500 hover:to-red-500">
                                    <Eye size={18} />
                                    View
                                  </button>
                                </Link>
                              </td>
                            </tr>
                          );
                        }
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </GlassPanel>
          </div>
        </div>
      </CinematicPage>
    </Layout>
  );
}