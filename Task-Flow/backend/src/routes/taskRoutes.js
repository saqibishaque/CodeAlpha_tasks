const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const authMiddleware = require('../middlewares/auth');

router.use(authMiddleware);

router.post('/', taskController.createTask);
router.get('/:id', taskController.getTaskById);
router.put('/:id', taskController.updateTask);
router.put('/:id/move', taskController.moveTask);
router.delete('/:id', taskController.deleteTask);

module.exports = router;
