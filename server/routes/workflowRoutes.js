const express = require('express');
const router = express.Router();
const { getDashboardStats, createWorkflow, getWorkflows, getWorkflowById, updateWorkflow, deleteWorkflow } = require('../controllers/workflowController');
const { protect } = require('../middleware/authMiddleware');

const restrictViewers = (req, res, next) => {
    if (req.user.role === 'Viewer' && ['POST', 'PUT', 'DELETE'].includes(req.method)) {
        return res.status(403).json({ error: "Access denied. Viewers are rigidly restricted to read-only network access." });
    }
    next();
};

router.use(protect);

router.get('/stats', getDashboardStats);
router.get('/', getWorkflows);
router.post('/', restrictViewers, createWorkflow);

router.get('/:id', getWorkflowById);
router.put('/:id', restrictViewers, updateWorkflow);
router.delete('/:id', restrictViewers, deleteWorkflow);

module.exports = router;