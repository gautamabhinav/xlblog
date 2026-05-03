import React, { useEffect, useState } from 'react';
import Layout from '../../Layout/Layout';
// import testAPI from '../../Helper/testAPI';
import { Link } from 'react-router-dom';
import api from '../../Helper/axiosInstance';
import { listAttempts } from '../../Helper/axiosInstance';

export default function TestResultsAdmin(){
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(()=>{ load() },[]);

  const load = async () => {
    setLoading(true);
    const res = await listAttempts();
    setAttempts(res.attempts || []);
    setLoading(false);
  }

  return (
    <Layout>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Test Attempts</h1>
        </div>

        {loading ? <div>Loading...</div> : (
          <div className="bg-white rounded shadow overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2">User</th>
                  <th className="px-4 py-2">Test</th>
                  <th className="px-4 py-2">Score</th>
                  <th className="px-4 py-2">Percent</th>
                  <th className="px-4 py-2">Taken At</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {attempts.map(a => (
                  <tr key={a._id} className="border-t">
                    <td className="px-4 py-2">{a.user?.name || a.user?.email || 'Anonymous'}</td>
                    <td className="px-4 py-2">{a.test?.title}</td>
                    <td className="px-4 py-2">{a.score} / {a.maxScore}</td>
                    <td className="px-4 py-2">{Math.round((a.score / Math.max(1,a.maxScore))*100)}%</td>
                    <td className="px-4 py-2">{new Date(a.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-2"><Link to={`/tests/result/${a._id}`} className="text-indigo-600">View</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  )
}
