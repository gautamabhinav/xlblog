// import React from "react";
// import { useSelector } from "react-redux";
// import { useNavigate } from "react-router-dom";

// const BlogCard = ({ data }) => {
//   // console.log('data', data);
//   const navigate = useNavigate();

//   // const comments = useSelector((state) => state.comments?.list || []);
//   const getText = (value, max = 120) => {
//     if (value === null || value === undefined) return "";
//     if (typeof value === "string")
//       return value.length > max ? value.slice(0, max) + "..." : value;
//     if (typeof value === "number") return String(value);
//     if (Array.isArray(value)) return value.join(", ");
//     if (typeof value === "object") {
//       // try common fields
//       if (value.name && typeof value.name === "string") return value.name;
//       if (value.title && typeof value.title === "string") return value.title;
//       if (value.content) return getText(value.content, max);
//       try {
//         return JSON.stringify(value).slice(0, max) + "...";
//       } catch (e) {
//         return "";
//       }
//     }
//     return String(value);
//   };

//   const categoryLabel = data?.category?.name || getText(data?.category);
//   const contentPreview = getText(data?.content, 150);
//   const authorLabel = data?.author || getText(data?.createdBy) || "Unknown";
//   const commentsCount = Array.isArray(data?.comments)
//     ? data.comments.length
//     : 0;
//   const thumbnailSrc = data?.thumbnail?.secure_url || data?.previewImage || null;

//   return (
//     <div
//       onClick={() => navigate("/blog/description", { state: { ...data } })}
//       className="text-white w-[22rem] h-[430px] shadow-lg rounded-lg cursor-pointer group overflow-hidden bg-zinc-700"
//     >
//       <div className="overflow-hidden">
//         {thumbnailSrc ? (
//           <img
//             className="h-48 w-full rounded-tl-lg rounded-tr-lg  group-hover:scale-[1.2]  transition-all ease-in-out duration-300 "
//             src={thumbnailSrc}
//             alt={getText(data?.title) || "blog thumbnail"}
//           />
//         ) : (
//           <div className="h-48 w-full flex items-center justify-center bg-zinc-800 text-gray-300">
//             <span className="p-4">No image</span>
//           </div>
//         )}
//       </div>

//       {/* blog details */}
//       <div className="p-3 space-y-1 text-white">
//         <h2 className="text-xl font-bold text-yellow-500 line-clamp-2">
//           {getText(data?.title)}
//         </h2>
//         <p className="line-clamp-2">{contentPreview}</p>
//         <p className="font-semibold">
//           <span className="text-yellow-500 font-bold">Author : </span>
//           {authorLabel}
//         </p>
//         <p className="font-semibold">
//           <span className="text-yellow-500 font-bold">Created By : </span>
//           {getText(data?.createdBy)}
//         </p>
//         <p className="font-semibold">
//           <span className="text-yellow-500 font-bold">Category : </span>
//           {categoryLabel}
//         </p>
//         {/* <p className="font-semibold">
//           <span className="text-yellow-500 font-bold">Comments : </span>
//           {comments?.length}
//         </p> */}
//       </div>
//     </div>
//   );
// };

// export default BlogCard;



// import React from "react";
// import { useNavigate } from "react-router-dom";
// import { MessageCircle, User, Tag } from "lucide-react";

// const BlogCard = ({ data }) => {
//   const navigate = useNavigate();

//   const getText = (value, max = 120) => {
//     if (!value) return "";
//     if (typeof value === "string")
//       return value.length > max ? value.slice(0, max) + "..." : value;
//     if (typeof value === "number") return String(value);
//     if (Array.isArray(value)) return value.join(", ");
//     if (typeof value === "object") {
//       if (value.name) return value.name;
//       if (value.title) return value.title;
//       if (value.content) return getText(value.content, max);
//       try {
//         return JSON.stringify(value).slice(0, max) + "...";
//       } catch {
//         return "";
//       }
//     }
//     return String(value);
//   };

//   const thumbnail =
//     data?.thumbnail?.secure_url || data?.previewImage;

//   const title = getText(data?.title, 80);
//   const content = getText(data?.content, 120);
//   const author = getText(data?.author || data?.createdBy);
//   const category = getText(data?.category?.name || data?.category);

//   return (
//     <div
//       onClick={() =>
//         navigate("/blog/description", { state: { ...data } })
//       }
//       className="group relative w-[22rem] cursor-pointer overflow-hidden rounded-2xl bg-[#0b0f1a] text-white shadow-[0_10px_40px_rgba(0,0,0,0.6)] transition-all duration-300 hover:scale-[1.03]"
//     >
//       {/* IMAGE SECTION */}
//       <div className="relative h-52 w-full overflow-hidden">
//         {thumbnail ? (
//           <img
//             src={thumbnail}
//             alt={title}
//             className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
//           />
//         ) : (
//           <div className="flex h-full w-full items-center justify-center bg-zinc-900 text-gray-400">
//             No Preview
//           </div>
//         )}

//         {/* DARK GRADIENT OVERLAY (Hotstar style) */}
//         <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

//         {/* CATEGORY BADGE */}
//         <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs backdrop-blur-md">
//           <Tag size={12} />
//           {category || "General"}
//         </div>
//       </div>

//       {/* CONTENT */}
//       <div className="space-y-2 p-4">
//         <h2 className="line-clamp-2 text-lg font-bold leading-snug text-white">
//           {title}
//         </h2>

//         <p className="line-clamp-2 text-sm text-gray-400">
//           {content}
//         </p>

//         {/* META INFO */}
//         <div className="flex items-center justify-between pt-3 text-xs text-gray-400">
          
//           <div className="flex items-center gap-1">
//             <User size={14} />
//             <span>{author || "Unknown"}</span>
//           </div>

//           <div className="flex items-center gap-1">
//             <MessageCircle size={14} />
//             <span>{data?.comments?.length || 0}</span>
//           </div>
//         </div>

//         {/* CTA STRIP */}
//         <div className="mt-3 h-[2px] w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-60" />
//       </div>

//       {/* HOVER GLOW */}
//       <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
//         <div className="absolute -bottom-10 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-indigo-500/20 blur-3xl" />
//       </div>
//     </div>
//   );
// };

// export default BlogCard;



import React from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle, User, Tag, Clock } from "lucide-react";

const BlogCard = ({ data }) => {
  const navigate = useNavigate();

  const getText = (value, max = 120) => {
    if (!value) return "";
    if (typeof value === "string")
      return value.length > max ? value.slice(0, max) + "..." : value;
    if (typeof value === "object") {
      if (value?.title) return value.title;
      if (value?.name) return value.name;
      if (value?.content) return getText(value.content, max);
    }
    return String(value);
  };

  const thumbnail =
    data?.thumbnail?.secure_url || data?.previewImage;

  const title = getText(data?.title, 80);
  const content = getText(data?.content, 110);
  const author = getText(data?.author || data?.createdBy);
  const category = getText(data?.category?.name || data?.category);

  const readTime = Math.max(1, Math.ceil((data?.content?.length || 200) / 400));

  return (
    <div
      onClick={() =>
        navigate("/blog/description", { state: { ...data } })
      }
      className="group relative w-[23rem] cursor-pointer overflow-hidden rounded-3xl bg-[#070b14] text-white shadow-[0_20px_60px_rgba(0,0,0,0.65)] transition-all duration-300 hover:-translate-y-2 hover:scale-[1.03]"
    >
      {/* Animated border glow */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-cyan-500 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-20" />

      {/* IMAGE SECTION */}
      <div className="relative h-56 w-full overflow-hidden">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-115"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-zinc-900 text-gray-400">
            No Preview
          </div>
        )}

        {/* cinematic overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

        {/* top chips */}
        <div className="absolute left-3 top-3 flex items-center gap-2">
          <span className="flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-[11px] backdrop-blur-md">
            <Tag size={12} />
            {category || "General"}
          </span>

          <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-[11px] text-indigo-200 backdrop-blur-md">
            Trending
          </span>
        </div>

        {/* read time */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-black/40 px-3 py-1 text-xs text-gray-200 backdrop-blur-md">
          <Clock size={12} />
          {readTime} min read
        </div>
      </div>

      {/* CONTENT */}
      <div className="space-y-3 p-5">
        <h2 className="line-clamp-2 text-lg font-bold leading-snug text-white group-hover:text-indigo-200">
          {title}
        </h2>

        <p className="line-clamp-2 text-sm leading-6 text-gray-400">
          {content}
        </p>

        {/* META */}
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-1">
            <User size={14} />
            {author || "Unknown"}
          </div>

          <div className="flex items-center gap-1">
            <MessageCircle size={14} />
            {data?.comments?.length || 0}
          </div>
        </div>

        {/* CTA LINE */}
        <div className="h-[2px] w-full bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-cyan-500 opacity-70 transition-all duration-300 group-hover:opacity-100" />
      </div>

      {/* FLOAT GLOW ORBS */}
      <div className="pointer-events-none absolute -bottom-10 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-indigo-500/20 blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
    </div>
  );
};

export default BlogCard;