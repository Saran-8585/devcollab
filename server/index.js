import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { initDatabase } from './db/database.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import projectRoutes from './routes/projects.js';
import taskRoutes from './routes/tasks.js';
import snippetRoutes from './routes/snippets.js';
import prRoutes from './routes/prs.js';
import discussionRoutes from './routes/discussions.js';
import dashboardRoutes from './routes/dashboard.js';
import adminRoutes from './routes/admin.js';
import activityRoutes from './routes/activity.js';
import { errorHandler } from './utils/errors.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

initDatabase();

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/snippets', snippetRoutes);
app.use('/api/prs', prRoutes);
app.use('/api/discussions', discussionRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/activity', activityRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`DevCollab server running on port ${PORT}`);
});
