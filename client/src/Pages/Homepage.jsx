import React, { useEffect, useMemo, useState, useRef } from "react";
import Layout from "../Layout/Layout";
import homePageMainImage from "../Assets/Images/homePageMainImage.png";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getAllBlogs } from "../Redux/blogSlice";
import BlogCard from "../Components/BlogCard";
import AiInsights from "./Excel/AiInsights";
import { HiOutlineSearch } from "react-icons/hi";
import { motion } from "framer-motion";
import axiosInstance from "../Helper/axiosInstance";
import toast from "react-hot-toast";

const Homepage = () => {
  const dispatch = useDispatch();
  const blogsData = useSelector((state) => state.blog?.blogsData || []);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [assistantOpen, setAssistantOpen] = useState(false);

  const [index, setIndex] = useState(0);
  const [showBlogs, setShowBlogs] = useState(false);
  const autoplay = useRef(null);

  const excelState = useSelector((state) => state.excel || {});
  const excelFiles = excelState.files || [];
  const currentFile = excelState.currentFile || null;

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

  const featured = useMemo(() => blogsData.slice(0, 5), [blogsData]);
  const recent = useMemo(() => blogsData.slice(0, 6), [blogsData]);

  useEffect(() => {
    if (!featured.length) return;
    autoplay.current = setInterval(() => setIndex((i) => (i + 1) % featured.length), 4000);
    return () => clearInterval(autoplay.current);
  }, [featured.length]);

  useEffect(() => {
    const timer = setTimeout(() => setShowBlogs(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  const filteredRecent = useMemo(() => {
    if (!query.trim()) return recent;
    const q = query.toLowerCase();
    return recent.filter(
      (b) =>
        (b?.title || "").toLowerCase().includes(q) ||
        (b?.author || "").toLowerCase().includes(q)
    );
  }, [recent, query]);

  // smart suggestions (client-side quick filter)
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }
    const q = query.toLowerCase();
    const hints = (blogsData || [])
      .slice(0, 10)
      .filter((b) => (b?.title || "").toLowerCase().includes(q) || (b?.author || "").toLowerCase().includes(q))
      .map((b) => ({ id: b._id, title: b.title }));
    setSuggestions(hints);
  }, [query, blogsData]);

  // voice search using Web Speech API (fallback safe)
  const startVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice search is not supported in this browser.');
      return;
    }
    const recog = new SpeechRecognition();
    recog.lang = 'en-US';
    recog.interimResults = false;
    recog.maxAlternatives = 1;
    setIsListening(true);
    recog.onresult = (ev) => {
      const txt = ev.results[0][0].transcript || '';
      setQuery(txt);
      setIsListening(false);
    };
    recog.onerror = () => setIsListening(false);
    recog.onend = () => setIsListening(false);
    recog.start();
  };

  // small helper: client-only summarize mock (replace with API call for real summaries)
  const summarizePost = (post) => {
    // call server LLM endpoint for a real summary
    const src = post?.description || post?.content || post?.title || '';
    if (!src) {
      toast.error('No content to summarize');
      return;
    }

    toast.loading('Generating summary...');
    axiosInstance
      .post('/ai/summary/text', { text: src })
      .then((res) => {
        toast.dismiss();
        const s = res?.data?.summary || 'No summary returned.';
        // Present summary in a toast (small); for longer text consider a modal
        toast.success('Summary ready — opening details');
        alert(s);
      })
      .catch((err) => {
        toast.dismiss();
        toast.error(err?.response?.data?.message || 'Failed to generate summary');
        console.error('Summary error', err);
      });
  };

  return (
    <Layout>
      <div className="pt-10 text-white flex flex-col gap-12 px-6 md:px-20">
        {/* HERO */}
        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-8 bg-gradient-to-r from-zinc-800 to-zinc-900 rounded-2xl p-8 shadow-lg">
          <motion.div
            initial={{ x: -40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
              Discover powerful insights from  <span className="text-yellow-500">real data</span>
            </h1>
            <p className="mt-4 text-lg text-gray-300">
              Explore dashboards, trends, and analytics — curated for clarity.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <div className="relative w-full sm:w-96">
                <HiOutlineSearch className="absolute left-3 top-3 text-gray-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search "
                  className="pl-10 pr-3 py-2 w-full bg-zinc-800 rounded-md border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
                {/* Voice search button (AI UX) */}
                {/* <button
                  type="button"
                  onClick={startVoiceSearch}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 bg-yellow-500 hover:bg-yellow-600 text-black p-2 rounded-full ${isListening ? 'ring-2 ring-yellow-300' : ''}`}
                  title={isListening ? 'Listening...' : 'Voice search'}
                >
                  {isListening ? '🎙️' : '🗣️'}
                </button> */}
                {/* Suggestions dropdown */}
                {suggestions.length > 0 && (
                  <div className="absolute left-0 mt-12 w-full bg-zinc-900 border border-zinc-700 rounded shadow-lg z-20">
                    {suggestions.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setQuery(s.title)}
                        className="w-full text-left px-3 py-2 hover:bg-zinc-800"
                      >
                        {s.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <Link to="/blogs">
                  <button className="bg-yellow-500 px-5 py-2 rounded-md font-semibold hover:bg-yellow-600 transition">
                    Explore Blogs
                  </button>
                </Link>
              </div>
            </div>

            <div className="mt-6 flex gap-6">
              <div>
                <p className="text-2xl font-bold text-yellow-400">{blogsData.length}</p>
                <p className="text-gray-300">Published posts</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-400">{Math.max(100, blogsData.length * 5)}</p>
                <p className="text-gray-300">Readers (est.)</p>
              </div>
              {/* <div>
                <p className="text-2xl font-bold text-yellow-400">{excelFiles.length}</p>
                <p className="text-gray-300">Excel files uploaded</p>
              </div> */}
            </div>
          </motion.div>

          <motion.div
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="flex justify-center"
          >
            <div className="w-full max-w-md rounded-xl overflow-hidden shadow-2xl border border-zinc-700">
              <img src={homePageMainImage} alt="home" className="object-cover w-full h-64 md:h-80" />
            </div>
          </motion.div>
        </div>

        {/* FEATURED CAROUSEL */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Featured picks</h2>
          {featured.length === 0 && loading ? (
            <div className="flex gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="w-[22rem] h-[430px] bg-zinc-800 animate-pulse rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="relative w-full h-[500px] flex justify-center items-center">
              {!showBlogs ? (
                <>
                  {featured.map((b, i) => (
                    <motion.div
                      key={b?._id || i}
                      initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
                      animate={{
                        x: 180 * Math.cos(i + 1),
                        y: 180 * Math.sin(i + 1),
                        scale: 1,
                        rotate: 720,
                        opacity: 1,
                      }}
                      transition={{ type: "spring", stiffness: 130, damping: 12 }}
                      className="absolute w-[22rem] h-[430px]"
                    >
                        <div className="relative h-full">
                          <div className="absolute top-3 right-3 flex gap-2">
                            
                            {((b?.description || b?.content || '').length || 0) > 300 && (
                              <div className="bg-gradient-to-r from-purple-600 to-pink-500 text-white text-xs px-2 py-1 rounded">AI-Pick</div>
                            )}
                          </div>
                          <BlogCard data={b} />
                          <div className="mt-2 px-3 pb-3 flex items-center justify-between">
                            <button
                              onClick={() => alert(summarizePost(b))}
                              className="text-sm bg-white/5 px-3 py-1 rounded text-yellow-300 hover:bg-white/10"
                            >
                              Summarize
                            </button>
                            <div className="text-xs text-zinc-400">{b?.readingTime || '—'} read</div>
                          </div>
                        </div>
                    </motion.div>
                  ))}
                  {Array.from({ length: 25 }).map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: [0, 1, 0] }}
                      transition={{ duration: 0.7, delay: i * 0.04 }}
                      className="absolute w-3 h-3 bg-yellow-400 rounded-full"
                      style={{
                        top: Math.random() * 420,
                        left: Math.random() * 620,
                        filter: "blur(2px)",
                      }}
                    />
                  ))}
                </>
              ) : (
                <>
                  <div className="flex gap-8 overflow-hidden relative">
                    {featured.map((b, i) => (
                      <motion.div
                        key={b?._id || i}
                        animate={{ x: (i - index) * 260, scale: i === index ? 1.05 : 0.95 }}
                        transition={{ type: "spring", stiffness: 120 }}
                        className="min-w-[22rem] max-w-[22rem]"
                      >
                        <BlogCard data={b} />
                      </motion.div>
                    ))}
                  </div>
                  <div className="flex gap-3 mt-4 justify-center">
                    {featured.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setIndex(i)}
                        className={`w-3 h-3 rounded-full ${i === index ? "bg-yellow-400" : "bg-zinc-600"}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </section>

        {/* EXCEL & AI */}
        {/* <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-1 md:col-span-2 bg-zinc-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-3">Excel Manager</h3>
            <p className="text-gray-300 mb-4">
              You have <span className="font-bold text-yellow-400">{excelFiles.length}</span> uploaded Excel files.
            </p>
            <Link to="/excel">
              <button className="px-4 py-2 bg-yellow-500 rounded">Open Excel Manager</button>
            </Link>
          </div>
          <div className="bg-zinc-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-3">AI Insights</h3>
            <AiInsights parsedData={currentFile?.parsedData || null} />
          </div>
        </section> */}

        {/* RECENT POSTS */}
        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Recent posts</h2>
            <Link to="/blogs" className="text-yellow-400 hover:underline">View all</Link>
          </div>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {(filteredRecent.length === 0 && !loading) ? (
              <div className="col-span-full text-center text-gray-400">
                No posts found. Try a different search or create the first post.
              </div>
            ) : loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-[430px] bg-zinc-800 animate-pulse rounded-lg" />
              ))
            ) : (
              filteredRecent.map((b) => (
                <motion.div
                  key={b?._id}
                  whileHover={{ scale: 1.03, rotateX: 1, rotateY: 1 }}
                  transition={{ type: "spring", stiffness: 120 }}
                  className="transform transition-all duration-300"
                >
                  <div className="relative">
                    <div className="absolute top-3 right-3">
                      {((b?.description || b?.content || '').length || 0) > 250 && (
                        <div className="bg-gradient-to-r from-indigo-600 to-cyan-400 text-white text-xs px-2 py-1 rounded">Recommended</div>
                      )}
                    </div>
                    <BlogCard data={b} />
                    <div className="mt-2 px-3 pb-3 flex items-center justify-between">
                      <button
                        onClick={() => alert(summarizePost(b))}
                        className="text-sm bg-white/5 px-3 py-1 rounded text-yellow-300 hover:bg-white/10"
                      >
                        Summarize
                      </button>
                      <div className="text-xs text-zinc-400">{b?.readingTime || '—'} read</div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </section>

        {/* Floating AI assistant widget */}
        <div className="fixed bottom-6 right-6 z-50">
          <div className="flex flex-col items-end">
            {assistantOpen && (
              <div className="w-80 bg-zinc-900 border border-zinc-700 rounded-xl p-3 mb-3 shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold">Assistant</div>
                  <button onClick={() => setAssistantOpen(false)} className="text-sm text-zinc-400">Close</button>
                </div>
                <div className="text-sm text-zinc-300 mb-2">Try: "Summarize latest posts" or "Show AI picks"</div>
                {/* <div className="flex gap-2">
                  <button
                    onClick={() => { setQuery(''); setAssistantOpen(false); alert('Try voice search by clicking the mic!'); }}
                    className="flex-1 px-3 py-2 bg-yellow-500 rounded text-black text-sm"
                  >
                    Voice Search
                  </button>
                  <button
                    onClick={() => { setQuery(''); setAssistantOpen(false); alert('AI Picks will highlight featured articles.'); }}
                    className="px-3 py-2 bg-white/5 rounded text-sm text-yellow-300"
                  >
                    AI Picks
                  </button>
                </div> */}
              </div>
            )}

            {/* <button
              onClick={() => setAssistantOpen((s) => !s)}
              className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 text-white shadow-lg flex items-center justify-center text-xl"
              title="Open Assistant"
            >
              🤖
            </button> */}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Homepage;
