const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    mimetype: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    path: {
      type: String,
      required: true
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task'
    },
    comment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment'
    }
  },
  { timestamps: true }
);

attachmentSchema.index({ task: 1 });
attachmentSchema.index({ comment: 1 });

module.exports = mongoose.model('Attachment', attachmentSchema);
