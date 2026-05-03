import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../Layout/Layout';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTests } from '../../Redux/testSlice';

export default function TestList(){
  const dispatch = useDispatch();
  const tests = useSelector((state) => state?.tests?.list || []);
  // console.log(tests);
  const loading = useSelector((state) => state?.tests?.loading?.list);
  // console.log(loading);

  
  useEffect(() => {
    dispatch(fetchTests());
  }, [dispatch]);
  

  return (
    <Layout>
      <div className="p-6 max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-4">Available Tests</h2>
        {loading ? (
          <div className="text-gray-500">Loading tests...</div>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tests.map(t => (
              <li key={t._id} className="p-4 border rounded-lg bg-white/60 shadow-sm">
                <div className="flex flex-col gap-3">
                  <div>
                    <div className="font-semibold text-lg">{t.title}</div>
                    <div className="text-sm text-gray-500">{t.description}</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">Duration: {Math.ceil((t.durationSeconds||300)/60)} min</div>
                    <Link to={`/tests/take/${t._id}`} className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700">Take Test</Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Layout>
  )
}
