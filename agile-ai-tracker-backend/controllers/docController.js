const Document = require('../models/Document');

exports.getDocsByProject = async (req, res) => {
  try {
    const docs = await Document.find({ projectId: req.params.projectId }).sort({ updatedAt: -1 });
    res.json({ success: true, data: docs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createDoc = async (req, res) => {
  try {
    const doc = await Document.create(req.body);
    res.status(201).json({ success: true, data: doc });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateDoc = async (req, res) => {
  try {
    const doc = await Document.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: doc });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteDoc = async (req, res) => {
  try {
    await Document.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Đã xóa tài liệu' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};