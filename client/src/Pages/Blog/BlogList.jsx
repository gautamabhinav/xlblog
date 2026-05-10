// import React, { useEffect, useMemo, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import BlogCard from "../../Components/BlogCard";
// import Layout from "../../Layout/Layout";
// import { getAllBlogs } from "../../Redux/blogSlice";
// import { HiOutlineSearch } from "react-icons/hi";
// import { useNavigate } from "react-router-dom";

// const BlogList = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   const blogsData = useSelector((state) => state.blog.blogsData) || [];
//   // local UI state
//   const [loading, setLoading] = useState(false);
//   const [query, setQuery] = useState("");
//   const [category, setCategory] = useState("");
//   const [sort, setSort] = useState("newest");

//   useEffect(() => {
//     (async () => {
//       try {
//         setLoading(true);
//         await dispatch(getAllBlogs());
//       } finally {
//         setLoading(false);
//       }
//     })();
//   }, [dispatch]);

//   const categories = useMemo(() => {
//     const set = new Set();
//     blogsData.forEach((b) => {
//       const name = b?.category?.name || b?.category || "Uncategorized";
//       if (name) set.add(name);
//     });
//     return ["", ...Array.from(set)];
//   }, [blogsData]);

//   const filtered = useMemo(() => {
//     let list = blogsData || [];
//     if (query.trim()) {
//       const q = query.toLowerCase();
//       list = list.filter((b) => {
//         return (
//           (b?.title || "").toLowerCase().includes(q) ||
//           (b?.content || "").toLowerCase().includes(q) ||
//           (b?.author || "").toLowerCase().includes(q)
//         );
//       });
//     }
//     if (category) {
//       list = list.filter((b) => (b?.category?.name || b?.category || "").toString() === category);
//     }
//     if (sort === "newest") {
//       list = list.slice().sort((a, b) => new Date(b?.createdAt || b?.createdAt) - new Date(a?.createdAt || a?.createdAt));
//     } else if (sort === "oldest") {
//       list = list.slice().sort((a, b) => new Date(a?.createdAt || a?.createdAt) - new Date(b?.createdAt || b?.createdAt));
//     }
//     return list;
//   }, [blogsData, query, category, sort]);

//   return (
//     <Layout>
//       <div className="min-h-[90vh] pt-12 px-6 md:px-20 flex flex-col gap-6 text-white">
//         <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//           <h1 className="text-3xl font-semibold">
//             Explore the blogs made by <span className="font-bold text-yellow-500">People Experts</span>
//           </h1>

//           <div className="flex items-center gap-3 w-full md:w-auto">
//             <div className="relative w-full md:w-80">
//               <HiOutlineSearch className="absolute left-3 top-3 text-gray-400" />
//               <input
//                 value={query}
//                 onChange={(e) => setQuery(e.target.value)}
//                 placeholder="Search title, author or content..."
//                 className="pl-10 pr-3 py-2 w-full bg-zinc-800 rounded-md border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
//               />
//             </div>

//             <select
//               value={category}
//               onChange={(e) => setCategory(e.target.value)}
//               className="bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2"
//             >
//               {categories.map((c) => (
//                 <option key={c || "all"} value={c}>
//                   {c || "All Categories"}
//                 </option>
//               ))}
//             </select>

//             <select
//               value={sort}
//               onChange={(e) => setSort(e.target.value)}
//               className="bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2"
//             >
//               <option value="newest">Newest</option>
//               <option value="oldest">Oldest</option>
//             </select>
//           </div>
//         </div>

//         {/* grid */}
//         {loading ? (
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-6">
//             {Array.from({ length: 6 }).map((_, i) => (
//               <div key={i} className="animate-pulse bg-zinc-800 rounded-lg p-4 h-[430px]"></div>
//             ))}
//           </div>
//         ) : filtered.length === 0 ? (
//           <div className="flex flex-col items-center justify-center gap-4 mt-12">
//             <p className="text-xl">No blogs found.</p>
//             <p className="text-gray-400 max-w-lg text-center">Try changing your search terms or create the first blog.</p>
//             <div className="flex gap-3">
//               <button
//                 onClick={() => navigate('/blog/create', { state: { initialBlogData: { newBlog: true } } })}
//                 className="bg-yellow-500 hover:bg-yellow-600 px-4 py-2 rounded-md font-semibold"
//               >
//                 Create Blog
//               </button>
//               <button onClick={() => { setQuery(''); setCategory(''); }} className="px-4 py-2 border rounded-md">Reset</button>
//             </div>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-6">
//             {filtered.map((element) => (
//               <div key={element?._id} className="transform hover:-translate-y-1 transition-all duration-300">
//                 <BlogCard data={element} />
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </Layout>
//   );

// //   return (
// //   <Layout>
// //     <div className="min-h-screen bg-black text-white px-4 md:px-12 pt-6">

// //       {/* 🔥 HERO SECTION */}
// //       {!loading && filtered[0] && (
// //         <div className="relative w-full h-[55vh] rounded-xl overflow-hidden mb-10">
// //           <img
// //             src={filtered[0]?.thumbnail}
// //             alt=""
// //             className="w-full h-full object-cover"
// //           />

// //           <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent flex flex-col justify-end p-6">
// //             <h1 className="text-4xl font-bold">{filtered[0]?.title}</h1>
// //             <p className="text-gray-300 max-w-xl mt-2 line-clamp-2">
// //               {filtered[0]?.content}
// //             </p>

// //             <button
// //               onClick={() => navigate(`/blog/${filtered[0]?._id}`)}
// //               className="mt-4 w-fit bg-yellow-500 hover:bg-yellow-600 px-5 py-2 rounded-md font-semibold"
// //             >
// //               Read Now
// //             </button>
// //           </div>
// //         </div>
// //       )}

// //       {/* 🔍 TOP BAR */}
// //       <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">

// //         <h1 className="text-2xl font-semibold">
// //           Explore Blogs by{" "}
// //           <span className="text-yellow-500 font-bold">Experts</span>
// //         </h1>

// //         <div className="flex items-center gap-3 w-full md:w-auto">

// //           {/* search */}
// //           <div className="relative w-full md:w-72">
// //             <HiOutlineSearch className="absolute left-3 top-3 text-gray-400" />
// //             <input
// //               value={query}
// //               onChange={(e) => setQuery(e.target.value)}
// //               placeholder="Search..."
// //               className="pl-10 pr-3 py-2 w-full bg-zinc-900 rounded-md border border-zinc-700 focus:ring-2 focus:ring-yellow-500"
// //             />
// //           </div>

// //           {/* category */}
// //           <select
// //             value={category}
// //             onChange={(e) => setCategory(e.target.value)}
// //             className="bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2"
// //           >
// //             {categories.map((c) => (
// //               <option key={c || "all"} value={c}>
// //                 {c || "All"}
// //               </option>
// //             ))}
// //           </select>

// //           {/* sort */}
// //           <select
// //             value={sort}
// //             onChange={(e) => setSort(e.target.value)}
// //             className="bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2"
// //           >
// //             <option value="newest">Newest</option>
// //             <option value="oldest">Oldest</option>
// //           </select>
// //         </div>
// //       </div>

// //       {/* ⏳ LOADING */}
// //       {loading ? (
// //         <div className="flex gap-4 overflow-x-auto">
// //           {Array.from({ length: 6 }).map((_, i) => (
// //             <div key={i} className="min-w-[220px] h-[300px] bg-zinc-800 animate-pulse rounded-lg"></div>
// //           ))}
// //         </div>
// //       ) : filtered.length === 0 ? (

// //         /* ❌ EMPTY STATE */
// //         <div className="flex flex-col items-center justify-center gap-4 mt-20">
// //           <p className="text-xl">No blogs found.</p>
// //           <p className="text-gray-400 text-center max-w-md">
// //             Try different search or create a new blog.
// //           </p>

// //           <div className="flex gap-3">
// //             <button
// //               onClick={() =>
// //                 navigate("/blog/create", {
// //                   state: { initialBlogData: { newBlog: true } },
// //                 })
// //               }
// //               className="bg-yellow-500 hover:bg-yellow-600 px-4 py-2 rounded-md font-semibold"
// //             >
// //               Create Blog
// //             </button>

// //             <button
// //               onClick={() => {
// //                 setQuery("");
// //                 setCategory("");
// //               }}
// //               className="px-4 py-2 border border-zinc-600 rounded-md"
// //             >
// //               Reset
// //             </button>
// //           </div>
// //         </div>

// //       ) : (
// //         <>
// //           {/* 🔥 TRENDING ROW */}
// //           <div className="mb-10">
// //             <h2 className="text-xl font-semibold mb-4">Trending</h2>

// //             <div className="flex gap-4 overflow-x-auto scrollbar-hide">
// //               {filtered.slice(0, 10).map((element) => (
// //                 <div
// //                   key={element._id}
// //                   onClick={() => navigate(`/blog/${element._id}`)}
// //                   className="min-w-[220px] h-[300px] relative cursor-pointer transform hover:scale-105 transition duration-300"
// //                 >
// //                   <img
// //                     src={element.thumbnail}
// //                     alt=""
// //                     className="w-full h-full object-cover rounded-lg"
// //                   />

// //                   <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent p-3 flex flex-col justify-end rounded-lg">
// //                     <h3 className="text-sm font-semibold line-clamp-2">
// //                       {element.title}
// //                     </h3>
// //                     <p className="text-xs text-gray-300">
// //                       {element.author}
// //                     </p>
// //                   </div>
// //                 </div>
// //               ))}
// //             </div>
// //           </div>

// //           {/* 🆕 LATEST ROW */}
// //           <div className="mb-10">
// //             <h2 className="text-xl font-semibold mb-4">Latest</h2>

// //             <div className="flex gap-4 overflow-x-auto scrollbar-hide">
// //               {[...filtered].reverse().slice(0, 10).map((element) => (
// //                 <div
// //                   key={element._id}
// //                   onClick={() => navigate(`/blog/${element._id}`)}
// //                   className="min-w-[220px] h-[300px] relative cursor-pointer transform hover:scale-105 transition duration-300"
// //                 >
// //                   <img
// //                     src={element.thumbnail}
// //                     alt=""
// //                     className="w-full h-full object-cover rounded-lg"
// //                   />

// //                   <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent p-3 flex flex-col justify-end rounded-lg">
// //                     <h3 className="text-sm font-semibold line-clamp-2">
// //                       {element.title}
// //                     </h3>
// //                     <p className="text-xs text-gray-300">
// //                       {element.author}
// //                     </p>
// //                   </div>
// //                 </div>
// //               ))}
// //             </div>
// //           </div>
// //         </>
// //       )}
// //     </div>
// //   </Layout>
// // );



// };

// export default BlogList;



// import React, { useEffect, useMemo, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { useNavigate } from "react-router-dom";
// import { HiOutlineSearch } from "react-icons/hi";
// import { getAllBlogs } from "../../Redux/blogSlice";
// import BlogCard from "../../Components/BlogCard";
// import Layout from "../../Layout/Layout";

// export default function BlogList() {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   const blogsData = useSelector((state) => state.blog.blogsData) || [];

//   const [loading, setLoading] = useState(false);
//   const [query, setQuery] = useState("");
//   const [category, setCategory] = useState("");
//   const [sort, setSort] = useState("newest");

//   useEffect(() => {
//     (async () => {
//       setLoading(true);
//       try {
//         await dispatch(getAllBlogs());
//       } finally {
//         setLoading(false);
//       }
//     })();
//   }, [dispatch]);

//   // categories
//   const categories = useMemo(() => {
//     const set = new Set();
//     blogsData.forEach((b) => {
//       set.add(b?.category?.name || b?.category || "General");
//     });
//     return ["", ...Array.from(set)];
//   }, [blogsData]);

//   // filtered blogs
//   const filtered = useMemo(() => {
//     let list = [...blogsData];

//     if (query) {
//       const q = query.toLowerCase();
//       list = list.filter((b) =>
//         `${b?.title || ""} ${b?.content || ""} ${b?.author || ""}`
//           .toLowerCase()
//           .includes(q)
//       );
//     }

//     if (category) {
//       list = list.filter(
//         (b) => (b?.category?.name || b?.category) === category
//       );
//     }

//     if (sort === "newest") {
//       list.sort(
//         (a, b) =>
//           new Date(b?.createdAt) - new Date(a?.createdAt)
//       );
//     } else {
//       list.sort(
//         (a, b) =>
//           new Date(a?.createdAt) - new Date(b?.createdAt)
//       );
//     }

//     return list;
//   }, [blogsData, query, category, sort]);

//   const featured = filtered[0];
//   const trending = filtered.slice(0, 10);
//   const latest = [...filtered].reverse().slice(0, 10);

//   return (
//     <Layout>
//       <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-zinc-900 text-white px-4 md:px-10 py-8">

//         {/* HERO SECTION */}
//         {!loading && featured && (
//           <div className="relative mb-10 h-[55vh] w-full overflow-hidden rounded-3xl shadow-2xl">
//             <img
//               src={featured?.thumbnail}
//               className="h-full w-full object-cover scale-105"
//               alt=""
//             />

//             <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent flex flex-col justify-end p-8">
//               <h1 className="text-4xl md:text-5xl font-black">
//                 {featured?.title}
//               </h1>

//               <p className="text-gray-300 mt-3 max-w-2xl line-clamp-2">
//                 {featured?.content}
//               </p>

//               <button
//                 onClick={() =>
//                   navigate("/blog/description", { state: featured })
//                 }
//                 className="mt-5 w-fit bg-yellow-500 hover:bg-yellow-600 px-5 py-2 rounded-lg font-bold"
//               >
//                 Read Now
//               </button>
//             </div>
//           </div>
//         )}

//         {/* TOP BAR */}
//         <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">

//           <h1 className="text-2xl md:text-3xl font-bold">
//             Explore Blogs by{" "}
//             <span className="text-yellow-400">Experts</span>
//           </h1>

//           {/* search */}
//           <div className="flex flex-wrap gap-3">

//             <div className="relative w-full md:w-80">
//               <HiOutlineSearch className="absolute left-3 top-3 text-gray-400" />
//               <input
//                 value={query}
//                 onChange={(e) => setQuery(e.target.value)}
//                 placeholder="Search blogs..."
//                 className="pl-10 pr-3 py-2 w-full bg-zinc-900 rounded-lg border border-zinc-700 focus:ring-2 focus:ring-yellow-500"
//               />
//             </div>

//             <select
//               value={category}
//               onChange={(e) => setCategory(e.target.value)}
//               className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2"
//             >
//               {categories.map((c) => (
//                 <option key={c || "all"} value={c}>
//                   {c || "All"}
//                 </option>
//               ))}
//             </select>

//             <select
//               value={sort}
//               onChange={(e) => setSort(e.target.value)}
//               className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2"
//             >
//               <option value="newest">Newest</option>
//               <option value="oldest">Oldest</option>
//             </select>
//           </div>
//         </div>

//         {/* LOADING */}
//         {loading ? (
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//             {Array.from({ length: 6 }).map((_, i) => (
//               <div
//                 key={i}
//                 className="h-[420px] rounded-2xl bg-zinc-800 animate-pulse"
//               />
//             ))}
//           </div>
//         ) : filtered.length === 0 ? (
//           /* EMPTY STATE */
//           <div className="text-center mt-20 space-y-4">
//             <p className="text-xl">No blogs found</p>
//             <p className="text-gray-400">
//               Try adjusting filters or create new content
//             </p>

//             <button
//               onClick={() => navigate("/blog/create")}
//               className="bg-yellow-500 px-5 py-2 rounded-lg font-bold"
//             >
//               Create Blog
//             </button>
//           </div>
//         ) : (
//           <>
//             {/* TRENDING ROW */}
//             <div className="mb-10">
//               <h2 className="text-xl font-bold mb-4">🔥 Trending</h2>

//               <div className="flex gap-4 overflow-x-auto pb-2">
//                 {trending.map((b) => (
//                   <div
//                     key={b._id}
//                     className="min-w-[220px] hover:scale-105 transition"
//                     onClick={() =>
//                       navigate("/blog/description", { state: b })
//                     }
//                   >
//                     <BlogCard data={b} />
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* GRID */}
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//               {filtered.map((b) => (
//                 <BlogCard key={b._id} data={b} />
//               ))}
//             </div>

//             {/* LATEST ROW */}
//             <div className="mt-12">
//               <h2 className="text-xl font-bold mb-4">🆕 Latest</h2>

//               <div className="flex gap-4 overflow-x-auto pb-2">
//                 {latest.map((b) => (
//                   <div
//                     key={b._id}
//                     className="min-w-[220px]"
//                     onClick={() =>
//                       navigate("/blog/description", { state: b })
//                     }
//                   >
//                     <BlogCard data={b} />
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </>
//         )}
//       </div>
//     </Layout>
//   );
// }



// import React, { useEffect, useMemo, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import BlogCard from "../../Components/BlogCard";
// import Layout from "../../Layout/Layout";
// import { getAllBlogs } from "../../Redux/blogSlice";
// import { HiOutlineSearch } from "react-icons/hi";
// import { useNavigate } from "react-router-dom";

// const scoreBlog = (blog, query) => {
//   let score = 0;

//   const title = (blog?.title || "").toLowerCase();
//   const content = (blog?.content || "").toLowerCase();
//   const author = (blog?.author || "").toLowerCase();

//   if (!query) return blog?.views || 0;

//   if (title.includes(query)) score += 5;
//   if (content.includes(query)) score += 2;
//   if (author.includes(query)) score += 3;

//   score += blog?.views ? blog.views / 100 : 0;
//   score += blog?.likes ? blog.likes * 2 : 0;

//   return score;
// };

// const BlogList = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   const blogsData = useSelector((state) => state.blog.blogsData) || [];

//   const [loading, setLoading] = useState(false);
//   const [query, setQuery] = useState("");
//   const [category, setCategory] = useState("");
//   const [sort, setSort] = useState("smart");

//   useEffect(() => {
//     (async () => {
//       setLoading(true);
//       await dispatch(getAllBlogs());
//       setLoading(false);
//     })();
//   }, [dispatch]);

//   // clean categories
//   const categories = useMemo(() => {
//     const set = new Set();
//     blogsData.forEach((b) => {
//       const name = b?.category?.name || b?.category || "Uncategorized";
//       set.add(name);
//     });
//     return ["", ...Array.from(set)];
//   }, [blogsData]);

//   // intelligent filtering + ranking
//   const filtered = useMemo(() => {
//     let list = [...blogsData];

//     const q = query.toLowerCase().trim();

//     // CATEGORY FILTER
//     if (category) {
//       list = list.filter(
//         (b) => (b?.category?.name || b?.category || "") === category
//       );
//     }

//     // SMART SEARCH
//     if (q) {
//       list = list
//         .map((b) => ({ ...b, _score: scoreBlog(b, q) }))
//         .filter((b) => b._score > 0)
//         .sort((a, b) => b._score - a._score);
//     }

//     // SORT MODES
//     if (!q) {
//       if (sort === "newest") {
//         list.sort(
//           (a, b) =>
//             new Date(b.createdAt || 0) -
//             new Date(a.createdAt || 0)
//         );
//       }

//       if (sort === "oldest") {
//         list.sort(
//           (a, b) =>
//             new Date(a.createdAt || 0) -
//             new Date(b.createdAt || 0)
//         );
//       }

//       if (sort === "smart") {
//         list.sort(
//           (a, b) =>
//             (b.views || 0) + (b.likes || 0) * 2 -
//             ((a.views || 0) + (a.likes || 0) * 2)
//         );
//       }
//     }

//     return list;
//   }, [blogsData, query, category, sort]);

//   const trending = useMemo(
//     () =>
//       [...blogsData]
//         .sort(
//           (a, b) =>
//             (b.views || 0) + (b.likes || 0) -
//             ((a.views || 0) + (a.likes || 0))
//         )
//         .slice(0, 6),
//     [blogsData]
//   );

//   return (
//     <Layout>
//       <div className="min-h-[90vh] px-6 md:px-20 pt-10 text-white bg-gradient-to-b from-black via-zinc-950 to-black">

//         {/* HEADER */}
//         <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
//           <h1 className="text-3xl font-bold">
//             Explore Intelligent Blogs{" "}
//             <span className="text-yellow-400">✨</span>
//           </h1>

//           {/* SEARCH + FILTER */}
//           <div className="flex flex-wrap gap-3">
//             <div className="relative">
//               <HiOutlineSearch className="absolute left-3 top-3 text-gray-400" />
//               <input
//                 value={query}
//                 onChange={(e) => setQuery(e.target.value)}
//                 placeholder="Search smart blogs..."
//                 className="pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-700 rounded-xl w-72 focus:ring-2 focus:ring-yellow-500"
//               />
//             </div>

//             <select
//               value={category}
//               onChange={(e) => setCategory(e.target.value)}
//               className="bg-zinc-900 border border-zinc-700 px-3 py-2 rounded-xl"
//             >
//               {categories.map((c) => (
//                 <option key={c} value={c}>
//                   {c || "All Categories"}
//                 </option>
//               ))}
//             </select>

//             <select
//               value={sort}
//               onChange={(e) => setSort(e.target.value)}
//               className="bg-zinc-900 border border-zinc-700 px-3 py-2 rounded-xl"
//             >
//               <option value="smart">Smart Rank</option>
//               <option value="newest">Newest</option>
//               <option value="oldest">Oldest</option>
//             </select>
//           </div>
//         </div>

//         {/* TRENDING ROW */}
//         {!loading && trending.length > 0 && (
//           <div className="mt-10">
//             <h2 className="text-xl font-semibold mb-4 text-yellow-400">
//               🔥 Trending Now
//             </h2>

//             <div className="flex gap-4 overflow-x-auto scrollbar-hide">
//               {trending.map((b) => (
//                 <div
//                   key={b._id}
//                   className="min-w-[240px] hover:scale-105 transition-transform duration-300 cursor-pointer"
//                   onClick={() =>
//                     navigate("/blog/description", { state: b })
//                   }
//                 >
//                   <BlogCard data={b} />
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* MAIN GRID */}
//         {loading ? (
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-10">
//             {Array.from({ length: 6 }).map((_, i) => (
//               <div
//                 key={i}
//                 className="h-[420px] rounded-2xl bg-zinc-800 animate-pulse"
//               />
//             ))}
//           </div>
//         ) : filtered.length === 0 ? (
//           <div className="mt-20 text-center">
//             <h2 className="text-2xl font-bold">No intelligent match found 🤖</h2>
//             <p className="text-gray-400 mt-2">
//               Try different keywords or explore trending content.
//             </p>

//             <button
//               onClick={() => {
//                 setQuery("");
//                 setCategory("");
//               }}
//               className="mt-5 px-5 py-2 bg-yellow-500 text-black rounded-xl font-semibold"
//             >
//               Reset Intelligence Filter
//             </button>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-10">
//             {filtered.map((b) => (
//               <div
//                 key={b._id}
//                 className="transform hover:-translate-y-1 transition"
//               >
//                 <BlogCard data={b} />
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </Layout>
//   );
// };

// export default BlogList;



import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import BlogCard from "../../Components/BlogCard";
import Layout from "../../Layout/Layout";
import { getAllBlogs } from "../../Redux/blogSlice";
import { HiOutlineSearch } from "react-icons/hi";
import { useNavigate } from "react-router-dom";

/* ---------------- INTELLIGENCE SCORING ---------------- */
const scoreBlog = (blog, query) => {
  const q = query.toLowerCase();

  const title = (blog?.title || "").toLowerCase();
  const content = (blog?.content || "").toLowerCase();
  const author = (blog?.author || "").toLowerCase();

  let score = 0;

  if (!query) return (blog?.views || 0) + (blog?.likes || 0) * 2;

  if (title.includes(q)) score += 6;
  if (content.includes(q)) score += 2;
  if (author.includes(q)) score += 3;

  score += (blog?.views || 0) / 100;
  score += (blog?.likes || 0) * 2;

  return score;
};

const BlogList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const blogsData = useSelector((state) => state.blog.blogsData) || [];

  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("smart");

  /* ---------------- FETCH ---------------- */
  useEffect(() => {
    (async () => {
      setLoading(true);
      await dispatch(getAllBlogs());
      setLoading(false);
    })();
  }, [dispatch]);

  /* ---------------- CATEGORIES ---------------- */
  const categories = useMemo(() => {
    const set = new Set();

    blogsData.forEach((b) => {
      const name = b?.category?.name || b?.category || "Uncategorized";
      set.add(name);
    });

    return ["", ...Array.from(set)];
  }, [blogsData]);

  /* ---------------- FILTER + RANK ---------------- */
  const filtered = useMemo(() => {
    let list = [...blogsData];
    const q = query.trim().toLowerCase();

    if (category) {
      list = list.filter(
        (b) => (b?.category?.name || b?.category) === category
      );
    }

    if (q) {
      list = list
        .map((b) => ({ ...b, _score: scoreBlog(b, q) }))
        .filter((b) => b._score > 0)
        .sort((a, b) => b._score - a._score);
    } else {
      if (sort === "smart") {
        list.sort(
          (a, b) =>
            (b.views || 0) + (b.likes || 0) * 2 -
            ((a.views || 0) + (a.likes || 0) * 2)
        );
      }

      if (sort === "newest") {
        list.sort(
          (a, b) =>
            new Date(b.createdAt || 0) -
            new Date(a.createdAt || 0)
        );
      }

      if (sort === "oldest") {
        list.sort(
          (a, b) =>
            new Date(a.createdAt || 0) -
            new Date(b.createdAt || 0)
        );
      }
    }

    return list;
  }, [blogsData, query, category, sort]);

  /* ---------------- TRENDING ---------------- */
  const trending = useMemo(() => {
    return [...blogsData]
      .sort(
        (a, b) =>
          (b.views || 0) + (b.likes || 0) -
          ((a.views || 0) + (a.likes || 0))
      )
      .slice(0, 6);
  }, [blogsData]);

  return (
    <Layout>
      <div className="min-h-[90vh] px-6 md:px-20 pt-10 text-white bg-gradient-to-b from-black via-zinc-950 to-black">

        {/* ---------------- HERO HEADER ---------------- */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          
          <div>
            <h1 className="text-3xl font-bold">
              Discover Smart Stories ✨
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Explore trending ideas, insights & creators
            </p>
          </div>

          {/* SEARCH + FILTER */}
          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <HiOutlineSearch className="absolute left-3 top-3 text-gray-400" />

              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search ideas, stories..."
                className="pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-700 rounded-xl w-72 focus:ring-2 focus:ring-yellow-500"
              />
            </div>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-zinc-900 border border-zinc-700 px-3 py-2 rounded-xl"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c || "All Categories"}
                </option>
              ))}
            </select>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-zinc-900 border border-zinc-700 px-3 py-2 rounded-xl"
            >
              <option value="smart">Smart Rank</option>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>
        </div>

        {/* ---------------- TRENDING ROW ---------------- */}
        {!loading && trending.length > 0 && (
          <div className="mt-10">
            <h2 className="text-lg font-semibold text-yellow-400 mb-3">
              🔥 Trending Now
            </h2>

            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
              {trending.map((b) => (
                <div
                  key={b._id}
                  className="min-w-[240px] hover:scale-105 transition duration-300 cursor-pointer"
                  onClick={() =>
                    navigate("/blog/description", { state: b })
                  }
                >
                  <BlogCard data={b} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---------------- MAIN CONTENT ---------------- */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-10">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-[420px] rounded-2xl bg-zinc-800 animate-pulse"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="mt-24 text-center">
            <h2 className="text-2xl font-bold">
              No matching stories found 🤖
            </h2>

            <p className="text-gray-400 mt-2">
              Try different keywords or explore trending content.
            </p>

            <button
              onClick={() => {
                setQuery("");
                setCategory("");
              }}
              className="mt-5 px-6 py-2 bg-yellow-500 text-black rounded-xl font-semibold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-10">
            {filtered.map((b) => (
              <div
                key={b._id}
                className="hover:-translate-y-1 transition-transform duration-300"
              >
                <BlogCard data={b} />
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default BlogList;