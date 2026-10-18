const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Main Routes
app.use('/api/auth', require('./routes/authRoutes')); // Thêm Auth Route
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/daily', require('./routes/dailyRoutes'));
app.use('/api/sprints', require('./routes/sprintRoutes'));
app.use('/api/docs', require('./routes/docRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/activities', require('./routes/activityRoutes'));
app.use('/api/system-settings', require('./routes/systemSettingRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));