const express = require('express');
const router = express.Router();
const workflowController = require('../controllers/workflowController');
const { protect } = require('../middleware/authMiddleware');

router.get('/stats', protect, workflowController.getDashboardStats);
router.get('/', protect, workflowController.getWorkflows);
router.post('/', protect, workflowController.createWorkflow);

// Specific ID CRUD Routes
router.get('/:id', protect, workflowController.getWorkflowById);
router.put('/:id', protect, workflowController.updateWorkflow);
router.delete('/:id', protect, workflowController.deleteWorkflow);

module.exports = router;