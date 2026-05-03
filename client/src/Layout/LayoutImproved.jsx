import React, { useState, useEffect, useRef } from 'react';
import { FiHome, FiBook, FiPhone, FiInfo, FiUser, FiFileText } from 'react-icons/fi';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AiOutlineLogout, AiOutlineSearch } from 'react-icons/ai';
import { motion, AnimatePresence } from 'framer-motion';
import Footer from '../Components/Footer';
import UserAvatar from '../Components/Common/UserAvatar';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../Redux/authSlice';
import { BsMoon, BsSun } from 'react-icons/bs';
import toast, { Toaster } from 'react-hot-toast';
import { fetchNotifications, markNotificationRead } from '../Redux/notificationSlice';
import { connectSocket, disconnectSocket } from '../Redux/socketSlice';
import { useTheme, cn } from '../Hooks/useTheme';

/**
 * Improved Layout Component
 * - Enhanced dark/light mode with proper contrast
 * - Better responsive design
 * - Improved accessibility
 * - Consistent theme application
 */
const Layout = ({ children }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const isLoggedIn = useSelector((state) => state?.auth?.isLoggedIn);
  const role = useSelector((state) => state?.auth?.role);
  const user = useSelector((state) => state?.auth?.data || state?.auth?.user) || {};

  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [query, setQuery] = useState('');
  const [theme, setTheme] = useState(() => {
    try {
      const stored = localStorage.getItem('theme');
      if (stored === 'dark' || stored === 'light') return stored;
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    } catch (e) {
      // ignore
    }
    return 'dark'; // default to dark for better UX
  });

  const firstLinkRef = useRef(null);
  const searchRef = useRef(null);
  const notifications = useSelector((state) => state?.notifications) || { list: [], unreadCount: 0 };
  const socket = useSelector((state) => state?.socket?.socket);
  const { colors } = useTheme();

  // Initialize theme and persist
  useEffect(() => {
    try {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.setAttribute('data-theme', 'light');
      }
      localStorage.setItem('theme', theme);
      const meta = document.querySelector('meta[name="color-scheme"]') || document.createElement('meta');
      meta.name = 'color-scheme';
      meta.content = theme === 'dark' ? 'dark light' : 'light dark';
      if (!document.head.contains(meta)) document.head.appendChild(meta);
    } catch (err) {
      console.warn('Theme init failed', err);
    }
  }, [theme]);

  // Load notifications and socket
  useEffect(() => {
    if (isLoggedIn) {
      dispatch(fetchNotifications());
      dispatch(connectSocket());
    } else {
      dispatch(disconnectSocket());
    }

    const handler = (e) => {
      if (e.key === '/' && document.activeElement.tagName !== 'INPUT') {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
        setShowUserMenu(false);
        setShowNotif(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isLoggedIn, dispatch]);

  // Real-time notifications
  useEffect(() => {
    if (!socket) return;
    const onNew = (payload) => {
      try {
        const targetRoles = payload?.targetRoles || [];
        const targetUsers = (payload?.targetUsers || []).map(String);
        const shouldShow = (
          (!targetRoles || targetRoles.length === 0) && (!targetUsers || targetUsers.length === 0)
        ) || (role && targetRoles.includes(String(role).toUpperCase())) || (user && targetUsers.includes(String(user._id || user.id)));

        if (shouldShow) {
          dispatch(fetchNotifications());
          try { toast.success('New notification'); } catch (e) { /* ignore */ }
        }
      } catch (e) {
        dispatch(fetchNotifications());
      }
    };
    socket.on('newNotification', onNew);
    return () => {
      socket.off('newNotification', onNew);
    };
  }, [socket, dispatch, role, user]);

  // Handle menu open/close
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => firstLinkRef.current?.focus(), 150);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  // Close overlays on route change
  useEffect(() => {
    setIsOpen(false);
    setShowUserMenu(false);
    setShowNotif(false);
    document.body.style.overflow = '';
  }, [location.pathname]);

  const handleLogout = async (event) => {
    event.preventDefault();
    const res = await dispatch(logout());
    if (res?.payload?.success) navigate('/');
  };

  const menuLinks = [
    { name: 'Home', path: '/', icon: <FiHome />, desc: 'Return to homepage' },
    ...(isLoggedIn && (role === 'ADMIN' || role === 'SUPERADMIN')
      ? [
          {
            name: 'Admin Dashboard',
            path: '/admin/dashboard',
            icon: <FiUser />,
            desc: 'Manage site content',
          },
        ]
      : []),
    { name: 'All Blogs', path: '/blogs', icon: <FiBook />, desc: 'Explore all posts' },
    {
      name: 'Excel Manager',
      path: '/excel',
      icon: <FiFileText />,
      desc: 'Upload & manage Excel files',
    },
    { name: 'All Tests', path: '/tests', icon: <FiBook />, desc: 'View tests' },
    { name: 'User Dashboard', path: '/user/dashboard', icon: <FiBook />, desc: 'User Dashboard' },
    { name: 'Contact Us', path: '/contact', icon: <FiPhone />, desc: 'Get in touch' },
    { name: 'About Us', path: '/about', icon: <FiInfo />, desc: 'Learn about the project' },
  ];

  const submitSearch = (e) => {
    e?.preventDefault?.();
    if (!query.trim()) {
      navigate('/blogs');
      return;
    }
    navigate(`/blogs?q=${encodeURIComponent(query.trim())}`);
    setQuery('');
  };

  return (
    <div className={cn('min-h-screen flex flex-col transition-colors duration-300', colors.bg.primary)}>
      {/* Header - Enhanced with better contrast */}
      <header className={cn(
        'p-3 md:p-4 flex items-center justify-between shadow-md transition-colors duration-300',
        theme === 'dark'
          ? 'bg-gradient-to-r from-indigo-700 to-purple-700'
          : 'bg-gradient-to-r from-indigo-600 to-purple-600',
        colors.text.primary
      )}>
        <div className="flex items-center gap-3">
          {/* Hamburger Button */}
          <button
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isOpen}
            onClick={() => setIsOpen((s) => !s)}
            className="relative w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors"
          >
            <span
              className={`block absolute w-6 h-0.5 bg-white transform transition duration-300 ${
                isOpen ? 'rotate-45' : '-translate-y-2.5'
              }`}
            />
            <span
              className={`block absolute w-6 h-0.5 bg-white transition duration-300 ${
                isOpen ? 'opacity-0' : 'opacity-100'
              }`}
            />
            <span
              className={`block absolute w-6 h-0.5 bg-white transform transition duration-300 ${
                isOpen ? '-rotate-45' : 'translate-y-2.5'
              }`}
            />
          </button>

          <Link
            to="/"
            className="text-lg font-bold tracking-wide hover:opacity-80 transition-opacity"
          >
            Blog Platform
          </Link>
        </div>

        {/* Search - visible on md+ */}
        <form
          onSubmit={submitSearch}
          className="hidden md:flex items-center gap-2 flex-1 max-w-xl mx-6"
        >
          <div className="relative w-full">
            <AiOutlineSearch className="absolute left-3 top-3 text-gray-200" />
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search blogs, authors... (press / to focus)"
              className="pl-10 pr-4 py-2 w-full rounded-full bg-white/20 text-white placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:bg-white/30 transition-all"
            />
          </div>
          <button
            type="submit"
            className="bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2 rounded-full font-semibold transition-colors"
          >
            Search
          </button>
        </form>

        {/* Right Controls */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Tests Link */}
          <Link
            to="/tests"
            className="hidden md:inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/15 hover:bg-white/25 transition-colors text-white"
          >
            <FiBook size={18} />
            <span className="hidden sm:inline text-sm">Tests</span>
          </Link>

          {/* Admin Create Test Buttons */}
          {isLoggedIn && (role === 'ADMIN' || role === 'SUPERADMIN') && (
            <div className="hidden md:inline-flex items-center gap-2">
              <Link
                to="/tests/create"
                className="px-3 py-1 rounded-md bg-yellow-400 hover:bg-yellow-500 text-black font-semibold text-sm transition-colors"
              >
                Create Test
              </Link>
            </div>
          )}

          {/* Theme Toggle */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
            className="p-2 rounded-full bg-white/15 hover:bg-white/25 transition-colors"
            title="Toggle theme"
          >
            {theme === 'dark' ? <BsSun size={18} /> : <BsMoon size={18} />}
          </motion.button>

          {/* Notification Bell */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.1 }}
              onClick={() => setShowNotif((s) => !s)}
              className="p-2 rounded-full bg-white/15 hover:bg-white/25 transition-colors relative"
              title="Notifications"
            >
              🔔
              {notifications?.unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-semibold">
                  {notifications.unreadCount}
                </span>
              )}
            </motion.button>

            <AnimatePresence>
              {showNotif && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={cn(
                    'absolute right-0 mt-2 w-80 rounded-lg shadow-2xl z-50 p-3 border',
                    'dark:bg-zinc-800 dark:border-zinc-700 bg-white border-gray-200'
                  )}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-semibold">Notifications</div>
                    <button
                      className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                      onClick={() => dispatch(fetchNotifications())}
                    >
                      Refresh
                    </button>
                  </div>
                  <div className="max-h-64 overflow-auto space-y-2">
                    {notifications?.loading ? (
                      <div className="p-3 text-sm text-gray-500">Loading...</div>
                    ) : notifications?.list?.length === 0 ? (
                      <div className="p-3 text-sm text-gray-500">No notifications</div>
                    ) : (
                      notifications.list.map((n) => (
                        <motion.div
                          key={n._id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={cn(
                            'p-2 rounded hover:opacity-80 flex items-start gap-2',
                            'dark:bg-zinc-700/50 bg-gray-50'
                          )}
                        >
                          <div className="flex-1">
                            <div className="font-medium text-sm">{n.title}</div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">{n.message}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                              {new Date(n.createdAt).toLocaleString()}
                            </div>
                          </div>
                          <div className="flex flex-col gap-1">
                            {!((n.readBy || []).some((r) => String(r.user) === String(user?._id || user?.id))) && (
                              <button
                                onClick={() => dispatch(markNotificationRead(n._id))}
                                className="text-xs text-blue-600 hover:underline"
                              >
                                Mark read
                              </button>
                            )}
                            {n.link && (
                              <a href={n.link} className="text-xs text-yellow-500 hover:underline">
                                Open
                              </a>
                            )}
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Avatar / Menu */}
          <div className="relative">
            {isLoggedIn ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => setShowUserMenu((s) => !s)}
                className="flex items-center gap-2 bg-white/15 hover:bg-white/25 px-3 py-1 rounded-full transition-colors"
              >
                <UserAvatar user={user} size={32} className="flex-shrink-0" />
                <span className="hidden md:inline text-sm">{user?.name || (user?.email || '').split('@')[0]}</span>
              </motion.button>
            ) : (
              <div className="hidden md:flex gap-2">
                <Link
                  to="/login"
                  className="px-3 py-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-3 py-1 rounded-md bg-purple-600 hover:bg-purple-700 text-white transition-colors"
                >
                  Signup
                </Link>
              </div>
            )}

            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={cn(
                    'absolute right-0 mt-2 w-48 rounded-lg shadow-2xl py-2 overflow-hidden z-50 border',
                    'dark:bg-zinc-800 dark:border-zinc-700 bg-white border-gray-200',
                    'dark:text-white text-gray-900'
                  )}
                >
                  <Link
                    to="/user/profile"
                    onClick={() => setShowUserMenu(false)}
                    className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
                  >
                    Profile
                  </Link>
                  {role === 'ADMIN' && (
                    <Link
                      to="/admin/dashboard"
                      onClick={() => setShowUserMenu(false)}
                      className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
                    >
                      Admin
                    </Link>
                  )}
                  <button
                    onClick={(e) => {
                      handleLogout(e);
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-zinc-700 flex items-center gap-2 transition-colors"
                  >
                    <AiOutlineLogout /> Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Sidebar Navigation */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 z-40"
            />

            <motion.aside
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: 'spring', stiffness: 120 }}
              className={cn(
                'fixed top-0 left-0 w-72 h-full shadow-2xl z-50 p-6 flex flex-col transition-colors duration-300',
                theme === 'dark'
                  ? 'bg-zinc-900/95 backdrop-blur-xl border-r border-zinc-800'
                  : 'bg-white/98 backdrop-blur-xl border-r border-gray-200'
              )}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className={cn('text-lg font-semibold', theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                  Navigation
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className={cn('hover:opacity-70 transition-opacity', theme === 'dark' ? 'text-gray-400' : 'text-gray-600')}
                >
                  ✕
                </button>
              </div>

              <nav className="flex-1 overflow-auto">
                <ul className="space-y-2">
                  {menuLinks.map((item, idx) => (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        ref={idx === 0 ? firstLinkRef : null}
                        className={cn(
                          'flex items-center gap-3 p-3 rounded-lg transition-all duration-200',
                          location.pathname === item.path
                            ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md'
                            : theme === 'dark'
                            ? 'hover:bg-zinc-800 text-gray-200'
                            : 'hover:bg-gray-100 text-gray-700'
                        )}
                        onClick={() => setIsOpen(false)}
                      >
                        <div className="text-xl">{item.icon}</div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">{item.name}</div>
                          <div className={cn('text-xs', theme === 'dark' ? 'text-gray-400' : 'text-gray-500')}>
                            {item.desc}
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              {/* Bottom Actions */}
              <div className="mt-6 space-y-3 border-t border-gray-300 dark:border-zinc-700 pt-4">
                {!isLoggedIn ? (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setIsOpen(false)}
                      className="w-full block py-2 text-center rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors"
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setIsOpen(false)}
                      className="w-full block py-2 text-center rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold transition-colors"
                    >
                      Signup
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/user/profile"
                      onClick={() => setIsOpen(false)}
                      className="w-full block py-2 text-center rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={(e) => {
                        handleLogout(e);
                        setIsOpen(false);
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors"
                    >
                      <AiOutlineLogout /> Logout
                    </button>
                  </>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 transition-colors duration-300">{children}</main>

      <Footer />
      <Toaster position="top-right" />
    </div>
  );
};

export default Layout;
