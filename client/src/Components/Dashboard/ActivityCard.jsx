import React from 'react';

export default function ActivityCard({ item }){
  return (
    <div className="p-3 bg-white/5 rounded flex items-start justify-between">
      <div>
        <div className="text-sm font-semibold">{item.title}</div>
        <div className="text-xs text-gray-300">{item.desc}</div>
        <div className="text-xs text-gray-500 mt-1">{new Date(item.date).toLocaleString()}</div>
      </div>
      <div className="text-sm">
        {item.type === 'notification' ? (
          <a href={item.meta?.link || '#'} className="text-indigo-400">Open</a>
        ) : (
          <a href={`/tests/result/${item.id}`} className="text-indigo-400">View Result</a>
        )}
      </div>
    </div>
  )
}
