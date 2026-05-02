import React from 'react';

export default function SectionContainer({ title, children }){
  return (
    <section className="mb-6">
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <div className="bg-white/5 rounded p-4">{children}</div>
    </section>
  )
}
