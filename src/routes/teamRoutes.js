const express = require('express');
const teamController = require('../controllers/teamController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// All team routes are protected
router.use(authenticate);

// Team CRUD
router.post('/', teamController.createTeam);
router.get('/', teamController.getTeams);
router.get('/:teamId', teamController.getTeamById);
router.put('/:teamId', teamController.updateTeam);
router.delete('/:teamId', teamController.deleteTeam);

// Member Management
router.post('/:teamId/members', teamController.addMember);
router.delete('/:teamId/members', teamController.removeMember);
router.patch('/:teamId/members', teamController.updateMemberRole);

module.exports = router;
