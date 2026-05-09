import { useEffect, useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { BellRing, Database, RadioTower, ShieldCheck, UploadCloud, UsersRound, Video } from "lucide-react";
import Layout from "../../Layout/Layout";
import api from "../../Helper/axiosInstance";
import DynamicTable from "../../Components/Admin/DynamicTable";
import { CinematicPage, GlassPanel, PremiumButton, SectionHeader, StatCard } from "../../Components/Premium/PremiumShell";

const chartData = [
  { name: "Mon", users: 1200, watch: 420 },
  { name: "Tue", users: 1800, watch: 680 },
  { name: "Wed", users: 2400, watch: 860 },
  { name: "Thu", users: 3100, watch: 1040 },
  { name: "Fri", users: 4200, watch: 1420 },
  { name: "Sat", users: 5100, watch: 1840 },
];

export default function AdminDashboard() {
  const [models, setModels] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/models");
      setModels(res.data.models || []);
      if (res.data.models?.length) setSelected(res.data.models[0]);
    } catch (error) {
      console.error(error);
      setModels([]);
    }
    setLoading(false);
  };

  const stats = useMemo(
    () => [
      { label: "Data models", value: models.length || 0, icon: Database },
      { label: "Realtime ops", value: "Ready", icon: RadioTower, accent: "text-emerald-200" },
      { label: "Video analytics", value: "OTT", icon: Video, accent: "text-red-200" },
      { label: "Moderation", value: "AI", icon: ShieldCheck, accent: "text-fuchsia-200" },
    ],
    [models.length]
  );

  return (
    <Layout>
      <CinematicPage>
        <section className="px-4 py-6 sm:px-6 lg:px-10">
          <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
            <GlassPanel className="p-5 md:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-sky-200">Admin Command Center</p>
              <h1 className="mt-3 text-4xl font-black md:text-6xl">Enterprise-grade platform operations.</h1>
              <p className="mt-4 max-w-2xl text-slate-300">Manage content, users, courses, uploads, notifications, realtime systems, and moderation workflows from one premium console.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <PremiumButton><UploadCloud size={17} /> Upload center</PremiumButton>
                <PremiumButton variant="ghost"><BellRing size={17} /> Notify learners</PremiumButton>
              </div>
            </GlassPanel>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
              {stats.map((item) => <StatCard key={item.label} {...item} />)}
            </div>
          </div>

          <section className="mt-8 grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
            <GlassPanel className="p-5">
              <SectionHeader eyebrow="Engagement" title="Learning activity" />
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="adminUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.75} />
                        <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.08)" />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip contentStyle={{ background: "#020617", border: "1px solid rgba(255,255,255,.12)", borderRadius: 8 }} />
                    <Area type="monotone" dataKey="users" stroke="#38bdf8" fill="url(#adminUsers)" />
                    <Area type="monotone" dataKey="watch" stroke="#ef4444" fill="rgba(239,68,68,.12)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </GlassPanel>

            <GlassPanel className="overflow-hidden p-5">
              <SectionHeader eyebrow="Database Studio" title="Model management" />
              <div className="grid gap-5 lg:grid-cols-[190px_1fr]">
                <aside className="space-y-2">
                  {loading ? <div className="text-slate-400">Loading models...</div> : models.map((model) => (
                    <button key={model} className={`w-full rounded-premium px-3 py-2 text-left text-sm transition ${selected === model ? "bg-gradient-to-r from-red-600 to-sky-500 text-white shadow-glow-red" : "bg-white/8 text-slate-300 hover:bg-white/12"}`} onClick={() => setSelected(model)}>
                      {model}
                    </button>
                  ))}
                </aside>
                <div className="min-w-0 overflow-hidden rounded-premium border border-white/10 bg-black/25 p-3">
                  {selected ? <DynamicTable model={selected} /> : <div className="text-slate-400">Select a model</div>}
                </div>
              </div>
            </GlassPanel>
          </section>
        </section>
      </CinematicPage>
    </Layout>
  );
}
