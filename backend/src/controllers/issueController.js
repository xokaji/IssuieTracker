const { validationResult } = require('express-validator');
const Issue = require('../models/Issue');

// GET /api/issues
const getIssues = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      priority,
      severity,
      type,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      assignee,
    } = req.query;

    const query = {};

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (severity) query.severity = severity;
    if (type) query.type = type;
    if (assignee) query.assignee = assignee;

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [issues, total] = await Promise.all([
      Issue.find(query)
        .populate('reporter', 'name email')
        .populate('assignee', 'name email')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit)),
      Issue.countDocuments(query),
    ]);

    res.json({
      issues,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/issues/stats
const getStats = async (req, res, next) => {
  try {
    const stats = await Issue.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const priorityStats = await Issue.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 },
        },
      },
    ]);

    const total = await Issue.countDocuments();

    const statusCounts = { open: 0, 'in-progress': 0, resolved: 0, closed: 0 };
    stats.forEach(s => { statusCounts[s._id] = s.count; });

    const priorityCounts = { low: 0, medium: 0, high: 0, critical: 0 };
    priorityStats.forEach(p => { priorityCounts[p._id] = p.count; });

    res.json({ total, statusCounts, priorityCounts });
  } catch (error) {
    next(error);
  }
};

// GET /api/issues/:id
const getIssue = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate('reporter', 'name email')
      .populate('assignee', 'name email')
      .populate('comments.author', 'name email');

    if (!issue) {
      return res.status(404).json({ error: 'Issue not found.' });
    }

    res.json({ issue });
  } catch (error) {
    next(error);
  }
};

// POST /api/issues
const createIssue = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, priority, severity, type, tags, assignee } = req.body;

    const issue = await Issue.create({
      title,
      description,
      priority,
      severity,
      type,
      tags: tags || [],
      assignee: assignee || null,
      reporter: req.user._id,
    });

    const populated = await Issue.findById(issue._id)
      .populate('reporter', 'name email')
      .populate('assignee', 'name email');

    res.status(201).json({ issue: populated });
  } catch (error) {
    next(error);
  }
};

// PUT /api/issues/:id
const updateIssue = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found.' });
    }

    const isOwner = issue.reporter.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Not authorized to update this issue.' });
    }

    const allowedFields = ['title', 'description', 'status', 'priority', 'severity', 'type', 'tags', 'assignee'];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        issue[field] = req.body[field];
      }
    });

    await issue.save();

    const updated = await Issue.findById(issue._id)
      .populate('reporter', 'name email')
      .populate('assignee', 'name email')
      .populate('comments.author', 'name email');

    res.json({ issue: updated });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/issues/:id
const deleteIssue = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found.' });
    }

    const isOwner = issue.reporter.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Not authorized to delete this issue.' });
    }

    await issue.deleteOne();
    res.json({ message: 'Issue deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

// POST /api/issues/:id/comments
const addComment = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found.' });
    }

    issue.comments.push({
      author: req.user._id,
      content: req.body.content,
    });

    await issue.save();

    const updated = await Issue.findById(issue._id)
      .populate('reporter', 'name email')
      .populate('assignee', 'name email')
      .populate('comments.author', 'name email');

    res.status(201).json({ issue: updated });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/issues/:id/comments/:commentId
const deleteComment = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ error: 'Issue not found.' });

    const comment = issue.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ error: 'Comment not found.' });

    const isOwner = comment.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) return res.status(403).json({ error: 'Not authorized.' });

    comment.deleteOne();
    await issue.save();

    const updated = await Issue.findById(issue._id)
      .populate('reporter', 'name email')
      .populate('assignee', 'name email')
      .populate('comments.author', 'name email');

    res.json({ issue: updated });
  } catch (error) {
    next(error);
  }
};

module.exports = { getIssues, getStats, getIssue, createIssue, updateIssue, deleteIssue, addComment, deleteComment };
