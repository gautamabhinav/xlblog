import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { BrainCircuit, Cpu, DatabaseZap, RadioTower, ShieldCheck, UsersRound } from "lucide-react";
import Layout from "../../Layout/Layout";

const traffic = [
  { name: "00:00", users: 1400, bitrate: 32 },
  { name: "04:00", users: 2200, bitrate: 44 },
  { name: "08:00", users: 6400, bitrate: 71 },
  { name: "12:00", users: 10400, bitrate: 88 },
  { name: "16:00", users: 18200, bitrate: 93 },
  { name: "20:00", users: 24600, bitrate: 97 },
];

const cards = [
  { label: "Concurrent users", value: "2.4M ready", icon: UsersRound },
  { label: "API p95 latency", value: "<120ms", icon: Cpu },
  { label: "Cache hit target", value: "92%", icon: DatabaseZap },
  { label: "Security posture", value: "Zero-trust", icon: ShieldCheck },
  { label: "Realtime rooms", value: "Redis-ready", icon: RadioTower },
  { label: "AI workloads", value: "Queue-first", icon: BrainCircuit },
];

const EnterpriseDashboard = () => {
  return (
    <Layout>
      <main className="min-h-screen bg-slate-950 px-4 py-6 text-white sm:px-6 lg:px-10">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-cyan-200">Enterprise Ops</p>
            <h1 className="mt-2 text-3xl font-black md:text-5xl">Scale, streaming, and AI observability</h1>
          </div>
          <div className="rounded-[8px] border border-emerald-300/30 bg-emerald-300/10 px-4 py-2 text-sm text-emerald-100">
            Kubernetes and CDN deployment ready
          </div>
        </div>

        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          {cards.map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-[8px] border border-white/10 bg-white/[0.05] p-4">
              <Icon className="h-5 w-5 text-cyan-200" />
              <p className="mt-4 text-2xl font-bold">{value}</p>
              <p className="text-sm text-slate-400">{label}</p>
            </div>
          ))}
        </section>

        <section className="mt-6 grid gap-4 xl:grid-cols-[1.4fr_0.6fr]">
          <div className="rounded-[8px] border border-white/10 bg-white/[0.05] p-4">
            <h2 className="text-lg font-semibold">Global streaming demand</h2>
            <div className="mt-4 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={traffic}>
                  <defs>
                    <linearGradient id="users" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#67e8f9" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#67e8f9" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ background: "#020617", border: "1px solid rgba(255,255,255,.12)", borderRadius: 8 }} />
                  <Area type="monotone" dataKey="users" stroke="#67e8f9" fill="url(#users)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-[8px] border border-white/10 bg-white/[0.05] p-4">
            <h2 className="text-lg font-semibold">Production roadmap</h2>
            <div className="mt-4 space-y-3">
              {["Redis cache + Socket.IO adapter", "BullMQ workers for video/AI", "MongoDB shard keys and read replicas", "Signed CDN URLs and DRM provider", "Prometheus, Grafana, structured logs"].map((item) => (
                <div key={item} className="rounded-[8px] bg-black/25 p-3 text-sm text-slate-200">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
};

export default EnterpriseDashboard;
