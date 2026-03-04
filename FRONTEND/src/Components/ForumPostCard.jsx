import React from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Pin, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CATEGORY_COLORS = {
    'Pregnancy': 'bg-pink-500/20   border-pink-500/30   text-pink-400',
    'Women Health': 'bg-rose-500/20   border-rose-500/30   text-rose-400',
    'Men Health': 'bg-blue-500/20   border-blue-500/30   text-blue-400',
    'Child Care': 'bg-green-500/20  border-green-500/30  text-green-400',
    'Mental Health': 'bg-purple-500/20 border-purple-500/30 text-purple-400',
    'General Discussion': 'bg-gray-500/20   border-gray-500/30   text-gray-400',
};

/**
 * ForumPostCard — compact card for forum post list.
 * Props: post, onLike (fn), alreadyLiked (bool), index
 */
const ForumPostCard = ({ post, onLike, alreadyLiked, index = 0 }) => {
    const navigate = useNavigate();
    const catStyle = CATEGORY_COLORS[post.category] || CATEGORY_COLORS['General Discussion'];

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
            className={`glass-card p-5 cursor-pointer hover:border-indigo-500/20 transition-all border ${post.isPinned ? 'border-yellow-500/30' : 'border-white/10'}`}
            onClick={() => navigate(`/forum/${post._id}`)}
        >
            <div className="flex items-start gap-4">
                <img
                    src={post.author?.profileImage?.url || `https://api.dicebear.com/7.x/initials/svg?seed=${post.author?.name}`}
                    alt={post.author?.name}
                    className="w-10 h-10 rounded-full object-cover border border-white/10 shrink-0"
                    onClick={e => e.stopPropagation()}
                />
                <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                        {post.isPinned && (
                            <span className="text-yellow-400 flex items-center gap-1 text-xs font-bold">
                                <Pin size={10} /> Pinned
                            </span>
                        )}
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${catStyle}`}>
                            <Tag size={9} className="inline mr-1" />{post.category}
                        </span>
                    </div>

                    <h3 className="font-extrabold text-white text-base leading-snug line-clamp-2">{post.title}</h3>
                    <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{post.content}</p>

                    <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-gray-600">
                        <span>{post.author?.name}</span>
                        <span>{new Date(post.createdAt).toLocaleDateString('en-IN')}</span>

                        <button
                            onClick={e => { e.stopPropagation(); onLike?.(post._id); }}
                            className={`flex items-center gap-1 transition-colors ${alreadyLiked ? 'text-red-400' : 'hover:text-red-400'}`}
                        >
                            <Heart size={13} className={alreadyLiked ? 'fill-red-400' : ''} /> {post.likes?.length || 0}
                        </button>
                        <span className="flex items-center gap-1">
                            <MessageCircle size={12} /> {post.commentCount || 0}
                        </span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default ForumPostCard;
