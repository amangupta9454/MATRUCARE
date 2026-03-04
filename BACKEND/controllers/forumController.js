const ForumPost = require('../models/ForumPost');
const ForumComment = require('../models/ForumComment');
const sendEmail = require('../config/nodemailer');

const POSTS_PER_PAGE = 15;

// ── GET /api/forum  (public, paginated) ───────────────────────────────────────
exports.getPosts = async (req, res) => {
    try {
        const { category, page = 1, q } = req.query;
        const filter = { isBanned: false };
        if (category && category !== 'All') filter.category = category;
        if (q) filter.$or = [{ title: new RegExp(q, 'i') }, { content: new RegExp(q, 'i') }];

        const skip = (parseInt(page) - 1) * POSTS_PER_PAGE;
        const [posts, total] = await Promise.all([
            ForumPost.find(filter)
                .populate('author', 'name profileImage')
                .sort({ isPinned: -1, createdAt: -1 })
                .skip(skip).limit(POSTS_PER_PAGE),
            ForumPost.countDocuments(filter),
        ]);

        // Attach comment counts
        const ids = posts.map(p => p._id);
        const commentCounts = await ForumComment.aggregate([
            { $match: { post: { $in: ids } } },
            { $group: { _id: '$post', count: { $sum: 1 } } },
        ]);
        const countMap = {};
        commentCounts.forEach(c => { countMap[c._id.toString()] = c.count; });

        res.json({ posts: posts.map(p => ({ ...p.toObject(), commentCount: countMap[p._id.toString()] || 0 })), total, page: +page });
    } catch (err) { console.error(err); res.status(500).json({ message: 'Error fetching posts' }); }
};

// ── GET /api/forum/:id  (single post + threaded comments) ────────────────────
exports.getPost = async (req, res) => {
    try {
        const post = await ForumPost.findById(req.params.id).populate('author', 'name profileImage role');
        if (!post || post.isBanned) return res.status(404).json({ message: 'Post not found' });

        const comments = await ForumComment.find({ post: req.params.id })
            .populate('author', 'name profileImage role')
            .sort('createdAt');

        res.json({ post, comments });
    } catch (err) { res.status(500).json({ message: 'Error fetching post' }); }
};

// ── POST /api/forum  (any auth user) ─────────────────────────────────────────
exports.createPost = async (req, res) => {
    try {
        const { title, content, category } = req.body;
        const post = await ForumPost.create({ author: req.user._id, title, content, category });
        await post.populate('author', 'name profileImage');
        res.status(201).json(post);
    } catch (err) { console.error(err); res.status(500).json({ message: 'Error creating post' }); }
};

// ── PUT /api/forum/:id  (author only) ─────────────────────────────────────────
exports.editPost = async (req, res) => {
    try {
        const post = await ForumPost.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });
        if (post.author.toString() !== req.user._id.toString())
            return res.status(403).json({ message: 'Not authorised' });

        const { title, content, category } = req.body;
        if (title) post.title = title;
        if (content) post.content = content;
        if (category) post.category = category;
        await post.save();
        res.json(post);
    } catch (err) { res.status(500).json({ message: 'Error editing post' }); }
};

// ── DELETE /api/forum/:id  (author or Admin) ──────────────────────────────────
exports.deletePost = async (req, res) => {
    try {
        const post = await ForumPost.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });
        const isAuthor = post.author.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'Admin';
        if (!isAuthor && !isAdmin) return res.status(403).json({ message: 'Not authorised' });

        await ForumComment.deleteMany({ post: req.params.id });
        await post.deleteOne();
        res.json({ message: 'Post deleted' });
    } catch (err) { res.status(500).json({ message: 'Error deleting post' }); }
};

// ── POST /api/forum/:id/like  (toggle, any auth user) ────────────────────────
exports.likePost = async (req, res) => {
    try {
        const post = await ForumPost.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });
        const idx = post.likes.indexOf(req.user._id);
        if (idx === -1) post.likes.push(req.user._id);
        else post.likes.splice(idx, 1);
        await post.save();
        res.json({ liked: idx === -1, likeCount: post.likes.length });
    } catch (err) { res.status(500).json({ message: 'Error toggling like' }); }
};

// ── PUT /api/forum/:id/pin  (Admin only) ──────────────────────────────────────
exports.pinPost = async (req, res) => {
    try {
        const post = await ForumPost.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });
        post.isPinned = !post.isPinned;
        await post.save();
        res.json({ isPinned: post.isPinned });
    } catch (err) { res.status(500).json({ message: 'Error pinning post' }); }
};

// ── PUT /api/forum/:id/ban  (Admin only) ──────────────────────────────────────
exports.banPost = async (req, res) => {
    try {
        const post = await ForumPost.findByIdAndUpdate(req.params.id, { isBanned: true }, { new: true });
        res.json({ message: 'Post banned', post });
    } catch (err) { res.status(500).json({ message: 'Error banning post' }); }
};

// ── POST /api/forum/:id/comments  (any auth user) ────────────────────────────
exports.addComment = async (req, res) => {
    try {
        const { content, parentComment } = req.body;
        const post = await ForumPost.findById(req.params.id).populate('author', 'name email');
        if (!post) return res.status(404).json({ message: 'Post not found' });

        const comment = await ForumComment.create({
            post: req.params.id,
            author: req.user._id,
            content,
            parentComment: parentComment || null,
        });
        await comment.populate('author', 'name profileImage role');

        // Notify OP if someone else commented
        if (post.author._id.toString() !== req.user._id.toString() && post.author.email) {
            sendEmail({
                to: post.author.email,
                subject: `MaaCare Forum — New reply on your post "${post.title.slice(0, 50)}"`,
                html: `<div style="font-family:Arial;padding:20px;border-left:4px solid #6366f1;">
                  <h3 style="color:#6366f1;">💬 New Reply on Your Post</h3>
                  <p><strong>${req.user.name}</strong> replied to your post "<em>${post.title}</em>":</p>
                  <blockquote style="border-left:3px solid #ccc;padding:8px 12px;color:#555;">${content}</blockquote>
                  <p>Log in to MaaCare to view the full conversation.</p>
                </div>`,
            }).catch(() => { });
        }

        res.status(201).json(comment);
    } catch (err) { console.error(err); res.status(500).json({ message: 'Error adding comment' }); }
};

// ── DELETE /api/forum/comments/:commentId  (author or Admin) ─────────────────
exports.deleteComment = async (req, res) => {
    try {
        const comment = await ForumComment.findById(req.params.commentId);
        if (!comment) return res.status(404).json({ message: 'Comment not found' });
        const isAuthor = comment.author.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'Admin';
        if (!isAuthor && !isAdmin) return res.status(403).json({ message: 'Not authorised' });
        // Also delete nested replies
        await ForumComment.deleteMany({ parentComment: comment._id });
        await comment.deleteOne();
        res.json({ message: 'Comment deleted' });
    } catch (err) { res.status(500).json({ message: 'Error deleting comment' }); }
};
