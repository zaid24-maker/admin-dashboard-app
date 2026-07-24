const express = require('express');
const router = express.Router();
const { getTeamMembers, inviteUser } = require('../controllers/teamController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getTeamMembers);
router.post('/invite', inviteUser);

module.exports = router;
