import { motion } from "framer-motion";

export const pageMotion = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] },
};

export function CinematicPage({ children, className = "" }) {
  return (
    <motion.main {...pageMotion} className={`relative min-h-screen overflow-hidden bg-premium-black text-white ${className}`}>
      <div className="pointer-events-none absolute inset-0 bg-cinematic" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[42rem] bg-[radial-gradient(circle_at_12%_8%,rgba(229,9,20,.22),transparent_32%),radial-gradient(circle_at_84%_16%,rgba(0,180,255,.2),transparent_30%)]" />
      <div className="relative z-10">{children}</div>
    </motion.main>
  );
}

export function SectionHeader({ eyebrow, title, action }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="text-xs uppercase tracking-[0.28em] text-sky-200/80">{eyebrow}</p>}
        <h2 className="mt-1 text-2xl font-black tracking-tight text-white md:text-3xl">{title}</h2>
      </div>
      {action}
    </div>
  );
}

export function GlassPanel({ children, className = "", hover = false }) {
  return (
    <motion.div
      whileHover={hover ? { y: -4, scale: 1.01 } : undefined}
      className={`rounded-premium border border-white/10 bg-white/[0.055] shadow-premium backdrop-blur-2xl ${className}`}
    >
      {children}
    </motion.div>
  );
}

export function PremiumButton({ children, variant = "primary", className = "", ...props }) {
  const styles = {
    primary: "bg-gradient-to-r from-red-600 via-rose-500 to-sky-500 text-white shadow-glow-red hover:brightness-110",
    ghost: "border border-white/12 bg-white/[0.07] text-white hover:bg-white/[0.12]",
    dark: "border border-white/10 bg-black/40 text-white hover:bg-black/60",
  };

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      className={`inline-flex items-center justify-center gap-2 rounded-premium px-4 py-2.5 text-sm font-bold transition ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}

export function PremiumInput({ className = "", ...props }) {
  return (
    <input
      className={`w-full rounded-premium border border-white/10 bg-black/35 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-sky-300 focus:ring-2 focus:ring-sky-300/20 ${className}`}
      {...props}
    />
  );
}

export function StatCard({ icon: Icon, label, value, accent = "text-sky-200" }) {
  return (
    <GlassPanel hover className="p-4">
      <Icon className={`h-5 w-5 ${accent}`} />
      <p className="mt-4 text-2xl font-black text-white">{value}</p>
      <p className="mt-1 text-sm text-slate-400">{label}</p>
    </GlassPanel>
  );
}

export function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-premium border border-white/10 bg-white/[0.05]">
      <div className="aspect-video animate-pulse bg-white/10" />
      <div className="space-y-2 p-4">
        <div className="h-4 w-2/3 animate-pulse rounded bg-white/10" />
        <div className="h-3 w-full animate-pulse rounded bg-white/10" />
      </div>
    </div>
  );
}
