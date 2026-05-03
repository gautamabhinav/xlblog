// // --- File: controllers/postController.js ---
// // This file contains the logic (controller functions) for handling requests.
import asyncHandler from '../middlewares/asyncHandler.middleware.js';
import Post from '../models/blog.model.js'; // Import the Post model

// import Post from "../models/blog.model";

// import asyncHandler from "../middlewares/asyncHandler.middleware.js";
// import Blog from "../models/blog.model.js";
// import Post from "../models/blog.model.js"; // Import the Post model
import AppError from "../utils/AppError.js";
import Category from "../models/category.model.js";
import mongoose from 'mongoose';

// // Get all posts
// export const getAllPosts = asyncHandler(async (req, res, next) => {
//     try {
//         const posts = await Post.find().sort({ createdAt: -1 }); // Sort by creation date
//         res.status(200).json(posts);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// });

// // Get a single post by ID
// export const getPostById = async (req, res) => {
//     try {
//         const post = await Post.findById(req.params.id);
//         if (!post) {
//             return res.status(404).json({ message: 'Post not found' });
//         }
//         res.status(200).json(post);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// // Create a new post
// export const createPost = async (req, res) => {
//     const { title, content, author } = req.body;
//     const newPost = new Post({
//         title,
//         content,
//         author
//     });
//     try {
//         const savedPost = await newPost.save();
//         res.status(201).json(savedPost);
//     } catch (error) {
//         res.status(400).json({ message: error.message });
//     }
// };

// // Update an existing post
// export const updatePost = async (req, res) => {
//     try {
//         const updatedPost = await Post.findByIdAndUpdate(
//             req.params.id,
//             req.body,
//             { new: true } // Return the updated document
//         );
//         if (!updatedPost) {
//             return res.status(404).json({ message: 'Post not found' });
//         }
//         res.status(200).json(updatedPost);
//     } catch (error) {
//         res.status(400).json({ message: error.message });
//     }
// };

// // Delete a post
// export const deletePost = async (req, res) => {
//     try {
//         const deletedPost = await Post.findByIdAndDelete(req.params.id);
//         if (!deletedPost) {
//             return res.status(404).json({ message: 'Post not found' });
//         }
//         res.status(200).json({ message: 'Post deleted successfully' });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// // export default  {
// //     getAllPosts,
// //     getPostById,
// //     createPost,
// //     updatePost,
// //     deletePost
// // };



// -------------------------------------------------------------------------------------------------------------------------------------------------------

export const getAllPosts = asyncHandler(async (req, res, next) => {

    const posts = await Post.find({}).populate("category");;
    // console.log(posts);

    res.status(200).json({
        success: true,
        message: "All posts fetched successfully",
        posts,
    });


});

// export const createPost = asyncHandler(async (req, res, next) => {
//     console.log(req.body);
//     console.log(req.headers['content-type']);
//     console.log(req.body);

//     if(!req.body) {
//         return next(new AppError('Post data is required', 404));
//     }

//     const { title, content, author, createdBy } = req.body;

//     if (!title || !content || !author || !createdBy) {
//         return next(new AppError('All fields are required', 400));
//     }

//     const newBlog = await Post.create({ 
//         title,
//         content, 
//         author, 
//         createdBy
//      });

//     if (!newBlog) {
//         return next(new AppError('Post could not be created, please try again', 400));
//     }

//     // Run only if user sends a file
//     if (req.file) {
//         try {
//             const result = await cloudinary.v2.uploader.upload(req.file.path, {
//                 folder: 'blog',
//             });

//             if (result) {
//                 newPost.thumbnail = {
//                     public_id: result.public_id,
//                     secure_url: result.secure_url
//                 };
//             }

//             await fs.rm(`uploads/${req.file.filename}`);
//         } catch (error) {
//             for (const file of await fs.readdir('uploads/')) {
//                 await fs.unlink(path.join('uploads/', file));
//             }
//             return next(new AppError(JSON.stringify(error) || 'File not uploaded, please try again', 400));
//         }
//     }

//     await newBlog.save();

//     res.status(201).json({
//         success: true,
//         message: "Post created successfully",
//         post: newBlog,
//     });
// });




import fs from "fs/promises";
import cloudinary from "cloudinary";

const isCloudinaryConfigured = () =>
  Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );

const resolveUploadedImage = async (file) => {
  if (!file) return null;

  if (!isCloudinaryConfigured()) {
    return {
      public_id: file.filename,
      secure_url: file.fileUrl,
    };
  }

  const result = await cloudinary.v2.uploader.upload(file.path, {
    folder: 'blog',
  });

  await fs.rm(file.path, { force: true });

  return {
    public_id: result.public_id,
    secure_url: result.secure_url,
  };
};

// Create a new post
export const createPost = asyncHandler(async (req, res, next) => {
    // Expecting JSON body: { title, content, author, createdBy }
    const { title, content, author, description, category, createdBy } = req.body;

    if (!title || !content || !author || !category || !description || !createdBy) {
        return next(new AppError('All fields are required', 400));
    }

    // helper to create simple slugs
    const slugify = (s = '') => s.toString().trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

    // Resolve category to an ObjectId. Accept either an ObjectId string, an existing category name/slug,
    // or create a new Category when a name is provided.
    let categoryId;
    const isValidObjectId = mongoose.Types.ObjectId.isValid;

    if (category) {
        // If client sent an object with _id
        if (typeof category === 'object' && category._id) {
            categoryId = category._id;
        } else if (typeof category === 'string') {
            if (isValidObjectId(category)) {
                categoryId = category; // already an ObjectId string
            } else {
                // try to find category by name (case-insensitive) or slug
                const found = await Category.findOne({ $or: [{ name: new RegExp(`^${category}$`, 'i') }, { slug: category }] });
                if (found) {
                    categoryId = found._id;
                } else {
                    // create new category from provided string
                    const createdCat = await Category.create({ name: category, slug: slugify(category) });
                    categoryId = createdCat._id;
                }
            }
        }
    }

    if (!categoryId) {
        return next(new AppError('Valid category is required', 400));
    }

    const newPost = new Post({
        title,
        content,
        author,
        description,
        category: categoryId,
        createdBy
    });

    // Handle file upload if present
    if (req.file) {
        try {
            newPost.thumbnail = await resolveUploadedImage(req.file);
        } catch (error) {
            await fs.rm(req.file.path, { force: true });
            return next(new AppError(JSON.stringify(error) || 'File not uploaded, please try again', 400));
        }
    }

    await newPost.save();

    res.status(201).json({
        success: true,
        message: "Post created successfully",
        post: newPost,
    });
});

export const getPostbyid = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const blog = await Post.findById(id);

    if (!blog) {
        return next(new AppError('Post not found', 404));
    }

    // increment view count (best-effort)
    try {
        blog.views = (blog.views || 0) + 1;
        await blog.save();
    } catch (e) {
        // ignore view increment failures
    }

    // compute summary counts
    const commentsCount = Array.isArray(blog.comments) ? blog.comments.length : 0;

    res.status(200).json({
        success: true,
        message: "Post fetched successfully",
        blog,
        summary: {
            views: blog.views || 0,
            comments: commentsCount,
            likes: 0 // default, can be computed by likes collection if needed
        }
    });
});

// export const updatePost = asyncHandler(async (req, res, next) => {
//     console.log('Body:', req.body);


//     const { id } = req.params;
//     const updates = req.body;

//     console.log(updates);

//     //  if (req.file) {
//     //     updates.thumbnail = req.file.path; // or cloudinary URL after upload
//     // }


//     // Ensure request body has data
//     if (!updates || typeof updates !== 'object' || Object.keys(updates).length === 0) {
//         return res.status(400).json({ message: 'No update data provided.' });
//     }

//     const blogs = await Post.findByIdAndUpdate(
//         id,
//         { $set: updates },
//         { new: true, runValidators: true }
//     );

//     if (!blogs) {
//         return next(new AppError('Invalid Post id or Post not found.', 400));
//     }

//     res.status(200).json({
//         success: true,
//         message: 'Post updated successfully',
//         blogs,
//     });
// });



// const { id } = req.params;
// const { title, content, author, createdBy } = req.body;

// if(!title || !content || !author || !createdBy) {
//     res.status(400).json({
//         success: false,
//         message: "Please provide all required fields: (title, content, author, createdBy)",
//     })
// }

// const updatedPost = await Post.findByIdAndUpdate(id, {
//     title,
//     content,
//     author,
//     createdBy,
// }, { new: true });

// if (!updatedPost) {
//     return next(new AppError('Post not found or could not be updated', 404));
// }

// res.status(200).json({
//     success: true,
//     message: "Post updated successfully",
//     post: updatedPost,
// });
// });


export const updatePost = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const updates = req.body;

  // Handle category conversion
  if (updates.category) {
    let categoryId;
    const isValidObjectId = mongoose.Types.ObjectId.isValid;

    if (typeof updates.category === "object" && updates.category._id) {
      categoryId = updates.category._id;
    } else if (typeof updates.category === "string") {
      if (isValidObjectId(updates.category)) {
        categoryId = updates.category;
      } else {
        const slugify = (s = '') =>
          s.toString().trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

        const found = await Category.findOne({
          $or: [
            { name: new RegExp(`^${updates.category}$`, "i") },
            { slug: updates.category }
          ]
        });

        if (found) {
          categoryId = found._id;
        } else {
          const createdCat = await Category.create({
            name: updates.category,
            slug: slugify(updates.category),
          });
          categoryId = createdCat._id;
        }
      }
    }

    updates.category = categoryId;
  }

  if (req.file) {
    try {
      updates.thumbnail = await resolveUploadedImage(req.file);
    } catch (error) {
      await fs.rm(req.file.path, { force: true });
      return next(new AppError(JSON.stringify(error) || "File not uploaded, please try again", 400));
    }
  }

  const updatedPost = await Post.findByIdAndUpdate(id, { $set: updates }, { 
    new: true, 
    runValidators: true 
  });

  if (!updatedPost) {
    return next(new AppError("Invalid Post id or Post not found.", 400));
  }

  res.status(200).json({
    success: true,
    message: "Post updated successfully",
    post: updatedPost,
  });
});



export const deletePost = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const deletedPost = await Post.findByIdAndDelete(id);
    if (!deletedPost) {
        return next(new AppError('Post not found or could not be deleted', 404));
    }

    res.status(200).json({
        success: true,
        message: "Post deleted successfully",
        post: deletedPost,
    });
});

export const getCommentsForPost = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const blog = await Post.findById(id);

    if (!blog) {
        return next(new AppError('blog not found', 404));
    }

    // Assuming comments are stored in the post document
    res.status(200).json({
        success: true,
        message: "Comments fetched successfully",
        comments: blog.comments || [], // Return comments or an empty array if none exist
    });
});

export const addComment = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { comment, author } = req.body;

    if (!comment || !author) {
        return next(new AppError('Comment and author are required', 400));
    }

    const blog = await Post.findById(id);

    if (!blog) {
        return next(new AppError('Post not found', 404));
    }

    // console.log('Fetched post:', blog);
    // console.log('Type of comments:', typeof blog.comments, 'Is array?', Array.isArray(blog.comments));


    if (!Array.isArray(blog.comments)) {
        blog.comments = [];
    }

    // Assuming comments is an array in the post schema
    blog.comments.push({ comment, author });

    await blog.save();

    res.status(201).json({
        success: true,
        message: "Comment added successfully",
        comments: blog.comments,
    });
});

export const updateComment = asyncHandler(async (req, res, next) => {
    // Update a specific comment inside a post's comments array
    const { id } = req.params; // post id
    const { commentId, newComment, author } = req.body;

    if (!commentId || !newComment) {
        return next(new AppError('commentId and newComment are required', 400));
    }

    const post = await Post.findById(id);
    if (!post) {
        return next(new AppError('Post not found', 404));
    }

    // comments stored as subdocuments
    const comment = post.comments.id(commentId);
    if (!comment) {
        return next(new AppError('Comment not found', 404));
    }

    comment.comment = newComment;
    if (author) comment.author = author;

    await post.save();

    res.status(200).json({
        success: true,
        message: 'Comment updated successfully',
        comments: post.comments,
    });
});



// --------------------------------- see here blog -> previous posts update Comment---------------------------------

export const deleteComment = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { commentId } = req.body;

    if (!commentId) {
        return next(new AppError('Comment ID is required', 400));
    }

    const blog = await Post.findById(id);

    if (!blog) {
        return next(new AppError('Post not found', 404));
    }

    // Find the index of the comment to be deleted
    const commentIndex = blog.comments.findIndex(comment => comment._id.toString() === commentId);

    if (commentIndex === -1) {
        return next(new AppError('Comment not found', 404));
    }

    // Remove the comment from the array
    blog.comments.splice(commentIndex, 1);

    await blog.save();

    res.status(200).json({
        success: true,
        message: "Comment deleted successfully",
        comments: blog.comments,
    });
});


// -------------------------------------------------------------------------------------------------------------------------------------------------------

// import asyncHandler from "../middlewares/asyncHandler.middleware.js";

// import Post from "../models/blog.model.js"; // Import the Post model
// import fs from "fs/promises";
// import path from "path";
// import cloudinary from "cloudinary";
// import AppError from "../utils/AppError.js";

// // -------------------- Get All Posts --------------------
// export const getAllPosts = asyncHandler(async (req, res, next) => {
//   const posts = await Post.find({}).sort({ createdAt: -1 });

//   res.status(200).json({
//     success: true,
//     message: "All posts fetched successfully",
//     posts, // ✅ renamed from posts → blogs
//   });
// });

// // -------------------- Create Post --------------------
// export const createPost = asyncHandler(async (req, res, next) => {
//     console.log(req.body);
//   if (!req.body) {
//     return next(new AppError("Post data is required", 404));
//   }

//   const { title, content, author, category, createdBy } = req.body;

//   if (!title || !content || !author || !createdBy) {
//     return next(new AppError("All fields are required", 400));
//   }

//   const newPost = await Post.create({
//     title,
//     content,
//     author,
//     category,
//     createdBy,

//   });

//   // File upload handling
//   if (req.file) {
//     try {
//       const result = await cloudinary.v2.uploader.upload(req.file.path, {
//         folder: "blog",
//       });

//       if (result) {
//         newBlog.thumbnail = {
//           public_id: result.public_id,
//           secure_url: result.secure_url,
//         };
//       }

//       await fs.rm(`uploads/${req.file.filename}`);
//     } catch (error) {
//       for (const file of await fs.readdir("uploads/")) {
//         await fs.unlink(path.join("uploads/", file));
//       }
//       return next(
//         new AppError(
//           JSON.stringify(error) || "File not uploaded, please try again",
//           400
//         )
//       );
//     }
//   }

//   await newPost.save();

//   res.status(201).json({
//     success: true,
//     message: "Post created successfully",
//     post: newPost, // ✅ use `post` key consistently
//   });
// });

// // -------------------- Get Post By ID --------------------
// export const getPostbyid = asyncHandler(async (req, res, next) => {
//   const { id } = req.params;
//   const post = await Post.findById(id);

//   if (!post) {
//     return next(new AppError("Post not found", 404));
//   }

//   res.status(200).json({
//     success: true,
//     message: "Post fetched successfully",
//     post,
//   });
// });

// // -------------------- Update Post --------------------
// export const updatePost = asyncHandler(async (req, res, next) => {
//   const { id } = req.params;
//   const updates = req.body;

//   if (
//     !updates ||
//     typeof updates !== "object" ||
//     Object.keys(updates).length === 0
//   ) {
//     return res.status(400).json({ message: "No update data provided." });
//   }

//   const blog = await Post.findByIdAndUpdate(id, updates, {
//     new: true,
//     runValidators: true,
//   });

//   if (!blog) {
//     return next(new AppError("Invalid Post id or Post not found.", 400));
//   }

//   res.status(200).json({
//     success: true,
//     message: "Post updated successfully",
//     blog,
//   });
// });

// // -------------------- Delete Post --------------------
// export const deletePost = asyncHandler(async (req, res, next) => {
//   const { id } = req.params;

//   const deletedBlog = await Post.findByIdAndDelete(id);

//   if (!deletedBlog) {
//     return next(new AppError("Post not found or could not be deleted", 404));
//   }

//   res.status(200).json({
//     success: true,
//     message: "Post deleted successfully",
//     blog: deletedBlog,
//   });
// });

// // -------------------- Get Comments --------------------
// export const getCommentsForPost = asyncHandler(async (req, res, next) => {
//   const { id } = req.params;
//   const blog = await Post.findById(id);

//   if (!blog) {
//     return next(new AppError("Blog not found", 404));
//   }

//   res.status(200).json({
//     success: true,
//     message: "Comments fetched successfully",
//     comments: blog.comments || [],
//   });
// });

// // -------------------- Add Comment --------------------
// export const addComment = asyncHandler(async (req, res, next) => {
//   const { id } = req.params;
//   const { comment, author } = req.body;

//   if (!comment || !author) {
//     return next(new AppError("Comment and author are required", 400));
//   }

//   const blog = await Post.findById(id);

//   if (!blog) {
//     return next(new AppError("Post not found", 404));
//   }

//   if (!Array.isArray(blog.comments)) {
//     blog.comments = [];
//   }

//   blog.comments.push({ comment, author });

//   await blog.save();

//   res.status(201).json({
//     success: true,
//     message: "Comment added successfully",
//     comments: blog.comments,
//   });
// });

// // -------------------- Update Comment --------------------
// export const updateComment = asyncHandler(async (req, res, next) => {
//   const { id } = req.params; // postId
//   const { commentId, newComment } = req.body;

//   if (!commentId || !newComment) {
//     return next(new AppError("Comment ID and new text are required", 400));
//   }

//   const blog = await Post.findById(id);
//   if (!blog) {
//     return next(new AppError("Post not found", 404));
//   }

//   const comment = blog.comments.id(commentId);
//   if (!comment) {
//     return next(new AppError("Comment not found", 404));
//   }

//   comment.comment = newComment;
//   await blog.save();

//   res.status(200).json({
//     success: true,
//     message: "Comment updated successfully",
//     comments: blog.comments,
//   });
// });

// // -------------------- Delete Comment --------------------
// export const deleteComment = asyncHandler(async (req, res, next) => {
//   const { id } = req.params; // postId
//   const { commentId } = req.body;

//   if (!commentId) {
//     return next(new AppError("Comment ID is required", 400));
//   }

//   const blog = await Post.findById(id);
//   if (!blog) {
//     return next(new AppError("Post not found", 404));
//   }

//   const comment = blog.comments.id(commentId);
//   if (!comment) {
//     return next(new AppError("Comment not found", 404));
//   }

//   comment.remove();
//   await blog.save();

//   res.status(200).json({
//     success: true,
//     message: "Comment deleted successfully",
//     comments: blog.comments,
//   });
// });

