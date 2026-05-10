import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../Layout/Layout";
import { login } from "../Redux/authSlice";
import { motion } from "framer-motion";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { Clapperboard, LockKeyhole, Mail, Sparkles } from "lucide-react";
import { CinematicPage, GlassPanel, PremiumButton, PremiumInput } from "../Components/Premium/PremiumShell";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // function to handle the user input
  const handleUserInput = (event) => {
    const { name, value } = event.target;
    setLoginData((s) => ({ ...s, [name]: value }));
  };

  // function to login
  const handleLogin = async (event) => {
    event.preventDefault();

    // checking the empty fields
    if (!loginData.email || !loginData.password) {
      toast.error("Please fill all the fields");
      return;
    }

    try {
      setLoading(true);
      // calling login action
      const res = await dispatch(login(loginData));

      // redirect to home page if true
      if (res?.payload?.success) navigate("/");

      // clearing the login inputs
      setLoginData({ email: "", password: "" });
    } catch (err) {
      console.error(err);
      toast.error("Login failed");
    } finally {
      setLoading(false);
    }
  };

  const guestLogin = () => setLoginData({ email: "test@gmail.com", password: "Test@123" });

  return (
    <Layout>
      <CinematicPage className="flex items-center justify-center p-4">
      <div className="grid w-full max-w-6xl gap-6 lg:grid-cols-[1fr_440px] lg:items-center">
        <div className="hidden lg:block">
          <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.28em] text-sky-200"><Sparkles size={14} /> Secure Access</p>
          <h1 className="mt-4 text-6xl font-black leading-none">Welcome back to your learning cinema.</h1>
          <p className="mt-5 max-w-xl text-slate-300">Continue courses, resume tests, open AI insights, and manage your premium dashboard.</p>
          <div className="mt-8 grid max-w-xl grid-cols-3 gap-3">
            {["OTT", "Tests", "AI"].map((item) => (
              <GlassPanel key={item} className="p-4 text-center"><Clapperboard className="mx-auto mb-3 h-5 w-5 text-red-200" />{item}</GlassPanel>
            ))}
          </div>
        </div>
        <motion.form
          onSubmit={handleLogin}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="w-full bg-white/[0.055] border border-white/10 rounded-[18px] p-6 shadow-premium text-white backdrop-blur-2xl"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">Welcome back</h1>
              <p className="text-sm text-zinc-400">Sign in to continue to your dashboard</p>
            </div>
            <div className="text-xs text-zinc-400">Secure · Fast</div>
          </div>

          <div className="grid gap-3">
            <div className="flex flex-col">
              <label className="text-sm text-zinc-300 mb-1 inline-flex items-center gap-2"><Mail size={14} /> Email</label>
              <input
                required
                type="email"
                name="email"
                id="email"
                placeholder="you@company.com"
                className="cinematic-input"
                value={loginData.email}
                onChange={handleUserInput}
              />
            </div>

            <div className="flex flex-col relative">
              <label className="text-sm text-zinc-300 mb-1 inline-flex items-center gap-2"><LockKeyhole size={14} /> Password</label>
              <input
                required
                type={showPassword ? "text" : "password"}
                name="password"
                id="password"
                placeholder="Enter your password"
                className="cinematic-input pr-10"
                value={loginData.password}
                onChange={handleUserInput}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-3 text-zinc-400"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <PremiumButton
                type="submit"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign in"}
              </PremiumButton>

              {/* <button
                type="button"
                onClick={guestLogin}
                className="text-sm text-zinc-300 underline hover:text-white"
              >
                Guest login
              </button> */}
            </div>

            <div className="flex items-center justify-between text-xs text-zinc-400">
              <Link to="/forgetpassword" className="hover:text-white">Forgot password?</Link>
              <div>
                Don't have an account? <Link to="/signup" className="text-yellow-400 font-medium">Sign up</Link>
              </div>
            </div>
          </div>
        </motion.form>
      </div>
      </CinematicPage>
    </Layout>
  );
};

export default Login;
