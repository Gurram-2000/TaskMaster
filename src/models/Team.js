const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Team name is required'],
      trim: true,
      maxlength: [100, 'Team name cannot exceed 100 characters']
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    members: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        role: {
          type: String,
          enum: ['admin', 'member', 'viewer'],
          default: 'member'
        },
        joinedAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    tasks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
      }
    ],
    projects: [
      {
        name: String,
        description: String,
        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

teamSchema.index({ owner: 1 });
teamSchema.index({ 'members.userId': 1 });

module.exports = mongoose.model('Team', teamSchema);
