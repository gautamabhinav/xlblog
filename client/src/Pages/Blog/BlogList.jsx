import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import BlogCard from "../../Components/BlogCard";
import Layout from "../../Layout/Layout";
import { getAllBlogs } from "../../Redux/blogSlice";
import { HiOutlineSearch } from "react-icons/hi";
import { useNavigate } from "react-router-dom";

const BlogList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const blogsData = useSelector((state) => state.blog.blogsData) || [];
  // local UI state
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("newest");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        await dispatch(getAllBlogs());
      } finally {
        setLoading(false);
      }
    })();
  }, [dispatch]);

  const categories = useMemo(() => {
    const set = new Set();
    blogsData.forEach((b) => {
      const name = b?.category?.name || b?.category || "Uncategorized";
      if (name) set.add(name);
    });
    return ["", ...Array.from(set)];
  }, [blogsData]);

  const filtered = useMemo(() => {
    let list = blogsData || [];
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((b) => {
        return (
          (b?.title || "").toLowerCase().includes(q) ||
          (b?.content || "").toLowerCase().includes(q) ||
          (b?.author || "").toLowerCase().includes(q)
        );
      });
    }
    if (category) {
      list = list.filter((b) => (b?.category?.name || b?.category || "").toString() === category);
    }
    if (sort === "newest") {
      list = list.slice().sort((a, b) => new Date(b?.createdAt || b?.createdAt) - new Date(a?.createdAt || a?.createdAt));
    } else if (sort === "oldest") {
      list = list.slice().sort((a, b) => new Date(a?.createdAt || a?.createdAt) - new Date(b?.createdAt || b?.createdAt));
    }
    return list;
  }, [blogsData, query, category, sort]);

  return (
    <Layout>
      <div className="min-h-[90vh] pt-12 px-6 md:px-20 flex flex-col gap-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-3xl font-semibold">
            Explore the blogs made by <span className="font-bold text-yellow-500">People Experts</span>
          </h1>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-80">
              <HiOutlineSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search title, author or content..."
                className="pl-10 pr-3 py-2 w-full bg-zinc-800 rounded-md border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2"
            >
              {categories.map((c) => (
                <option key={c || "all"} value={c}>
                  {c || "All Categories"}
                </option>
              ))}
            </select>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>
        </div>

        {/* grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-zinc-800 rounded-lg p-4 h-[430px]"></div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 mt-12">
            <p className="text-xl">No blogs found.</p>
            <p className="text-gray-400 max-w-lg text-center">Try changing your search terms or create the first blog.</p>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/blog/create', { state: { initialBlogData: { newBlog: true } } })}
                className="bg-yellow-500 hover:bg-yellow-600 px-4 py-2 rounded-md font-semibold"
              >
                Create Blog
              </button>
              <button onClick={() => { setQuery(''); setCategory(''); }} className="px-4 py-2 border rounded-md">Reset</button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-6">
            {filtered.map((element) => (
              <div key={element?._id} className="transform hover:-translate-y-1 transition-all duration-300">
                <BlogCard data={element} />
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );

//   return (
//   <Layout>
//     <div className="min-h-screen bg-black text-white px-4 md:px-12 pt-6">

//       {/* 🔥 HERO SECTION */}
//       {!loading && filtered[0] && (
//         <div className="relative w-full h-[55vh] rounded-xl overflow-hidden mb-10">
//           <img
//             src={filtered[0]?.thumbnail}
//             alt=""
//             className="w-full h-full object-cover"
//           />

//           <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent flex flex-col justify-end p-6">
//             <h1 className="text-4xl font-bold">{filtered[0]?.title}</h1>
//             <p className="text-gray-300 max-w-xl mt-2 line-clamp-2">
//               {filtered[0]?.content}
//             </p>

//             <button
//               onClick={() => navigate(`/blog/${filtered[0]?._id}`)}
//               className="mt-4 w-fit bg-yellow-500 hover:bg-yellow-600 px-5 py-2 rounded-md font-semibold"
//             >
//               Read Now
//             </button>
//           </div>
//         </div>
//       )}

//       {/* 🔍 TOP BAR */}
//       <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">

//         <h1 className="text-2xl font-semibold">
//           Explore Blogs by{" "}
//           <span className="text-yellow-500 font-bold">Experts</span>
//         </h1>

//         <div className="flex items-center gap-3 w-full md:w-auto">

//           {/* search */}
//           <div className="relative w-full md:w-72">
//             <HiOutlineSearch className="absolute left-3 top-3 text-gray-400" />
//             <input
//               value={query}
//               onChange={(e) => setQuery(e.target.value)}
//               placeholder="Search..."
//               className="pl-10 pr-3 py-2 w-full bg-zinc-900 rounded-md border border-zinc-700 focus:ring-2 focus:ring-yellow-500"
//             />
//           </div>

//           {/* category */}
//           <select
//             value={category}
//             onChange={(e) => setCategory(e.target.value)}
//             className="bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2"
//           >
//             {categories.map((c) => (
//               <option key={c || "all"} value={c}>
//                 {c || "All"}
//               </option>
//             ))}
//           </select>

//           {/* sort */}
//           <select
//             value={sort}
//             onChange={(e) => setSort(e.target.value)}
//             className="bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2"
//           >
//             <option value="newest">Newest</option>
//             <option value="oldest">Oldest</option>
//           </select>
//         </div>
//       </div>

//       {/* ⏳ LOADING */}
//       {loading ? (
//         <div className="flex gap-4 overflow-x-auto">
//           {Array.from({ length: 6 }).map((_, i) => (
//             <div key={i} className="min-w-[220px] h-[300px] bg-zinc-800 animate-pulse rounded-lg"></div>
//           ))}
//         </div>
//       ) : filtered.length === 0 ? (

//         /* ❌ EMPTY STATE */
//         <div className="flex flex-col items-center justify-center gap-4 mt-20">
//           <p className="text-xl">No blogs found.</p>
//           <p className="text-gray-400 text-center max-w-md">
//             Try different search or create a new blog.
//           </p>

//           <div className="flex gap-3">
//             <button
//               onClick={() =>
//                 navigate("/blog/create", {
//                   state: { initialBlogData: { newBlog: true } },
//                 })
//               }
//               className="bg-yellow-500 hover:bg-yellow-600 px-4 py-2 rounded-md font-semibold"
//             >
//               Create Blog
//             </button>

//             <button
//               onClick={() => {
//                 setQuery("");
//                 setCategory("");
//               }}
//               className="px-4 py-2 border border-zinc-600 rounded-md"
//             >
//               Reset
//             </button>
//           </div>
//         </div>

//       ) : (
//         <>
//           {/* 🔥 TRENDING ROW */}
//           <div className="mb-10">
//             <h2 className="text-xl font-semibold mb-4">Trending</h2>

//             <div className="flex gap-4 overflow-x-auto scrollbar-hide">
//               {filtered.slice(0, 10).map((element) => (
//                 <div
//                   key={element._id}
//                   onClick={() => navigate(`/blog/${element._id}`)}
//                   className="min-w-[220px] h-[300px] relative cursor-pointer transform hover:scale-105 transition duration-300"
//                 >
//                   <img
//                     src={element.thumbnail}
//                     alt=""
//                     className="w-full h-full object-cover rounded-lg"
//                   />

//                   <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent p-3 flex flex-col justify-end rounded-lg">
//                     <h3 className="text-sm font-semibold line-clamp-2">
//                       {element.title}
//                     </h3>
//                     <p className="text-xs text-gray-300">
//                       {element.author}
//                     </p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* 🆕 LATEST ROW */}
//           <div className="mb-10">
//             <h2 className="text-xl font-semibold mb-4">Latest</h2>

//             <div className="flex gap-4 overflow-x-auto scrollbar-hide">
//               {[...filtered].reverse().slice(0, 10).map((element) => (
//                 <div
//                   key={element._id}
//                   onClick={() => navigate(`/blog/${element._id}`)}
//                   className="min-w-[220px] h-[300px] relative cursor-pointer transform hover:scale-105 transition duration-300"
//                 >
//                   <img
//                     src={element.thumbnail}
//                     alt=""
//                     className="w-full h-full object-cover rounded-lg"
//                   />

//                   <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent p-3 flex flex-col justify-end rounded-lg">
//                     <h3 className="text-sm font-semibold line-clamp-2">
//                       {element.title}
//                     </h3>
//                     <p className="text-xs text-gray-300">
//                       {element.author}
//                     </p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </>
//       )}
//     </div>
//   </Layout>
// );



};

export default BlogList;
