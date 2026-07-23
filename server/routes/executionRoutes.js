const express = require('express');
const router = express.Router();
const executionController = require('../controllers/executionController');
const { protect } = require('../middleware/authMiddleware');

router.post('/:workflowId/run', protect, executionController.runWorkflow);
router.get('/', protect, executionController.getExecutions);
router.delete('/clear-all', protect, executionController.clearAllExecutions);
router.get('/:id', protect, executionController.getExecutionById);
router.delete('/:id', protect, executionController.deleteExecution);

module.exports = router;
