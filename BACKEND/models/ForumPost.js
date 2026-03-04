const mongoose = require('mongoose');

const CATEGORIES = ['Pregnancy', 'Women Health', 'Men Health', 'Child Care', 'Mental Health', 'General Discussion'];

const forumPostSchema = new mongoose.Schema({
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    content: { type: String, required: true, trim: true },
    category: { type: String, enum: CATEGORIES, default: 'General Discussion' },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isPinned: { type: Boolean, default: false },
    isBanned: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('ForumPost', forumPostSchema);
