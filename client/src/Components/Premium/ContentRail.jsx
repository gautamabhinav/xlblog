import { motion } from "framer-motion";
import { BookOpen, Clock3, Play, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { SectionHeader } from "./PremiumShell";

const fallbackGradients = [
  "from-red-600 via-rose-500 to-orange-400",
  "from-sky-500 via-blue-600 to-indigo-700",
  "from-emerald-400 via-teal-500 to-cyan-600",
  "from-fuchsia-500 via-purple-600 to-blue-600",
];

export function ContentCard({ item, index = 0, to = "#", type = "course" }) {
  const image = item?.thumbnail?.secure_url || item?.thumbnailUrl || item?.image || item?.cover;
  const title = item?.title || item?.name || "Premium learning title";
  const description = item?.description || item?.meta || "Adaptive learning, guided practice, and AI-ready recommendations.";

  return (
    <motion.article
      whileHover={{ y: -8, scale: 1.025 }}
      transition={{ type: "spring", stiffness: 220, damping: 22 }}
      className="group relative min-w-[260px] max-w-[260px] overflow-hidden rounded-premium border border-white/10 bg-white/[0.055] shadow-premium"
    >
      <Link to={to} state={item}>
        <div className={`relative aspect-video bg-gradient-to-br ${fallbackGradients[index % fallbackGradients.length]}`}>
          {image ? <img src={image} alt={title} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-110" /> : null}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />
          <button className="absolute bottom-3 left-3 grid h-10 w-10 place-items-center rounded-full bg-white text-black opacity-0 shadow-xl transition group-hover:opacity-100">
            <Play size={18} fill="currentColor" />
          </button>
          <span className="absolute right-3 top-3 rounded-full bg-black/45 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-white backdrop-blur">
            {type}
          </span>
        </div>
        <div className="p-4">
          <h3 className="line-clamp-1 text-base font-bold text-white">{title}</h3>
          <p className="mt-1 line-clamp-2 text-sm leading-5 text-slate-400">{description}</p>
          <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
            <span className="inline-flex items-center gap-1"><Star size={13} className="text-yellow-300" /> 4.8</span>
            <span className="inline-flex items-center gap-1"><Clock3 size={13} /> {item?.numberOfLectures || item?.duration || 12} lessons</span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}

export function ContentRail({ eyebrow, title, items = [], toBuilder, type, emptyText = "Nothing here yet." }) {
  return (
    <section className="py-6">
      <SectionHeader eyebrow={eyebrow} title={title} />
      {items.length ? (
        <div className="premium-scroll flex gap-4 overflow-x-auto pb-4">
          {items.map((item, index) => (
            <ContentCard key={item?._id || item?.id || item?.title || index} item={item} index={index} to={toBuilder?.(item) || "#"} type={type} />
          ))}
        </div>
      ) : (
        <div className="rounded-premium border border-white/10 bg-white/[0.04] p-8 text-center text-slate-400">
          <BookOpen className="mx-auto mb-3 h-8 w-8 text-slate-500" />
          {emptyText}
        </div>
      )}
    </section>
  );
}
