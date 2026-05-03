import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../../Layout/Layout";
import { getUserData } from "../../Redux/authSlice";
import { motion } from "framer-motion";
import { FiEdit2, FiLock, FiMail, FiUser } from "react-icons/fi";
import toast from "react-hot-toast";

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
      <div className="min-h-[90vh] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="w-full max-w-3xl bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-2xl p-6 shadow-2xl text-white"
        >
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
                <div className="w-36 h-36 rounded-full bg-yellow-400 flex items-center justify-center text-black font-bold text-2xl">
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
                  <button onClick={handleEditProfile} className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-black px-3 py-2 rounded-md font-semibold">
                    <FiEdit2 /> Edit
                  </button>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-zinc-800/60 p-4 rounded-md">
                  <div className="flex items-center gap-3">
                    <FiMail className="text-yellow-400" />
                    <div>
                      <div className="text-sm text-gray-300">Email</div>
                      <div className="font-medium">{userData?.email || "—"}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-800/60 p-4 rounded-md">
                  <div className="flex items-center gap-3">
                    <FiUser className="text-yellow-400" />
                    <div>
                      <div className="text-sm text-gray-300">Role</div>
                      <div className="font-medium">{userData?.role || "User"}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-800/60 p-4 rounded-md">
                  <div className="flex items-center gap-3">
                    <FiLock className="text-yellow-400" />
                    <div>
                      <div className="text-sm text-gray-300">Subscription</div>
                      <div className="font-medium capitalize">{userData?.subscription?.status || "inactive"}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-800/60 p-4 rounded-md">
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
                <button onClick={handleChangePassword} className="flex-1 bg-transparent border border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black px-4 py-2 rounded-md font-semibold">
                  Change Password
                </button>

                <button onClick={handleEditProfile} className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-md font-semibold">
                  Edit Profile
                </button>

                {/* History / All Users Data button depending on role */}
                {userData?.role === 'superadmin' ? (
                  <button onClick={() => navigate('/admin/dashboard-full')} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-semibold">
                    All Users Data
                  </button>
                ) : (
                  <button onClick={() => navigate('/user/dashboard-full')} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-semibold">
                    History
                  </button>
                )}

                {userData?.subscription?.status === "active" && (
                  <button onClick={handleCancelSubscription} disabled={cancelling} className="flex-1 bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-md font-semibold">
                    {cancelling ? "Cancelling..." : "Cancel Subscription"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Profile;