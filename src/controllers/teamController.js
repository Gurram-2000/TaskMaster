const { body, validationResult } = require('express-validator');
const Team = require('../models/Team');
const User = require('../models/User');

// Create Team
exports.createTeam = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Team name is required')
    .isLength({ max: 100 })
    .withMessage('Team name cannot exceed 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, description } = req.body;

      const team = new Team({
        name,
        description: description || '',
        owner: req.user._id,
        members: [
          {
            userId: req.user._id,
            role: 'admin'
          }
        ]
      });

      await team.save();
      await team.populate('owner', 'username email firstName lastName');
      await team.populate('members.userId', 'username email firstName lastName');

      // Add team to user's teams
      await User.findByIdAndUpdate(req.user._id, { $push: { teams: team._id } });

      res.status(201).json({
        message: 'Team created successfully',
        team
      });
    } catch (error) {
      console.error('Create team error:', error);
      res.status(500).json({ error: 'Failed to create team' });
    }
  }
];

// Get All Teams
exports.getTeams = async (req, res) => {
  try {
    const teams = await Team.find({
      $or: [
        { owner: req.user._id },
        { 'members.userId': req.user._id }
      ]
    })
      .populate('owner', 'username email firstName lastName')
      .populate('members.userId', 'username email firstName lastName')
      .populate('tasks', 'title status priority');

    res.status(200).json({ teams });
  } catch (error) {
    console.error('Get teams error:', error);
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
};

// Get Team by ID
exports.getTeamById = async (req, res) => {
  try {
    const team = await Team.findById(req.params.teamId)
      .populate('owner', 'username email firstName lastName')
      .populate('members.userId', 'username email firstName lastName')
      .populate('tasks', 'title status priority dueDate');

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Check if user is a member
    const isMember = team.owner.toString() === req.user._id.toString() ||
      team.members.some(m => m.userId._id.toString() === req.user._id.toString());

    if (!isMember && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'You do not have access to this team' });
    }

    res.status(200).json({ team });
  } catch (error) {
    console.error('Get team by ID error:', error);
    res.status(500).json({ error: 'Failed to fetch team' });
  }
};

// Update Team
exports.updateTeam = [
  body('name')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Team name cannot exceed 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const team = await Team.findById(req.params.teamId);

      if (!team) {
        return res.status(404).json({ error: 'Team not found' });
      }

      // Check if user is team owner
      if (team.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Only team owner can update team details' });
      }

      const { name, description } = req.body;

      if (name) team.name = name;
      if (description !== undefined) team.description = description;

      await team.save();
      await team.populate('owner', 'username email firstName lastName');
      await team.populate('members.userId', 'username email firstName lastName');

      res.status(200).json({
        message: 'Team updated successfully',
        team
      });
    } catch (error) {
      console.error('Update team error:', error);
      res.status(500).json({ error: 'Failed to update team' });
    }
  }
];

// Add Member to Team
exports.addMember = [
  body('userId')
    .isMongoId()
    .withMessage('Invalid user ID')
    .custom(async (value, { req }) => {
      const user = await User.findById(value);
      if (!user) {
        throw new Error('User not found');
      }
    }),
  body('role')
    .optional()
    .isIn(['admin', 'member', 'viewer'])
    .withMessage('Invalid role'),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { userId, role = 'member' } = req.body;
      const team = await Team.findById(req.params.teamId);

      if (!team) {
        return res.status(404).json({ error: 'Team not found' });
      }

      // Check if user is team owner
      if (team.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Only team owner can add members' });
      }

      // Check if user is already a member
      const isMember = team.members.some(m => m.userId.toString() === userId.toString());
      if (isMember) {
        return res.status(400).json({ error: 'User is already a member of this team' });
      }

      team.members.push({ userId, role });
      await team.save();
      await team.populate('members.userId', 'username email firstName lastName');

      // Add team to user's teams
      await User.findByIdAndUpdate(userId, { $push: { teams: team._id } });

      res.status(200).json({
        message: 'Member added successfully',
        team
      });
    } catch (error) {
      console.error('Add member error:', error);
      res.status(500).json({ error: 'Failed to add member' });
    }
  }
];

// Remove Member from Team
exports.removeMember = async (req, res) => {
  try {
    const { userId } = req.body;
    const team = await Team.findById(req.params.teamId);

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Check if user is team owner
    if (team.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only team owner can remove members' });
    }

    // Prevent owner from removing themselves
    if (team.owner.toString() === userId.toString()) {
      return res.status(400).json({ error: 'Team owner cannot be removed' });
    }

    team.members = team.members.filter(m => m.userId.toString() !== userId.toString());
    await team.save();

    // Remove team from user's teams
    await User.findByIdAndUpdate(userId, { $pull: { teams: team._id } });

    res.status(200).json({
      message: 'Member removed successfully',
      team
    });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({ error: 'Failed to remove member' });
  }
};

// Update Member Role
exports.updateMemberRole = [
  body('userId')
    .isMongoId()
    .withMessage('Invalid user ID'),
  body('role')
    .isIn(['admin', 'member', 'viewer'])
    .withMessage('Invalid role'),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { userId, role } = req.body;
      const team = await Team.findById(req.params.teamId);

      if (!team) {
        return res.status(404).json({ error: 'Team not found' });
      }

      // Check if user is team owner
      if (team.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Only team owner can update member roles' });
      }

      const memberIndex = team.members.findIndex(m => m.userId.toString() === userId.toString());

      if (memberIndex === -1) {
        return res.status(404).json({ error: 'Member not found in team' });
      }

      team.members[memberIndex].role = role;
      await team.save();
      await team.populate('members.userId', 'username email firstName lastName');

      res.status(200).json({
        message: 'Member role updated successfully',
        team
      });
    } catch (error) {
      console.error('Update member role error:', error);
      res.status(500).json({ error: 'Failed to update member role' });
    }
  }
];

// Delete Team
exports.deleteTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.teamId);

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Check if user is team owner
    if (team.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only team owner can delete the team' });
    }

    // Remove team from all members
    await User.updateMany(
      { _id: { $in: team.members.map(m => m.userId) } },
      { $pull: { teams: team._id } }
    );

    await Team.findByIdAndDelete(req.params.teamId);

    res.status(200).json({ message: 'Team deleted successfully' });
  } catch (error) {
    console.error('Delete team error:', error);
    res.status(500).json({ error: 'Failed to delete team' });
  }
};
