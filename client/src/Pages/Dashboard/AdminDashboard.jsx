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


// import React, { useEffect } from "react";
// import Layout from "../../Layout/Layout";
// import {
//   Chart as ChartJS,
//   ArcElement,
//   Tooltip,
//   Legend,
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   Title,
// } from "chart.js";
// import { Pie, Bar } from "react-chartjs-2";
// import { FaUsers } from "react-icons/fa";
// import { GiMoneyStack } from "react-icons/gi";
// import { FcSalesPerformance } from "react-icons/fc";
// import { BsCollectionPlayFill, BsTrash } from "react-icons/bs";
// import { MdOutlineModeEdit } from "react-icons/md";
// import { useNavigate } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import { deleteCourse, getAllCourses } from "../../Redux/courseSlice";
// import { getStatsData } from "../../Redux/statSlice";
// import { getPaymentRecord } from "../../Redux/razorpaySlice";

// ChartJS.register(
//   ArcElement,
//   Tooltip,
//   Legend,
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   Title
// );

// const AdminDashboard = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   const { allUsersCount, subscribedUsersCount } = useSelector(
//     (state) => state.stat
//   );
//   const { allPayments, finalMonths, monthlySalesRecord } = useSelector(
//     (state) => state.razorpay
//   );

//   const userData = {
//     labels: ["Registered User", "Enrolled User"],
//     datasets: [
//       {
//         label: "User Details",
//         data: [allUsersCount, subscribedUsersCount],
//         backgroundColor: ["yellow", "green"],
//         borderColor: ["yellow", "green"],
//         borderWidth: 1,
//       },
//     ],
//   };

//   const salesData = {
//     labels: [
//       "January",
//       "Febraury",
//       "March",
//       "April",
//       "May",
//       "June",
//       "July",
//       "August",
//       "September",
//       "October",
//       "November",
//       "December",
//     ],
//     fontColor: "white",
//     datasets: [
//       {
//         label: "Sales / Month",
//         data: monthlySalesRecord,
//         backgroundColor: ["rgb(255, 99, 132)"],
//         borderColor: ["white"],
//         borderWidth: 2,
//       },
//     ],
//   };

//   // getting the courses data from redux toolkit store
//   const myCourses = useSelector((state) => state?.course?.coursesData);

//   // function to handle the course delete
//   const handleCourseDelete = async (id) => {
//     if (window.confirm("Are you sure you want to delete the course?")) {
//       const res = await dispatch(deleteCourse(id));

//       // fetching the new updated data for the course
//       if (res.payload.success) {
//         await dispatch(getAllCourses());
//       }
//     }
//   };

//   useEffect(() => {
//     (async () => {
//       await dispatch(getAllCourses());
//       await dispatch(getStatsData());
//       await dispatch(getPaymentRecord());
//     })();
//   }, []);

//   return (
//     <Layout>
//       <div className="min-h-[90vh] pt-5 flex flex-col flex-wrap gap-10 text-white">
//         <h1 className="text-center text-3xl font-semibold text-yellow-500">
//           Admin Dashboard
//         </h1>

//         {/* creating the records card and chart for sales and user details */}
//         <div className="grid grid-cols-2 gap-5 m-auto mx-10">
//           {/* displaying the users chart and data */}
//           <div className="flex flex-col items-center gap-10 p-5 shadow-lg rounded-md">
//             {/* for displaying the pie chart */}
//             <div className="w-80 h-80">
//               <Pie data={userData} />
//             </div>

//             {/* card for user data */}
//             <div className="grid grid-cols-2 gap-5">
//               {/* card for registered users */}
//               <div className="flex items-center justify-between py-5 px-5 gap-5 rounded-md shadow-md">
//                 <div className="flex flex-col items-center">
//                   <p className="font-semibold">Registered Users</p>
//                   <h3 className="text-4xl font-bold">{allUsersCount}</h3>
//                 </div>
//                 <FaUsers className="text-yellow-500 text-5xl" />
//               </div>

//               {/* card for enrolled users */}
//               <div className="flex items-center justify-between py-5 px-5 gap-5 rounded-md shadow-md">
//                 <div className="flex flex-col items-center">
//                   <p className="font-semibold">Subscribed Users</p>
//                   <h3 className="text-4xl font-bold">{subscribedUsersCount}</h3>
//                 </div>
//                 <FaUsers className="text-green-500 text-5xl" />
//               </div>
//             </div>
//           </div>

//           {/* displaying the sales chart and data */}
//           <div className="flex flex-col items-center gap-10 p-5 shadow-lg rounded-md">
//             {/* for displaying the bar chart */}
//             <div className="h-80 relative w-full">
//               <Bar className="absolute bottom-0 h-80 w-full" data={salesData} />
//             </div>

//             {/* card for user data */}
//             <div className="grid grid-cols-2 gap-5">
//               {/* card for registered users */}
//               <div className="flex items-center justify-between py-5 px-5 gap-5 rounded-md shadow-md">
//                 <div className="flex flex-col items-center">
//                   <p className="font-semibold">Subscriptions Count</p>
//                   <h3 className="text-4xl font-bold">{allPayments?.count}</h3>
//                 </div>
//                 <FcSalesPerformance className="text-yellow-500 text-5xl" />
//               </div>

//               {/* card for enrolled users */}
//               <div className="flex items-center justify-between py-5 px-5 gap-5 rounded-md shadow-md">
//                 <div className="flex flex-col items-center">
//                   <p className="font-semibold">Total Revenue</p>
//                   <h3 className="text-4xl font-bold">
//                     {allPayments?.count * 499}
//                   </h3>
//                 </div>
//                 <GiMoneyStack className="text-green-500 text-5xl" />
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* CRUD courses section */}
//         <div className="mx-[10%] w-[80%] self-center flex flex-col items-center justify-center gap-10 mb-10">
//           <div className="flex w-full items-center justify-between">
//             <h1 className="text-center text-3xl font-semibold">
//               Courses Overview
//             </h1>

//             {/* add course card */}
//             <button
//               onClick={() => {
//                 navigate("/course/create", {
//                   state: {
//                     initialCourseData: {
//                       newCourse: true,
//                       title: "",
//                       category: "",
//                       createdBy: "",
//                       description: "",
//                       thumbnail: undefined,
//                       previewImage: "",
//                     },
//                   },
//                 });
//               }}
//               className="w-fit bg-yellow-500 hover:bg-yellow-600 transition-all ease-in-out duration-300 rounded py-2 px-4 font-semibold text-lg cursor-pointer"
//             >
//               Create New Course
//             </button>
//           </div>

//           <table className="table overflow-x-scroll">
//             <thead>
//               <tr>
//                 <th>S No.</th>
//                 <th>Course Title</th>
//                 <th>Course Category</th>
//                 <th>Instructor</th>
//                 <th>Total Lectures</th>
//                 <th>Course Description</th>
//                 <th>Actions</th>
//               </tr>
//             </thead>

//             <tbody>
//               {myCourses?.map((element, index) => {
//                 return (
//                   <tr key={element?._id}>
//                     <td>{index + 1}</td>
//                     <td>
//                       <textarea
//                         readOnly
//                         className="w-40 h-auto bg-transparent resize-none"
//                         value={element?.title}
//                       ></textarea>
//                     </td>
//                     <td>{element?.category}</td>
//                     <td>{element?.createdBy}</td>
//                     <td>{element?.numberOfLectures}</td>
//                     <td className="max-w-28 overflow-hidden text-ellipsis whitespace-nowrap">
//                       <textarea
//                         readOnly
//                         className="w-80 h-auto bg-transparent resize-none"
//                         value={element?.description}
//                       ></textarea>
//                     </td>

//                     <td className="flex items-center gap-4">
//                       {/* to edit the course */}
//                       <button
//                         onClick={() =>
//                           navigate("/course/create", {
//                             state: {
//                               initialCourseData: {
//                                 newCourse: false,
//                                 ...element,
//                               },
//                             },
//                           })
//                         }
//                         className="bg-yellow-500 hover:bg-yellow-600 transition-all ease-in-out duration-300 text-xl py-2 px-4 rounded-md font-bold"
//                       >
//                         <MdOutlineModeEdit />
//                       </button>

//                       {/* to delete the course */}
//                       <button
//                         onClick={() => handleCourseDelete(element._id)}
//                         className="bg-red-500 hover:bg-red-600 transition-all ease-in-out duration-30 text-xl py-2 px-4 rounded-md font-bold"
//                       >
//                         <BsTrash />
//                       </button>

//                       {/* to CRUD the lectures */}
//                       <button
//                         onClick={() =>
//                           navigate("/course/displaylectures", {
//                             state: { ...element },
//                           })
//                         }
//                         className="bg-green-500 hover:bg-green-600 transition-all ease-in-out duration-30 text-xl py-2 px-4 rounded-md font-bold"
//                       >
//                         <BsCollectionPlayFill />
//                       </button>
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </Layout>
//   );
// };

// export default AdminDashboard;



// // src/Pages/Admin/AdminDashboard.jsx
// import React, { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import Layout from "../../Layout/Layout";
// import { fetchUsers, updateUserRole } from "../../Redux/adminSlice";
// import { motion } from "framer-motion";
// import { useNavigate } from "react-router-dom";
// import { FaCrown, FaUserShield, FaRegUser } from "react-icons/fa";
// import { FiUpload, FiDownload, FiTrash2, FiEye, FiPlay } from "react-icons/fi";
// import AiInsights from "../Excel/AiInsights";
// import ChartViewer from "../Excel/ChartViewer";
// import { getExcelFiles, uploadExcelFile, deleteExcelFile, getExcelFileById } from "../../Redux/excelSlice";
// import { saveAs } from "file-saver";

// const AdminDashboard = ({ id }) => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   const { users = [], loading = false } = useSelector((state) => state.admin || {});
//   const auth = useSelector((state) => state.auth || {});
//   const { files = [], currentFile } = useSelector((state) => state.excel || {});
//   const currentUserRole = auth?.role || "";

//   useEffect(() => {
//     dispatch(fetchUsers());
//     dispatch(getExcelFiles()); // load list once on mount
//   }, [dispatch]);

//   // selected file id for embedded chart viewer / analysis
//   const [selectedFileId, setSelectedFileId] = useState(id || null);

//   const handleRoleChange = (userId, newRole) => {
//     dispatch(updateUserRole({ userId, role: newRole }));
//   };

//   // Upload
//   const handleUploadFile = async (e) => {
//     const f = e.target.files?.[0];
//     if (!f) return;
//     await dispatch(uploadExcelFile(f));
//     await dispatch(getExcelFiles());
//   };

//   // Delete file
//   const handleDeleteFile = async (id) => {
//     if (!window.confirm("Delete this file?")) return;
//     await dispatch(deleteExcelFile(id));
//     await dispatch(getExcelFiles());
//     if (selectedFileId === id) setSelectedFileId(null);
//   };

//   // Download file (prefer backend downloadUrl)
//   const handleDownloadFile = async (file) => {
//     const url = file?.downloadUrl || file?.url;
//     if (url) {
//       window.open(url, "_blank");
//       return;
//     }
//     try {
//       const resp = await fetch(`/api/excel/${file._id}/download`, { credentials: "same-origin" });
//       if (!resp.ok) throw new Error("Download failed");
//       const blob = await resp.blob();
//       saveAs(blob, file.filename || `excel-${file._id}.xlsx`);
//     } catch (err) {
//       console.error("download error", err);
//       if (file?.url) window.open(file.url, "_blank");
//       else alert("Unable to download file.");
//     }
//   };

//   // Analyze — fetch file, put it into store, and set selected id for ChartViewer
//   const handleAnalyze = async (fileId) => {
//     setSelectedFileId(fileId);
//     await dispatch(getExcelFileById(fileId));
//     // ChartViewer (embed) will read currentFile from the redux store
//   };

//   if (loading) return <p className="text-center py-10">Loading users...</p>;

//   return (
//     <Layout>
//       <div className="min-h-[90vh] px-6 py-10 text-white">
//         <div className="max-w-7xl mx-auto space-y-10">
//           {/* Header */}
//           <div className="flex items-center justify-between">
//             <h1 className="text-3xl font-bold text-yellow-400">Admin Dashboard</h1>
//             <div className="flex items-center gap-3">
//               <label className="px-4 py-2 bg-indigo-600 rounded cursor-pointer hover:bg-indigo-700 transition">
//                 <input type="file" accept=".xlsx,.xls,.csv" onChange={handleUploadFile} className="hidden" />
//                 <span className="flex items-center gap-2"><FiUpload /> Upload Excel</span>
//               </label>
//               <button onClick={() => navigate('/tests')} className="px-3 py-2 rounded bg-indigo-500 text-white">Tests</button>
//               {(currentUserRole === 'ADMIN' || currentUserRole === 'SUPERADMIN') && (
//                 <>
//                   <button onClick={() => navigate('/tests/upload-pdf')} className="px-3 py-2 rounded bg-pink-500 text-white">Upload Test PDF</button>
//                   <button onClick={() => navigate('/tests/create')} className="px-3 py-2 rounded bg-yellow-400 text-black">Create Test</button>
//                   <button onClick={() => navigate('/tests/attempts')} className="px-3 py-2 rounded bg-green-600 text-white">View Attempts</button>
//                 </>
//               )}

              
//             </div>
//           </div>

//           {/* Users */}
//           <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-white/5 to-white/10 p-6 rounded-2xl shadow-lg border border-zinc-800">
//             <h2 className="text-lg font-semibold mb-4 text-yellow-400">User Management</h2>
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
//                     <tr key={user._id} className="border-t border-zinc-700 hover:bg-white/5">
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
//                           <select value={user.role} onChange={(e) => handleRoleChange(user._id, e.target.value)} className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1">
//                             <option value="USER">USER</option>
//                             <option value="ADMIN">ADMIN</option>
//                             <option value="SUPERADMIN">SUPERADMIN</option>
//                           </select>
//                         )}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </motion.div>

//           {/* Excel files list */}
//           <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-white/5 to-white/10 p-6 rounded-2xl shadow-lg border border-zinc-800">
//             <h2 className="text-lg font-semibold text-yellow-400 mb-4">Excel Files</h2>

//             <div className="overflow-x-auto">
//               <table className="w-full text-left text-sm">
//                 <thead className="bg-zinc-800/50">
//                   <tr>
//                     <th className="px-3 py-2">Filename</th>
//                     <th className="px-3 py-2">Uploaded At</th>
//                     <th className="px-3 py-2">Size</th>
//                     <th className="px-3 py-2">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {files.map((f) => (
//                     <tr key={f._id} className="border-t border-zinc-700 hover:bg-white/5">
//                       <td className="px-3 py-2">{f.filename || f.originalname || "Unnamed"}</td>
//                       <td className="px-3 py-2">{f.uploadedAt ? new Date(f.uploadedAt).toLocaleString() : "—"}</td>
//                       <td className="px-3 py-2">{f.size ? `${(f.size / 1024).toFixed(2)} KB` : "—"}</td>
//                       <td className="px-3 py-2 flex gap-2">
//                         <button
//                           onClick={async () => {
//                             // prefetch then navigate
//                             await dispatch(getExcelFileById(f._id));
//                             navigate(`/excel?file=${f._id}`);
//                           }}
//                           className="px-2 py-1 bg-blue-600 text-white rounded"
//                           title="View"
//                         >
//                           <FiEye />
//                         </button>

//                         {/* <button onClick={() => handleAnalyze(f._id)} className="px-2 py-1 bg-indigo-500 text-white rounded" title="Analyze">
//                           <FiPlay />
//                         </button>

//                         <button onClick={() => handleDownloadFile(f)} className="px-2 py-1 bg-yellow-400 text-black rounded" title="Download">
//                           <FiDownload />
//                         </button> */}

//                         <button onClick={() => handleDeleteFile(f._id)} className="px-2 py-1 bg-red-500 text-white rounded" title="Delete">
//                           <FiTrash2 />
//                         </button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </motion.div>

//           {/* Embedded Chart Builder + AI Insights (uses ChartViewer in embed mode) */}
//           {/* <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-white/5 to-white/10 p-6 rounded-2xl shadow-lg border border-zinc-800 grid md:grid-cols-2 gap-6">
//             <div>
//               <h2 className="text-lg font-semibold text-yellow-400 mb-4">Excel Chart Builder</h2>
              
//               <ChartViewer embed selectedFileId={selectedFileId} />
//             </div>

//             <div>
//               <h2 className="text-lg font-semibold text-yellow-400 mb-4">AI Insights</h2>
//               <AiInsights parsedData={currentFile?.parsedData || currentFile?.data || null} />
//             </div>
//           </motion.div> */}
//         </div>
//       </div>
//     </Layout>
//   );
// };

// export default AdminDashboard;


import React, { useEffect, useState } from "react";
import Layout from "../../Layout/Layout";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";
import { Pie, Bar } from "react-chartjs-2";

import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

// Icons
import { FaUsers, FaCrown, FaUserShield, FaRegUser } from "react-icons/fa";
import { GiMoneyStack } from "react-icons/gi";
import { FcSalesPerformance } from "react-icons/fc";
import { BsCollectionPlayFill, BsTrash } from "react-icons/bs";
import { MdOutlineModeEdit } from "react-icons/md";
import { FiUpload, FiTrash2, FiEye } from "react-icons/fi";

// Redux
import { deleteCourse, getAllCourses } from "../../Redux/courseSlice";
import { getStatsData } from "../../Redux/statSlice";
import { getPaymentRecord } from "../../Redux/razorpaySlice";
import { fetchUsers, updateUserRole } from "../../Redux/adminSlice";
import {
  getExcelFiles,
  uploadExcelFile,
  deleteExcelFile,
  getExcelFileById,
} from "../../Redux/excelSlice";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ================= STATE =================
  const { allUsersCount, subscribedUsersCount } = useSelector((s) => s.stat);
  const { allPayments, monthlySalesRecord } = useSelector((s) => s.razorpay);
  const { coursesData } = useSelector((s) => s.course);
  const { users } = useSelector((s) => s.admin);
  const { files } = useSelector((s) => s.excel);
  const auth = useSelector((s) => s.auth);

  const [selectedFileId, setSelectedFileId] = useState(null);

  // ================= EFFECT =================
  useEffect(() => {
    dispatch(getAllCourses());
    dispatch(getStatsData());
    dispatch(getPaymentRecord());
    dispatch(fetchUsers());
    dispatch(getExcelFiles());
  }, [dispatch]);

  // ================= HANDLERS =================
  const handleCourseDelete = async (id) => {
    if (!window.confirm("Delete course?")) return;
    const res = await dispatch(deleteCourse(id));
    if (res.payload.success) dispatch(getAllCourses());
  };

  const handleUploadFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    await dispatch(uploadExcelFile(file));
    dispatch(getExcelFiles());
  };

  const handleDeleteFile = async (id) => {
    if (!window.confirm("Delete file?")) return;
    await dispatch(deleteExcelFile(id));
    dispatch(getExcelFiles());
  };

  // ================= CHART DATA =================
  const userData = {
    labels: ["Registered", "Subscribed"],
    datasets: [
      {
        data: [allUsersCount, subscribedUsersCount],
        backgroundColor: ["yellow", "green"],
      },
    ],
  };

  const salesData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May"],
    datasets: [
      {
        label: "Sales",
        data: monthlySalesRecord,
        backgroundColor: ["red"],
      },
    ],
  };

  // ================= UI =================
  return (
    <Layout>
      <div className="text-white p-6 space-y-10">

        <h1 className="text-3xl text-yellow-400 font-bold text-center">
          Admin Dashboard
        </h1>

        {/* ===== CHARTS ===== */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <Pie data={userData} />
          </div>
          <div>
            <Bar data={salesData} />
          </div>
        </div>

        {/* ===== USERS ===== */}
        <div>
          <h2 className="text-xl text-yellow-400 mb-4">Users</h2>
          <table className="w-full">
            <tbody>
              {users?.map((u) => (
                <tr key={u._id}>
                  <td>{u.fullName}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>
                    {auth?.role === "SUPERADMIN" && (
                      <select
                        value={u.role}
                        onChange={(e) =>
                          dispatch(
                            updateUserRole({
                              userId: u._id,
                              role: e.target.value,
                            })
                          )
                        }
                      >
                        <option>USER</option>
                        <option>ADMIN</option>
                        <option>SUPERADMIN</option>
                      </select>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ===== COURSES ===== */}
        <div>
          <h2 className="text-xl text-yellow-400 mb-4">Courses</h2>
          <button
            onClick={() =>
              navigate("/course/create", {
                state: {
                  initialCourseData: {
                    newCourse: true,
                    title: "",
                    category: "",
                    createdBy: "",
                    description: "",
                    thumbnail: undefined,
                    previewImage: "",
                  },
                },
              })
            }
          >
            Create Course
          </button>

          <table className="w-full">
            <tbody>
              {coursesData?.map((c, i) => (
                <tr key={c._id}>
                  <td>{i + 1}</td>
                  <td>{c.title}</td>
                  <td>{c.category}</td>

                  <td>
                    <button
                      onClick={() =>
                        navigate("/course/create", {
                          state: {
                            initialCourseData: { newCourse: false, ...c },
                          },
                        })
                      }
                    >
                      <MdOutlineModeEdit />
                    </button>

                    <button onClick={() => handleCourseDelete(c._id)}>
                      <BsTrash />
                    </button>

                    <button
                      onClick={() =>
                        navigate("/course/displaylectures", { state: c })
                      }
                    >
                      <BsCollectionPlayFill />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ===== EXCEL FILES ===== */}
        <div>
          <h2 className="text-xl text-yellow-400 mb-4">Excel Files</h2>

          <input type="file" onChange={handleUploadFile} />

          <table className="w-full">
            <tbody>
              {files?.map((f) => (
                <tr key={f._id}>
                  <td>{f.filename}</td>

                  <td>
                    <button
                      onClick={async () => {
                        await dispatch(getExcelFileById(f._id));
                        navigate(`/excel?file=${f._id}`);
                      }}
                    >
                      <FiEye />
                    </button>

                    <button onClick={() => handleDeleteFile(f._id)}>
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </Layout>
  );
};

export default AdminDashboard;