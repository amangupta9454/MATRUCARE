const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/forumController');
const { protect, authorize } = require('../utils/roleMiddleware');

// ── Comments (must be BEFORE /:id to avoid route conflict) ───────────────────
router.delete('/comments/:commentId', protect, ctrl.deleteComment);

// Posts — public reads
router.get('/', ctrl.getPosts);
router.get('/:id', ctrl.getPost);

// Posts — auth writes
router.post('/', protect, ctrl.createPost);
router.put('/:id', protect, ctrl.editPost);
router.delete('/:id', protect, ctrl.deletePost);
router.post('/:id/like', protect, ctrl.likePost);

// Admin moderation
router.put('/:id/pin', protect, authorize('Admin'), ctrl.pinPost);
router.put('/:id/ban', protect, authorize('Admin'), ctrl.banPost);

// Comments — add
router.post('/:id/comments', protect, ctrl.addComment);

module.exports = router;
