const express = require('express');
const router = express.Router();
const { getDocsByProject, createDoc, updateDoc, deleteDoc } = require('../controllers/docController');

router.get('/project/:projectId', getDocsByProject);
router.post('/', createDoc);
router.put('/:id', updateDoc);
router.delete('/:id', deleteDoc);

module.exports = router;