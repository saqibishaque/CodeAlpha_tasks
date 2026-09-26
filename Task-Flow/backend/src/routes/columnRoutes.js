const express = require('express');
const router = express.Router();
const columnController = require('../controllers/columnController');
const authMiddleware = require('../middlewares/auth');

router.use(authMiddleware);

router.post('/', columnController.createColumn);
router.put('/:id', columnController.updateColumn);
router.delete('/:id', columnController.deleteColumn);

module.exports = router;
