import { BarChart3, BookOpen, Home, PlaySquare, UserRound } from "lucide-react";
import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Home", icon: Home },
  { to: "/ott", label: "Stream", icon: PlaySquare },
  { to: "/courses", label: "Courses", icon: BookOpen },
  { to: "/tests", label: "Tests", icon: BarChart3 },
  { to: "/user/profile", label: "Me", icon: UserRound },
];

export default function MobileBottomNav() {
  return (
    <nav className="fixed inset-x-3 bottom-3 z-[60] rounded-[18px] border border-white/10 bg-black/70 px-2 py-2 text-white shadow-premium backdrop-blur-2xl md:hidden">
      <div className="grid grid-cols-5 gap-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `flex flex-col items-center gap-1 rounded-[14px] py-2 text-[11px] transition ${isActive ? "bg-white/12 text-sky-200" : "text-slate-400"}`}>
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
