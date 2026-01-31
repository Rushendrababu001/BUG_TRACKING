import React, { useState, useEffect } from "react";
import { FiSend, FiTrash2, FiLoader } from "react-icons/fi";
import { getCommentsByBug, addCommentToBug, deleteComment } from "../../services/commentService";
import { formatDateTime } from "../../utils";

export const CommentsSection = ({ bugId, userId, userName, userAvatar }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadComments();
  }, [bugId]);

  const loadComments = async () => {
    setLoading(true);
    try {
      const bugComments = await getCommentsByBug(bugId);
      setComments(bugComments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (error) {
      console.error("Error loading comments:", error);
    }
    setLoading(false);
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      await addCommentToBug(bugId, {
        content: newComment,
        userId,
        userName,
        userAvatar,
      });
      setNewComment("");
      await loadComments();
    } catch (error) {
      console.error("Error adding comment:", error);
    }
    setSubmitting(false);
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm("Delete this comment?")) return;
    try {
      await deleteComment(bugId, commentId);
      await loadComments();
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-slate-900">Comments ({comments.length})</h4>

      {loading ? (
        <div className="text-center py-4 text-slate-400">Loading comments...</div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-slate-50 rounded-lg p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{comment.userName}</p>
                  <p className="text-xs text-slate-500">{formatDateTime(comment.createdAt)}</p>
                </div>
                {comment.userId === userId && (
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    className="text-slate-400 hover:text-red-600 p-1"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <p className="text-sm text-slate-700 mt-2">{comment.content}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <input
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleAddComment()}
          placeholder="Add a comment..."
          className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        <button
          onClick={handleAddComment}
          disabled={!newComment.trim() || submitting}
          className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
        >
          {submitting ? <FiLoader className="animate-spin" /> : <FiSend />}
        </button>
      </div>
    </div>
  );
};

export default CommentsSection;
