import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import CommentList from "../../Components/Comments/CommentList";
import CommentForm from "../../Components/Comments/CommentForm";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Layout from "../../Layout/Layout";
import axiosInstance from "../../Helper/axiosInstance";
import { FiShare2 } from "react-icons/fi";
import { AiOutlineLike } from "react-icons/ai";
import { fetchComments } from "../../Redux/commentSlice";
import LikeButton from "../../Components/Likes/LikeButton";
import { BookOpen, Clock3, UserRound } from "lucide-react";
import { CinematicPage, GlassPanel } from "../../Components/Premium/PremiumShell";
import { SecondaryButton } from "../../Components/Premium/Buttons";

const BlogDescription = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id: paramId } = useParams();
  const blogsData = useSelector((state) => state.blog?.blogsData || []);
  const comments = useSelector((state) => state.comments?.list || []);
  const likes = useSelector((state) => state.likes || []);
  const blogFromStore = blogsData.find?.((b) => b?._id === location?.state?._id) || null;
  const [blog, setBlog] = useState(location?.state || blogFromStore || null);
  const [likesCount, setLikesCount] = useState(blog?.likes || 0);
  const imgSrc = blog?.thumbnail?.secure_url || blog?.previewImage || null;

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

  useEffect(() => { window.scrollTo(0, 0); }, []);
  useEffect(() => {
    const id = paramId || blog?._id || location?.state?._id;
    if (id) dispatch(fetchComments(id));
  }, [paramId, blog?._id, location?.state?._id, dispatch]);
  useEffect(() => {
    const id = paramId || blog?._id || location?.state?._id;
    if (id) { if (!blog || blog._id !== id) loadBlog(id); } else navigate("/blogs", { replace: true });
  }, [paramId, blog, location, loadBlog, navigate]);

  const doLike = async () => {
    if (!blog?._id) return;
    try {
      await axiosInstance.post(`/likes/${blog._id}/like`);
      await loadBlog(blog._id);
    } catch {
      setLikesCount((count) => count + 1);
    }
  };
  const copyLink = async () => { try { await navigator.clipboard.writeText(window.location.href); alert("Link copied to clipboard"); } catch {} };

  if (!blog) return null;

  return (
    <Layout>
      <CinematicPage className="p-4 sm:p-6 lg:p-10">
        <article className="mx-auto max-w-6xl">
          <GlassPanel className="overflow-hidden">
            <div className="relative min-h-[360px]">
              {imgSrc ? <img src={imgSrc} alt={blog?.title} className="absolute inset-0 h-full w-full object-cover" /> : <div className="absolute inset-0 bg-gradient-to-br from-red-700 to-sky-700" />}
              <div className="absolute inset-0 bg-gradient-to-t from-premium-black via-black/50 to-black/15" />
              <div className="relative z-10 flex min-h-[360px] flex-col justify-end p-5 md:p-8">
                <p className="text-xs uppercase tracking-[0.28em] text-sky-200">{blog?.category?.name || "General"}</p>
                <h1 className="mt-3 max-w-4xl text-4xl font-black leading-tight md:text-6xl">{blog.title}</h1>
                <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-300">
                  <span className="inline-flex items-center gap-2"><UserRound size={15} /> {blog.author || "Unknown"}</span>
                  <span className="inline-flex items-center gap-2"><Clock3 size={15} /> {new Date(blog.createdAt || Date.now()).toLocaleString()}</span>
                  <span className="inline-flex items-center gap-2"><BookOpen size={15} /> {Math.max(2, Math.ceil((blog.content || blog.description || "").length / 900))} min read</span>
                </div>
              </div>
            </div>
          </GlassPanel>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_300px]">
            <GlassPanel className="p-5 md:p-8">
              <div className="prose prose-invert max-w-none prose-headings:text-white prose-p:text-slate-200 prose-strong:text-white prose-a:text-sky-300" dangerouslySetInnerHTML={{ __html: blog.content || blog?.description || "" }} />
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <SecondaryButton onClick={doLike}><AiOutlineLike /> Like {likesCount}</SecondaryButton>
                <SecondaryButton onClick={copyLink}><FiShare2 /> Share</SecondaryButton>
                <LikeButton postId={blog._id} />
              </div>
              <div className="mt-8">
                <h3 className="mb-3 text-xl font-bold">Comments</h3>
                <CommentForm blogId={blog?._id} />
                <div className="mt-4"><CommentList blogId={blog?._id} /></div>
              </div>
            </GlassPanel>
            <aside className="space-y-4">
              <GlassPanel className="p-4">
                <div className="text-sm text-secondary">Stats</div>
                <div className="mt-3 grid gap-2 text-sm text-primary">
                  <span>Views: {blog?.views || 0}</span>
                  <span>Likes: {likes?.likesByPost?.[blog._id] || likesCount || 0}</span>
                  <span>Comments: {comments?.length || 0}</span>
                </div>
              </GlassPanel>
              <GlassPanel className="p-4">
                <h4 className="font-bold">Related reads</h4>
                <p className="mt-2 text-sm text-secondary">Explore more posts with the same category and author style.</p>
                <SecondaryButton onClick={() => navigate("/blogs")} className="mt-4 w-full">Browse Blogs</SecondaryButton>
              </GlassPanel>
            </aside>
          </div>
        </article>
      </CinematicPage>
    </Layout>
  );
};

export default BlogDescription;
