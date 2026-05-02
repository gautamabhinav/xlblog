// import React, { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import Layout from "../../Layout/Layout";
// import { fetchUsers, updateUserRole } from "../../Redux/adminSlice";
// // import { getAllBlogs, deleteBlog } from "../../Redux/blogSlice";
// import { motion } from "framer-motion";
// import { useNavigate } from "react-router-dom";
// import {
//   FaUsers,
//   FaUserShield,
//   FaCrown,
//   FaRegUser,
// } from "react-icons/fa";
// import {
//   BsCollectionPlayFill,
//   BsTrash,
// } from "react-icons/bs";
// import { FcSalesPerformance, FcViewDetails } from "react-icons/fc";
// import AiInsights from "../Excel/AiInsights";
// import ChartViewer from "../Excel/ChartViewer";
// import HistoryPanel from "../Excel/HistoryPannel";
// import { getExcelFiles, uploadExcelFile, deleteExcelFile, getExcelFileById } from "../../Redux/excelSlice";
// import { FiUpload, FiDownload, FiTrash2, FiEye, FiPlay } from "react-icons/fi";
// import { saveAs } from "file-saver";
// import { MdOutlineModeEdit } from "react-icons/md";



// const AdminDashboard = ({id}) => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   const { users = [], loading = false } = useSelector((state) => state.admin || {});
//   const auth = useSelector((state) => state.auth || {});
//   const { files = [], status: excelStatus = {} } = useSelector((state) => state.excel || {});
//   const currentFile = useSelector((state) => state.excel?.currentFile);
//   const currentUserRole = auth?.role || "";
//   // const myBlogs = useSelector((state) => state.blog.blogsData) || [];

//   // const [counts, setCounts] = useState({ blogs: 0, authors: 0, categories: 0 });
//   const [animated, setAnimated] = useState({ b: 0, a: 0, c: 0 });

//   useEffect(() => {
//     dispatch(fetchUsers());
//     // dispatch(getAllBlogs());
//     // load excel uploads for admin view
//     dispatch(getExcelFiles());
//   }, [dispatch]);

//   // useEffect(() => {
//   //   const totalBlogs = myBlogs?.length || 0;
//   //   const uniqueAuthors = new Set(myBlogs.map((b) => b?.author).filter(Boolean)).size;
//   //   const uniqueCategories = new Set(myBlogs.map((b) => b?.category?.name).filter(Boolean)).size;

//   //   setCounts({ blogs: totalBlogs, authors: uniqueAuthors, categories: uniqueCategories });

//   //   // Simple count-up animation
//   //   const duration = 600;
//   //   const start = performance.now();
//   //   const startVals = { ...animated };

//   //   const step = (now) => {
//   //     const t = Math.min((now - start) / duration, 1);
//   //     setAnimated({
//   //       b: Math.floor(startVals.b + (totalBlogs - startVals.b) * t),
//   //       a: Math.floor(startVals.a + (uniqueAuthors - startVals.a) * t),
//   //       c: Math.floor(startVals.c + (uniqueCategories - startVals.c) * t),
//   //     });
//   //     if (t < 1) requestAnimationFrame(step);
//   //   };
//   //   requestAnimationFrame(step);
//   //   // eslint-disable-next-line react-hooks/exhaustive-deps
//   // }, [myBlogs]);

//   const handleRoleChange = (userId, newRole) => {
//     dispatch(updateUserRole({ userId, role: newRole }));
//   };

//   // const handleBlogDelete = async (id) => {
//   //   if (window.confirm("Are you sure you want to delete this blog?")) {
//   //     const res = await dispatch(deleteBlog(id));
//   //     if (res.payload?.success) {
//   //       await dispatch(getAllBlogs());
//   //     }
//   //   }
//   // };

//   // Excel upload handlers
//   const handleUploadFile = async (e) => {
//     const f = e.target.files?.[0];
//     if (!f) return;
//     await dispatch(uploadExcelFile(f));
//     // refresh list
//     dispatch(getExcelFiles());
//   };

//   const handleDeleteFile = async (id) => {
//     if (!window.confirm('Delete this file?')) return;
//     await dispatch(deleteExcelFile(id));
//     dispatch(getExcelFiles());
//   };

//   const handleDownloadFile = async (file) => {
//     // Prefer explicit downloadUrl/url if present
//     const url = file?.downloadUrl || file?.url;
//     if (url) {
//       // open in new tab - backend may set proper headers
//       window.open(url, "_blank");
//       return;
//     }

//     // Fallback: try server download endpoint and save blob
//     try {
//       const resp = await fetch(`/api/excel/${file._id}/download`, { credentials: 'same-origin' });
//       if (!resp.ok) throw new Error(`Download failed: ${resp.status}`);
//       const blob = await resp.blob();
//       saveAs(blob, file.filename || `excel-${file._id}.xlsx`);
//     } catch (err) {
//       console.error("download error", err);
//       // last resort: open file url if any or alert
//       if (file?.url) window.open(file.url, "_blank");
//       else alert("Unable to download file.");
//     }
//   };

//   const [selectedFileId, setSelectedFileId] = useState(null);

//   const handleAnalyze = async (id) => {
//     setSelectedFileId(id);
//     const result = await dispatch(getExcelFileById(id));
//     if (result.payload) {
//       // If we have a file, update it in the store
//       return result.payload;
//     }
//   };

//   if (loading) return <p className="text-center py-10">Loading users...</p>;

//   return (
//     <Layout>
//       <div className="min-h-[90vh] px-6 py-10 text-white">
//         <div className="max-w-7xl mx-auto space-y-10">
//           {/* Header */}
//           <div className="flex items-center justify-between">
//             <h1 className="text-3xl font-bold text-yellow-400">
//               Admin Dashboard
//             </h1>
//             {/* <div className="flex gap-3">
//               <button
//                 onClick={() => dispatch(getAllBlogs())}
//                 className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition"
//               >
//                 Refresh
//               </button>
//               <button
//                 onClick={() => navigate("/blog/create")}
//                 className="px-4 py-2 rounded-lg bg-yellow-500 text-black font-semibold"
//               >
//                 + Create Blog
//               </button>
//             </div> */}
//           </div>

//           {/* Stats */}
//           {/* <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
//             <StatCard
//               title="Total Blogs"
//               value={animated.b}
//               icon={<BsCollectionPlayFill />}
//               color="from-yellow-300 to-yellow-500"
//             />
//             <StatCard
//               title="Unique Authors"
//               value={animated.a}
//               icon={<FaUsers />}
//               color="from-emerald-300 to-emerald-500"
//             />
//             <StatCard
//               title="Categories"
//               value={animated.c}
//               icon={<FcSalesPerformance />}
//               color="from-sky-300 to-sky-500"
//             />
//           </div> */}

//           {/* Users Table */}
//           <motion.div
//             initial={{ opacity: 0, y: 10 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             className="bg-gradient-to-br from-white/5 to-white/10 p-6 rounded-2xl shadow-lg border border-zinc-800"
//           >
//             <h2 className="text-lg font-semibold mb-4 text-yellow-400">
//               User Management
//             </h2>
//             <div className="overflow-x-auto">
//               <table className="w-full text-left text-sm">
//                 <thead className="bg-zinc-800/50">
//                   <tr>
//                     <th className="px-4 py-2">Name</th>
//                     <th className="px-4 py-2">Email</th>
//                     <th className="px-4 py-2">Role</th>
//                     <th className="px-4 py-2">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {users.map((user) => (
//                     <tr
//                       key={user._id}
//                       className="border-t border-zinc-700 hover:bg-white/5"
//                     >
//                       <td className="px-4 py-2">{user.fullName}</td>
//                       <td className="px-4 py-2">{user.email}</td>
//                       <td className="px-4 py-2 flex items-center gap-2">
//                         {user.role === "SUPERADMIN" && <FaCrown className="text-yellow-400" />}
//                         {user.role === "ADMIN" && <FaUserShield className="text-blue-400" />}
//                         {user.role === "USER" && <FaRegUser className="text-gray-400" />}
//                         {user.role}
//                       </td>
//                       <td className="px-4 py-2">
//                         {currentUserRole === "SUPERADMIN" && (
//                           <select
//                             value={user.role}
//                             onChange={(e) => handleRoleChange(user._id, e.target.value)}
//                             className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1"
//                           >
//                             <option value="USER">USER</option>
//                             <option value="ADMIN">ADMIN</option>
//                             <option value="SUPERADMIN">SUPERADMIN</option>
//                           </select>
//                         )}
//                         {currentUserRole === "ADMIN" && user.role === "USER" && (
//                           <select
//                             value={user.role}
//                             onChange={(e) => handleRoleChange(user._id, e.target.value)}
//                             className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1"
//                           >
//                             <option value="USER">USER</option>
//                           </select>
//                         )}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </motion.div>

//           <ChartViewer embed selectedFileId={id} />


//           {/* Reuse Excel Chart Builder */}
//         {/* <section className="bg-dark rounded-lg shadow p-4">
//           <h2 className="text-xl font-semibold mb-4">Excel Chart Analytics</h2>
//           <ChartViewer embed />
//         </section> */}

//           {/* Excel Uploads & AI Insights */}
//           <motion.div
//             initial={{ opacity: 0, y: 10 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             className="bg-gradient-to-br from-white/5 to-white/10 p-6 rounded-2xl shadow-lg border border-zinc-800 grid md:grid-cols-2 gap-6"
//           >
//             <div>
//               <div className="flex items-center justify-between mb-4">
//                 <h2 className="text-lg font-semibold text-yellow-400">Excel Uploads</h2>
//                 <div className="flex items-center gap-2">
//                   <label className="px-3 py-2 bg-indigo-600 rounded cursor-pointer">
//                     <input type="file" accept=".xlsx,.xls,.csv" onChange={handleUploadFile} className="hidden" />
//                     <span className="flex items-center gap-2 text-white"><FiUpload /> Upload</span>
//                   </label>
//                 </div>
//               </div>

//               <div className="overflow-x-auto">
//                 <table className="w-full text-left text-sm">
//                   <thead className="bg-zinc-800/50">
//                     <tr>
//                       <th className="px-3 py-2">Filename</th>
//                       <th className="px-3 py-2">Uploaded At</th>
//                       <th className="px-3 py-2">Size</th>
//                       <th className="px-3 py-2">Actions</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {files.map((f) => (
//                       <tr key={f._id} className="border-t border-zinc-700 hover:bg-white/5">
//                         <td className="px-3 py-2">{f.filename || f.originalname || 'Unnamed'}</td>
//                         <td className="px-3 py-2">{f.uploadedAt ? new Date(f.uploadedAt).toLocaleString() : '—'}</td>
//                         <td className="px-3 py-2">{f.size ? `${(f.size / 1024).toFixed(2)} KB` : '—'}</td>
//                         <td className="px-3 py-2 flex gap-2">
//                           <button
//                             onClick={async () => {
//                               // ensure file is loaded into store before navigating
//                               const res = await dispatch(getExcelFileById(f._id));
//                               if (res && (res.payload || res.file)) navigate(`/excel?file=${f._id}`);
//                               else navigate(`/excel?file=${f._id}`); // still navigate as fallback
//                             }}
//                             className="px-2 py-1 bg-blue-600 text-white rounded"
//                             title="View"
//                           >
//                             <FiEye />
//                           </button>

//                           <button
//                             onClick={() => handleAnalyze(f._id)}
//                             className="px-2 py-1 bg-indigo-500 text-white rounded"
//                             title="Analyze"
//                           >
//                             <FiPlay />
//                           </button>

//                           <button
//                             onClick={() => handleDownloadFile(f)}
//                             className="px-2 py-1 bg-yellow-400 text-black rounded"
//                             title="Download"
//                           >
//                             <FiDownload />
//                           </button>

//                           <button onClick={() => handleDeleteFile(f._id)} className="px-2 py-1 bg-red-500 text-white rounded" title="Delete"><FiTrash2 /></button>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>

//             <div>
//               <div className="flex items-center justify-between mb-4">
//                 <h2 className="text-lg font-semibold text-yellow-400">AI Insights & Charts</h2>
//                 <div className="text-sm text-gray-300">Analyze and visualize uploaded Excel files</div>
//               </div>

//               {/* embedded chart builder (reuses excel chart logic) */}
//               <div className="mb-4">
//                 <ChartViewer embed={true} selectedFileId={selectedFileId} />
//               </div>

//               <div className="border-t border-zinc-700 pt-4">
//                 <h3 className="text-md font-medium text-yellow-400 mb-3">AI Analysis</h3>
//                 <AiInsights parsedData={currentFile?.parsedData || currentFile?.data || null} />
//               </div>
//             </div>
//           </motion.div>
//         </div>
//       </div>
//     </Layout>
//   );
// };

// export default AdminDashboard;



// src/Pages/Admin/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Layout from "../../Layout/Layout";
import { fetchUsers, updateUserRole } from "../../Redux/adminSlice";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FaCrown, FaUserShield, FaRegUser } from "react-icons/fa";
import { FiUpload, FiDownload, FiTrash2, FiEye, FiPlay } from "react-icons/fi";
import AiInsights from "../Excel/AiInsights";
import ChartViewer from "../Excel/ChartViewer";
import { getExcelFiles, uploadExcelFile, deleteExcelFile, getExcelFileById } from "../../Redux/excelSlice";
import { saveAs } from "file-saver";
import { getAllBlogs } from "../../Redux/blogSlice";
import { MdOutlineModeEdit } from "react-icons/md";
import { FcSalesPerformance, FcViewDetails } from "react-icons/fc";

import {
  BsCollectionPlayFill,
  BsTrash,
} from "react-icons/bs";

import {
  FaUsers,
  // FaUserShield,
  // FaCrown,
  // FaRegUser,
} from "react-icons/fa";

// Reusable Stat Card
const StatCard = ({ title, value, icon, color }) => {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      className={`flex items-center justify-between p-5 rounded-2xl bg-gradient-to-br ${color} text-black shadow-md`}
    >
      <div>
        <p className="text-sm font-medium opacity-80">{title}</p>
        <h2 className="text-3xl font-bold mt-1">{value}</h2>
      </div>
      <div className="text-4xl opacity-90">{icon}</div>
    </motion.div>
  );
};

const AdminDashboard = ({ id }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { users = [], loading = false } = useSelector((state) => state.admin || {});
  const auth = useSelector((state) => state.auth || {});
  const myBlogs = useSelector((state) => state.blog.blogsData) || [];
  const [animated, setAnimated] = useState({ b: 0, a: 0, c: 0 })

  const [counts, setCounts] = useState({ blogs: 0, authors: 0, categories: 0 });
  const { files = [], currentFile } = useSelector((state) => state.excel || {});
  const currentUserRole = auth?.role || "";

  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(getExcelFiles()); // load list once on mount
    dispatch(getAllBlogs())
  }, [dispatch]);

  useEffect(() => {
    const totalBlogs = myBlogs?.length || 0;
    const uniqueAuthors = new Set(myBlogs.map((b) => b?.author).filter(Boolean)).size;
    const uniqueCategories = new Set(myBlogs.map((b) => b?.category?.name).filter(Boolean)).size;

    setCounts({ blogs: totalBlogs, authors: uniqueAuthors, categories: uniqueCategories });

    // Simple count-up animation
    const duration = 600;
    const start = performance.now();
    const startVals = { ...animated };

    const step = (now) => {
      const t = Math.min((now - start) / duration, 1);
      setAnimated({
        b: Math.floor(startVals.b + (totalBlogs - startVals.b) * t),
        a: Math.floor(startVals.a + (uniqueAuthors - startVals.a) * t),
        c: Math.floor(startVals.c + (uniqueCategories - startVals.c) * t),
      });
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myBlogs]);

  // selected file id for embedded chart viewer / analysis
  const [selectedFileId, setSelectedFileId] = useState(id || null);

  const handleRoleChange = (userId, newRole) => {
    dispatch(updateUserRole({ userId, role: newRole }));
  };

  // Upload
  const handleUploadFile = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    await dispatch(uploadExcelFile(f));
    await dispatch(getExcelFiles());
  };

  // Delete file
  const handleDeleteFile = async (id) => {
    if (!window.confirm("Delete this file?")) return;
    await dispatch(deleteExcelFile(id));
    await dispatch(getExcelFiles());
    if (selectedFileId === id) setSelectedFileId(null);
  };

  // Download file (prefer backend downloadUrl)
  const handleDownloadFile = async (file) => {
    const url = file?.downloadUrl || file?.url;
    if (url) {
      window.open(url, "_blank");
      return;
    }
    try {
      const resp = await fetch(`/api/excel/${file._id}/download`, { credentials: "same-origin" });
      if (!resp.ok) throw new Error("Download failed");
      const blob = await resp.blob();
      saveAs(blob, file.filename || `excel-${file._id}.xlsx`);
    } catch (err) {
      console.error("download error", err);
      if (file?.url) window.open(file.url, "_blank");
      else alert("Unable to download file.");
    }
  };

  // Analyze — fetch file, put it into store, and set selected id for ChartViewer
  const handleAnalyze = async (fileId) => {
    setSelectedFileId(fileId);
    await dispatch(getExcelFileById(fileId));
    // ChartViewer (embed) will read currentFile from the redux store
  };

  if (loading) return <p className="text-center py-10">Loading users...</p>;

  return (
    <Layout>
      <div className="min-h-[90vh] px-6 py-10 text-white">
        <div className="max-w-7xl mx-auto space-y-10">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-yellow-400">Admin Dashboard</h1>
            <div className="flex gap-3">
              <button
                onClick={() => dispatch(getAllBlogs())}
                className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition"
              >
                Refresh
              </button>
              <button
                onClick={() => navigate("/blog/create")}
                className="px-4 py-2 rounded-lg bg-yellow-500 text-black font-semibold"
              >
                + Create Blog
              </button>
            </div>

            <label className="px-4 py-2 bg-indigo-600 rounded cursor-pointer hover:bg-indigo-700 transition">
              <input type="file" accept=".xlsx,.xls,.csv" onChange={handleUploadFile} className="hidden" />
              <span className="flex items-center gap-2"><FiUpload /> Upload Excel</span>
            </label>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <StatCard
              title="Total Blogs"
              value={animated.b}
              icon={<BsCollectionPlayFill />}
              color="from-yellow-300 to-yellow-500"
            />
            <StatCard
              title="Unique Authors"
              value={animated.a}
              icon={<FaUsers />}
              color="from-emerald-300 to-emerald-500"
            />
            <StatCard
              title="Categories"
              value={animated.c}
              icon={<FcSalesPerformance />}
              color="from-sky-300 to-sky-500"
            />
          </div>
          

          {/* Users */}
          <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-white/5 to-white/10 p-6 rounded-2xl shadow-lg border border-zinc-800">
            <h2 className="text-lg font-semibold mb-4 text-yellow-400">User Management</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-800/50">
                  <tr>
                    <th className="px-4 py-2">Name</th>
                    <th className="px-4 py-2">Email</th>
                    <th className="px-4 py-2">Role</th>
                    <th className="px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id} className="border-t border-zinc-700 hover:bg-white/5">
                      <td className="px-4 py-2">{user.fullName}</td>
                      <td className="px-4 py-2">{user.email}</td>
                      <td className="px-4 py-2 flex items-center gap-2">
                        {user.role === "SUPERADMIN" && <FaCrown className="text-yellow-400" />}
                        {user.role === "ADMIN" && <FaUserShield className="text-blue-400" />}
                        {user.role === "USER" && <FaRegUser className="text-gray-400" />}
                        {user.role}
                      </td>
                      <td className="px-4 py-2">
                        {currentUserRole === "SUPERADMIN" && (
                          <select value={user.role} onChange={(e) => handleRoleChange(user._id, e.target.value)} className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1">
                            <option value="USER">USER</option>
                            <option value="ADMIN">ADMIN</option>
                            <option value="SUPERADMIN">SUPERADMIN</option>
                          </select>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Excel files list */}
          <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-white/5 to-white/10 p-6 rounded-2xl shadow-lg border border-zinc-800">
            <h2 className="text-lg font-semibold text-yellow-400 mb-4">Excel Files</h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-800/50">
                  <tr>
                    <th className="px-3 py-2">Filename</th>
                    <th className="px-3 py-2">Uploaded At</th>
                    <th className="px-3 py-2">Size</th>
                    <th className="px-3 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {files.map((f) => (
                    <tr key={f._id} className="border-t border-zinc-700 hover:bg-white/5">
                      <td className="px-3 py-2">{f.filename || f.originalname || "Unnamed"}</td>
                      <td className="px-3 py-2">{f.uploadedAt ? new Date(f.uploadedAt).toLocaleString() : "—"}</td>
                      <td className="px-3 py-2">{f.size ? `${(f.size / 1024).toFixed(2)} KB` : "—"}</td>
                      <td className="px-3 py-2 flex gap-2">
                        <button
                          onClick={async () => {
                            // prefetch then navigate
                            await dispatch(getExcelFileById(f._id));
                            navigate(`/excel?file=${f._id}`);
                          }}
                          className="px-2 py-1 bg-blue-600 text-white rounded"
                          title="View"
                        >
                          <FiEye />
                        </button>

                        {/* <button onClick={() => handleAnalyze(f._id)} className="px-2 py-1 bg-indigo-500 text-white rounded" title="Analyze">
                          <FiPlay />
                        </button>

                        <button onClick={() => handleDownloadFile(f)} className="px-2 py-1 bg-yellow-400 text-black rounded" title="Download">
                          <FiDownload />
                        </button> */}

                        <button onClick={() => handleDeleteFile(f._id)} className="px-2 py-1 bg-red-500 text-white rounded" title="Delete">
                          <FiTrash2 />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Embedded Chart Builder + AI Insights (uses ChartViewer in embed mode) */}
          {/* <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-white/5 to-white/10 p-6 rounded-2xl shadow-lg border border-zinc-800 grid md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold text-yellow-400 mb-4">Excel Chart Builder</h2>
              
              <ChartViewer embed selectedFileId={selectedFileId} />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-yellow-400 mb-4">AI Insights</h2>
              <AiInsights parsedData={currentFile?.parsedData || currentFile?.data || null} />
            </div>
          </motion.div> */}

          {/* Blogs Table */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-white/5 to-white/10 p-6 rounded-2xl shadow-lg border border-zinc-800"
          >
            <h2 className="text-lg font-semibold mb-4 text-yellow-400">
              Blogs Overview
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-800/50">
                  <tr>
                    <th className="px-4 py-2">#</th>
                    <th className="px-4 py-2">Preview</th>
                    <th className="px-4 py-2">Title</th>
                    <th className="px-4 py-2">Category</th>
                    <th className="px-4 py-2">Author</th>
                    <th className="px-4 py-2">Content</th>
                    <th className="px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {myBlogs.map((blog, index) => (
                    <motion.tr
                      key={blog._id}
                      initial={{ opacity: 0, y: 6 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      className="border-t border-zinc-700 hover:bg-white/5"
                    >
                      <td className="px-4 py-3">{index + 1}</td>
                      <td className="px-4 py-3">
                        {blog?.thumbnail?.secure_url ? (
                          <img
                            src={blog.thumbnail.secure_url}
                            alt="thumb"
                            className="w-20 h-12 object-cover rounded-lg border border-zinc-700"
                          />
                        ) : (
                          <div className="w-20 h-12 flex items-center justify-center bg-zinc-800 text-zinc-500 rounded-lg">
                            No Img
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">{blog.title}</td>
                      <td className="px-4 py-3">{blog.category?.name || "—"}</td>
                      <td className="px-4 py-3">{blog.author || "—"}</td>
                      <td className="px-4 py-3 max-w-xs truncate">
                        {blog.content}
                      </td>
                      <td className="px-4 py-3 flex gap-2">
                        <button
                          onClick={() =>
                            navigate("/blog/create", { state: { initialBlogData: { newBlog: false, ...blog } } })
                          }
                          className="p-2 bg-yellow-500 hover:bg-yellow-600 rounded-lg text-black"
                        >
                          <MdOutlineModeEdit />
                        </button>
                        <button
                          onClick={() => handleBlogDelete(blog._id)}
                          className="p-2 bg-red-500 hover:bg-red-600 rounded-lg text-white"
                        >
                          <BsTrash />
                        </button>
                        <button
                          onClick={() => navigate("/blog/description", { state: { ...blog } })}
                          className="p-2 bg-green-500 hover:bg-green-600 rounded-lg text-black"
                        >
                          <FcViewDetails />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
