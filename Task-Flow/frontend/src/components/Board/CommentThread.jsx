import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import api from '../../services/api';
import { Send, Trash2, MessageSquare, Sparkles } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const CommentThread = ({ taskId, projectId }) => {
  const { user } = useAuth();
  const { socket, typingInfo, emitTyping } = useSocket();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const bottomRef = useRef(null);

  // Fetch comments
  useEffect(() => {
    let isMounted = true;
    const fetchComments = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/comments/task/${taskId}`);
        if (isMounted) setComments(res.data);
      } catch (error) {
        console.error('Failed to fetch comments:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchComments();

    return () => {
      isMounted = false;
    };
  }, [taskId]);

  // Real-time socket events for comments
  useEffect(() => {
    if (!socket) return;

    const handleCommentAdded = (payload) => {
      if (payload.taskId === taskId) {
        setComments((prev) => {
          if (prev.some((c) => c.id === payload.comment.id)) return prev;
          return [...prev, payload.comment];
        });
      }
    };

    const handleCommentDeleted = (payload) => {
      if (payload.taskId === taskId) {
        setComments((prev) => prev.filter((c) => c.id !== payload.commentId));
      }
    };

    socket.on('comment:added', handleCommentAdded);
    socket.on('comment:deleted', handleCommentDeleted);

    return () => {
      socket.off('comment:added', handleCommentAdded);
      socket.off('comment:deleted', handleCommentDeleted);
    };
  }, [socket, taskId]);

  // Scroll to bottom when new comment arrives
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);

  const handleInputChange = (e) => {
    setNewComment(e.target.value);
    emitTyping(taskId);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;

    try {
      setSubmitting(true);
      const res = await api.post(`/comments/task/${taskId}`, {
        content: newComment.trim()
      });
      // The socket event will broadcast or we append immediately
      setComments((prev) => {
        if (prev.some((c) => c.id === res.data.id)) return prev;
        return [...prev, res.data];
      });
      setNewComment('');
    } catch (error) {
      console.error('Failed to post comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await api.delete(`/comments/${commentId}`);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  const isSomeoneTyping = typingInfo && typingInfo.taskId === taskId && typingInfo.userName !== user?.name;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-800 text-sm font-semibold text-slate-300">
        <MessageSquare className="w-4 h-4 text-indigo-400" />
        <span>Activity & Discussion ({comments.length})</span>
      </div>

      {/* Comments List */}
      <div className="space-y-4 max-h-72 overflow-y-auto pr-2 kanban-column-scroll mb-4 flex-1">
        {loading ? (
          <div className="text-center py-6 text-xs text-slate-500">Loading comments...</div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 bg-slate-800/40 rounded-xl border border-dashed border-slate-800 text-xs text-slate-400">
            No comments yet. Start the team conversation below!
          </div>
        ) : (
          comments.map((comment) => {
            const isOwner = comment.userId === user?.id;
            const timeAgo = formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true });

            return (
              <div
                key={comment.id}
                className="flex items-start gap-3 group/comment bg-slate-800/60 p-3 rounded-xl border border-slate-700/50"
              >
                <img
                  src={
                    comment.user?.avatarUrl ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.user?.name}`
                  }
                  alt={comment.user?.name}
                  className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-700 flex-shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-200">
                        {comment.user?.name}
                      </span>
                      <span className="text-[10px] text-slate-500">{timeAgo}</span>
                    </div>

                    {isOwner && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="opacity-0 group-hover/comment:opacity-100 text-slate-500 hover:text-rose-400 p-1 transition"
                        title="Delete comment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {comment.content}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Typing notification indicator */}
      {isSomeoneTyping && (
        <div className="text-xs text-indigo-400 flex items-center gap-1.5 mb-2 animate-pulse">
          <Sparkles className="w-3 h-3" />
          <span>{typingInfo.userName} is typing a comment...</span>
        </div>
      )}

      {/* Comment Form */}
      <form onSubmit={handleAddComment} className="relative">
        <textarea
          value={newComment}
          onChange={handleInputChange}
          placeholder="Write a comment... (Enter to submit)"
          rows={2}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleAddComment(e);
            }
          }}
          className="w-full text-xs bg-slate-800/80 border border-slate-700 rounded-xl p-3 pr-12 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition resize-none"
        />
        <button
          type="submit"
          disabled={!newComment.trim() || submitting}
          className="absolute right-2.5 bottom-3.5 p-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white rounded-lg transition disabled:cursor-not-allowed shadow-md shadow-indigo-600/30"
          title="Send comment"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};

export default CommentThread;
