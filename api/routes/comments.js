const express = require('express');
const router = express.Router();
const commentController = require('../controller/commentController');
const checkAuth = require('../middleware/check-auth');

router.get('/:contentID', commentController.getCommentForContent);

router.post('/:contentID', commentController.postCommentToContent);

router.delete('/:commentID', commentController.deleteComment);

module.exports = router;