const express = require('express');
const router = express.Router();
const { createProject, getProjects } = require('../controllers/projectController');

router.route('/').post(createProject).get(getProjects);

module.exports = router;