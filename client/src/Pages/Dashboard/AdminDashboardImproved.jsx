import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Layout from '../../Layout/Layout';
import { fetchUsers, updateUserRole } from '../../Redux/adminSlice';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaCrown, FaUserShield, FaRegUser } from 'react-icons/fa';
import { FiUpload, FiDownload, FiTrash2, FiEye, FiPlay, FiRefreshCw } from 'react-icons/fi';
import AiInsights from '../Excel/AiInsights';
import ChartViewer from '../Excel/ChartViewer';
import { getExcelFiles, uploadExcelFile, deleteExcelFile, getExcelFileById } from '../../Redux/excelSlice';
import { saveAs } from 'file-saver';
import { getAllBlogs } from '../../Redux/blogSlice';
import { MdOutlineModeEdit } from 'react-icons/md';
import { BsTrash } from 'react-icons/bs';
import { useTheme, cn } from '../../Hooks/useTheme';
import toast from 'react-hot-toast';

/**
 * Reusable Stat Card Component
 */
const StatCard = ({ title, value, icon, color }) => {
  const { colors } = useTheme();
  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className={cn(
        'p-5 md:p-6 rounded-xl shadow-lg text-white bg-gradient-to-br',
        color
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs md:text-sm font-medium opacity-80">{title}</p>
          <h2 className="text-2xl md:text-3xl font-bold mt-2">{value}</h2>
        </div>
        <div className="text-3xl md:text-4xl opacity-70">{icon}</div>
      </div>
    </motion.div>
  );
};

/**
 * Improved AdminDashboard Component
 * - Theme-aware styling
 * - Better component reusability
 * - Improved UI/UX with proper spacing
 * - Responsive design
 */
const AdminDashboard = ({ id }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { colors } = useTheme();

  const { users = [], loading: usersLoading = false } = useSelector((state) => state.admin || {});
  const auth = useSelector((state) => state.auth || {});
  const myBlogs = useSelector((state) => state.blog?.blogsData) || [];
  const { files = [], currentFile } = useSelector((state) => state.excel || {});
  const currentUserRole = auth?.role || '';

  const [selectedFileId, setSelectedFileId] = useState(id || null);
  const [uploading, setUploading] = useState(false);

  // Load initial data
  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(getExcelFiles());
    dispatch(getAllBlogs());
  }, [dispatch]);

  // Handlers
  const handleRoleChange = useCallback(async (userId, newRole) => {
    try {
      await dispatch(updateUserRole({ userId, role: newRole }));
      toast.success('Role updated successfully');
    } catch (err) {
      toast.error('Failed to update role');
    }
  }, [dispatch]);

  const handleUploadFile = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      await dispatch(uploadExcelFile(file));
      await dispatch(getExcelFiles());
      toast.success('File uploaded successfully');
    } catch (err) {
      toast.error('Failed to upload file');
    } finally {
      setUploading(false);
      e.target.value = ''; // Reset input
    }
  }, [dispatch]);

  const handleDeleteFile = useCallback(async (fileId) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;

    try {
      await dispatch(deleteExcelFile(fileId));
      await dispatch(getExcelFiles());
      toast.success('File deleted successfully');
    } catch (err) {
      toast.error('Failed to delete file');
    }
  }, [dispatch]);

  const handleDownloadFile = useCallback(async (file) => {
    try {
      const url = file?.downloadUrl || file?.url;
      if (url) {
        window.open(url, '_blank');
        return;
      }

      const resp = await fetch(`/api/excel/${file._id}/download`, { credentials: 'same-origin' });
      if (!resp.ok) throw new Error(`Download failed: ${resp.status}`);
      const blob = await resp.blob();
      saveAs(blob, file.filename || `excel-${file._id}.xlsx`);
      toast.success('Download started');
    } catch (err) {
      console.error('Download error', err);
      toast.error('Failed to download file');
    }
  }, []);

  const handleAnalyze = useCallback(async (fileId) => {
    try {
      setSelectedFileId(fileId);
      const result = await dispatch(getExcelFileById(fileId));
      if (result.payload) {
        toast.success('File loaded for analysis');
      }
    } catch (err) {
      toast.error('Failed to load file');
    }
  }, [dispatch]);

  const handleBlogDelete = useCallback(async (blogId) => {
    if (!window.confirm('Are you sure you want to delete this blog?')) return;
    try {
      // Add blog deletion logic here
      await dispatch(getAllBlogs());
      toast.success('Blog deleted successfully');
    } catch (err) {
      toast.error('Failed to delete blog');
    }
  }, [dispatch]);

  if (usersLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[90vh]">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="text-4xl"
          >
            ⚙️
          </motion.div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={cn('min-h-[90vh] px-4 md:px-6 lg:px-8 py-10 transition-colors duration-300', colors.bg.primary)}>
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <h1 className={cn('text-3xl md:text-4xl font-bold', colors.text.accent)}>
              Admin Dashboard
            </h1>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                dispatch(fetchUsers());
                dispatch(getExcelFiles());
                toast.success('Refreshed data');
              }}
              className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
              title="Refresh data"
            >
              <FiRefreshCw size={20} />
            </motion.button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
          >
            <StatCard
              title="Total Blogs"
              value={myBlogs.length}
              icon="📝"
              color="from-blue-500 to-blue-600"
            />
            <StatCard
              title="Total Users"
              value={users.length}
              icon="👥"
              color="from-purple-500 to-purple-600"
            />
            <StatCard
              title="Excel Files"
              value={files.length}
              icon="📊"
              color="from-green-500 to-green-600"
            />
          </motion.div>

          {/* Users Management */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={cn(
              'p-4 md:p-6 rounded-xl border shadow-lg',
              colors.bg.card,
              colors.border.light
            )}
          >
            <h2 className={cn('text-lg md:text-xl font-semibold mb-4 md:mb-6', colors.text.accent)}>
              User Management
            </h2>

            <div className="overflow-x-auto">
              <table className={cn('w-full text-sm', colors.text.primary)}>
                <thead className={cn('border-b', colors.border.light, colors.bg.secondary)}>
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold">Name</th>
                    <th className="text-left px-4 py-3 font-semibold">Email</th>
                    <th className="text-left px-4 py-3 font-semibold">Role</th>
                    <th className="text-left px-4 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-700">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-4 py-8 text-center text-gray-400">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <motion.tr
                        key={user._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-white/5 transition-colors"
                      >
                        <td className="px-4 py-3">{user.fullName}</td>
                        <td className="px-4 py-3 truncate">{user.email}</td>
                        <td className="px-4 py-3 flex items-center gap-2">
                          {user.role === 'SUPERADMIN' && <FaCrown className="text-yellow-400" title="Super Admin" />}
                          {user.role === 'ADMIN' && <FaUserShield className="text-blue-400" title="Admin" />}
                          {user.role === 'USER' && <FaRegUser className="text-gray-400" title="User" />}
                          <span className="font-medium">{user.role}</span>
                        </td>
                        <td className="px-4 py-3">
                          {currentUserRole === 'SUPERADMIN' ? (
                            <select
                              value={user.role}
                              onChange={(e) => handleRoleChange(user._id, e.target.value)}
                              className={cn(
                                'px-3 py-1 rounded bg-opacity-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-yellow-400',
                                colors.bg.input,
                                colors.text.primary
                              )}
                            >
                              <option value="USER">USER</option>
                              <option value="ADMIN">ADMIN</option>
                              <option value="SUPERADMIN">SUPERADMIN</option>
                            </select>
                          ) : currentUserRole === 'ADMIN' && user.role === 'USER' ? (
                            <select
                              value={user.role}
                              onChange={(e) => handleRoleChange(user._id, e.target.value)}
                              className={cn(
                                'px-3 py-1 rounded bg-opacity-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-yellow-400',
                                colors.bg.input,
                                colors.text.primary
                              )}
                            >
                              <option value="USER">USER</option>
                              <option value="ADMIN">ADMIN</option>
                            </select>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Chart Viewer */}
          <ChartViewer embed selectedFileId={id} />

          {/* Excel Manager & AI Insights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={cn(
              'grid md:grid-cols-2 gap-6 p-4 md:p-6 rounded-xl border shadow-lg',
              colors.bg.card,
              colors.border.light
            )}
          >
            {/* Excel Uploads */}
            <div>
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h3 className={cn('text-lg font-semibold', colors.text.accent)}>
                  Excel Uploads
                </h3>
                <label className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold cursor-pointer transition-colors">
                  <FiUpload size={16} />
                  <span className="hidden sm:inline">Upload</span>
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleUploadFile}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="overflow-x-auto">
                <table className={cn('w-full text-sm', colors.text.primary)}>
                  <thead className={cn('border-b', colors.border.light, colors.bg.secondary)}>
                    <tr>
                      <th className="text-left px-3 py-2 font-semibold">Filename</th>
                      <th className="text-left px-3 py-2 font-semibold">Date</th>
                      <th className="text-left px-3 py-2 font-semibold">Size</th>
                      <th className="text-left px-3 py-2 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-700">
                    {files.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-3 py-6 text-center text-gray-400">
                          No files uploaded yet
                        </td>
                      </tr>
                    ) : (
                      files.map((file) => (
                        <motion.tr
                          key={file._id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="hover:bg-white/5 transition-colors"
                        >
                          <td className="px-3 py-2 truncate max-w-xs">
                            {file.filename || file.originalname || 'Unnamed'}
                          </td>
                          <td className="px-3 py-2 text-xs">
                            {file.uploadedAt
                              ? new Date(file.uploadedAt).toLocaleDateString()
                              : '—'}
                          </td>
                          <td className="px-3 py-2 text-xs">
                            {file.size ? `${(file.size / 1024).toFixed(2)} KB` : '—'}
                          </td>
                          <td className="px-3 py-2 flex gap-1">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                dispatch(getExcelFileById(file._id));
                                navigate(`/excel?file=${file._id}`);
                              }}
                              className="p-2 bg-blue-600 hover:bg-blue-700 rounded text-white transition-colors"
                              title="View"
                            >
                              <FiEye size={14} />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleAnalyze(file._id)}
                              className="p-2 bg-indigo-600 hover:bg-indigo-700 rounded text-white transition-colors"
                              title="Analyze"
                            >
                              <FiPlay size={14} />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleDownloadFile(file)}
                              className="p-2 bg-yellow-500 hover:bg-yellow-600 rounded text-black transition-colors"
                              title="Download"
                            >
                              <FiDownload size={14} />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleDeleteFile(file._id)}
                              className="p-2 bg-red-600 hover:bg-red-700 rounded text-white transition-colors"
                              title="Delete"
                            >
                              <FiTrash2 size={14} />
                            </motion.button>
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* AI Insights & Charts */}
            <div className="flex flex-col gap-4">
              <div>
                <h3 className={cn('text-lg font-semibold mb-4', colors.text.accent)}>
                  AI Insights & Charts
                </h3>
                <div className={cn('rounded-lg p-4 border', colors.bg.secondary, colors.border.light)}>
                  <ChartViewer embed={true} selectedFileId={selectedFileId} />
                </div>
              </div>

              <div className={cn('rounded-lg p-4 border', colors.bg.secondary, colors.border.light)}>
                <h3 className={cn('text-base font-semibold mb-3', colors.text.accent)}>
                  Analysis
                </h3>
                <AiInsights parsedData={currentFile?.parsedData || currentFile?.data || null} />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
