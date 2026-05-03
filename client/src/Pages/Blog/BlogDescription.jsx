import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import CommentList from "../../Components/Comments/CommentList";
import CommentForm from "../../Components/Comments/CommentForm";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Layout from "../../Layout/Layout";
import axiosInstance from "../../Helper/axiosInstance";
import { FiShare2 } from "react-icons/fi";
import { AiOutlineLike } from "react-icons/ai";
import { motion } from "framer-motion";
import { fetchComments } from "../../Redux/commentSlice";
import LikeButton from "../../Components/Likes/LikeButton";
// import { getAllBlogs } from "../../Redux/blogSlice"; // ← uncomment if you have this

const BlogDescription = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id: paramId } = useParams();

  const blogsData = useSelector((state) => state.blog?.blogsData || []);
  const comments = useSelector((state) => state.comments?.list || []);
  const likes = useSelector((state) => state.likes || []);

  // console.log("BlogDescription comments from Redux:", comments);





  const blogFromStore =
    blogsData.find?.((b) => b?._id === location?.state?._id) || null;

  const [blog, setBlog] = useState(location?.state || blogFromStore || null);

  
  // ❌ Remove this block completely:
// useEffect(() => {
//   dispatch(fetchComments());
// }, [dispatch]);

  // ✅ Add this instead:
  // useEffect(() => {
  //   const id = paramId || blog?._id || location?.state?._id;
  //   if (id) {
  //     dispatch(fetchComments(id));  // <-- pass blogId
  //   }
  // }, [paramId, blog?._id, location?.state?._id, dispatch]);

  useEffect(() => {
    const id = paramId || blog?._id || location?.state?._id;
    if (id) {
      dispatch(fetchComments(id));   // ✅ loads all comments for this blog
    }
  }, [paramId, blog?._id, location?.state?._id, dispatch]);
  
  // Comments are now managed by Redux (see CommentList/CommentForm)
  const [likesCount, setLikesCount] = useState(blog?.likes || 0);
  const [liked, setLiked] = useState(false);

  const imgSrc = blog?.thumbnail?.secure_url || blog?.previewImage || null;

  // ---------------- Data Loaders ----------------
  const loadBlog = useCallback(async (id) => {
    try {
      const res = await axiosInstance.get(`/posts/${id}`);
      const payload = res?.data?.blog || res?.data?.post || res?.data;
      if (payload) {
        setBlog(payload);
        setLikesCount(payload.likes || 0);
      }
    } catch {
      navigate("/blogs", { replace: true });
    }
  }, [navigate]);



  // ---------------- Effects ----------------
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const id = paramId || blog?._id || location?.state?._id;
    if (id) {
      if (!blog || blog._id !== id) loadBlog(id);
      // comments are loaded by CommentList (which dispatches fetchComments)
    } else {
      navigate("/blogs", { replace: true });
    }
  }, [paramId, blog, location, loadBlog, navigate]);

  // ---------------- Actions ----------------
  const doLike = async () => {
    if (!blog?._id) return;
    try {
      const res = await axiosInstance.post(`/likes/${blog._id}/like`);
      if (res?.data) {
        setLiked(true);
        await loadBlog(blog._id);
      }
    } catch {
      setLikesCount((c) => c + 1);
    }
  };


  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard");
    } catch {}
  };

  // ---------------- Components ----------------
  // Comments UI moved to CommentForm and CommentList (Redux-powered)

  if (!blog) return null;

  // ---------------- UI ----------------
  return (
    <Layout>
      <div className="min-h-[90vh] pt-12 px-6 md:px-20 text-white">
        <div className="max-w-5xl mx-auto bg-gradient-to-b from-white/3 to-transparent rounded-lg p-6 shadow-lg">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Blog Content */}
            <div className="md:w-2/3">
            
              {imgSrc ? (
                <img
                  src={imgSrc}
                  alt={blog?.title}
                  className="w-full h-64 object-cover rounded-md mb-4"
                />
              ) : (
                <div className="w-full h-64 bg-zinc-800 rounded-md mb-4 flex items-center justify-center text-zinc-400">
                  No image
                </div>
              )}

              <h1 className="text-3xl font-bold text-yellow-400 mb-2">
                {blog.title}
              </h1>
              <div className="flex items-center gap-4 text-sm text-zinc-300 mb-4">
                <span>By {blog.author || "Unknown"}</span>•{" "}
                {new Date(blog.createdAt || Date.now()).toLocaleString()} •{" "}
                <span className="px-2 py-1 bg-white/5 rounded text-xs">
                  {blog?.category?.name || "General"}
                </span>
              </div>

              <div
                className="prose max-w-none text-zinc-200 mb-6"
                dangerouslySetInnerHTML={{
                  __html: blog.content || blog?.description || "",
                }}
              />

              <div className="prose max-w-none text-zinc-200 mb-6">
                {blog.content || blog?.description || ""}
              </div>


              <div className="flex items-center gap-3">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={doLike}
                  className="flex items-center gap-2 px-3 py-2 rounded bg-white/5"
                >
                  <AiOutlineLike /> Like {likesCount}
                </motion.button>
                <button
                  onClick={copyLink}
                  className="px-3 py-2 rounded bg-white/5 flex items-center gap-2"
                >
                  <FiShare2 /> Share
                </button>


                <div className="flex items-center gap-3">
                  <LikeButton postId={blog._id} />
                  <button
                    onClick={copyLink}
                    className="px-3 py-2 rounded bg-white/5 flex items-center gap-2"
                  >
                    <FiShare2 /> Share
                  </button>
                </div>
              </div>

              {/* Comments (Redux-powered) */}
              <div className="mt-8">
                <h3 className="text-xl font-semibold mb-3">Comments</h3>
                <CommentForm blogId={blog?._id} />
                <div className="mt-4">
                  <CommentList blogId={blog?._id} />
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <aside className="md:w-1/3 space-y-4">
              <div className="p-4 bg-white/5 rounded">
                <div className="text-sm text-zinc-300">Stats</div>
                <div className="flex items-center gap-3 mt-2 text-white">
                  <span className="px-2 py-1 rounded bg-white/5">
                    Views: {blog?.views || 0}
                  </span>
                  <span className="px-2 py-1 rounded bg-white/5">
                    Likes: {likes?.likesByPost?.[blog._id] || 0}
                  </span>
                 <span className="px-2 py-1 rounded bg-white/5">
                  Comments: {comments?.length || 0}
                </span>

                </div>
              </div>

              <div className="p-4 bg-white/5 rounded">
                <h4 className="font-semibold">
                  More from {blog?.category?.name || "Category"}
                </h4>
                <div className="mt-3 text-sm text-zinc-300">
                  Explore more posts in this category from the dashboard.
                </div>
                <button
                  onClick={() => navigate("/blogs")}
                  className="mt-3 w-full px-3 py-2 rounded bg-indigo-600 text-black"
                >
                  Browse
                </button>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BlogDescription;
