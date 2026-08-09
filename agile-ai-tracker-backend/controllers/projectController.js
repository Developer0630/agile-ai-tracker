const Project = require('../models/Project');
const User = require('../models/User');

// @desc    Tạo dự án mới
// @route   POST /api/projects
exports.createProject = async (req, res) => {
  try {
    const { name, key, description, pmId, members } = req.body;
    const project = await Project.create({ name, key, description, pmId, members });
    res.status(201).json({ success: true, data: project });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Lấy danh sách tất cả dự án
// @route   GET /api/projects
exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find().populate('pmId', 'name email').populate('members', 'name email skills');
    res.status(200).json({ success: true, data: projects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};