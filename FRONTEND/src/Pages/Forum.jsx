import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../Components/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageSquare, PenSquare, Search, Filter, X, Send, Loader2,
    Tag, ArrowLeft, Heart, MessageCircle, Trash2, Pin, Shield
} from 'lucide-react';
import ForumPostCard from '../Components/ForumPostCard';
import ForumComment from '../Components/ForumComment';
import { useParams } from 'react-router-dom';

const CATEGORIES = ['All', 'Pregnancy', 'Women Health', 'Men Health', 'Child Care', 'Mental Health', 'General Discussion'];

const Forum = () => {
    const { user, token } = useContext(AuthContext);
    const { id: routePostId } = useParams(); // id from /forum/:id route
    const [posts, setPosts] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [category, setCategory] = useState('All');
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');

    // Single post view
    const [openPost, setOpenPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [postLoading, setPostLoading] = useState(false);

    // Create post modal
    const [showCreate, setShowCreate] = useState(false);
    const [form, setForm] = useState({ title: '', content: '', category: 'General Discussion' });
    const [saving, setSaving] = useState(false);

    // Comment input
    const [commentText, setCommentText] = useState('');
    const [commentSaving, setCommentSaving] = useState(false);

    const authHeader = { Authorization: `Bearer ${token}` };

    const fetchPosts = async (p = 1, cat = category, q = search) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: p, ...(cat !== 'All' && { category: cat }), ...(q && { q }) });
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/forum?${params}`);
            setPosts(data.posts); setTotal(data.total); setPage(p);
        } catch { } finally { setLoading(false); }
    };

    useEffect(() => { fetchPosts(); }, []);

    // If navigated to /forum/:id directly, open that post
    useEffect(() => {
        if (routePostId) openSinglePost(routePostId);
    }, [routePostId]);

    const handleCategory = cat => { setCategory(cat); fetchPosts(1, cat, search); };
    const handleSearch = () => { setSearch(searchInput); fetchPosts(1, category, searchInput); };

    const openSinglePost = async (postId) => {
        setOpenPost(null); setPostLoading(true);
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/forum/${postId}`);
            setOpenPost(data.post); setComments(data.comments);
        } catch { } finally { setPostLoading(false); }
    };

    const handleLike = async (postId) => {
        if (!token) return;
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/forum/${postId}/like`, {}, { headers: authHeader });
            fetchPosts(page);
            if (openPost?._id === postId) openSinglePost(postId);
        } catch { }
    };

    const handleCreatePost = async e => {
        e.preventDefault(); setSaving(true);
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/forum`, form, { headers: authHeader });
            setShowCreate(false); setForm({ title: '', content: '', category: 'General Discussion' });
            fetchPosts(1);
        } catch { } finally { setSaving(false); }
    };

    const handleAddComment = async () => {
        if (!commentText.trim() || !openPost) return;
        setCommentSaving(true);
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/forum/${openPost._id}/comments`,
                { content: commentText }, { headers: authHeader });
            setCommentText('');
            openSinglePost(openPost._id);
        } catch { } finally { setCommentSaving(false); }
    };

    const handleDeleteComment = async (commentId) => {
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/forum/comments/${commentId}`, { headers: authHeader });
            openSinglePost(openPost._id);
        } catch { }
    };

    const handleDeletePost = async (postId) => {
        if (!window.confirm('Delete this post?')) return;
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/forum/${postId}`, { headers: authHeader });
            setOpenPost(null); fetchPosts(page);
        } catch { }
    };

    const handlePin = async (postId) => {
        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/forum/${postId}/pin`, {}, { headers: authHeader });
            fetchPosts(page); if (openPost?._id === postId) openSinglePost(postId);
        } catch { }
    };

    const handleBan = async (postId) => {
        if (!window.confirm('Ban this post? It will be hidden from all users.')) return;
        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/forum/${postId}/ban`, {}, { headers: authHeader });
            setOpenPost(null); fetchPosts(page);
        } catch { }
    };

    const PAGES = Math.ceil(total / 15);
    const topLevelComments = comments.filter(c => !c.parentComment);
    const alreadyLiked = (post) => post.likes?.some(l => l === user?._id || l?._id === user?._id);

    // ── Single Post View ──────────────────────────────────────────────────────
    if (postLoading) return (
        <div className="flex justify-center items-center h-[60vh]">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500" />
        </div>
    );

    if (openPost) return (
        <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
            <button onClick={() => setOpenPost(null)} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-bold">
                <ArrowLeft size={16} /> Back to Forum
            </button>

            <div className="glass-card p-6 border border-white/10">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full border bg-indigo-500/10 border-indigo-500/30 text-indigo-400 mb-2 inline-block">
                            {openPost.category}
                        </span>
                        <h1 className="text-2xl font-extrabold text-white mt-1">{openPost.title}</h1>
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                            <img src={openPost.author?.profileImage?.url || `https://api.dicebear.com/7.x/initials/svg?seed=${openPost.author?.name}`}
                                className="w-7 h-7 rounded-full border border-white/10" alt="" />
                            <span>{openPost.author?.name}</span>
                            <span>{new Date(openPost.createdAt).toLocaleDateString('en-IN')}</span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-1 items-end shrink-0">
                        {user?._id === openPost.author?._id && (
                            <button onClick={() => handleDeletePost(openPost._id)}
                                className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"><Trash2 size={11} /> Delete</button>
                        )}
                        {user?.role === 'Admin' && (<>
                            <button onClick={() => handlePin(openPost._id)}
                                className="text-xs text-yellow-400 hover:text-yellow-300 flex items-center gap-1"><Pin size={11} /> {openPost.isPinned ? 'Unpin' : 'Pin'}</button>
                            <button onClick={() => handleBan(openPost._id)}
                                className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"><Shield size={11} /> Ban Post</button>
                        </>)}
                    </div>
                </div>

                <p className="text-gray-300 mt-4 leading-relaxed whitespace-pre-wrap">{openPost.content}</p>

                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/10">
                    <button onClick={() => handleLike(openPost._id)}
                        className={`flex items-center gap-1.5 text-sm transition-colors ${alreadyLiked(openPost) ? 'text-red-400' : 'text-gray-500 hover:text-red-400'}`}>
                        <Heart size={15} className={alreadyLiked(openPost) ? 'fill-red-400' : ''} /> {openPost.likes?.length || 0} Likes
                    </button>
                    <span className="text-sm text-gray-500 flex items-center gap-1.5">
                        <MessageCircle size={15} /> {comments.length} Comments
                    </span>
                </div>
            </div>

            {/* Comments */}
            <div className="glass-card p-6 border border-white/10">
                <h2 className="font-extrabold text-white mb-4 flex items-center gap-2">
                    <MessageCircle size={16} className="text-indigo-400" /> Comments
                </h2>

                {user && (
                    <div className="flex gap-3 mb-5">
                        <img src={user.profileImage?.url || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`}
                            className="w-8 h-8 rounded-full border border-white/10 shrink-0" alt="" />
                        <div className="flex gap-2 flex-1">
                            <input type="text" value={commentText}
                                onChange={e => setCommentText(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') handleAddComment(); }}
                                placeholder="Add a comment…"
                                className="dark-input flex-1 text-sm py-2" />
                            <button onClick={handleAddComment} disabled={commentSaving || !commentText.trim()}
                                className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-50 transition-all">
                                {commentSaving ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                            </button>
                        </div>
                    </div>
                )}

                {topLevelComments.length === 0 ? (
                    <p className="text-gray-600 text-sm">No comments yet — be the first to reply!</p>
                ) : (
                    <div className="divide-y divide-white/5">
                        {topLevelComments.map(c => (
                            <ForumComment key={c._id} comment={c} postId={openPost._id}
                                allComments={comments} onDelete={handleDeleteComment}
                                onRefresh={() => openSinglePost(openPost._id)} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );

    // ── Post List View ─────────────────────────────────────────────────────────
    return (
        <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
                        <div className="bg-indigo-500/20 border border-indigo-500/30 p-2.5 rounded-xl">
                            <MessageSquare size={22} className="text-indigo-400" />
                        </div>
                        Community Forum
                    </h1>
                    <p className="text-gray-500 mt-1 text-sm">Discuss health topics with other MaaCare members</p>
                </div>
                {user && (
                    <button onClick={() => setShowCreate(true)}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all text-sm">
                        <PenSquare size={15} /> New Post
                    </button>
                )}
            </div>

            {/* Search */}
            <div className="flex gap-2">
                <input value={searchInput} onChange={e => setSearchInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
                    placeholder="Search posts…" className="dark-input flex-1 text-sm" />
                <button onClick={handleSearch}
                    className="bg-white/10 hover:bg-white/20 border border-white/10 text-white px-4 py-2 rounded-xl transition-all">
                    <Search size={16} />
                </button>
                {search && (
                    <button onClick={() => { setSearchInput(''); setSearch(''); fetchPosts(1, category, ''); }}
                        className="text-gray-400 hover:text-white px-3 py-2 rounded-xl transition-colors">
                        <X size={16} />
                    </button>
                )}
            </div>

            {/* Category pills */}
            <div className="flex gap-2 flex-wrap">
                {CATEGORIES.map(cat => (
                    <button key={cat} onClick={() => handleCategory(cat)}
                        className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all border ${category === cat
                            ? 'bg-indigo-600 border-indigo-500 text-white'
                            : 'bg-white/5 border-white/10 text-gray-500 hover:text-white'}`}>
                        {cat}
                    </button>
                ))}
            </div>

            {/* Post list */}
            {loading ? (
                <div className="flex justify-center py-14">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
                </div>
            ) : posts.length === 0 ? (
                <div className="glass-card p-14 text-center">
                    <MessageSquare className="mx-auto h-12 w-12 text-gray-700 mb-3" />
                    <p className="text-white font-bold">No posts yet</p>
                    <p className="text-sm text-gray-500 mt-1">Be the first to start a discussion!</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {posts.map((p, i) => (
                        <ForumPostCard key={p._id} post={p} index={i}
                            onLike={handleLike} alreadyLiked={alreadyLiked(p)} />
                    ))}
                </div>
            )}

            {/* Pagination */}
            {PAGES > 1 && (
                <div className="flex justify-center gap-2">
                    {Array.from({ length: PAGES }, (_, i) => i + 1).map(p => (
                        <button key={p} onClick={() => fetchPosts(p)} className={`w-8 h-8 rounded-lg text-sm font-bold transition-all ${p === page ? 'bg-indigo-600 text-white' : 'bg-white/5 text-gray-500 hover:text-white'}`}>{p}</button>
                    ))}
                </div>
            )}

            {/* Create post modal */}
            <AnimatePresence>
                {showCreate && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }} className="glass-card-elevated p-8 w-full max-w-lg">
                            <div className="flex justify-between items-center mb-5">
                                <h2 className="text-xl font-extrabold text-white">Create Post</h2>
                                <button onClick={() => setShowCreate(false)} className="text-gray-500 hover:text-white"><X size={18} /></button>
                            </div>
                            <form onSubmit={handleCreatePost} className="space-y-4">
                                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="dark-input text-sm">
                                    {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
                                </select>
                                <input required placeholder="Title *" value={form.title}
                                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="dark-input text-sm" />
                                <textarea required rows="5" placeholder="What's on your mind?..." value={form.content}
                                    onChange={e => setForm(f => ({ ...f, content: e.target.value }))} className="dark-input resize-none text-sm" />
                                <div className="flex gap-3">
                                    <button type="button" onClick={() => setShowCreate(false)}
                                        className="flex-1 py-3 rounded-xl font-bold text-gray-400 hover:bg-white/10 transition-colors">Cancel</button>
                                    <button type="submit" disabled={saving}
                                        className="flex-1 py-3 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-70 transition-colors flex items-center justify-center gap-2">
                                        {saving ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                                        {saving ? 'Posting…' : 'Post'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Forum;
