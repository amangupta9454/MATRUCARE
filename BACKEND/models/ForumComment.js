const mongoose = require('mongoose');

const forumCommentSchema = new mongoose.Schema({
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'ForumPost', required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, trim: true, maxlength: 1000 },
    parentComment: { type: mongoose.Schema.Types.ObjectId, ref: 'ForumComment', default: null }, // null = top-level
}, { timestamps: true });

module.exports = mongoose.model('ForumComment', forumCommentSchema);
