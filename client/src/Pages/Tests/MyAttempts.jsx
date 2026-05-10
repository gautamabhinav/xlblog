// import React, { useEffect, useState } from 'react';
// import Layout from '../../Layout/Layout';
// import api, { listAttempts as listAttemptsApi, getAttempt } from '../../Helper/axiosInstance';
// import { Link } from 'react-router-dom';

// export default function MyAttempts(){
//   const [attempts, setAttempts] = useState([]);
//   const [loading, setLoading] = useState(false);

//   useEffect(()=>{ load() },[]);

//   const load = async () => {
//     setLoading(true);
//     try{
//       const res = await api.get('/tests/attempts/me');
//       setAttempts(res.data.attempts || []);
//     }catch(e){
//       console.error(e);
//       setAttempts([]);
//     }
//     setLoading(false);
//   }

//   return (
//     <Layout>
//       <div className="p-6 max-w-4xl mx-auto">
//         <h1 className="text-2xl font-bold mb-4">My Attempts</h1>
//         {loading ? <div>Loading...</div> : (
//           <div className="bg-white rounded shadow overflow-x-auto">
//             <table className="w-full text-left text-sm">
//               <thead className="bg-gray-100">
//                 <tr>
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




import React, { useEffect, useState } from "react";
import Layout from "../../Layout/Layout";
import api from "../../Helper/axiosInstance";
import { Link } from "react-router-dom";
import {
  Trophy,
  CalendarDays,
  BarChart3,
  ArrowRight,
} from "lucide-react";

export default function MyAttempts() {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);

    try {
      const res = await api.get("/tests/attempts/me");
      setAttempts(res.data.attempts || []);
    } catch (e) {
      console.error(e);
      setAttempts([]);
    }

    setLoading(false);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-zinc-900 text-white px-4 md:px-8 py-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              My Attempts
            </h1>

            <p className="text-zinc-400 mt-2">
              Track your test performance and progress
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-5 py-3 rounded-2xl backdrop-blur-lg">
            <Trophy className="text-yellow-400 w-6 h-6" />
            <div>
              <p className="text-sm text-zinc-400">Total Attempts</p>
              <h2 className="font-bold text-xl">
                {attempts.length}
              </h2>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-24 rounded-2xl bg-white/5 animate-pulse border border-white/10"
              />
            ))}
          </div>
        ) : attempts.length === 0 ? (
          
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <BarChart3 className="w-16 h-16 text-zinc-600 mb-4" />

            <h2 className="text-2xl font-semibold mb-2">
              No Attempts Yet
            </h2>

            <p className="text-zinc-400 max-w-md">
              Start attempting tests to track your learning progress and rankings.
            </p>
          </div>
        ) : (
          
          /* Attempts Grid */
          <div className="grid gap-5">
            {attempts.map((a, index) => {
              const percentage = Math.round(
                (a.score / Math.max(1, a.maxScore)) * 100
              );

              return (
                <div
                  key={a._id}
                  className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 hover:border-indigo-500/40 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10"
                >
                  {/* Glow Effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10" />

                  <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    
                    {/* Left Content */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-lg">
                          #{index + 1}
                        </div>

                        <div>
                          <h2 className="text-xl font-semibold text-white">
                            {a.test?.title || "Untitled Test"}
                          </h2>

                          <div className="flex items-center gap-2 text-zinc-400 text-sm mt-1">
                            <CalendarDays className="w-4 h-4" />
                            {new Date(a.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </div>

                      {/* Progress */}
                      <div className="mt-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-zinc-300">
                            Performance
                          </span>

                          <span className="font-semibold text-white">
                            {percentage}%
                          </span>
                        </div>

                        <div className="w-full h-3 rounded-full bg-zinc-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${
                              percentage >= 80
                                ? "bg-green-500"
                                : percentage >= 50
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Right Stats */}
                    <div className="flex flex-col items-start lg:items-end gap-4">
                      <div className="text-right">
                        <p className="text-zinc-400 text-sm">
                          Score
                        </p>

                        <h3 className="text-3xl font-bold text-white">
                          {a.score}
                          <span className="text-zinc-500 text-lg">
                            {" "}
                            / {a.maxScore}
                          </span>
                        </h3>
                      </div>

                      <Link
                        to={`/tests/result/${a._id}`}
                        className="group/button inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium transition-all duration-300 shadow-lg shadow-indigo-500/20"
                      >
                        View Result
                        <ArrowRight className="w-4 h-4 group-hover/button:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}