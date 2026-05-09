import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { ListVideo, Plus, Trash2 } from "lucide-react";
import Layout from "../../Layout/Layout";
import { deleteCourseLecture, getCourseLecture } from "../../Redux/lectureSlice";
import { CinematicPage, GlassPanel } from "../../Components/Premium/PremiumShell";
import { DangerButton, PrimaryButton } from "../../Components/Premium/Buttons";

const DisplayLectures = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const courseDetails = useLocation().state;
  const { lectures } = useSelector((state) => state.lecture);
  const { role } = useSelector((state) => state.auth);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  const handleLectureDelete = async (courseId, lectureId) => {
    await dispatch(deleteCourseLecture({ courseId, lectureId }));
    await dispatch(getCourseLecture(courseDetails._id));
  };

  useEffect(() => {
    if (courseDetails?._id) dispatch(getCourseLecture(courseDetails._id));
  }, [dispatch, courseDetails?._id]);

  const currentLecture = lectures?.[currentVideoIndex];

  return (
    <Layout>
      <CinematicPage className="p-4 sm:p-6 lg:p-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-end">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-sky-200">Lecture Player</p>
              <h1 className="mt-2 text-3xl font-black md:text-5xl">{courseDetails?.title}</h1>
            </div>
            {(role === "ADMIN" || role === "SUPERADMIN") && <PrimaryButton onClick={() => navigate("/course/addlecture", { state: { ...courseDetails } })}><Plus size={16} /> Add Lecture</PrimaryButton>}
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <GlassPanel className="overflow-hidden">
              <video className="aspect-video w-full bg-black object-contain" src={currentLecture?.lecture?.secure_url} controls disablePictureInPicture controlsList="nodownload" />
              <div className="p-5">
                <h2 className="text-2xl font-bold text-primary">{currentLecture?.title || "Select a lecture"}</h2>
                <p className="mt-2 leading-7 text-secondary">{currentLecture?.description || "Choose a lecture from the sidebar to start watching."}</p>
              </div>
            </GlassPanel>

            <GlassPanel className="p-4">
              <div className="mb-4 flex items-center gap-2 font-bold"><ListVideo size={18} /> Lectures</div>
              <div className="space-y-3">
                {(lectures || []).map((lecture, index) => (
                  <div key={lecture._id} className={`rounded-premium border p-3 ${index === currentVideoIndex ? "border-sky-300 bg-sky-400/10" : "border-white/10 bg-white/[0.04]"}`}>
                    <button className="w-full text-left" onClick={() => setCurrentVideoIndex(index)}>
                      <div className="text-sm text-sky-200">Lecture {index + 1}</div>
                      <div className="font-semibold text-primary">{lecture?.title}</div>
                    </button>
                    {(role === "ADMIN" || role === "SUPERADMIN") && <DangerButton className="mt-3 w-full" onClick={() => handleLectureDelete(courseDetails?._id, lecture?._id)}><Trash2 size={15} /> Delete</DangerButton>}
                  </div>
                ))}
                {!lectures?.length && <div className="rounded-premium bg-white/[0.04] p-6 text-center text-secondary">No lectures uploaded yet.</div>}
              </div>
            </GlassPanel>
          </div>
        </div>
      </CinematicPage>
    </Layout>
  );
};

export default DisplayLectures;
