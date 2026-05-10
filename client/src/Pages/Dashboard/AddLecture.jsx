// import { useEffect, useState } from "react";
// import { toast } from "react-hot-toast";
// import { ArrowLeft, UploadCloud } from "lucide-react";
// import { useDispatch } from "react-redux";
// import { useLocation, useNavigate } from "react-router-dom";
// import Layout from "../../Layout/Layout";
// import { addCourseLecture } from "../../Redux/lectureSlice";
// import { CinematicPage, GlassPanel, PremiumInput } from "../../Components/Premium/PremiumShell";
// import { PrimaryButton, SecondaryButton } from "../../Components/Premium/Buttons";

// const AddLectures = () => {
//   const courseDetails = useLocation().state;
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const [uploading, setUploading] = useState(false);
//   const [dragging, setDragging] = useState(false);
//   const [userInput, setUserInput] = useState({ id: courseDetails?._id, lecture: undefined, title: "", description: "", videoSrc: "" });

//   const handleInputChange = (event) => setUserInput({ ...userInput, [event.target.name]: event.target.value });
//   const setVideo = (video) => {
//     if (!video) return;
//     if (!video.type.startsWith("video/")) return toast.error("Please select a valid video file");
//     if (video.size > 500 * 1024 * 1024) return toast.error("Video must be under 500MB");
//     setUserInput({ ...userInput, videoSrc: window.URL.createObjectURL(video), lecture: video });
//   };

//   const handleFormSubmit = async (event) => {
//     event.preventDefault();
//     if (!userInput.lecture || !userInput.title || !userInput.description) return toast.error("All fields are mandatory");
//     setUploading(true);
//     const res = await dispatch(addCourseLecture(userInput));
//     setUploading(false);
//     if (res?.payload?.success) setUserInput({ id: courseDetails?._id, lecture: undefined, title: "", description: "", videoSrc: "" });
//   };

//   useEffect(() => { if (!courseDetails) navigate(-1); }, [courseDetails, navigate]);

//   return (
//     <Layout>
//       <CinematicPage className="grid place-items-center p-4 sm:p-6">
//         <GlassPanel className="w-full max-w-xl p-5">
//           <header className="mb-5 flex items-center gap-3">
//             <SecondaryButton onClick={() => navigate(-1)}><ArrowLeft size={16} /></SecondaryButton>
//             <div>
//               <p className="text-xs uppercase tracking-[0.24em] text-sky-200">Upload Center</p>
//               <h1 className="text-2xl font-black">Add new lecture</h1>
//             </div>
//           </header>
//           <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
//             <PremiumInput type="text" name="title" value={userInput.title} onChange={handleInputChange} placeholder="Lecture title" />
//             <textarea name="description" value={userInput.description} onChange={handleInputChange} placeholder="Lecture description" className="cinematic-input h-28 resize-none" />
//             {userInput.videoSrc ? (
//               <video src={userInput.videoSrc} muted controls controlsList="nodownload" disablePictureInPicture className="aspect-video w-full rounded-premium bg-black object-contain" />
//             ) : (
//               <label
//                 htmlFor="lecture"
//                 onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
//                 onDragLeave={() => setDragging(false)}
//                 onDrop={(event) => { event.preventDefault(); setDragging(false); setVideo(event.dataTransfer.files?.[0]); }}
//                 className={`flex h-52 cursor-pointer flex-col items-center justify-center gap-3 rounded-premium border border-dashed ${dragging ? "border-sky-300 bg-sky-400/10" : "border-white/15 bg-white/[0.04]"}`}
//               >
//                 <UploadCloud className="h-9 w-9 text-sky-300" />
//                 <span className="font-semibold text-primary">Choose or drop lecture video</span>
//                 <span className="text-sm text-secondary">MP4/WebM, up to 500MB</span>
//                 <input type="file" name="lecture" id="lecture" onChange={(event) => setVideo(event.target.files?.[0])} accept="video/mp4,video/x-m4v,video/*" className="hidden" />
//               </label>
//             )}
//             <PrimaryButton loading={uploading}>Add Lecture</PrimaryButton>
//           </form>
//         </GlassPanel>
//       </CinematicPage>
//     </Layout>
//   );
// };

// export default AddLectures;


// import { useEffect, useState } from "react";
// import { toast } from "react-hot-toast";
// import { ArrowLeft, UploadCloud, PlayCircle, Film } from "lucide-react";
// import { useDispatch } from "react-redux";
// import { useLocation, useNavigate } from "react-router-dom";

// import Layout from "../../Layout/Layout";
// import { addCourseLecture } from "../../Redux/lectureSlice";

// import {
//   CinematicPage,
//   GlassPanel,
//   PremiumInput,
// } from "../../Components/Premium/PremiumShell";

// import {
//   PrimaryButton,
//   SecondaryButton,
// } from "../../Components/Premium/Buttons";

// const AddLectures = () => {
//   const courseDetails = useLocation().state;
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   const [uploading, setUploading] = useState(false);
//   const [dragging, setDragging] = useState(false);

//   const [userInput, setUserInput] = useState({
//     id: courseDetails?._id,
//     lecture: undefined,
//     title: "",
//     description: "",
//     videoSrc: "",
//   });

//   const handleInputChange = (e) =>
//     setUserInput({ ...userInput, [e.target.name]: e.target.value });

//   const setVideo = (video) => {
//     if (!video) return;
//     if (!video.type.startsWith("video/"))
//       return toast.error("Only video files allowed");
//     if (video.size > 500 * 1024 * 1024)
//       return toast.error("Max size: 500MB");

//     setUserInput({
//       ...userInput,
//       videoSrc: URL.createObjectURL(video),
//       lecture: video,
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!userInput.lecture || !userInput.title || !userInput.description) {
//       return toast.error("All fields required");
//     }

//     setUploading(true);

//     const res = await dispatch(addCourseLecture(userInput));

//     setUploading(false);

//     if (res?.payload?.success) {
//       toast.success("Lecture added successfully 🎬");
//       setUserInput({
//         id: courseDetails?._id,
//         lecture: undefined,
//         title: "",
//         description: "",
//         videoSrc: "",
//       });
//     }
//   };

//   useEffect(() => {
//     if (!courseDetails) navigate(-1);
//   }, [courseDetails, navigate]);

//   return (
//     <Layout>
//       <CinematicPage className="relative min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-white">

//         {/* HERO GLOW BACKGROUND */}
//         <div className="absolute top-0 left-0 h-[400px] w-[400px] bg-red-600/20 blur-[140px]" />
//         <div className="absolute bottom-0 right-0 h-[400px] w-[400px] bg-indigo-600/20 blur-[140px]" />

//         <div className="relative z-10 flex justify-center p-4 sm:p-10">

//           <GlassPanel className="w-full max-w-3xl rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-2xl">

//             {/* HEADER */}
//             <div className="mb-6 flex items-center gap-4">
//               <SecondaryButton onClick={() => navigate(-1)}>
//                 <ArrowLeft size={16} />
//               </SecondaryButton>

//               <div>
//                 <p className="text-xs uppercase tracking-[0.3em] text-red-300">
//                   Studio Upload
//                 </p>

//                 <h1 className="text-3xl font-black">
//                   Add New Lecture
//                 </h1>

//                 <p className="text-sm text-gray-400">
//                   Upload cinematic learning content like Netflix Studio 🎥
//                 </p>
//               </div>
//             </div>

//             {/* VIDEO PREVIEW / UPLOAD */}
//             <div className="mb-6">
//               {userInput.videoSrc ? (
//                 <div className="relative overflow-hidden rounded-2xl border border-white/10">
//                   <video
//                     src={userInput.videoSrc}
//                     controls
//                     className="h-[280px] w-full object-cover"
//                   />

//                   <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1 text-xs">
//                     <PlayCircle size={14} />
//                     Preview Mode
//                   </div>
//                 </div>
//               ) : (
//                 <label
//                   htmlFor="lecture"
//                   onDragOver={(e) => {
//                     e.preventDefault();
//                     setDragging(true);
//                   }}
//                   onDragLeave={() => setDragging(false)}
//                   onDrop={(e) => {
//                     e.preventDefault();
//                     setDragging(false);
//                     setVideo(e.dataTransfer.files?.[0]);
//                   }}
//                   className={`group flex h-[280px] cursor-pointer flex-col items-center justify-center gap-4 rounded-3xl border border-dashed transition-all ${
//                     dragging
//                       ? "border-red-400 bg-red-500/10 scale-[1.01]"
//                       : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
//                   }`}
//                 >
//                   <UploadCloud className="h-12 w-12 text-red-300 group-hover:scale-110 transition" />

//                   <div className="text-center">
//                     <p className="text-lg font-semibold">
//                       Drop your lecture video here
//                     </p>

//                     <p className="text-sm text-gray-400">
//                       MP4, MOV, WEBM — up to 500MB
//                     </p>
//                   </div>

//                   <input
//                     type="file"
//                     id="lecture"
//                     className="hidden"
//                     accept="video/*"
//                     onChange={(e) => setVideo(e.target.files?.[0])}
//                   />
//                 </label>
//               )}
//             </div>

//             {/* FORM */}
//             <form
//               onSubmit={handleSubmit}
//               className="relative space-y-5 rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] via-white/[0.03] to-transparent p-6 shadow-2xl backdrop-blur-2xl transition-all duration-300 hover:border-white/20"
//             >

//               <PremiumInput
//                 name="title"
//                 value={userInput.title}
//                 onChange={handleInputChange}
//                 placeholder="Lecture title (e.g. React Hooks Masterclass)"
//               />

//               <textarea
//                 name="description"
//                 value={userInput.description}
//                 onChange={handleInputChange}
//                 placeholder="Describe what students will learn..."
//                 className="h-28 w-full resize-none rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-white/[0.02] p-4 text-white placeholder:text-gray-500 shadow-inner backdrop-blur-xl transition-all duration-300 focus:border-red-400/60 focus:ring-2 focus:ring-red-500/20 focus:shadow-[0_0_25px_rgba(239,68,68,0.15)] hover:border-white/20"
//               />

//               {/* ACTION BUTTON */}
//               <PrimaryButton loading={uploading} className="w-full">
//                 <Film size={16} />
//                 Publish Lecture
//               </PrimaryButton>
//             </form>

//             {/* FOOTER HINT */}
//             <div className="mt-5 text-center text-xs text-gray-500">
//               Powered by cinematic learning engine • Netflix-style UI system
//             </div>

//           </GlassPanel>
//         </div>
//       </CinematicPage>
//     </Layout>
//   );
// };

// export default AddLectures;


import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import {
  ArrowLeft,
  UploadCloud,
  PlayCircle,
  Film,
  Sparkles,
} from "lucide-react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";

import Layout from "../../Layout/Layout";
import { addCourseLecture } from "../../Redux/lectureSlice";

import {
  CinematicPage,
  GlassPanel,
  PremiumInput,
} from "../../Components/Premium/PremiumShell";

import {
  PrimaryButton,
  SecondaryButton,
} from "../../Components/Premium/Buttons";

const AddLectures = () => {
  const courseDetails = useLocation().state;
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);

  const [userInput, setUserInput] = useState({
    id: courseDetails?._id,
    lecture: undefined,
    title: "",
    description: "",
    videoSrc: "",
  });

  const handleInputChange = (e) =>
    setUserInput({ ...userInput, [e.target.name]: e.target.value });

  const setVideo = (video) => {
    if (!video) return;
    if (!video.type.startsWith("video/"))
      return toast.error("Only video files allowed");
    if (video.size > 500 * 1024 * 1024)
      return toast.error("Max size: 500MB");

    setUserInput({
      ...userInput,
      videoSrc: URL.createObjectURL(video),
      lecture: video,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userInput.lecture || !userInput.title || !userInput.description) {
      return toast.error("All fields required");
    }

    setUploading(true);

    const res = await dispatch(addCourseLecture(userInput));

    setUploading(false);

    if (res?.payload?.success) {
      toast.success("Lecture published successfully 🎬");
      setUserInput({
        id: courseDetails?._id,
        lecture: undefined,
        title: "",
        description: "",
        videoSrc: "",
      });
    }
  };

  useEffect(() => {
    if (!courseDetails) navigate(-1);
  }, [courseDetails, navigate]);

  return (
    <Layout>
      <CinematicPage className="relative min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-white">

        {/* CINEMATIC GLOW */}
        <div className="absolute top-0 left-0 h-[450px] w-[450px] bg-red-600/20 blur-[160px]" />
        <div className="absolute bottom-0 right-0 h-[450px] w-[450px] bg-indigo-600/20 blur-[160px]" />

        <div className="relative z-10 flex justify-center px-4 py-10">

          <GlassPanel className="w-full max-w-4xl rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-3xl shadow-2xl">

            {/* HEADER */}
            <div className="mb-8 flex items-start gap-5">

              <SecondaryButton onClick={() => navigate(-1)}>
                <ArrowLeft size={16} />
              </SecondaryButton>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-red-300">
                  Studio Upload Portal
                </p>

                <h1 className="mt-2 text-4xl font-black tracking-tight">
                  Add Cinematic Lecture
                </h1>

                <p className="mt-2 text-sm text-gray-400 leading-relaxed">
                  Create premium learning experiences — Netflix / JioHotstar style
                  lecture publishing system 🎬
                </p>
              </div>
            </div>

            {/* VIDEO UPLOAD AREA */}
            <div className="mb-8">

              {userInput.videoSrc ? (
                <div className="relative overflow-hidden rounded-3xl border border-white/10 shadow-xl">
                  <video
                    src={userInput.videoSrc}
                    controls
                    className="h-[320px] w-full object-cover"
                  />

                  <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-black/60 px-4 py-1 text-xs font-semibold backdrop-blur">
                    <PlayCircle size={14} />
                    Preview Mode
                  </div>
                </div>

              ) : (
                <label
                  htmlFor="lecture"
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragging(false);
                    setVideo(e.dataTransfer.files?.[0]);
                  }}
                  className={`group flex h-[320px] cursor-pointer flex-col items-center justify-center gap-5 rounded-3xl border border-dashed transition-all duration-300 ${
                    dragging
                      ? "border-red-400 bg-red-500/10 scale-[1.02]"
                      : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
                  }`}
                >
                  <UploadCloud className="h-14 w-14 text-red-300 group-hover:scale-110 transition" />

                  <div className="text-center">
                    <p className="text-xl font-bold tracking-wide">
                      Drop your lecture video here
                    </p>

                    <p className="mt-2 text-sm text-gray-400">
                      MP4 • MOV • WEBM — Maximum 500MB
                    </p>
                  </div>

                  <input
                    type="file"
                    id="lecture"
                    className="hidden"
                    accept="video/*"
                    onChange={(e) => setVideo(e.target.files?.[0])}
                  />
                </label>
              )}
            </div>

            {/* FORM */}
            <form
              onSubmit={handleSubmit}
              className="space-y-6 rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.06] via-white/[0.03] to-transparent p-7 shadow-2xl backdrop-blur-2xl"
            >

              {/* TITLE */}
              <PremiumInput
                name="title"
                value={userInput.title}
                onChange={handleInputChange}
                placeholder="Enter powerful lecture title (e.g. React Masterclass)"
              />

              {/* DESCRIPTION */}
              <textarea
                name="description"
                value={userInput.description}
                onChange={handleInputChange}
                placeholder="Write a compelling description that hooks students..."
                className="h-32 w-full resize-none rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-white placeholder:text-gray-500 shadow-inner outline-none transition-all duration-300 focus:border-red-400 focus:ring-2 focus:ring-red-500/20 hover:border-white/20"
              />

              {/* SUBMIT */}
              <PrimaryButton loading={uploading} className="w-full text-lg font-bold tracking-wide">
                <Film size={18} />
                Publish Cinematic Lecture
              </PrimaryButton>
            </form>

            {/* FOOTER */}
            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500">
              <Sparkles size={14} className="text-red-400" />
              Powered by cinematic learning engine • Studio-grade UI system
            </div>

          </GlassPanel>
        </div>
      </CinematicPage>
    </Layout>
  );
};

export default AddLectures;