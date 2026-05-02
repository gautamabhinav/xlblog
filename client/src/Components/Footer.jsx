import React, { useState } from "react";
import { Link } from "react-router-dom";
import { BsFacebook, BsInstagram, BsLinkedin, BsTwitter } from "react-icons/bs";
import { FiMail } from "react-icons/fi";
import { toast } from "react-hot-toast";

const Footer = () => {
  const year = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submitNewsletter = (e) => {
    e.preventDefault();
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      toast.error("Please enter a valid email");
      return;
    }
    setSubmitting(true);
    // local confirmation (no external network call)
    setTimeout(() => {
      setSubmitting(false);
      setEmail("");
      toast.success("Thanks — you’re subscribed!");
    }, 600);
  };

  return (
    <footer className="mt-12 bg-gradient-to-t from-zinc-900 via-zinc-950 to-black text-gray-200">
      {/* Decorative divider */}
      <div className="w-full overflow-hidden leading-[0] -mb-1">
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="w-full h-6 opacity-30"
        >
          <path
            d="M0,0 C300,100 900,0 1200,100 L1200,0 L0,0 Z"
            className="fill-white"
            opacity="0.03"
          ></path>
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {/* Brand + tagline */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold tracking-tight text-white">
              Excel Analytics Blogging Platform
            </h3>
            <p className="text-sm text-zinc-300 max-w-sm">
              Where ideas meet readers — publish, share, and discover thoughtful
              stories crafted by our community.
            </p>

            <div className="flex items-center space-x-3 mt-3">
              <div className="p-2 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 text-black font-semibold">
                ARG
              </div>
              <span className="text-xs text-zinc-400">
                Built for creators • Community-first
              </span>
            </div>

            <div className="flex gap-3 mt-4">
              <a
                aria-label="Facebook"
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="transform hover:-translate-y-1 transition-all text-2xl p-2 rounded-md bg-white/5 hover:bg-white/7"
              >
                <BsFacebook className="text-indigo-400" />
              </a>
              <a
                aria-label="Instagram"
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="transform hover:-translate-y-1 transition-all text-2xl p-2 rounded-md bg-white/5 hover:bg-white/7"
              >
                <BsInstagram className="text-pink-400" />
              </a>
              <a
                aria-label="Twitter"
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="transform hover:-translate-y-1 transition-all text-2xl p-2 rounded-md bg-white/5 hover:bg-white/7"
              >
                <BsTwitter className="text-sky-400" />
              </a>
              <a
                aria-label="LinkedIn"
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="transform hover:-translate-y-1 transition-all text-2xl p-2 rounded-md bg-white/5 hover:bg-white/7"
              >
                <BsLinkedin className="text-blue-500" />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div className="flex flex-col md:items-start">
            <h4 className="text-white font-medium mb-3">Quick links</h4>
            <ul className="space-y-2 text-zinc-300">
              <li>
                <Link
                  to="/"
                  className="hover:text-white transition-colors"
                >
                  Home
                </Link>
              </li>
              {/* <li>
                <Link
                  to="/blogs"
                  className="hover:text-white transition-colors"
                >
                  All Blogs
                </Link>
              </li> */}
              <li>
                <Link
                  to="/about"
                  className="hover:text-white transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="hover:text-white transition-colors"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  to="/user/profile"
                  className="hover:text-white transition-colors"
                >
                  Your Profile
                </Link>
              </li>
            </ul>
            

            <div className="mt-6">
              <h5 className="text-white font-medium mb-2">Resources</h5>
              <ul className="text-zinc-300 text-sm space-y-1">
                <li>
                  <a className="hover:text-white" href="#">
                    Terms
                  </a>
                </li>
                <li>
                  <a className="hover:text-white" href="#">
                    Privacy
                  </a>
                </li>
                <li>
                  <a className="hover:text-white" href="#">
                    Help Center
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Newsletter */}
          <div className="md:pl-6">
            <h4 className="text-white font-medium mb-3">
              Join our newsletter
            </h4>
            <p className="text-zinc-300 text-sm mb-4">
              Get short weekly digests with featured stories, tips, and community
              highlights.
            </p>

            <form
              onSubmit={submitNewsletter}
              className="flex gap-2"
            >
              <label
                htmlFor="footer-email"
                className="sr-only"
              >
                Email address
              </label>
              <div className="relative flex-1">
                <input
                  id="footer-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="w-full rounded-lg px-4 py-3 bg-white/5 placeholder:text-zinc-400 text-white outline-none border border-transparent focus:border-yellow-400"
                />
                <FiMail className="absolute right-3 top-3 text-zinc-400" />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 rounded-lg bg-yellow-400 text-black font-semibold hover:bg-yellow-500 transition-colors"
              >
                {submitting ? "Joining..." : "Join"}
              </button>
            </form>

            <div className="mt-6 text-xs text-zinc-500">
              No spam. Unsubscribe anytime.
            </div>
          </div>
        </div>

        <div className="border-t border-zinc-800 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-zinc-400 text-sm">
            © {year} Blogging Platform. All rights reserved.
          </div>
          <div className="text-zinc-400 text-sm">
            Made in India ·{" "}
            <Link
              to="/about"
              className="hover:text-white"
            >
              Our Team
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

