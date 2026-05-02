import React, { useEffect, useState, useCallback, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchComments, addComment, deleteComment } from "../../Redux/commentSlice";
import UserAvatar from '../Common/UserAvatar';

export default function CommentList({ blogId }) {
  const dispatch = useDispatch();
  const store = useSelector((state) => state.comments || {});
  const auth = useSelector((s) => s.auth || {});
  // prefer API-shaped comments, fall back to legacy list
  const flatComments = store.comments && store.comments.length ? store.comments : (store.list || []);
  const loading = store.loading;

  const [replyTo, setReplyTo] = useState(null);
  const [replyTextMap, setReplyTextMap] = useState({});
  const [openReplies, setOpenReplies] = useState({});
  const inputRef = useRef(null);

  useEffect(() => {
    if (blogId) dispatch(fetchComments(blogId));
  }, [blogId, dispatch]);

  const buildTree = useCallback((items) => {
    if (!items || items.length === 0) return [];
    const map = new Map();
    const roots = [];
    // normalize ids to strings to avoid ObjectId vs string mismatches
    items.forEach((it) => {
      const id = String(it._id || it.id);
      map.set(id, { ...it, _id: id, replies: [] });
    });
    items.forEach((it) => {
      const id = String(it._id || it.id);
      const parentId = it.parentId ? String(it.parentId) : (it.parent ? String(it.parent) : null);
      if (parentId && map.has(parentId)) {
        map.get(parentId).replies.push(map.get(id));
      } else {
        roots.push(map.get(id));
      }
    });
    return roots;
  }, []);

  const tree = buildTree(flatComments);

  const submitReply = async (parentId, text) => {
  if (!text.trim() || !blogId) return;
  try {
    await dispatch(addComment({ blogId, comment: text, parentId })).unwrap();
    await dispatch(fetchComments(blogId));
    setReplyTo(null);
    setOpenReplies((s) => ({ ...s, [String(parentId)]: true }));
  } catch (err) {
    console.error("Reply failed:", err);
  }
};


  // If replyTo changes to a new id, focus the input
  useEffect(() => {
    if (replyTo && inputRef.current) {
      inputRef.current.focus();
    }
  }, [replyTo]);

  const ReplyInput = ({ parentId, compact = true }) => {
  const [text, setText] = useState("");
  const localRef = useRef(null);

  useEffect(() => {
    if (replyTo === parentId && localRef.current) {
      localRef.current.focus();
    }
  }, [replyTo, parentId]);

  const handleSubmit = () => {
    if (!text.trim()) return;
    submitReply(parentId, text);
    setText(""); // clear input after submit
  };

  return (
    <div className={`mt-2 ${compact ? "flex items-start gap-2" : "flex gap-2"}`}>
      <input
        ref={localRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Add a public reply..."
        className="flex-1 px-3 py-2 rounded bg-white/5 text-sm"
      />
      <div className="flex gap-2">
        <button
          onClick={handleSubmit}
          className="px-3 py-1 rounded bg-indigo-600 text-black text-sm"
          disabled={loading}
        >
          Reply
        </button>
        <button
          onClick={() => setReplyTo(null)}
          className="px-3 py-1 rounded bg-transparent border border-white/10 text-sm"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

  const CommentMeta = ({ node }) => {
    return (
      <div className="flex items-center gap-3">
        <UserAvatar user={node.user} size={32} />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="font-medium text-sm">{node.user?.fullName || node.user?.name || node.user?.role || 'Anonymous'}</div>
            <div className="text-xs text-zinc-400">{new Date(node.createdAt || Date.now()).toLocaleString()}</div>
          </div>
        </div>
      </div>
    );
  };

  const CommentNode = ({ node, depth = 0 }) => {
    const idKey = String(node._id || node.id);
    const repliesCount = node.replies?.length || 0;
    const isOpen = !!openReplies[idKey];
    const currentUserId = auth.data?._id || auth.data?.id || null;
    const role = auth.data?.role || auth.role || '';
    return (
      <div style={{ marginLeft: depth ? 12 : 0 }}>
        <div className="p-3 bg-white/5 rounded mb-2">
          <CommentMeta node={node} />
          <div className="mt-2 text-sm text-zinc-200" dangerouslySetInnerHTML={{ __html: node.comment || node.text || '' }} />

          <div className="mt-3 flex items-center gap-3">
            <button onClick={() => setReplyTo(idKey)} className="text-sm text-indigo-300">Reply</button>
            {/* Always render Delete button for each comment. Confirm before deleting. */}
            <button
              onClick={async () => {
                // confirmation prompt
                // eslint-disable-next-line no-restricted-globals
                const ok = confirm('Are you sure you want to delete this comment? This action cannot be undone.');
                if (!ok) return;
                try {
                  await dispatch(deleteComment({ commentId: idKey })).unwrap();
                  // refresh comments for this blog
                  if (blogId) await dispatch(fetchComments(blogId));
                } catch (err) {
                  console.error('Delete comment failed', err);
                }
              }}
              className="text-sm text-red-400"
            >
              Delete
            </button>
            {repliesCount > 0 && (
              <button
                onClick={() => setOpenReplies((s) => ({ ...s, [idKey]: !isOpen }))}
                className="text-sm text-zinc-400"
              >
                {isOpen ? 'Hide replies' : `View ${repliesCount} repl${repliesCount > 1 ? 'ies' : 'y'}`}
              </button>
            )}
          </div>

          {/* Inline compact reply input, like YouTube */}
          {replyTo === idKey && <ReplyInput parentId={idKey} compact />}
        </div>

        {/* Replies section (collapsed by default) */}
        {repliesCount > 0 && isOpen && (
          <div className="pl-4 space-y-2">
            {node.replies.map((r) => (
              <CommentNode key={String(r._id || r.id)} node={r} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  if (!flatComments || flatComments.length === 0) return <div className="text-zinc-400">No comments yet.</div>;

  return (
    <div className="space-y-3">
      {tree.map((n) => (
        <CommentNode key={n._id || n.id} node={n} />
      ))}
    </div>
  );
}


