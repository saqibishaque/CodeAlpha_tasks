const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const authMiddleware = require('../middlewares/auth');

router.use(authMiddleware);

router.post('/task/:taskId', commentController.addComment);
router.get('/task/:taskId', commentController.getComments);
router.delete('/:id', commentController.deleteComment);

module.exports = router;
