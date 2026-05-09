import { useState } from "react";
import { Link } from "react-router-dom";
import { BsFacebook, BsInstagram, BsLinkedin, BsTwitter } from "react-icons/bs";
import { FiMail } from "react-icons/fi";
import { toast } from "react-hot-toast";

const Footer = () => {
  const year = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submitNewsletter = (event) => {
    event.preventDefault();
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      toast.error("Please enter a valid email");
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setEmail("");
      toast.success("You are subscribed");
    }, 600);
  };

  return (
    <footer className="border-t border-white/10 bg-premium-black text-gray-200">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="space-y-4">
            <h3 className="text-2xl font-black tracking-tight text-white">
              XL<span className="text-red-500">Stream</span>
            </h3>
            <p className="max-w-sm text-sm leading-6 text-zinc-300">
              Premium LMS, OTT streaming, exams, analytics, and AI-ready learning experiences in one cinematic platform.
            </p>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-gradient-to-br from-red-600 to-sky-500 p-2 font-semibold text-white">XL</div>
              <span className="text-xs text-zinc-400">Built for learners • OTT-first</span>
            </div>
            <div className="flex gap-3">
              {[
                [BsFacebook, "Facebook", "https://facebook.com", "text-indigo-300"],
                [BsInstagram, "Instagram", "https://instagram.com", "text-pink-300"],
                [BsTwitter, "Twitter", "https://twitter.com", "text-sky-300"],
                [BsLinkedin, "LinkedIn", "https://linkedin.com", "text-blue-300"],
              ].map(([Icon, label, href, color]) => (
                <a key={label} aria-label={label} href={href} target="_blank" rel="noreferrer" className="rounded-premium bg-white/5 p-2 text-2xl transition hover:-translate-y-1 hover:bg-white/10">
                  <Icon className={color} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-3 font-medium text-white">Explore</h4>
            <ul className="space-y-2 text-zinc-300">
              <li><Link to="/" className="hover:text-white">Home</Link></li>
              <li><Link to="/ott" className="hover:text-white">OTT Stream</Link></li>
              <li><Link to="/courses" className="hover:text-white">Courses</Link></li>
              <li><Link to="/tests" className="hover:text-white">Tests</Link></li>
              <li><Link to="/user/profile" className="hover:text-white">Your Profile</Link></li>
            </ul>
            <h5 className="mb-2 mt-6 font-medium text-white">Resources</h5>
            <ul className="space-y-1 text-sm text-zinc-300">
              <li><a className="hover:text-white" href="#">Terms</a></li>
              <li><a className="hover:text-white" href="#">Privacy</a></li>
              <li><a className="hover:text-white" href="#">Help Center</a></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 font-medium text-white">Join our newsletter</h4>
            <p className="mb-4 text-sm leading-6 text-zinc-300">
              Get featured courses, exam drops, AI learning updates, and platform highlights.
            </p>
            <form onSubmit={submitNewsletter} className="flex gap-2">
              <label htmlFor="footer-email" className="sr-only">Email address</label>
              <div className="relative flex-1">
                <input id="footer-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@email.com" className="w-full rounded-premium border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-zinc-400 focus:border-sky-300" />
                <FiMail className="absolute right-3 top-3 text-zinc-400" />
              </div>
              <button type="submit" disabled={submitting} className="rounded-premium bg-gradient-to-r from-red-600 to-sky-500 px-4 py-2 font-semibold text-white transition hover:brightness-110">
                {submitting ? "Joining..." : "Join"}
              </button>
            </form>
            <div className="mt-6 text-xs text-zinc-500">No spam. Unsubscribe anytime.</div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-sm text-zinc-400 md:flex-row">
          <div>© {year} XLStream. All rights reserved.</div>
          <div>Made in India · <Link to="/about" className="hover:text-white">Our Team</Link></div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
