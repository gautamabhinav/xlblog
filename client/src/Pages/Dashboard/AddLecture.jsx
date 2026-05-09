import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { ArrowLeft, UploadCloud } from "lucide-react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import Layout from "../../Layout/Layout";
import { addCourseLecture } from "../../Redux/lectureSlice";
import { CinematicPage, GlassPanel, PremiumInput } from "../../Components/Premium/PremiumShell";
import { PrimaryButton, SecondaryButton } from "../../Components/Premium/Buttons";

const AddLectures = () => {
  const courseDetails = useLocation().state;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [userInput, setUserInput] = useState({ id: courseDetails?._id, lecture: undefined, title: "", description: "", videoSrc: "" });

  const handleInputChange = (event) => setUserInput({ ...userInput, [event.target.name]: event.target.value });
  const setVideo = (video) => {
    if (!video) return;
    if (!video.type.startsWith("video/")) return toast.error("Please select a valid video file");
    if (video.size > 500 * 1024 * 1024) return toast.error("Video must be under 500MB");
    setUserInput({ ...userInput, videoSrc: window.URL.createObjectURL(video), lecture: video });
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    if (!userInput.lecture || !userInput.title || !userInput.description) return toast.error("All fields are mandatory");
    setUploading(true);
    const res = await dispatch(addCourseLecture(userInput));
    setUploading(false);
    if (res?.payload?.success) setUserInput({ id: courseDetails?._id, lecture: undefined, title: "", description: "", videoSrc: "" });
  };

  useEffect(() => { if (!courseDetails) navigate(-1); }, [courseDetails, navigate]);

  return (
    <Layout>
      <CinematicPage className="grid place-items-center p-4 sm:p-6">
        <GlassPanel className="w-full max-w-xl p-5">
          <header className="mb-5 flex items-center gap-3">
            <SecondaryButton onClick={() => navigate(-1)}><ArrowLeft size={16} /></SecondaryButton>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-sky-200">Upload Center</p>
              <h1 className="text-2xl font-black">Add new lecture</h1>
            </div>
          </header>
          <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
            <PremiumInput type="text" name="title" value={userInput.title} onChange={handleInputChange} placeholder="Lecture title" />
            <textarea name="description" value={userInput.description} onChange={handleInputChange} placeholder="Lecture description" className="cinematic-input h-28 resize-none" />
            {userInput.videoSrc ? (
              <video src={userInput.videoSrc} muted controls controlsList="nodownload" disablePictureInPicture className="aspect-video w-full rounded-premium bg-black object-contain" />
            ) : (
              <label
                htmlFor="lecture"
                onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={(event) => { event.preventDefault(); setDragging(false); setVideo(event.dataTransfer.files?.[0]); }}
                className={`flex h-52 cursor-pointer flex-col items-center justify-center gap-3 rounded-premium border border-dashed ${dragging ? "border-sky-300 bg-sky-400/10" : "border-white/15 bg-white/[0.04]"}`}
              >
                <UploadCloud className="h-9 w-9 text-sky-300" />
                <span className="font-semibold text-primary">Choose or drop lecture video</span>
                <span className="text-sm text-secondary">MP4/WebM, up to 500MB</span>
                <input type="file" name="lecture" id="lecture" onChange={(event) => setVideo(event.target.files?.[0])} accept="video/mp4,video/x-m4v,video/*" className="hidden" />
              </label>
            )}
            <PrimaryButton loading={uploading}>Add Lecture</PrimaryButton>
          </form>
        </GlassPanel>
      </CinematicPage>
    </Layout>
  );
};

export default AddLectures;
