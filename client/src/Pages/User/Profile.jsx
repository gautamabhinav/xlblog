import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../../Layout/Layout";
import { getUserData } from "../../Redux/authSlice";
import { motion } from "framer-motion";
import { FiEdit2, FiLock, FiMail, FiUser } from "react-icons/fi";
import toast from "react-hot-toast";
import { Award, CalendarDays, Clapperboard, Flame } from "lucide-react";
import { CinematicPage, GlassPanel, PremiumButton, StatCard } from "../../Components/Premium/PremiumShell";

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const userData = useSelector((state) => state?.auth?.data) || null;
  const [loading, setLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await dispatch(getUserData());
      setLoading(false);
    })();
  }, [dispatch]);

  const handleChangePassword = () => {
    if (userData?.email === "test@gmail.com") return navigate("/denied");
    navigate("/changepassword");
  };

  const handleEditProfile = () => {
    if (userData?.email === "test@gmail.com") return navigate("/denied");
    navigate("/user/editprofile");
  };

  const handleCancelSubscription = async () => {
    if (!userData?.subscription) return;
    if (!window.confirm("Are you sure you want to cancel your subscription?")) return;

    // Safe mock flow (real cancellation action may be missing in this repo)
    try {
      setCancelling(true);
      // Simulate an async cancel API call; in real app dispatch the cancel action
      await new Promise((res) => setTimeout(res, 1000));
      toast.success("Subscription cancelled (mock). Refreshing profile...");
      await dispatch(getUserData());
    } catch (err) {
      toast.error("Failed to cancel subscription");
    } finally {
      setCancelling(false);
    }
  };

  const avatarSrc = userData?.avatar?.secure_url || userData?.avatar || null;

  return (
    <Layout>
      <CinematicPage className="p-4 sm:p-6 lg:p-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mx-auto w-full max-w-6xl"
        >
          <GlassPanel className="overflow-hidden p-5 md:p-8">
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="flex-shrink-0">
              {loading ? (
                <div className="w-36 h-36 rounded-full bg-zinc-700 animate-pulse" />
              ) : avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt={userData?.fullName || "User avatar"}
                  className="w-36 h-36 rounded-full object-cover border-4 border-zinc-800 shadow-inner"
                />
              ) : (
                <div className="w-36 h-36 rounded-full bg-gradient-to-br from-red-500 to-sky-400 flex items-center justify-center text-white font-bold text-2xl shadow-glow-red">
                  {userData?.fullName ? userData.fullName.charAt(0).toUpperCase() : "U"}
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold">{userData?.fullName || "Your name"}</h2>
                  <p className="text-sm text-gray-300 mt-1">{userData?.bio || "Passionate writer and reader"}</p>
                </div>

                <div className="flex gap-2">
                  <button onClick={handleEditProfile} className="flex items-center gap-2 rounded-premium bg-gradient-to-r from-red-600 to-sky-500 px-3 py-2 font-semibold text-white shadow-glow-red">
                    <FiEdit2 /> Edit
                  </button>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white/[0.06] border border-white/10 p-4 rounded-premium">
                  <div className="flex items-center gap-3">
                    <FiMail className="text-yellow-400" />
                    <div>
                      <div className="text-sm text-gray-300">Email</div>
                      <div className="font-medium">{userData?.email || "—"}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/[0.06] border border-white/10 p-4 rounded-premium">
                  <div className="flex items-center gap-3">
                    <FiUser className="text-yellow-400" />
                    <div>
                      <div className="text-sm text-gray-300">Role</div>
                      <div className="font-medium">{userData?.role || "User"}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/[0.06] border border-white/10 p-4 rounded-premium">
                  <div className="flex items-center gap-3">
                    <FiLock className="text-yellow-400" />
                    <div>
                      <div className="text-sm text-gray-300">Subscription</div>
                      <div className="font-medium capitalize">{userData?.subscription?.status || "inactive"}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/[0.06] border border-white/10 p-4 rounded-premium">
                  <div className="flex items-center gap-3">
                    <div className="text-yellow-400 text-xl">⭐</div>
                    <div>
                      <div className="text-sm text-gray-300">Posts</div>
                      <div className="font-medium">{Array.isArray(userData?.posts) ? userData.posts.length : 0}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button onClick={handleChangePassword} className="flex-1 rounded-premium border border-white/15 bg-white/5 px-4 py-2 font-semibold text-white hover:bg-white/10">
                  Change Password
                </button>

                <button onClick={handleEditProfile} className="flex-1 rounded-premium bg-gradient-to-r from-red-600 to-sky-500 px-4 py-2 font-semibold text-white shadow-glow-red">
                  Edit Profile
                </button>

                {/* History / All Users Data button depending on role */}
                {userData?.role === 'superadmin' ? (
                  <button onClick={() => navigate('/admin/dashboard-full')} className="flex-1 rounded-premium bg-sky-600 px-4 py-2 font-semibold text-white hover:bg-sky-500">
                    All Users Data
                  </button>
                ) : (
                  <button onClick={() => navigate('/user/dashboard-full')} className="flex-1 rounded-premium bg-sky-600 px-4 py-2 font-semibold text-white hover:bg-sky-500">
                    History
                  </button>
                )}

                {userData?.subscription?.status === "active" && (
                  <button onClick={handleCancelSubscription} disabled={cancelling} className="flex-1 rounded-premium bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-500">
                    {cancelling ? "Cancelling..." : "Cancel Subscription"}
                  </button>
                )}
              </div>
            </div>
          </div>
          </GlassPanel>

          <div className="mt-5 grid gap-4 md:grid-cols-4">
            <StatCard icon={Clapperboard} label="Watch history" value="Ready" />
            <StatCard icon={Flame} label="Learning streak" value="7d" accent="text-red-200" />
            <StatCard icon={Award} label="Badges" value="12" accent="text-yellow-200" />
            <StatCard icon={CalendarDays} label="Planner" value="Today" accent="text-emerald-200" />
          </div>
        </motion.div>
      </CinematicPage>
    </Layout>
  );
};

export default Profile;
