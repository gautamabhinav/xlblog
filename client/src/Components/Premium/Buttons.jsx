import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const variants = {
  primary: "bg-gradient-to-r from-red-600 to-sky-500 text-white shadow-glow-red hover:brightness-110",
  secondary: "border border-white/10 bg-white/10 text-white hover:bg-white/15",
  ghost: "bg-transparent text-slate-200 hover:bg-white/10",
  danger: "bg-red-600 text-white hover:bg-red-500",
};

export function Button({ children, variant = "primary", loading = false, disabled = false, className = "", ...props }) {
  return (
    <motion.button
      whileTap={{ scale: disabled || loading ? 1 : 0.97 }}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-premium px-4 py-2.5 text-sm font-bold transition focus:outline-none focus:ring-2 focus:ring-sky-300/40 disabled:cursor-not-allowed disabled:opacity-55 ${variants[variant]} ${className}`}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </motion.button>
  );
}

export const PrimaryButton = (props) => <Button variant="primary" {...props} />;
export const SecondaryButton = (props) => <Button variant="secondary" {...props} />;
export const GhostButton = (props) => <Button variant="ghost" {...props} />;
export const DangerButton = (props) => <Button variant="danger" {...props} />;

export function IconButton({ children, className = "", ...props }) {
  return (
    <motion.button
      whileTap={{ scale: 0.94 }}
      className={`grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/10 text-white transition hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-sky-300/40 ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}
