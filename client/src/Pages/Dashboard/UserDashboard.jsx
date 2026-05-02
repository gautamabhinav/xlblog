// import React, { useEffect, useMemo, useState } from "react";
// import Layout from "../../Layout/Layout";
// import { useQuill } from "react-quilljs";
// import "quill/dist/quill.snow.css";
// import { useDispatch, useSelector } from "react-redux";
// import { createNewBlog, deleteBlog, getAllBlogs, updateBlog } from "../../Redux/blogSlice";
// import { useNavigate } from "react-router-dom";
// import { motion } from "framer-motion";
// import { AiOutlinePlus, AiOutlineDelete, AiOutlineEdit, AiOutlineEye } from "react-icons/ai";
// import { HiOutlineCheck, HiOutlineSave, HiOutlineX } from "react-icons/hi";

// const TAG_OPTIONS = ["Development", "React", "Node", "Design", "Product", "Tutorial"];

// const UserDashboard = () => {
//     const dispatch = useDispatch();
//     const navigate = useNavigate();

//     const blogsData = useSelector((state) => state.blog?.blogsData || []);
//     const [query, setQuery] = useState("");
//     const [selectedTags, setSelectedTags] = useState([]);
//     const [title, setTitle] = useState("");
//     const [category, setCategory] = useState("");
//     const [thumbnail, setThumbnail] = useState(null);
//     const [localLikes, setLocalLikes] = useState({});

//     const { quill, quillRef } = useQuill({
//         theme: "snow",
//         modules: {
//             toolbar: [
//                 ["bold", "italic", "underline"],
//                 [{ header: [1, 2, 3, false] }],
//                 ["link", "image"],
//                 [{ list: "ordered" }, { list: "bullet" }],
//                 ["blockquote", "code-block"],
//             ],
//         },
//     });

//     useEffect(() => {
//         dispatch(getAllBlogs());
//     }, [dispatch]);

//     // derive filtered list
//     const filtered = useMemo(() => {
//         const q = query.trim().toLowerCase();
//         return (blogsData || []).filter((b) => {
//             if (!b) return false;
//             const matchQ = q
//                 ? (b.title || "").toLowerCase().includes(q) || (b?.content || "").toLowerCase().includes(q)
//                 : true;
//             const matchTags = selectedTags.length
//                 ? Array.isArray(b.tags)
//                     ? selectedTags.every((t) => b.tags.includes(t))
//                     : selectedTags.includes(b?.category?.name || b?.category)
//                 : true;
//             return matchQ && matchTags;
//         });
//     }, [blogsData, query, selectedTags]);

//     const handleThumbnail = (e) => {
//         const f = e.target.files?.[0];
//         if (f) setThumbnail(f);
//     };

//     const handleToggleTag = (tag) => {
//         setSelectedTags((s) => (s.includes(tag) ? s.filter((t) => t !== tag) : [...s, tag]));
//     };

//     const publish = async (status = "published") => {
//         const content = quill?.root?.innerHTML || "";
//         if (!title || !content) return alert("Please provide title and content");

//         const formData = new FormData();
//         formData.append("title", title);
//         formData.append("content", content);
//         formData.append("author", "Me");
//         formData.append("createdBy", "Me");
//         formData.append("category", category || selectedTags[0] || "General");
//         formData.append("tags", JSON.stringify(selectedTags));
//         formData.append("status", status);
//         if (thumbnail) formData.append("thumbnail", thumbnail);

//         const res = await dispatch(createNewBlog(formData));
//         if (res?.meta?.requestStatus === "fulfilled" && res?.payload?.success) {
//             // reset editor
//             setTitle("");
//             setCategory("");
//             setThumbnail(null);
//             setSelectedTags([]);
//             // if (quill) quill.setText("");
//             // refresh list
//             dispatch(getAllBlogs());
//         }
//     };

//     const handleDelete = async (id) => {
//         if (!window.confirm("Delete this blog?")) return;
//         const res = await dispatch(deleteBlog(id));
//         if (res?.meta?.requestStatus === "fulfilled" && res?.payload?.success) {
//             dispatch(getAllBlogs());
//         }
//     };

//     const handleEdit = (b) => {
//         navigate("/blog/create", { state: { initialBlogData: { newBlog: false, ...b } } });
//     };

//     const handleView = (b) => {
//         navigate("/blog/description", { state: { ...b } });
//     };

//     const toggleLike = (id) => {
//         setLocalLikes((s) => {
//             const cur = s[id] || 0;
//             return { ...s, [id]: cur + 1 };
//         });
//     };

//     return (
//         <Layout>
//             <div className="min-h-[90vh] p-6 text-white">
//                 <div className="max-w-7xl mx-auto">
//                     <div className="flex flex-col md:flex-row gap-6">
//                         {/* Sidebar actions */}
//                         <aside className="w-full md:w-64 bg-white/5 rounded-xl p-4 space-y-4">
//                             <h2 className="text-lg font-semibold">Blog Dashboard</h2>
//                             <nav className="flex flex-col gap-2">
//                                 <button className="text-left px-3 py-2 rounded hover:bg-white/10">🏠 Overview</button>
//                                 <button
//                                     onClick={() => navigate("/blog/create")}
//                                     className="px-3 py-1 rounded-md bg-yellow-500 text-black font-semibold"
//                                 >
//                                     Create Blog
//                                 </button>

//                                 <button onClick={() => document.getElementById('my-blogs')?.scrollIntoView({ behavior: 'smooth' })} className="text-left px-3 py-2 rounded hover:bg-white/10">📚 My Blogs</button>
//                                 <button className="text-left px-3 py-2 rounded hover:bg-white/10">❤️ Liked Blogs</button>
//                                 <button className="text-left px-3 py-2 rounded hover:bg-white/10">⚙️ Settings</button>
//                             </nav>
//                         </aside>

//                         {/* Main column */}
//                         <main className="flex-1 space-y-6">
//                             {/* Top header */}
//                             {/* <header className="flex items-center justify-between">
//                                 <div className="flex items-center gap-4">
//                                     <form onSubmit={(e) => e.preventDefault()} className="flex items-center gap-2">
//                                         <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search blogs by title, tag or category" className="px-3 py-2 rounded-lg bg-white/5 placeholder:text-gray-300" />
//                                         <button onClick={() => setQuery("")} className="px-3 py-2 rounded bg-zinc-700">Clear</button>
//                                     </form>
//                                 </div>
//                                 <div className="flex items-center gap-3">
//                                     <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center font-bold text-black">U</div>
//                                 </div>
//                             </header> */}

//                             {/* Create blog card */}
//                             {/* <section className="bg-white/3 p-4 rounded-xl shadow-sm">
//                                 <h3 className="text-xl font-semibold mb-3">Create / Write a blog</h3>
//                                 <div className="space-y-3">
//                                     <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter your blog title..." className="w-full px-3 py-3 text-lg font-semibold rounded bg-white/5" />

//                                     <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
//                                         <select value={category} onChange={(e) => setCategory(e.target.value)} className="px-3 py-2 rounded bg-white/5">
//                                             <option value="">Select category</option>
//                                             {TAG_OPTIONS.map((t) => (
//                                                 <option key={t} value={t}>{t}</option>
//                                             ))}
//                                         </select>

//                                         <div className="col-span-2 flex items-center gap-3">
//                                             <input type="file" accept="image/*" onChange={handleThumbnail} />
//                                             <div className="flex gap-2 flex-wrap">
//                                                 {TAG_OPTIONS.map((t) => (
//                                                     <button key={t} onClick={() => handleToggleTag(t)} className={`px-2 py-1 rounded text-sm ${selectedTags.includes(t) ? 'bg-indigo-600 text-black' : 'bg-white/5'}`}>{t}</button>
//                                                 ))}
//                                             </div>
//                                         </div>
//                                     </div>

//                                     <div className="prose max-w-full bg-white rounded p-2 text-black">
//                                         <div ref={quillRef} style={{ minHeight: 200 }} />
//                                     </div>

//                                     <div className="flex gap-3 pt-2">
//                                         <button onClick={() => publish('published')} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-black font-semibold"><HiOutlineCheck /> Publish</button>
//                                         <button onClick={() => publish('draft')} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-500 text-black"><HiOutlineSave /> Save as Draft</button>
//                                         <button onClick={() => { setTitle(''); setCategory(''); setSelectedTags([]); setThumbnail(null); if (quill) quill.setText(''); }} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600"><HiOutlineX /> Cancel</button>
//                                     </div>
//                                 </div>
//                             </section> */}

//                             {/* <button
//                                 onClick={() => navigate("/blog/create")}
//                                 className="px-3 py-1 rounded-md bg-yellow-500 text-black font-semibold"
//                             >
//                                 Create Blog
//                             </button> */}

//                             {/* My Blogs */}
//                             <section id="my-blogs">
//                                 <h3 className="text-xl font-semibold mb-4">My Blogs</h3>

//                                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//                                     {filtered.length === 0 ? (
//                                         <div className="col-span-full text-center text-zinc-300 p-6 bg-white/5 rounded">No blogs found</div>
//                                     ) : (
//                                         filtered.map((b) => (
//                                             <motion.div whileHover={{ y: -6 }} key={b._id} className="bg-white/4 rounded-lg p-4 shadow-md relative">
//                                                 <div className="h-36 mb-3 rounded overflow-hidden bg-zinc-800 flex items-center justify-center">
//                                                     {b?.thumbnail?.secure_url ? (
//                                                         <img src={b.thumbnail.secure_url} alt="thumb" className="w-full h-full object-cover" />
//                                                     ) : (
//                                                         <div className="text-zinc-400">No image</div>
//                                                     )}
//                                                 </div>
//                                                 <div className="flex items-start justify-between gap-3">
//                                                     <div className="flex-1">
//                                                         <h4 className="font-semibold text-lg line-clamp-2">{b.title}</h4>
//                                                         <p className="text-sm text-zinc-400">{new Date(b.createdAt || b?.createdAt || Date.now()).toLocaleDateString()}</p>
//                                                         <div className="flex gap-2 items-center mt-2">
//                                                             <span className="px-2 py-1 text-xs rounded bg-white/5">{b?.category?.name || b?.category || 'General'}</span>
//                                                             {(b?.tags || []).slice(0, 3).map((t) => (<span key={t} className="px-2 py-1 text-xs rounded bg-white/5">{t}</span>))}
//                                                         </div>
//                                                     </div>

//                                                     <div className="flex flex-col items-end gap-2">
//                                                         <div className="text-sm text-zinc-300">{b.status || 'published'}</div>
//                                                         <div className="flex gap-2">
//                                                             <button onClick={() => handleEdit(b)} className="px-2 py-1 rounded bg-yellow-500 text-black"><AiOutlineEdit /></button>
//                                                             <button onClick={() => handleView(b)} className="px-2 py-1 rounded bg-emerald-500 text-black"><AiOutlineEye /></button>
//                                                             <button onClick={() => handleDelete(b._id)} className="px-2 py-1 rounded bg-red-500 text-white"><AiOutlineDelete /></button>
//                                                         </div>
//                                                     </div>
//                                                 </div>

//                                                 <div className="flex items-center justify-between mt-3 text-sm text-zinc-300">
//                                                     <div className="flex items-center gap-3">
//                                                         <button onClick={() => toggleLike(b._id)} className="px-2 py-1 rounded bg-white/5">👍 {(b.likes || 0) + (localLikes[b._id] || 0)}</button>
//                                                         <button onClick={() => handleView(b)} className="px-2 py-1 rounded bg-white/5">💬 {(b.comments?.length) || 0}</button>
//                                                     </div>
//                                                     <div className="text-xs text-zinc-400">Views: {b.views || 0}</div>
//                                                 </div>
//                                             </motion.div>
//                                         ))
//                                     )}
//                                 </div>
//                             </section>
//                         </main>
//                     </div>
//                 </div>
//             </div>
//         </Layout>
//     );
// };

// export default UserDashboard;


// import React, { useEffect, useMemo, useState } from "react";
// import Layout from "../../Layout/Layout";
// import { useQuill } from "react-quilljs";
// import "quill/dist/quill.snow.css";
// import { useDispatch, useSelector } from "react-redux";
// import { createNewBlog, deleteBlog, getAllBlogs, updateBlog } from "../../Redux/blogSlice";
// import { useNavigate } from "react-router-dom";
// import { motion } from "framer-motion";
// import { AiOutlineDelete, AiOutlineEdit, AiOutlineEye } from "react-icons/ai";

// const TAG_OPTIONS = ["Development", "React", "Node", "Design", "Product", "Tutorial"];

// const UserDashboard = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   const blogsData = useSelector((state) => state.blog?.blogsData || []);
//   const [query, setQuery] = useState("");
//   const [selectedTags, setSelectedTags] = useState([]);
//   const [title, setTitle] = useState("");
//   const [category, setCategory] = useState("");
//   const [thumbnail, setThumbnail] = useState(null);
//   const [likedMap, setLikedMap] = useState({});
//   const [likedBlogs, setLikedBlogs] = useState([]);
//   const [settings, setSettings] = useState({
//     persistLikes: false,
//     showLikedOnly: false,
//   });

//   const { quill, quillRef } = useQuill({
//     theme: "snow",
//     modules: {
//       toolbar: [
//         ["bold", "italic", "underline"],
//         [{ header: [1, 2, 3, false] }],
//         ["link", "image"],
//         [{ list: "ordered" }, { list: "bullet" }],
//         ["blockquote", "code-block"],
//       ],
//     },
//   });

//   useEffect(() => {
//     dispatch(getAllBlogs());
//   }, [dispatch]);

//   useEffect(() => {
//     const persist = (() => {
//       try {
//         const raw = localStorage.getItem("persistLikesSetting");
//         return raw ? JSON.parse(raw) : false;
//       } catch (e) {
//         return false;
//       }
//     })();
//     if (persist) {
//       try {
//         const ids = JSON.parse(localStorage.getItem("likedIds") || "[]");
//         const blogs = JSON.parse(localStorage.getItem("likedBlogs") || "[]");
//         const map = ids.reduce((acc, id) => ({ ...acc, [id]: true }), {});
//         setLikedMap(map);
//         setLikedBlogs(blogs);
//         setSettings((s) => ({ ...s, persistLikes: true }));
//       } catch (e) {
//       }
//     }
//   }, []);

//   useEffect(() => {
//     try {
//       localStorage.setItem("persistLikesSetting", JSON.stringify(settings.persistLikes));
//     } catch (e) {}
//     if (settings.persistLikes) {
//       try {
//         const ids = Object.keys(likedMap).filter((k) => likedMap[k]);
//         localStorage.setItem("likedIds", JSON.stringify(ids));
//         localStorage.setItem("likedBlogs", JSON.stringify(likedBlogs));
//       } catch (e) {}
//     } else {
//       try {
//         localStorage.removeItem("likedIds");
//         localStorage.removeItem("likedBlogs");
//       } catch (e) {}
//     }
//   }, [settings.persistLikes, likedMap, likedBlogs]);

//   const filtered = useMemo(() => {
//     const q = query.trim().toLowerCase();
//     let list = (blogsData || []).filter((b) => {
//       if (!b) return false;
//       const matchQ = q
//         ? (b.title || "").toLowerCase().includes(q) || (b?.content || "").toLowerCase().includes(q)
//         : true;
//       const matchTags = selectedTags.length
//         ? Array.isArray(b.tags)
//           ? selectedTags.every((t) => b.tags.includes(t))
//           : selectedTags.includes(b?.category?.name || b?.category)
//         : true;
//       return matchQ && matchTags;
//     });
//     if (settings.showLikedOnly) {
//       list = list.filter((b) => likedMap[b._id]);
//     }
//     return list;
//   }, [blogsData, query, selectedTags, settings.showLikedOnly, likedMap]);

//   const handleToggleTag = (tag) => {
//     setSelectedTags((s) => (s.includes(tag) ? s.filter((t) => t !== tag) : [...s, tag]));
//   };

//   const handleDelete = async (id) => {
//     if (!window.confirm("Delete this blog?")) return;
//     const res = await dispatch(deleteBlog(id));
//     if (res?.meta?.requestStatus === "fulfilled" && res?.payload?.success) {
//       dispatch(getAllBlogs());
//       setLikedMap((m) => {
//         if (!m[id]) return m;
//         const next = { ...m };
//         delete next[id];
//         return next;
//       });
//       setLikedBlogs((s) => s.filter((b) => b._id !== id));
//     }
//   };

//   const handleEdit = (b) => {
//     navigate("/blog/create", { state: { initialBlogData: { newBlog: false, ...b } } });
//   };

//   const handleView = (b) => {
//     navigate("/blog/description", { state: { ...b } });
//   };

//   const toggleLike = (b) => {
//     const id = b._id;
//     setLikedMap((m) => {
//       const isLiked = !!m[id];
//       const next = { ...m };
//       if (isLiked) {
//         delete next[id];
//       } else {
//         next[id] = true;
//       }
//       return next;
//     });
//     setLikedBlogs((s) => {
//       const exists = s.find((x) => x._id === id);
//       if (exists) return s.filter((x) => x._id !== id);
//       return [...s, b];
//     });
//   };

//   const displayedLikes = (b) => {
//     const base = Number(b?.likes || 0);
//     return base + (likedMap[b._id] ? 1 : 0);
//   };

//   return (
//     <Layout>
//       <div className="min-h-[90vh] p-6 text-white">
//         <div className="max-w-7xl mx-auto">
//           <div className="flex flex-col md:flex-row gap-6">
//             <aside className="w-full md:w-64 bg-white/5 rounded-xl p-4 space-y-4">
//               <h2 className="text-lg font-semibold">Blog Dashboard</h2>
//               <nav className="flex flex-col gap-2">
//                 <button className="text-left px-3 py-2 rounded hover:bg-white/10">🏠 Overview</button>
//                 <button
//                   onClick={() => navigate("/blog/create")}
//                   className="px-3 py-1 rounded-md bg-yellow-500 text-black font-semibold"
//                 >
//                   Create Blog
//                 </button>
//                 <button
//                   onClick={() => document.getElementById("my-blogs")?.scrollIntoView({ behavior: "smooth" })}
//                   className="text-left px-3 py-2 rounded hover:bg-white/10"
//                 >
//                   📚 My Blogs
//                 </button>
//                 <button
//                   onClick={() => document.getElementById("liked-blogs")?.scrollIntoView({ behavior: "smooth" })}
//                   className="text-left px-3 py-2 rounded hover:bg-white/10"
//                 >
//                   ❤️ Liked Blogs
//                 </button>
//                 <button
//                   onClick={() => document.getElementById("settings")?.scrollIntoView({ behavior: "smooth" })}
//                   className="text-left px-3 py-2 rounded hover:bg-white/10"
//                 >
//                   ⚙️ Settings
//                 </button>
//               </nav>
//             </aside>

//             <main className="flex-1 space-y-6">
//               <section id="my-blogs">
//                 <h3 className="text-xl font-semibold mb-4">My Blogs</h3>
//                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//                   {filtered.length === 0 ? (
//                     <div className="col-span-full text-center text-zinc-300 p-6 bg-white/5 rounded">No blogs found</div>
//                   ) : (
//                     filtered.map((b) => (
//                       <motion.div whileHover={{ y: -6 }} key={b._id} className="bg-white/4 rounded-lg p-4 shadow-md relative">
//                         <div className="h-36 mb-3 rounded overflow-hidden bg-zinc-800 flex items-center justify-center">
//                           {b?.thumbnail?.secure_url ? (
//                             // eslint-disable-next-line jsx-a11y/img-redundant-alt
//                             <img src={b.thumbnail.secure_url} alt="thumb" className="w-full h-full object-cover" />
//                           ) : (
//                             <div className="text-zinc-400">No image</div>
//                           )}
//                         </div>
//                         <div className="flex items-start justify-between gap-3">
//                           <div className="flex-1">
//                             <h4 className="font-semibold text-lg line-clamp-2">{b.title}</h4>
//                             <p className="text-sm text-zinc-400">{new Date(b.createdAt || Date.now()).toLocaleDateString()}</p>
//                             <div className="flex gap-2 items-center mt-2">
//                               <span className="px-2 py-1 text-xs rounded bg-white/5">{b?.category?.name || b?.category || "General"}</span>
//                               {(b?.tags || []).slice(0, 3).map((t) => (
//                                 <span key={t} className="px-2 py-1 text-xs rounded bg-white/5">{t}</span>
//                               ))}
//                             </div>
//                           </div>

//                           <div className="flex flex-col items-end gap-2">
//                             <div className="text-sm text-zinc-300">{b.status || "published"}</div>
//                             <div className="flex gap-2">
//                               <button onClick={() => handleEdit(b)} className="px-2 py-1 rounded bg-yellow-500 text-black"><AiOutlineEdit /></button>
//                               <button onClick={() => handleView(b)} className="px-2 py-1 rounded bg-emerald-500 text-black"><AiOutlineEye /></button>
//                               <button onClick={() => handleDelete(b._id)} className="px-2 py-1 rounded bg-red-500 text-white"><AiOutlineDelete /></button>
//                             </div>
//                           </div>
//                         </div>

//                         <div className="flex items-center justify-between mt-3 text-sm text-zinc-300">
//                           <div className="flex items-center gap-3">
//                             <button onClick={() => toggleLike(b)} className="px-2 py-1 rounded bg-white/5">👍 {displayedLikes(b)}</button>
//                             <button onClick={() => handleView(b)} className="px-2 py-1 rounded bg-white/5">💬 {(b.comments?.length) || 0}</button>
//                           </div>
//                           <div className="text-xs text-zinc-400">Views: {b.views || 0}</div>
//                         </div>
//                       </motion.div>
//                     ))
//                   )}
//                 </div>
//               </section>

//               <section id="liked-blogs">
//                 <h3 className="text-xl font-semibold mb-4">❤️ Liked Blogs</h3>
//                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//                   {likedBlogs.length === 0 ? (
//                     <div className="col-span-full text-center text-zinc-300 p-6 bg-white/5 rounded">No liked blogs yet</div>
//                   ) : (
//                     likedBlogs.map((b) => (
//                       <motion.div key={b._id} whileHover={{ y: -6 }} className="bg-white/4 rounded-lg p-4 shadow-md">
//                         <h4 className="font-semibold text-lg">{b.title}</h4>
//                         <button onClick={() => toggleLike(b)} className="mt-2 px-3 py-1 rounded bg-red-500 text-white">Unlike</button>
//                       </motion.div>
//                     ))
//                   )}
//                 </div>
//               </section>

//               <section id="settings" className="bg-white/5 p-4 rounded-xl">
//                 <h3 className="text-lg font-semibold mb-3">⚙️ Settings</h3>
//                 <div className="space-y-2">
//                   <label className="flex items-center gap-2">
//                     <input type="checkbox" checked={settings.persistLikes} onChange={(e) => setSettings((s) => ({ ...s, persistLikes: e.target.checked }))} />
//                     Persist Likes (save to localStorage)
//                   </label>
//                   <label className="flex items-center gap-2">
//                     <input type="checkbox" checked={settings.showLikedOnly} onChange={(e) => setSettings((s) => ({ ...s, showLikedOnly: e.target.checked }))} />
//                     Show only Liked Blogs in My Blogs
//                   </label>
//                 </div>
//               </section>
//             </main>
//           </div>
//         </div>
//       </div>
//     </Layout>
//   );
// };

// export default UserDashboard;


// import React, { useEffect, useMemo, useState } from "react";
// import Layout from "../../Layout/Layout";
// import { useQuill } from "react-quilljs";
// import "quill/dist/quill.snow.css";
// import { useDispatch, useSelector } from "react-redux";
// import { createNewBlog, deleteBlog, getAllBlogs, updateBlog } from "../../Redux/blogSlice";
// import { useNavigate } from "react-router-dom";
// import { motion } from "framer-motion";
// import { AiOutlineDelete, AiOutlineEdit, AiOutlineEye } from "react-icons/ai";

// const TAG_OPTIONS = ["Development", "React", "Node", "Design", "Product", "Tutorial"];

// const UserDashboard = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   const blogsData = useSelector((state) => state.blog?.blogsData || []);
//   const [query, setQuery] = useState("");
//   const [selectedTags, setSelectedTags] = useState([]);
//   const [title, setTitle] = useState("");
//   const [category, setCategory] = useState("");
//   const [thumbnail, setThumbnail] = useState(null);
//   const [likedMap, setLikedMap] = useState({});
//   const [likedBlogs, setLikedBlogs] = useState([]);
//   const [settings, setSettings] = useState({
//     persistLikes: false,
//     showLikedOnly: false,
//   });

//   const { quill, quillRef } = useQuill({
//     theme: "snow",
//     modules: {
//       toolbar: [
//         ["bold", "italic", "underline"],
//         [{ header: [1, 2, 3, false] }],
//         ["link", "image"],
//         [{ list: "ordered" }, { list: "bullet" }],
//         ["blockquote", "code-block"],
//       ],
//     },
//   });

//   useEffect(() => {
//     dispatch(getAllBlogs());
//   }, [dispatch]);

//   useEffect(() => {
//     const persist = (() => {
//       try {
//         const raw = localStorage.getItem("persistLikesSetting");
//         return raw ? JSON.parse(raw) : false;
//       } catch (e) {
//         return false;
//       }
//     })();
//     if (persist) {
//       try {
//         const ids = JSON.parse(localStorage.getItem("likedIds") || "[]");
//         const blogs = JSON.parse(localStorage.getItem("likedBlogs") || "[]");
//         const map = ids.reduce((acc, id) => ({ ...acc, [id]: true }), {});
//         setLikedMap(map);
//         setLikedBlogs(blogs);
//         setSettings((s) => ({ ...s, persistLikes: true }));
//       } catch (e) {}
//     }
//   }, []);

//   useEffect(() => {
//     try {
//       localStorage.setItem("persistLikesSetting", JSON.stringify(settings.persistLikes));
//     } catch (e) {}
//     if (settings.persistLikes) {
//       try {
//         const ids = Object.keys(likedMap).filter((k) => likedMap[k]);
//         localStorage.setItem("likedIds", JSON.stringify(ids));
//         localStorage.setItem("likedBlogs", JSON.stringify(likedBlogs));
//       } catch (e) {}
//     } else {
//       try {
//         localStorage.removeItem("likedIds");
//         localStorage.removeItem("likedBlogs");
//       } catch (e) {}
//     }
//   }, [settings.persistLikes, likedMap, likedBlogs]);

//   const filtered = useMemo(() => {
//     const q = query.trim().toLowerCase();
//     let list = (blogsData || []).filter((b) => {
//       if (!b) return false;
//       const matchQ = q
//         ? (b.title || "").toLowerCase().includes(q) || (b?.content || "").toLowerCase().includes(q)
//         : true;
//       const matchTags = selectedTags.length
//         ? Array.isArray(b.tags)
//           ? selectedTags.every((t) => b.tags.includes(t))
//           : selectedTags.includes(b?.category?.name || b?.category)
//         : true;
//       return matchQ && matchTags;
//     });
//     if (settings.showLikedOnly) {
//       list = list.filter((b) => likedMap[b._id]);
//     }
//     return list;
//   }, [blogsData, query, selectedTags, settings.showLikedOnly, likedMap]);

//   const handleDelete = async (id) => {
//     if (!window.confirm("Delete this blog?")) return;
//     const res = await dispatch(deleteBlog(id));
//     if (res?.meta?.requestStatus === "fulfilled" && res?.payload?.success) {
//       dispatch(getAllBlogs());
//       setLikedMap((m) => {
//         if (!m[id]) return m;
//         const next = { ...m };
//         delete next[id];
//         return next;
//       });
//       setLikedBlogs((s) => s.filter((b) => b._id !== id));
//     }
//   };

//   const handleEdit = (b) => {
//     navigate("/blog/create", { state: { initialBlogData: { newBlog: false, ...b } } });
//   };

//   const handleView = (b) => {
//     navigate("/blog/description", { state: { ...b } });
//   };

//   const toggleLike = (b) => {
//     const id = b._id;
//     setLikedMap((m) => {
//       const isLiked = !!m[id];
//       const next = { ...m };
//       if (isLiked) {
//         delete next[id];
//       } else {
//         next[id] = true;
//       }
//       return next;
//     });
//     setLikedBlogs((s) => {
//       const exists = s.find((x) => x._id === id);
//       if (exists) return s.filter((x) => x._id !== id);
//       return [...s, b];
//     });
//   };

//   const displayedLikes = (b) => {
//     const base = Number(b?.likes || 0);
//     return base + (likedMap[b._id] ? 1 : 0);
//   };

//   return (
//     <Layout>
//       <div className="min-h-[90vh] p-6 text-white">
//         <div className="max-w-7xl mx-auto">
//           <div className="flex flex-col md:flex-row gap-6">
//             <aside className="w-full md:w-64 bg-white/5 rounded-xl p-4 space-y-4">
//               <h2 className="text-lg font-semibold">Blog Dashboard</h2>
//               <nav className="flex flex-col gap-2">
//                 <button className="text-left px-3 py-2 rounded hover:bg-white/10">🏠 Overview</button>
//                 <button
//                   onClick={() => navigate("/blog/create")}
//                   className="px-3 py-1 rounded-md bg-yellow-500 text-black font-semibold"
//                 >
//                   Create Blog
//                 </button>
//                 <button
//                   onClick={() => document.getElementById("my-blogs")?.scrollIntoView({ behavior: "smooth" })}
//                   className="text-left px-3 py-2 rounded hover:bg-white/10"
//                 >
//                   📚 My Blogs
//                 </button>
//                 <button
//                   onClick={() => document.getElementById("liked-blogs")?.scrollIntoView({ behavior: "smooth" })}
//                   className="text-left px-3 py-2 rounded hover:bg-white/10"
//                 >
//                   ❤️ Liked Blogs
//                 </button>
//                 <button
//                   onClick={() => document.getElementById("settings")?.scrollIntoView({ behavior: "smooth" })}
//                   className="text-left px-3 py-2 rounded hover:bg-white/10"
//                 >
//                   ⚙️ Settings
//                 </button>
//               </nav>
//             </aside>

//             <main className="flex-1 space-y-6">
//               <section id="my-blogs">
//                 <h3 className="text-xl font-semibold mb-4">My Blogs</h3>
//                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//                   {filtered.length === 0 ? (
//                     <div className="col-span-full text-center text-zinc-300 p-6 bg-white/5 rounded">No blogs found</div>
//                   ) : (
//                     filtered.map((b) => (
//                       <motion.div whileHover={{ y: -6 }} key={b._id} className="bg-white/4 rounded-lg p-4 shadow-md relative">
//                         <div className="h-36 mb-3 rounded overflow-hidden bg-zinc-800 flex items-center justify-center">
//                           {b?.thumbnail?.secure_url ? (
//                             <img src={b.thumbnail.secure_url} alt="thumb" className="w-full h-full object-cover" />
//                           ) : (
//                             <div className="text-zinc-400">No image</div>
//                           )}
//                         </div>
//                         <div className="flex items-start justify-between gap-3">
//                           <div className="flex-1">
//                             <h4 className="font-semibold text-lg line-clamp-2">{b.title}</h4>
//                             <p className="text-sm text-zinc-400">{new Date(b.createdAt || Date.now()).toLocaleDateString()}</p>
//                             <div className="flex gap-2 items-center mt-2">
//                               <span className="px-2 py-1 text-xs rounded bg-white/5">{b?.category?.name || b?.category || "General"}</span>
//                               {(b?.tags || []).slice(0, 3).map((t) => (
//                                 <span key={t} className="px-2 py-1 text-xs rounded bg-white/5">{t}</span>
//                               ))}
//                             </div>
//                           </div>
//                           <div className="flex flex-col items-end gap-2">
//                             <div className="text-sm text-zinc-300">{b.status || "published"}</div>
//                             <div className="flex gap-2">
//                               <button onClick={() => handleEdit(b)} className="px-2 py-1 rounded bg-yellow-500 text-black"><AiOutlineEdit /></button>
//                               <button onClick={() => handleView(b)} className="px-2 py-1 rounded bg-emerald-500 text-black"><AiOutlineEye /></button>
//                               <button onClick={() => handleDelete(b._id)} className="px-2 py-1 rounded bg-red-500 text-white"><AiOutlineDelete /></button>
//                             </div>
//                           </div>
//                         </div>
//                         <div className="flex items-center justify-between mt-3 text-sm text-zinc-300">
//                           <div className="flex items-center gap-3">
//                             <button onClick={() => toggleLike(b)} className="px-2 py-1 rounded bg-white/5">👍 {displayedLikes(b)}</button>
//                             <button onClick={() => handleView(b)} className="px-2 py-1 rounded bg-white/5">💬 {(b.comments?.length) || 0}</button>
//                           </div>
//                           <div className="text-xs text-zinc-400">Views: {b.views || 0}</div>
//                         </div>
//                       </motion.div>
//                     ))
//                   )}
//                 </div>
//               </section>

//               <section id="liked-blogs">
//                 <h3 className="text-xl font-semibold mb-4">❤️ Liked Blogs</h3>
//                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//                   {likedBlogs.length === 0 ? (
//                     <div className="col-span-full text-center text-zinc-300 p-6 bg-white/5 rounded">No liked blogs yet</div>
//                   ) : (
//                     likedBlogs.map((b) => (
//                       <motion.div whileHover={{ y: -6 }} key={b._id} className="bg-white/4 rounded-lg p-4 shadow-md relative">
//                         <div className="h-36 mb-3 rounded overflow-hidden bg-zinc-800 flex items-center justify-center">
//                           {b?.thumbnail?.secure_url ? (
//                             <img src={b.thumbnail.secure_url} alt="thumb" className="w-full h-full object-cover" />
//                           ) : (
//                             <div className="text-zinc-400">No image</div>
//                           )}
//                         </div>
//                         <div className="flex items-start justify-between gap-3">
//                           <div className="flex-1">
//                             <h4 className="font-semibold text-lg line-clamp-2">{b.title}</h4>
//                             <p className="text-sm text-zinc-400">{new Date(b.createdAt || Date.now()).toLocaleDateString()}</p>
//                             <div className="flex gap-2 items-center mt-2">
//                               <span className="px-2 py-1 text-xs rounded bg-white/5">{b?.category?.name || b?.category || "General"}</span>
//                               {(b?.tags || []).slice(0, 3).map((t) => (
//                                 <span key={t} className="px-2 py-1 text-xs rounded bg-white/5">{t}</span>
//                               ))}
//                             </div>
//                           </div>
//                           <div className="flex flex-col items-end gap-2">
//                             <div className="text-sm text-zinc-300">{b.status || "published"}</div>
//                             <div className="flex gap-2">
//                               <button onClick={() => handleEdit(b)} className="px-2 py-1 rounded bg-yellow-500 text-black"><AiOutlineEdit /></button>
//                               <button onClick={() => handleView(b)} className="px-2 py-1 rounded bg-emerald-500 text-black"><AiOutlineEye /></button>
//                               <button onClick={() => handleDelete(b._id)} className="px-2 py-1 rounded bg-red-500 text-white"><AiOutlineDelete /></button>
//                             </div>
//                           </div>
//                         </div>
//                         <div className="flex items-center justify-between mt-3 text-sm text-zinc-300">
//                           <div className="flex items-center gap-3">
//                             <button onClick={() => toggleLike(b)} className="px-2 py-1 rounded bg-red-500 text-white">Unlike</button>
//                             <button onClick={() => handleView(b)} className="px-2 py-1 rounded bg-white/5">💬 {(b.comments?.length) || 0}</button>
//                           </div>
//                           <div className="text-xs text-zinc-400">Views: {b.views || 0}</div>
//                         </div>
//                       </motion.div>
//                     ))
//                   )}
//                 </div>
//               </section>

//               <section id="settings" className="bg-white/5 p-4 rounded-xl">
//                 <h3 className="text-lg font-semibold mb-3">⚙️ Settings</h3>
//                 <div className="space-y-2">
//                   <label className="flex items-center gap-2">
//                     <input type="checkbox" checked={settings.persistLikes} onChange={(e) => setSettings((s) => ({ ...s, persistLikes: e.target.checked }))} />
//                     Persist Likes (save to localStorage)
//                   </label>
//                   <label className="flex items-center gap-2">
//                     <input type="checkbox" checked={settings.showLikedOnly} onChange={(e) => setSettings((s) => ({ ...s, showLikedOnly: e.target.checked }))} />
//                     Show only Liked Blogs in My Blogs
//                   </label>
//                 </div>
//               </section>
//             </main>
//           </div>
//         </div>
//       </div>
//     </Layout>
//   );
// };

// export default UserDashboard;

import React, { useEffect, useMemo, useState } from "react";
import Layout from "../../Layout/Layout";
// import { useQuill } from "react-quilljs";
// import "quill/dist/quill.snow.css";
import { useDispatch, useSelector } from "react-redux";
import { deleteBlog, getAllBlogs } from "../../Redux/blogSlice";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AiOutlineDelete, AiOutlineEdit, AiOutlineEye } from "react-icons/ai";

const TAG_OPTIONS = ["Development", "React", "Node", "Design", "Product", "Tutorial"];

const CURRENT_USER = "Me";

const UserDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const blogsData = useSelector((state) => state.blog?.blogsData || []);
  const [query, setQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [likedMap, setLikedMap] = useState({});
  const [likedBlogs, setLikedBlogs] = useState([]);
  const [settings, setSettings] = useState({
    persistLikes: false,
    showLikedOnly: false,
    permanentLocalData: false, // when true, local likes/comments are not removed automatically
  });
  const [userViews, setUserViews] = useState({});
  const [userComments, setUserComments] = useState({});

  // const { quillRef } = useQuill({
  //   theme: "snow",
  //   modules: {
  //     toolbar: [
  //       ["bold", "italic", "underline"],
  //       [{ header: [1, 2, 3, false] }],
  //       ["link", "image"],
  //       [{ list: "ordered" }, { list: "bullet" }],
  //       ["blockquote", "code-block"],
  //     ],
  //   },
  // });

  useEffect(() => {
    dispatch(getAllBlogs());
  }, [dispatch]);

  useEffect(() => {
    try {
      const persist = JSON.parse(localStorage.getItem("persistLikesSetting")) || false;
      const permanent = JSON.parse(localStorage.getItem("permanentLocalData")) || false;
      const ids = JSON.parse(localStorage.getItem("likedIds") || "[]");
      const blogs = JSON.parse(localStorage.getItem("likedBlogs") || "[]");
      const views = JSON.parse(localStorage.getItem("userViews") || "{}");
      const comments = JSON.parse(localStorage.getItem("userComments") || "{}");
      const map = ids.reduce((acc, id) => ({ ...acc, [id]: true }), {});
      setLikedMap(map);
      setLikedBlogs(blogs);
      setUserViews(views);
      setUserComments(comments);
      setSettings((s) => ({ ...s, persistLikes: persist, permanentLocalData: permanent }));
    } catch (e) {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("persistLikesSetting", JSON.stringify(settings.persistLikes));
      localStorage.setItem("permanentLocalData", JSON.stringify(settings.permanentLocalData));
    } catch (e) {}
    // Save likes to localStorage when persistence is enabled OR when user opted for permanent local data
    if (settings.persistLikes || settings.permanentLocalData) {
      try {
        const ids = Object.keys(likedMap).filter((k) => likedMap[k]);
        localStorage.setItem("likedIds", JSON.stringify(ids));
        localStorage.setItem("likedBlogs", JSON.stringify(likedBlogs));
      } catch (e) {}
    } else {
      // user chose not to persist likes and didn't opt for permanence -> remove stored likes
      try {
        localStorage.removeItem("likedIds");
        localStorage.removeItem("likedBlogs");
      } catch (e) {}
    }

    // Always persist user views and comments so user data isn't lost unexpectedly
    try {
      localStorage.setItem("userViews", JSON.stringify(userViews));
      localStorage.setItem("userComments", JSON.stringify(userComments));
    } catch (e) {}
  }, [settings.persistLikes, likedMap, likedBlogs, userViews, userComments]);

  // Helpers for settings UI to manage local data
  const editComment = (postId, idx) => {
    const prev = userComments[postId] || [];
    const cur = prev[idx];
    const replacement = window.prompt("Edit comment:", cur?.text || "");
    if (replacement === null) return; // cancelled
    setUserComments((c) => {
      const next = { ...c };
      const list = next[postId] ? [...next[postId]] : [];
      list[idx] = { ...list[idx], text: replacement };
      next[postId] = list;
      return next;
    });
  };

  const deleteComment = (postId, idx) => {
    if (!window.confirm("Delete this local comment?")) return;
    setUserComments((c) => {
      const next = { ...c };
      const list = next[postId] ? [...next[postId]] : [];
      list.splice(idx, 1);
      if (list.length === 0) delete next[postId];
      else next[postId] = list;
      return next;
    });
  };

  const removeLike = (postId) => {
    if (!window.confirm("Remove like for this post from local storage?")) return;
    setLikedMap((m) => {
      const next = { ...m };
      delete next[postId];
      return next;
    });
    setLikedBlogs((s) => s.filter((b) => b._id !== postId));
  };

  const handleClearLocalData = () => {
    const proceed = settings.permanentLocalData
      ? window.confirm("Local data is marked permanent. Do you really want to clear ALL local likes and comments? This cannot be undone.")
      : window.confirm("Clear all local likes, comments and views?");
    if (!proceed) return;
    try {
      localStorage.removeItem("likedIds");
      localStorage.removeItem("likedBlogs");
      localStorage.removeItem("userComments");
      localStorage.removeItem("userViews");
    } catch (e) {}
    setLikedMap({});
    setLikedBlogs([]);
    setUserComments({});
    setUserViews({});
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = (blogsData || []).filter((b) => {
      if (!b) return false;
      const matchQ = q
        ? (b.title || "").toLowerCase().includes(q) || (b?.content || "").toLowerCase().includes(q)
        : true;
      const matchTags = selectedTags.length
        ? Array.isArray(b.tags)
          ? selectedTags.every((t) => b.tags.includes(t))
          : selectedTags.includes(b?.category?.name || b?.category)
        : true;
      return matchQ && matchTags;
    });
    if (settings.showLikedOnly) {
      list = list.filter((b) => likedMap[b._id]);
    }
    return list;
  }, [blogsData, query, selectedTags, settings.showLikedOnly, likedMap]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this blog?")) return;
    const res = await dispatch(deleteBlog(id));
    if (res?.meta?.requestStatus === "fulfilled" && res?.payload?.success) {
      dispatch(getAllBlogs());
      setLikedMap((m) => {
        if (!m[id]) return m;
        const next = { ...m };
        delete next[id];
        return next;
      });
      setLikedBlogs((s) => s.filter((b) => b._id !== id));
      setUserViews((v) => {
        const next = { ...v };
        delete next[id];
        return next;
      });
      setUserComments((c) => {
        const next = { ...c };
        delete next[id];
        return next;
      });
    }
  };

  const handleEdit = (b) => {
    navigate("/blog/create", { state: { initialBlogData: { newBlog: false, ...b } } });
  };

  const handleView = (b) => {
    const id = b._id;
    if (!userViews[id]) {
      setUserViews((v) => ({ ...v, [id]: true }));
    }
    navigate("/blog/description", { state: { ...b } });
  };

  const toggleLike = (b) => {
    const id = b._id;
    setLikedMap((m) => {
      const isLiked = !!m[id];
      const next = { ...m };
      if (isLiked) {
        delete next[id];
      } else {
        next[id] = true;
      }
      return next;
    });
    setLikedBlogs((s) => {
      const exists = s.find((x) => x._id === id);
      if (exists) return s.filter((x) => x._id !== id);
      return [...s, b];
    });
  };

  const displayedLikes = (b) => {
    const base = Number(b?.likes || 0);
    return base + (likedMap[b._id] ? 1 : 0);
  };

  const displayedViews = (b) => {
    const base = Number(b?.views || 0);
    return base + (userViews[b._id] ? 1 : 0);
  };

  const handleAddComment = (id, text) => {
    if (!text.trim()) return;
    setUserComments((c) => {
      const prev = c[id] || [];
      return { ...c, [id]: [...prev, { user: CURRENT_USER, text }] };
    });
  };

  const BlogCard = ({ b, allowUnlike = false }) => {
    const [commentInput, setCommentInput] = useState("");
    return (
      <motion.div whileHover={{ y: -6 }} key={b._id} className="bg-white/4 rounded-lg p-4 shadow-md relative">
        <div className="h-36 mb-3 rounded overflow-hidden bg-zinc-800 flex items-center justify-center">
          {b?.thumbnail?.secure_url ? (
            <img src={b.thumbnail.secure_url} alt="thumb" className="w-full h-full object-cover" />
          ) : (
            <div className="text-zinc-400">No image</div>
          )}
        </div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h4 className="font-semibold text-lg line-clamp-2">{b.title}</h4>
            <p className="text-sm text-zinc-400">{new Date(b.createdAt || Date.now()).toLocaleDateString()}</p>
            <div className="flex gap-2 items-center mt-2">
              <span className="px-2 py-1 text-xs rounded bg-white/5">{b?.category?.name || b?.category || "General"}</span>
              {(b?.tags || []).slice(0, 3).map((t) => (
                <span key={t} className="px-2 py-1 text-xs rounded bg-white/5">{t}</span>
              ))}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="text-sm text-zinc-300">{b.status || "published"}</div>
            <div className="flex gap-2">
              {!allowUnlike && <button onClick={() => handleEdit(b)} className="px-2 py-1 rounded bg-yellow-500 text-black"><AiOutlineEdit /></button>}
              <button onClick={() => handleView(b)} className="px-2 py-1 rounded bg-emerald-500 text-black"><AiOutlineEye /></button>
              {!allowUnlike && <button onClick={() => handleDelete(b._id)} className="px-2 py-1 rounded bg-red-500 text-white"><AiOutlineDelete /></button>}
              {allowUnlike && <button onClick={() => toggleLike(b)} className="px-2 py-1 rounded bg-red-500 text-white">Unlike</button>}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between mt-3 text-sm text-zinc-300">
          <div className="flex items-center gap-3">
            <button onClick={() => toggleLike(b)} className="px-2 py-1 rounded bg-white/5">👍 {displayedLikes(b)}</button>
            <button className="px-2 py-1 rounded bg-white/5">💬 {(b.comments?.length || 0) + (userComments[b._id]?.length || 0)}</button>
          </div>
          <div className="text-xs text-zinc-400">Views: {displayedViews(b)}</div>
        </div>
        <div className="mt-2">
          <div className="space-y-1 max-h-24 overflow-y-auto">
            {(userComments[b._id] || []).map((c, i) => (
              <div key={i} className="text-xs text-zinc-200 bg-white/10 px-2 py-1 rounded">{c.user}: {c.text}</div>
            ))}
          </div>
          <div className="flex gap-2 mt-2">
            <input value={commentInput} onChange={(e) => setCommentInput(e.target.value)} placeholder="Add a comment..." className="flex-1 px-2 py-1 rounded bg-white/10 text-sm" />
            <button onClick={() => { handleAddComment(b._id, commentInput); setCommentInput(""); }} className="px-2 py-1 rounded bg-indigo-500 text-white text-sm">Post</button>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <Layout>
      <div className="min-h-[90vh] p-6 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-6">
            <aside className="w-full md:w-64 bg-white/5 rounded-xl p-4 space-y-4">
              <h2 className="text-lg font-semibold">Blog Dashboard</h2>
              <nav className="flex flex-col gap-2">
                <button className="text-left px-3 py-2 rounded hover:bg-white/10">🏠 Overview</button>
                <button onClick={() => navigate("/blog/create")} className="px-3 py-1 rounded-md bg-yellow-500 text-black font-semibold">Create Blog</button>
                <button onClick={() => document.getElementById("my-blogs")?.scrollIntoView({ behavior: "smooth" })} className="text-left px-3 py-2 rounded hover:bg-white/10">📚 My Blogs</button>
                <button onClick={() => document.getElementById("liked-blogs")?.scrollIntoView({ behavior: "smooth" })} className="text-left px-3 py-2 rounded hover:bg-white/10">❤️ Liked Blogs</button>
                <button onClick={() => document.getElementById("settings")?.scrollIntoView({ behavior: "smooth" })} className="text-left px-3 py-2 rounded hover:bg-white/10">⚙️ Settings</button>
              </nav>
            </aside>

            <main className="flex-1 space-y-6">
              <section id="my-blogs">
                <h3 className="text-xl font-semibold mb-4">My Blogs</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filtered.length === 0 ? (
                    <div className="col-span-full text-center text-zinc-300 p-6 bg-white/5 rounded">No blogs found</div>
                  ) : (
                    filtered.map((b) => <BlogCard key={b._id} b={b} />)
                  )}
                </div>
              </section>

              <section id="liked-blogs">
                <h3 className="text-xl font-semibold mb-4">❤️ Liked Blogs</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {likedBlogs.length === 0 ? (
                    <div className="col-span-full text-center text-zinc-300 p-6 bg-white/5 rounded">No liked blogs yet</div>
                  ) : (
                    likedBlogs.map((b) => <BlogCard key={b._id} b={b} allowUnlike />)
                  )}
                </div>
              </section>

              <section id="settings" className="bg-white/5 p-4 rounded-xl">
                <h3 className="text-lg font-semibold mb-3">⚙️ Settings</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={settings.persistLikes} onChange={(e) => setSettings((s) => ({ ...s, persistLikes: e.target.checked }))} />
                    Persist Likes (save to localStorage)
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={settings.permanentLocalData} onChange={(e) => setSettings((s) => ({ ...s, permanentLocalData: e.target.checked }))} />
                    Permanent Local Data (never auto-delete likes/comments)
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={settings.showLikedOnly} onChange={(e) => setSettings((s) => ({ ...s, showLikedOnly: e.target.checked }))} />
                    Show only Liked Blogs in My Blogs
                  </label>
                  <div className="mt-3 p-3 bg-white/3 rounded">
                    <h4 className="font-medium mb-2">Local Data Manager</h4>
                    <div className="flex flex-col gap-2">
                      <div>
                        <strong>Liked posts:</strong>
                        {likedBlogs.length === 0 ? (
                          <div className="text-xs text-zinc-400">No liked posts stored locally</div>
                        ) : (
                          <ul className="mt-2 space-y-1 max-h-36 overflow-y-auto">
                            {likedBlogs.map((b) => (
                              <li key={b._id} className="flex items-center justify-between text-sm">
                                <span className="truncate mr-2">{b.title}</span>
                                <div className="flex items-center gap-2">
                                  <button onClick={() => removeLike(b._id)} className="px-2 py-1 text-xs rounded bg-red-600">Remove</button>
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      <div>
                        <strong>Comments:</strong>
                        {Object.keys(userComments).length === 0 ? (
                          <div className="text-xs text-zinc-400">No local comments</div>
                        ) : (
                          <div className="mt-2 max-h-36 overflow-y-auto space-y-1 text-sm">
                            {Object.entries(userComments).map(([postId, comments]) => (
                              <div key={postId} className="pb-2 border-b border-white/5">
                                <div className="text-xs text-zinc-300">Post: {postId}</div>
                                {comments.map((c, i) => (
                                  <div key={i} className="flex items-center justify-between gap-2 mt-1">
                                    <div className="text-xs truncate">{c.user}: {c.text}</div>
                                    <div className="flex gap-1">
                                      <button onClick={() => editComment(postId, i)} className="px-2 py-1 text-xs rounded bg-yellow-500">Edit</button>
                                      <button onClick={() => deleteComment(postId, i)} className="px-2 py-1 text-xs rounded bg-red-600">Delete</button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="pt-2">
                        <button onClick={handleClearLocalData} className="px-3 py-2 rounded bg-red-700 text-white">Clear all local data</button>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </main>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default UserDashboard;