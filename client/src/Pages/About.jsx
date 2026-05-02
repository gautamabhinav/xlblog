import React, { useState, useEffect, useRef } from "react";
import Layout from "../Layout/Layout";
import aboutMainImage from "../Assets/Images/aboutMainImage.png";
import apj from "../Assets/Images/QuotesPersonality/apj.png";
import billGates from "../Assets/Images/QuotesPersonality/billGates.png";
import einstein from "../Assets/Images/QuotesPersonality/einstein.png";
import nelsonMandela from "../Assets/Images/QuotesPersonality/nelsonMandela.png";
import steveJobs from "../Assets/Images/QuotesPersonality/steveJobs.png";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { FiFeather } from "react-icons/fi";
import { FaUsers } from "react-icons/fa";
import { BiBookOpen } from "react-icons/bi";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getAllBlogs } from "../Redux/blogSlice";

const quotes = [
  {
    img: nelsonMandela,
    name: "Nelson Mandela",
    text: "The power of words can inspire, educate, and transform the world.",
  },
  {
    img: apj,
    name: "A. P. J. Abdul Kalam",
    text: "Writing is the gateway to creativity, and creativity shapes great minds.",
  },
  {
    img: einstein,
    name: "Albert Einstein",
    text: "Creativity is intelligence having fun — and blogs are the best way to express it.",
  },
  {
    img: steveJobs,
    name: "Steve Jobs",
    text: "Innovation in writing can change the way people see the world.",
  },
  {
    img: billGates,
    name: "Bill Gates",
    text: "Content is king. A well-written blog can be more powerful than any tool.",
  },
];

const About = () => {
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const blogsData = useSelector((state) => state.blog?.blogsData || []);
  const autoplayRef = useRef(null);
  const carouselRef = useRef(null);

  useEffect(() => {
    // fetch blogs for live stats (non-blocking)
    dispatch(getAllBlogs());
  }, [dispatch]);

  useEffect(() => {
    startAutoplay();
    return () => stopAutoplay();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startAutoplay = () => {
    stopAutoplay();
    autoplayRef.current = setInterval(() => {
      setCurrent((prev) => (prev === quotes.length - 1 ? 0 : prev + 1));
    }, 4500);
  };

  const stopAutoplay = () => {
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current);
      autoplayRef.current = null;
    }
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? quotes.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrent((prev) => (prev === quotes.length - 1 ? 0 : prev + 1));
  };

  return (
    <Layout>
      <div className="px-6 md:px-20 pt-10 flex flex-col text-white">
        {/* about hero */}
        <div className="flex flex-col-reverse md:flex-row items-center gap-10 md:gap-16">
          <motion.section
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="w-full md:w-1/2 space-y-6 text-center md:text-left"
          >
            <h1 className="text-3xl md:text-5xl text-yellow-500 font-bold leading-tight">
              Excel for Everyone
            </h1>
            <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
              Our mission is to share valuable stories, insights, and knowledge
              with the world. This platform connects passionate writers and
              curious readers to exchange ideas, creativity, and perspectives
              that matter. Whether you're here to write, read, or learn — welcome.
            </p>

            <div className="flex items-center gap-4 justify-center md:justify-start">
              <button
                onClick={() => navigate("/blogs")}
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-6 py-3 rounded-full shadow-lg transition-transform hover:scale-105"
              >
                Explore Blogs
              </button>

              <button
                onClick={() => navigate('/blog/create', { state: { initialBlogData: { newBlog: true } } })}
                className="border border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black font-semibold px-6 py-3 rounded-full shadow-sm transition-colors"
              >
                Write a Story
              </button>
            </div>

            {/* quick feature cards */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <motion.div
                whileHover={{ y: -6 }}
                className="bg-zinc-800/80 p-4 rounded-lg flex flex-col items-center gap-2"
              >
                <FiFeather className="text-3xl text-yellow-400" />
                <h4 className="font-semibold">Write</h4>
                <p className="text-sm text-gray-300 text-center">Publish your ideas with a beautiful editor.</p>
              </motion.div>

              <motion.div
                whileHover={{ y: -6 }}
                className="bg-zinc-800/80 p-4 rounded-lg flex flex-col items-center gap-2"
              >
                <BiBookOpen className="text-3xl text-yellow-400" />
                <h4 className="font-semibold">Read</h4>
                <p className="text-sm text-gray-300 text-center">Curated posts from creators you will love.</p>
              </motion.div>

              <motion.div
                whileHover={{ y: -6 }}
                className="bg-zinc-800/80 p-4 rounded-lg flex flex-col items-center gap-2"
              >
                <FaUsers className="text-3xl text-yellow-400" />
                <h4 className="font-semibold">Connect</h4>
                <p className="text-sm text-gray-300 text-center">Join a community that talks about ideas.</p>
              </motion.div>
            </div>

            {/* community stats */}
            <div className="mt-6 flex gap-6">
              <div className="bg-zinc-900/70 p-4 rounded-lg text-center flex-1">
                <p className="text-3xl font-bold text-yellow-400">{blogsData.length}</p>
                <p className="text-gray-300">Published posts</p>
              </div>

              <div className="bg-zinc-900/70 p-4 rounded-lg text-center flex-1">
                <p className="text-3xl font-bold text-yellow-400">{Math.max(50, blogsData.length * 3)}</p>
                <p className="text-gray-300">Active readers (est.)</p>
              </div>
            </div>

          </motion.section>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="w-full md:w-1/2 flex justify-center"
          >
            <div className="rounded-2xl shadow-2xl overflow-hidden border border-zinc-700">
              <img
                src={aboutMainImage}
                alt="aboutMainImage"
                className="w-full h-full object-cover max-h-[380px]"
              />
            </div>
          </motion.div>
        </div>

        {/* quotes carousel */}
        <div
          ref={carouselRef}
          onMouseEnter={stopAutoplay}
          onMouseLeave={startAutoplay}
          className="relative w-full md:w-3/4 lg:w-1/2 mx-auto my-16 bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl shadow-xl p-10 text-center flex flex-col items-center"
        >
          {/* Slide Content */}
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center"
          >
            <img
              className="w-32 md:w-40 rounded-full border-4 border-yellow-500 shadow-lg"
              src={quotes[current].img}
              alt={quotes[current].name}
            />
            <p className="mt-6 text-lg md:text-xl italic text-gray-200 max-w-lg">
              "{quotes[current].text}"
            </p>
            <h3 className="mt-4 text-xl md:text-2xl font-semibold">{quotes[current].name}</h3>
          </motion.div>

          {/* Navigation buttons */}
          <button
            onClick={prevSlide}
            aria-label="Previous quote"
            className="absolute top-1/2 -left-6 md:-left-10 transform -translate-y-1/2 bg-yellow-500 text-black p-3 rounded-full shadow-lg hover:bg-yellow-600 transition"
          >
            <ChevronLeft size={28} />
          </button>
          <button
            onClick={nextSlide}
            aria-label="Next quote"
            className="absolute top-1/2 -right-6 md:-right-10 transform -translate-y-1/2 bg-yellow-500 text-black p-3 rounded-full shadow-lg hover:bg-yellow-600 transition"
          >
            <ChevronRight size={28} />
          </button>

          {/* indicators */}
          <div className="flex gap-2 mt-6">
            {quotes.map((q, i) => (
              <button
                key={i}
                aria-label={`Show quote ${i + 1}`}
                onClick={() => setCurrent(i)}
                className={`w-3 h-3 rounded-full ${i === current ? "bg-yellow-400" : "bg-zinc-600"}`}
              />
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default About;
