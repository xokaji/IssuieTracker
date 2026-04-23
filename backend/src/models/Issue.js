const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: [1000, 'Comment cannot exceed 1000 characters'],
  },
}, { timestamps: true });

const issueSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [5000, 'Description cannot exceed 5000 characters'],
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'resolved', 'closed'],
    default: 'open',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
  },
  severity: {
    type: String,
    enum: ['minor', 'moderate', 'major', 'critical'],
    default: 'moderate',
  },
  type: {
    type: String,
    enum: ['bug', 'feature', 'improvement', 'task', 'question'],
    default: 'bug',
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 30,
  }],
  assignee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  comments: [commentSchema],
  resolvedAt: {
    type: Date,
    default: null,
  },
  closedAt: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
});

// Text index for search
issueSchema.index({ title: 'text', description: 'text', tags: 'text' });
issueSchema.index({ status: 1, priority: 1, createdAt: -1 });
issueSchema.index({ reporter: 1 });
issueSchema.index({ assignee: 1 });

// Auto-set resolvedAt/closedAt
issueSchema.pre('save', function (next) {
  if (this.isModified('status')) {
    if (this.status === 'resolved' && !this.resolvedAt) {
      this.resolvedAt = new Date();
    }
    if (this.status === 'closed' && !this.closedAt) {
      this.closedAt = new Date();
    }
  }
  next();
});

module.exports = mongoose.model('Issue', issueSchema);
