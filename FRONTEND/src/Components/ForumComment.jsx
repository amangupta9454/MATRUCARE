import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Reply, Trash2, ChevronDown, ChevronUp, Send } from 'lucide-react';

/**
 * ForumComment — renders one comment with optional nested replies.
 * Props: comment, postId, allComments ([]), onDelete (fn), onRefresh (fn), depth (0=top)
 */
const ForumComment = ({ comment, postId, allComments = [], onDelete, onRefresh, depth = 0 }) => {
    const { user, token } = useContext(AuthContext);
    const [showReplies, setShowReplies] = useState(true);
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [saving, setSaving] = useState(false);

    const authHeader = { Authorization: `Bearer ${token}` };

    // Direct children of this comment (use toString() to handle ObjectId vs string)
    const replies = allComments.filter(c =>
        c.parentComment && c.parentComment.toString() === comment._id.toString()
    );

    const submitReply = async () => {
        if (!replyText.trim()) return;
        setSaving(true);
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/forum/${postId}/comments`,
                { content: replyText, parentComment: comment._id },
                { headers: authHeader });
            setReplyText(''); setShowReplyForm(false);
            onRefresh?.();
        } catch { } finally { setSaving(false); }
    };

    const canDelete = user && (user._id === comment.author?._id || user.role === 'Admin');

    return (
        <div className={`${depth > 0 ? 'ml-6 pl-4 border-l border-white/10' : ''}`}>
            <div className="py-3">
                <div className="flex items-start gap-3">
                    <img
                        src={comment.author?.profileImage?.url ||
                            `https://api.dicebear.com/7.x/initials/svg?seed=${comment.author?.name}`}
                        alt={comment.author?.name}
                        className="w-8 h-8 rounded-full object-cover border border-white/10 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-sm font-bold text-white">{comment.author?.name}</span>
                            {comment.author?.role && (
                                <span className="text-xs text-gray-600 bg-white/5 px-1.5 py-0.5 rounded">
                                    {comment.author.role}
                                </span>
                            )}
                            <span className="text-xs text-gray-600 ml-auto">
                                {new Date(comment.createdAt).toLocaleDateString('en-IN')}
                            </span>
                        </div>
                        <p className="text-sm text-gray-300 leading-relaxed">{comment.content}</p>

                        {/* Actions */}
                        <div className="flex items-center gap-3 mt-1.5">
                            {user && (
                                <button onClick={() => setShowReplyForm(r => !r)}
                                    className="text-xs text-gray-500 hover:text-indigo-400 flex items-center gap-1 transition-colors">
                                    <Reply size={11} /> Reply
                                </button>
                            )}
                            {replies.length > 0 && (
                                <button onClick={() => setShowReplies(r => !r)}
                                    className="text-xs text-gray-500 hover:text-white flex items-center gap-1 transition-colors">
                                    {showReplies ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                                    {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
                                </button>
                            )}
                            {canDelete && (
                                <button onClick={() => onDelete?.(comment._id)}
                                    className="text-xs text-gray-500 hover:text-red-400 flex items-center gap-1 transition-colors ml-auto">
                                    <Trash2 size={11} /> Delete
                                </button>
                            )}
                        </div>

                        {/* Reply form */}
                        <AnimatePresence>
                            {showReplyForm && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }} className="mt-2 flex gap-2">
                                    <input type="text" value={replyText} onChange={e => setReplyText(e.target.value)}
                                        placeholder="Write a reply…"
                                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitReply(); } }}
                                        className="dark-input text-xs py-1.5 flex-1" />
                                    <button onClick={submitReply} disabled={saving || !replyText.trim()}
                                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-xs disabled:opacity-50 transition-all">
                                        <Send size={12} />
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Nested replies */}
            {showReplies && replies.map(r => (
                <ForumComment key={r._id} comment={r} postId={postId} allComments={allComments}
                    onDelete={onDelete} onRefresh={onRefresh} depth={depth + 1} />
            ))}
        </div>
    );
};

export default ForumComment;
