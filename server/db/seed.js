import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Project from '../models/Project.js';
import ProjectCollaborator from '../models/ProjectCollaborator.js';
import Task from '../models/Task.js';
import Snippet from '../models/Snippet.js';
import PullRequest from '../models/PullRequest.js';
import PRComment from '../models/PRComment.js';
import Discussion from '../models/Discussion.js';
import DiscussionReply from '../models/DiscussionReply.js';
import Follow from '../models/Follow.js';
import SnippetLike from '../models/SnippetLike.js';
import ActivityLog from '../models/ActivityLog.js';
import Flag from '../models/Flag.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/devcollab';

function randomDate(minDaysAgo, maxDaysAgo) {
  const now = Date.now();
  const minMs = minDaysAgo * 24 * 60 * 60 * 1000;
  const maxMs = maxDaysAgo * 24 * 60 * 60 * 1000;
  return new Date(now - (minMs + Math.random() * (maxMs - minMs)));
}

async function staggerTimestamps(collectionName, minDays, maxDays, fields = ['created_at']) {
  const collection = mongoose.connection.db.collection(collectionName);
  const docs = await collection.find({}, { projection: { _id: 1 } }).toArray();
  if (docs.length === 0) return;
  const now = Date.now();
  const minMs = minDays * 24 * 60 * 60 * 1000;
  const rangeMs = (maxDays - minDays) * 24 * 60 * 60 * 1000;
  const BATCH_SIZE = 100;
  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    const batch = docs.slice(i, i + BATCH_SIZE);
    const operations = batch.map(doc => {
      const setFields = {};
      for (const field of fields) {
        setFields[field] = new Date(now - (minMs + Math.random() * rangeMs));
      }
      return { updateOne: { filter: { _id: doc._id }, update: { $set: setFields } } };
    });
    await collection.bulkWrite(operations);
  }
}

async function seed() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('Dropping existing data...');
  const collections = await mongoose.connection.db.listCollections().toArray();
  for (const c of collections) {
    await mongoose.connection.db.dropCollection(c.name);
  }

  console.log('Seeding database...');
  const hash = await bcrypt.hash('password123', 10);
  const adminHash = await bcrypt.hash('admin123', 10);
  const devHash = await bcrypt.hash('dev123', 10);

  // ═══════════════════════════════════════════════
  // USERS
  // ═══════════════════════════════════════════════
  const users = await User.insertMany([
    { name: 'Alex Johnson', email: 'alex@example.com', password: hash, username: 'alexj', bio: 'Full-stack developer passionate about React and Node.js', location: 'San Francisco, CA', website: 'https://alexj.dev', primary_language: 'JavaScript', skills: ['React', 'Node.js', 'TypeScript', 'MongoDB'], role: 'admin', followers_count: 0, following_count: 0 },
    { name: 'Sarah Chen', email: 'sarah@example.com', password: hash, username: 'sarahchen', bio: 'Python developer and data science enthusiast', location: 'New York, NY', website: 'https://sarahchen.io', primary_language: 'Python', skills: ['Python', 'Pandas', 'NumPy', 'Matplotlib'], role: 'developer', followers_count: 0, following_count: 0 },
    { name: 'Marcus Williams', email: 'marcus@example.com', password: hash, username: 'marcusw', bio: 'Mobile app developer (Flutter & React Native)', location: 'London, UK', website: null, primary_language: 'Dart', skills: ['Flutter', 'Dart', 'React Native', 'Firebase'], role: 'developer', followers_count: 0, following_count: 0 },
    { name: 'Priya Patel', email: 'priya@example.com', password: hash, username: 'priyap', bio: 'DevOps engineer & Go enthusiast', location: 'Bangalore, India', website: 'https://priyap.dev', primary_language: 'Go', skills: ['Go', 'Docker', 'Kubernetes', 'Terraform'], role: 'developer', followers_count: 0, following_count: 0 },
    { name: 'Jordan Lee', email: 'jordan@example.com', password: hash, username: 'jordanl', bio: 'Frontend developer specializing in Vue.js and UI/UX', location: 'Seattle, WA', website: null, primary_language: 'Vue.js', skills: ['Vue.js', 'Pinia', 'Tailwind CSS', 'Figma'], role: 'moderator', followers_count: 0, following_count: 0 },
    { name: 'Demo User', email: 'demo@example.com', password: hash, username: 'demo', bio: 'Demo account for testing. Active contributor to multiple projects.', location: null, website: null, primary_language: 'JavaScript', skills: ['React', 'Node.js', 'MongoDB', 'Express'], role: 'developer', followers_count: 0, following_count: 0 },
    { name: 'Admin User', email: 'admin@devcollab.com', password: adminHash, username: 'admin', bio: 'Platform administrator managing the DevCollab community', primary_language: 'JavaScript', skills: ['Administration', 'Moderation', 'Node.js'], role: 'admin', followers_count: 0, following_count: 0 },
    { name: 'Developer One', email: 'dev1@devcollab.com', password: devHash, username: 'dev1', bio: 'Python developer specializing in machine learning and data pipelines', primary_language: 'Python', skills: ['Python', 'scikit-learn', 'TensorFlow', 'Pandas'], role: 'developer', followers_count: 0, following_count: 0 },
    { name: 'Developer Two', email: 'dev2@devcollab.com', password: devHash, username: 'dev2', bio: 'Go backend developer focused on microservices and cloud infrastructure', primary_language: 'Go', skills: ['Go', 'gRPC', 'Docker', 'PostgreSQL'], role: 'developer', followers_count: 0, following_count: 0 },
    { name: 'Developer Three', email: 'dev3@devcollab.com', password: devHash, username: 'dev3', bio: 'Rust systems programmer and CLI tool enthusiast', primary_language: 'Rust', skills: ['Rust', 'CLI', 'Systems Programming', 'WebAssembly'], role: 'developer', followers_count: 0, following_count: 0 },
    { name: 'Developer Four', email: 'dev4@devcollab.com', password: devHash, username: 'dev4', bio: 'TypeScript full-stack developer passionate about type safety', primary_language: 'TypeScript', skills: ['TypeScript', 'React', 'Next.js', 'Prisma'], role: 'developer', followers_count: 0, following_count: 0 },
    { name: 'Developer Five', email: 'dev5@devcollab.com', password: devHash, username: 'dev5', bio: 'Java/Spring Boot developer with a passion for clean architecture', primary_language: 'Java', skills: ['Java', 'Spring Boot', 'Hibernate', 'Kafka'], role: 'developer', followers_count: 0, following_count: 0 },
    { name: 'Developer Six', email: 'dev6@devcollab.com', password: devHash, username: 'dev6', bio: 'C++ game developer exploring graphics programming and engines', primary_language: 'C++', skills: ['C++', 'OpenGL', 'Unreal Engine', 'CMake'], role: 'developer', followers_count: 0, following_count: 0 },
  ]);
  const [alex, sarah, marcus, priya, jordan, demo, admin, dev1, dev2, dev3, dev4, dev5, dev6] = users;
  console.log(`Created ${users.length} users`);

  // ═══════════════════════════════════════════════
  // FOLLOWS
  // ═══════════════════════════════════════════════
  await Follow.insertMany([
    // existing follows
    { follower_id: demo._id, following_id: alex._id },
    { follower_id: demo._id, following_id: sarah._id },
    { follower_id: alex._id, following_id: demo._id },
    { follower_id: alex._id, following_id: priya._id },
    { follower_id: sarah._id, following_id: alex._id },
    { follower_id: sarah._id, following_id: jordan._id },
    { follower_id: marcus._id, following_id: alex._id },
    { follower_id: priya._id, following_id: alex._id },
    { follower_id: jordan._id, following_id: sarah._id },
    // dev users follow main users
    { follower_id: dev1._id, following_id: alex._id },
    { follower_id: dev1._id, following_id: sarah._id },
    { follower_id: dev1._id, following_id: priya._id },
    { follower_id: dev1._id, following_id: demo._id },
    { follower_id: dev2._id, following_id: alex._id },
    { follower_id: dev2._id, following_id: marcus._id },
    { follower_id: dev2._id, following_id: priya._id },
    { follower_id: dev3._id, following_id: alex._id },
    { follower_id: dev3._id, following_id: jordan._id },
    { follower_id: dev3._id, following_id: demo._id },
    { follower_id: dev4._id, following_id: alex._id },
    { follower_id: dev4._id, following_id: sarah._id },
    { follower_id: dev4._id, following_id: demo._id },
    { follower_id: dev4._id, following_id: priya._id },
    { follower_id: dev5._id, following_id: alex._id },
    { follower_id: dev5._id, following_id: priya._id },
    { follower_id: dev5._id, following_id: jordan._id },
    { follower_id: dev6._id, following_id: alex._id },
    { follower_id: dev6._id, following_id: sarah._id },
    { follower_id: dev6._id, following_id: marcus._id },
    // main users follow each other more
    { follower_id: alex._id, following_id: marcus._id },
    { follower_id: alex._id, following_id: jordan._id },
    { follower_id: alex._id, following_id: sarah._id },
    { follower_id: sarah._id, following_id: priya._id },
    { follower_id: sarah._id, following_id: demo._id },
    { follower_id: marcus._id, following_id: demo._id },
    { follower_id: marcus._id, following_id: priya._id },
    { follower_id: marcus._id, following_id: jordan._id },
    { follower_id: priya._id, following_id: jordan._id },
    { follower_id: priya._id, following_id: demo._id },
    { follower_id: jordan._id, following_id: alex._id },
    { follower_id: jordan._id, following_id: demo._id },
    { follower_id: jordan._id, following_id: marcus._id },
    // admin follows main users
    { follower_id: admin._id, following_id: alex._id },
    { follower_id: admin._id, following_id: sarah._id },
    { follower_id: admin._id, following_id: priya._id },
    // cross-follows among dev users
    { follower_id: dev1._id, following_id: dev4._id },
    { follower_id: dev2._id, following_id: dev5._id },
    { follower_id: dev3._id, following_id: dev6._id },
    { follower_id: dev4._id, following_id: dev1._id },
    { follower_id: dev5._id, following_id: dev2._id },
    { follower_id: dev6._id, following_id: dev3._id },
    // main users follow some devs
    { follower_id: alex._id, following_id: dev1._id },
    { follower_id: sarah._id, following_id: dev4._id },
    { follower_id: priya._id, following_id: dev2._id },
    { follower_id: jordan._id, following_id: dev3._id },
  ]);
  console.log('Created follows');

  // ═══════════════════════════════════════════════
  // PROJECTS
  // ═══════════════════════════════════════════════
  const projects = await Project.insertMany([
    { owner_id: alex._id, name: 'TaskFlow', description: 'A modern project management tool with real-time collaboration features', primary_language: 'JavaScript', visibility: 'public', tags: ['react', 'node', 'real-time', 'typescript', 'collaboration', 'websocket'], stars_count: 42, forks_count: 12, readme_content: '# TaskFlow\n\nA modern project management tool.\n\n## Features\n- Real-time collaboration\n- Task management\n- Team dashboards\n' },
    { owner_id: sarah._id, name: 'DataVizPro', description: 'Advanced data visualization library for Python with support for interactive charts', primary_language: 'Python', visibility: 'public', tags: ['python', 'visualization', 'data-science', 'matplotlib', 'interactive', 'charts'], stars_count: 89, forks_count: 34, readme_content: '# DataVizPro\n\nAdvanced data visualization library.\n\n## Features\n- Interactive charts\n- Statistical plots\n- Real-time data streams\n' },
    { owner_id: marcus._id, name: 'HealthTrack', description: 'A cross-platform health tracking mobile application', primary_language: 'Dart', visibility: 'public', tags: ['flutter', 'health', 'mobile', 'fitness', 'cross-platform', 'wellness'], stars_count: 35, forks_count: 11, readme_content: '# HealthTrack\n\nCross-platform health tracking app.\n\n## Features\n- Step tracking\n- Sleep monitoring\n- Nutrition logging\n' },
    { owner_id: priya._id, name: 'CloudDeploy', description: 'Automated deployment tool for cloud infrastructure management', primary_language: 'Go', visibility: 'public', tags: ['go', 'devops', 'cloud', 'infrastructure', 'automation', 'aws'], stars_count: 56, forks_count: 23, readme_content: '# CloudDeploy\n\nAutomated deployment tool.\n\n## Features\n- Multi-cloud support\n- Infrastructure as Code\n- Rollback capabilities\n' },
    { owner_id: jordan._id, name: 'VueStore', description: 'E-commerce frontend built with Vue.js and Pinia store', primary_language: 'Vue.js', visibility: 'public', tags: ['vue', 'ecommerce', 'pinia', 'vue3', 'tailwind', 'stripe'], stars_count: 31, forks_count: 8, readme_content: '# VueStore\n\nE-commerce frontend built with Vue.js.\n\n## Features\n- Product catalog\n- Shopping cart\n- Checkout flow\n' },
    { owner_id: demo._id, name: 'DevCollab API', description: 'The main API for the DevCollab platform', primary_language: 'JavaScript', visibility: 'public', tags: ['api', 'node', 'express', 'mongodb', 'rest-api', 'authentication', 'documentation'], stars_count: 18, forks_count: 6, readme_content: '# DevCollab API\n\nBackend API for DevCollab.\n\n## Features\n- User auth\n- Project management\n- Code snippets\n' },
    { owner_id: alex._id, name: 'Private Notes', description: 'Personal notes app (private)', primary_language: 'JavaScript', visibility: 'private', tags: ['notes', 'personal', 'markdown', 'sync'], stars_count: 2, forks_count: 0, readme_content: '# Private Notes\n\nA private note-taking application.\n' },
    { owner_id: dev1._id, name: 'PyML Toolkit', description: 'Machine learning toolkit built with Python and scikit-learn', primary_language: 'Python', visibility: 'public', tags: ['python', 'ml', 'data-science', 'scikit-learn', 'classification', 'numpy'], stars_count: 28, forks_count: 8, readme_content: '# PyML Toolkit\n\nMachine learning toolkit.\n' },
    { owner_id: dev2._id, name: 'GoMicro API', description: 'Microservices API gateway written in Go', primary_language: 'Go', visibility: 'public', tags: ['go', 'microservices', 'api', 'grpc', 'docker', 'kubernetes'], stars_count: 22, forks_count: 7, readme_content: '# GoMicro API\n\nMicroservices API gateway.\n' },
    { owner_id: dev3._id, name: 'Rusty CLI', description: 'Command-line tools collection built with Rust', primary_language: 'Rust', visibility: 'public', tags: ['rust', 'cli', 'tools', 'performance', 'terminal', 'filesystem'], stars_count: 25, forks_count: 7, readme_content: '# Rusty CLI\n\nCLI tools in Rust.\n' },
    { owner_id: dev4._id, name: 'TypeCore', description: 'TypeScript core library with utility types and helpers', primary_language: 'TypeScript', visibility: 'public', tags: ['typescript', 'utilities', 'types', 'type-safety', 'generics', 'developer-tools'], stars_count: 30, forks_count: 9, readme_content: '# TypeCore\n\nTypeScript utilities.\n' },
    { owner_id: dev5._id, name: 'SpringBoard', description: 'Spring Boot starter kit for rapid API development', primary_language: 'Java', visibility: 'public', tags: ['java', 'spring', 'api', 'rest-api', 'microservices', 'security'], stars_count: 33, forks_count: 11, readme_content: '# SpringBoard\n\nSpring Boot starter kit.\n' },
    { owner_id: dev6._id, name: 'CPP Game Engine', description: 'Lightweight 2D game engine written in C++', primary_language: 'C++', visibility: 'public', tags: ['cpp', 'game-dev', 'engine', 'opengl', '2d', 'graphics'], stars_count: 21, forks_count: 5, readme_content: '# CPP Game Engine\n\n2D game engine in C++.\n' },
    { owner_id: dev1._id, name: 'Dev1 Private App', description: 'Personal project for learning new technologies', primary_language: 'JavaScript', visibility: 'private', tags: ['personal', 'learning', 'sandbox'], stars_count: 1, forks_count: 0, readme_content: '# Private App\n' },
  ]);
  const [taskFlow, dataViz, healthTrack, cloudDeploy, vueStore, devcollabApi, privateNotes, pyML, goMicro, rustyCLI, typeCore, springBoard, cppEngine, dev1Private] = projects;
  console.log(`Created ${projects.length} projects`);

  // ═══════════════════════════════════════════════
  // PROJECT COLLABORATORS
  // ═══════════════════════════════════════════════
  await ProjectCollaborator.insertMany([
    { project_id: taskFlow._id, user_id: alex._id, role: 'owner' },
    { project_id: taskFlow._id, user_id: demo._id, role: 'collaborator' },
    { project_id: taskFlow._id, user_id: dev1._id, role: 'collaborator' },
    { project_id: dataViz._id, user_id: sarah._id, role: 'owner' },
    { project_id: dataViz._id, user_id: alex._id, role: 'collaborator' },
    { project_id: dataViz._id, user_id: jordan._id, role: 'collaborator' },
    { project_id: dataViz._id, user_id: dev4._id, role: 'collaborator' },
    { project_id: healthTrack._id, user_id: marcus._id, role: 'owner' },
    { project_id: healthTrack._id, user_id: demo._id, role: 'collaborator' },
    { project_id: cloudDeploy._id, user_id: priya._id, role: 'owner' },
    { project_id: cloudDeploy._id, user_id: sarah._id, role: 'collaborator' },
    { project_id: cloudDeploy._id, user_id: dev2._id, role: 'collaborator' },
    { project_id: vueStore._id, user_id: jordan._id, role: 'owner' },
    { project_id: vueStore._id, user_id: demo._id, role: 'collaborator' },
    { project_id: devcollabApi._id, user_id: demo._id, role: 'owner' },
    { project_id: devcollabApi._id, user_id: alex._id, role: 'collaborator' },
    { project_id: privateNotes._id, user_id: alex._id, role: 'owner' },
    { project_id: pyML._id, user_id: dev1._id, role: 'owner' },
    { project_id: pyML._id, user_id: dev4._id, role: 'collaborator' },
    { project_id: goMicro._id, user_id: dev2._id, role: 'owner' },
    { project_id: goMicro._id, user_id: dev5._id, role: 'collaborator' },
    { project_id: rustyCLI._id, user_id: dev3._id, role: 'owner' },
    { project_id: rustyCLI._id, user_id: dev6._id, role: 'collaborator' },
    { project_id: typeCore._id, user_id: dev4._id, role: 'owner' },
    { project_id: typeCore._id, user_id: dev1._id, role: 'collaborator' },
    { project_id: springBoard._id, user_id: dev5._id, role: 'owner' },
    { project_id: springBoard._id, user_id: dev2._id, role: 'collaborator' },
    { project_id: cppEngine._id, user_id: dev6._id, role: 'owner' },
    { project_id: cppEngine._id, user_id: dev3._id, role: 'collaborator' },
    { project_id: dev1Private._id, user_id: dev1._id, role: 'owner' },
    // additional collaborators
    { project_id: taskFlow._id, user_id: dev3._id, role: 'collaborator' },
    { project_id: dataViz._id, user_id: dev6._id, role: 'collaborator' },
    { project_id: healthTrack._id, user_id: dev4._id, role: 'collaborator' },
    { project_id: vueStore._id, user_id: dev1._id, role: 'collaborator' },
    { project_id: devcollabApi._id, user_id: jordan._id, role: 'collaborator' },
    { project_id: pyML._id, user_id: jordan._id, role: 'collaborator' },
    { project_id: goMicro._id, user_id: dev1._id, role: 'collaborator' },
    { project_id: rustyCLI._id, user_id: sarah._id, role: 'collaborator' },
    { project_id: typeCore._id, user_id: demo._id, role: 'collaborator' },
    { project_id: springBoard._id, user_id: dev4._id, role: 'collaborator' },
    { project_id: cppEngine._id, user_id: alex._id, role: 'collaborator' },
    { project_id: privateNotes._id, user_id: demo._id, role: 'collaborator' },
  ]);
  console.log('Created project collaborators');

  // ═══════════════════════════════════════════════
  // TASKS
  // ═══════════════════════════════════════════════
  await Task.insertMany([
    // --- existing tasks ---
    { project_id: taskFlow._id, title: 'Set up CI/CD pipeline', description: 'Configure GitHub Actions for automated testing and deployment', created_by: alex._id, assignee_id: alex._id, priority: 'high', status: 'in_progress', labels: ['devops', 'ci-cd'] },
    { project_id: taskFlow._id, title: 'Implement drag-and-drop UI', description: 'Add drag-and-drop functionality for task cards on the board view', created_by: alex._id, assignee_id: demo._id, priority: 'medium', status: 'open', labels: ['frontend', 'ui'] },
    { project_id: taskFlow._id, title: 'Add real-time notifications', description: 'Implement WebSocket-based notifications for task assignments', created_by: alex._id, assignee_id: alex._id, priority: 'high', status: 'open', labels: ['backend', 'real-time'] },
    { project_id: taskFlow._id, title: 'Write unit tests', description: 'Achieve 80% test coverage for the main components', created_by: alex._id, assignee_id: null, priority: 'medium', status: 'open', labels: ['testing'] },
    { project_id: dataViz._id, title: 'Add 3D scatter plot support', description: 'Implement 3D scatter plots using Matplotlib', created_by: sarah._id, assignee_id: sarah._id, priority: 'medium', status: 'open', labels: ['3d', 'visualization'] },
    { project_id: dataViz._id, title: 'Optimize rendering performance', description: 'Improve chart rendering speed for large datasets', created_by: sarah._id, assignee_id: alex._id, priority: 'high', status: 'open', labels: ['performance'] },
    { project_id: dataViz._id, title: 'Create documentation site', description: 'Build a documentation site using Sphinx', created_by: sarah._id, assignee_id: jordan._id, priority: 'low', status: 'completed', labels: ['docs'] },
    { project_id: healthTrack._id, title: 'Implement step counting algorithm', description: 'Build step counting using accelerometer data', created_by: marcus._id, assignee_id: marcus._id, priority: 'high', status: 'in_progress', labels: ['algorithm', 'mobile'] },
    { project_id: healthTrack._id, title: 'Design sleep tracking UI', description: 'Create sleep tracking dashboard with charts', created_by: marcus._id, assignee_id: demo._id, priority: 'medium', status: 'open', labels: ['ui', 'design'] },
    { project_id: cloudDeploy._id, title: 'Add AWS ECS support', description: 'Support deployment to AWS Elastic Container Service', created_by: priya._id, assignee_id: priya._id, priority: 'high', status: 'in_progress', labels: ['aws', 'deployment'] },
    { project_id: cloudDeploy._id, title: 'Implement rollback feature', description: 'Add automatic rollback on deployment failure', created_by: priya._id, assignee_id: sarah._id, priority: 'medium', status: 'open', labels: ['deployment', 'safety'] },
    { project_id: vueStore._id, title: 'Build product search', description: 'Implement product search with filters', created_by: jordan._id, assignee_id: jordan._id, priority: 'high', status: 'in_progress', labels: ['search', 'frontend'] },
    { project_id: vueStore._id, title: 'Integrate payment gateway', description: 'Add Stripe payment integration for checkout', created_by: jordan._id, assignee_id: demo._id, priority: 'high', status: 'open', labels: ['payment', 'stripe'] },
    { project_id: devcollabApi._id, title: 'Add rate limiting', description: 'Implement API rate limiting to prevent abuse', created_by: demo._id, assignee_id: alex._id, priority: 'medium', status: 'open', labels: ['security'] },
    { project_id: devcollabApi._id, title: 'Write API documentation', description: 'Document all API endpoints with examples', created_by: demo._id, assignee_id: demo._id, priority: 'low', status: 'open', labels: ['docs'] },
    { project_id: devcollabApi._id, title: 'Implement search functionality', description: 'Add full-text search across projects and snippets', created_by: demo._id, assignee_id: alex._id, priority: 'high', status: 'in_progress', labels: ['backend'] },
    { project_id: pyML._id, title: 'Add random forest classifier', description: 'Implement random forest algorithm', created_by: dev1._id, assignee_id: dev1._id, priority: 'high', status: 'in_progress', labels: ['ml', 'python'] },
    { project_id: pyML._id, title: 'Write model evaluation utils', description: 'Cross-validation and metrics helpers', created_by: dev1._id, assignee_id: dev4._id, priority: 'medium', status: 'open', labels: ['testing'] },
    { project_id: goMicro._id, title: 'Implement service discovery', description: 'Add Consul-based service discovery', created_by: dev2._id, assignee_id: dev2._id, priority: 'high', status: 'open', labels: ['go', 'microservices'] },
    { project_id: goMicro._id, title: 'Add health check endpoint', description: 'Implement /healthz endpoint', created_by: dev2._id, assignee_id: dev5._id, priority: 'low', status: 'completed', labels: ['observability'] },
    { project_id: rustyCLI._id, title: 'Implement grep-like tool', description: 'Build a fast grep clone in Rust', created_by: dev3._id, assignee_id: dev3._id, priority: 'medium', status: 'open', labels: ['rust', 'cli'] },
    { project_id: typeCore._id, title: 'Add utility types', description: 'Implement Partial, Pick, Omit equivalents', created_by: dev4._id, assignee_id: dev4._id, priority: 'high', status: 'in_progress', labels: ['typescript'] },
    { project_id: springBoard._id, title: 'Add JWT auth filter', description: 'Implement JWT authentication filter', created_by: dev5._id, assignee_id: dev5._id, priority: 'high', status: 'open', labels: ['java', 'security'] },
    { project_id: cppEngine._id, title: 'Add sprite rendering', description: 'Implement sprite sheet rendering', created_by: dev6._id, assignee_id: dev6._id, priority: 'medium', status: 'open', labels: ['cpp', 'rendering'] },
    // --- new tasks ---
    { project_id: taskFlow._id, title: 'Add OAuth integration', description: 'Implement OAuth 2.0 for third-party login providers', created_by: alex._id, assignee_id: demo._id, priority: 'high', status: 'open', labels: ['auth', 'security'] },
    { project_id: taskFlow._id, title: 'Refactor database queries', description: 'Optimize slow queries and add proper indexing', created_by: alex._id, assignee_id: null, priority: 'medium', status: 'backlog', labels: ['database', 'performance'] },
    { project_id: dataViz._id, title: 'Add animated transitions', description: 'Add smooth animated transitions between chart states', created_by: sarah._id, assignee_id: dev4._id, priority: 'medium', status: 'in_progress', labels: ['animation', 'ui'] },
    { project_id: dataViz._id, title: 'Fix axis labeling bug', description: 'Axis labels overlap when zoomed in on time-series data', created_by: sarah._id, assignee_id: alex._id, priority: 'high', status: 'open', labels: ['bug', 'visualization'] },
    { project_id: healthTrack._id, title: 'Add medication reminders', description: 'Allow users to set medication reminders with notifications', created_by: marcus._id, assignee_id: demo._id, priority: 'medium', status: 'open', labels: ['feature', 'mobile'] },
    { project_id: healthTrack._id, title: 'iOS push notifications', description: 'Implement push notifications for iOS using APNs', created_by: marcus._id, assignee_id: marcus._id, priority: 'high', status: 'in_progress', labels: ['ios', 'notifications'] },
    { project_id: cloudDeploy._id, title: 'Add Terraform support', description: 'Support Terraform configurations for infrastructure provisioning', created_by: priya._id, assignee_id: dev2._id, priority: 'medium', status: 'open', labels: ['terraform', 'infrastructure'] },
    { project_id: cloudDeploy._id, title: 'Write integration tests', description: 'Add end-to-end integration tests for deployment flows', created_by: priya._id, assignee_id: sarah._id, priority: 'low', status: 'completed', labels: ['testing', 'integration'] },
    { project_id: vueStore._id, title: 'Add wishlist feature', description: 'Let users create and manage product wishlists', created_by: jordan._id, assignee_id: null, priority: 'medium', status: 'backlog', labels: ['feature', 'ecommerce'] },
    { project_id: vueStore._id, title: 'SEO optimization', description: 'Improve SEO with meta tags, sitemaps, and SSR', created_by: jordan._id, assignee_id: demo._id, priority: 'high', status: 'open', labels: ['seo', 'performance'] },
    { project_id: devcollabApi._id, title: 'Add GraphQL endpoint', description: 'Add a GraphQL API layer alongside REST', created_by: demo._id, assignee_id: alex._id, priority: 'medium', status: 'open', labels: ['graphql', 'api'] },
    { project_id: pyML._id, title: 'Implement PCA algorithm', description: 'Add principal component analysis for dimensionality reduction', created_by: dev1._id, assignee_id: dev1._id, priority: 'high', status: 'open', labels: ['ml', 'python'] },
    { project_id: goMicro._id, title: 'Add rate limiter', description: 'Implement configurable rate limiting middleware', created_by: dev2._id, assignee_id: dev2._id, priority: 'medium', status: 'open', labels: ['middleware', 'security'] },
    { project_id: goMicro._id, title: 'Implement logging middleware', description: 'Add structured logging with request IDs', created_by: dev2._id, assignee_id: dev5._id, priority: 'low', status: 'completed', labels: ['logging', 'observability'] },
    { project_id: rustyCLI._id, title: 'Add file watcher', description: 'Build a file system watcher similar to entr', created_by: dev3._id, assignee_id: dev6._id, priority: 'medium', status: 'open', labels: ['rust', 'filesystem'] },
    { project_id: typeCore._id, title: 'Add string utilities', description: 'Implement string manipulation utilities (camelCase, kebab-case, etc.)', created_by: dev4._id, assignee_id: dev4._id, priority: 'low', status: 'completed', labels: ['typescript', 'utilities'] },
    { project_id: springBoard._id, title: 'Add database migration', description: 'Integrate Flyway for database migration management', created_by: dev5._id, assignee_id: dev5._id, priority: 'high', status: 'open', labels: ['java', 'database'] },
    { project_id: cppEngine._id, title: 'Add particle system', description: 'Implement a particle effects system for 2D games', created_by: dev6._id, assignee_id: dev6._id, priority: 'medium', status: 'open', labels: ['cpp', 'graphics'] },
    // --- more tasks for filling gaps ---
    { project_id: privateNotes._id, title: 'Add markdown note editor', description: 'Support markdown formatting in the note editor with live preview', created_by: alex._id, assignee_id: null, priority: 'low', status: 'backlog', labels: ['feature', 'markdown'] },
    { project_id: privateNotes._id, title: 'Implement note search', description: 'Full-text search across all notes with tag filtering', created_by: alex._id, assignee_id: demo._id, priority: 'medium', status: 'open', labels: ['search', 'feature'] },
    { project_id: privateNotes._id, title: 'Add note categories', description: 'Organize notes with hierarchical categories and tags', created_by: alex._id, assignee_id: alex._id, priority: 'medium', status: 'open', labels: ['organization', 'feature'] },
    { project_id: dev1Private._id, title: 'Set up user authentication', description: 'Implement JWT-based authentication with login and registration', created_by: dev1._id, assignee_id: dev1._id, priority: 'high', status: 'in_progress', labels: ['auth', 'security'] },
    { project_id: dev1Private._id, title: 'Build dashboard layout', description: 'Create the main dashboard layout with sidebar navigation', created_by: dev1._id, assignee_id: null, priority: 'medium', status: 'open', labels: ['ui', 'frontend'] },
    { project_id: dev1Private._id, title: 'Add data persistence', description: 'Set up SQLite database and implement CRUD operations', created_by: dev1._id, assignee_id: dev1._id, priority: 'high', status: 'backlog', labels: ['database', 'backend'] },
    { project_id: rustyCLI._id, title: 'Add JSON pretty-print command', description: 'Format JSON input with configurable indentation and color output', created_by: dev3._id, assignee_id: dev3._id, priority: 'medium', status: 'in_progress', labels: ['rust', 'json', 'formatting'] },
    { project_id: rustyCLI._id, title: 'Implement file search command', description: 'Build a recursive file search with glob pattern support', created_by: dev3._id, assignee_id: sarah._id, priority: 'medium', status: 'open', labels: ['rust', 'filesystem', 'search'] },
    { project_id: typeCore._id, title: 'Add Promise utilities', description: 'Implement Promise helpers like delay, retry, and timeout', created_by: dev4._id, assignee_id: dev4._id, priority: 'medium', status: 'in_progress', labels: ['typescript', 'async', 'utilities'] },
    { project_id: typeCore._id, title: 'Add validation helpers', description: 'Create type-safe validation functions for common patterns', created_by: dev4._id, assignee_id: demo._id, priority: 'medium', status: 'open', labels: ['typescript', 'validation'] },
    { project_id: springBoard._id, title: 'Implement Redis caching', description: 'Add Redis-based caching layer for improved API response times', created_by: dev5._id, assignee_id: dev5._id, priority: 'high', status: 'in_progress', labels: ['java', 'cache', 'performance'] },
    { project_id: springBoard._id, title: 'Add API documentation', description: 'Generate OpenAPI/Swagger documentation automatically', created_by: dev5._id, assignee_id: dev4._id, priority: 'low', status: 'open', labels: ['docs', 'api'] },
    { project_id: cppEngine._id, title: 'Add AABB collision detection', description: 'Implement axis-aligned bounding box collision detection for 2D sprites', created_by: dev6._id, assignee_id: dev6._id, priority: 'high', status: 'in_progress', labels: ['cpp', 'physics', 'collision'] },
    { project_id: cppEngine._id, title: 'Implement audio playback', description: 'Add WAV and MP3 audio file playback using OpenAL', created_by: dev6._id, assignee_id: alex._id, priority: 'medium', status: 'backlog', labels: ['cpp', 'audio', 'feature'] },
    { project_id: healthTrack._id, title: 'Build water intake logger', description: 'Allow users to log daily water consumption with reminders', created_by: marcus._id, assignee_id: demo._id, priority: 'medium', status: 'open', labels: ['feature', 'health', 'mobile'] },
    { project_id: cloudDeploy._id, title: 'Add Azure deployment support', description: 'Support deployment to Microsoft Azure cloud services', created_by: priya._id, assignee_id: dev2._id, priority: 'medium', status: 'open', labels: ['azure', 'cloud', 'deployment'] },
    { project_id: vueStore._id, title: 'Add order history page', description: 'Create an order history page with status tracking and invoice download', created_by: jordan._id, assignee_id: demo._id, priority: 'medium', status: 'open', labels: ['feature', 'ecommerce', 'ui'] },
    { project_id: devcollabApi._id, title: 'Add file upload endpoint', description: 'Implement file upload with Multer for profile avatars and attachments', created_by: demo._id, assignee_id: jordan._id, priority: 'medium', status: 'open', labels: ['feature', 'file-upload', 'api'] },
    { project_id: dataViz._id, title: 'Add bar chart race animation', description: 'Implement animated bar chart race for temporal data visualization', created_by: sarah._id, assignee_id: dev6._id, priority: 'low', status: 'open', labels: ['animation', 'visualization', 'feature'] },
    { project_id: pyML._id, title: 'Implement K-means clustering', description: 'Add K-means clustering algorithm with elbow method for K selection', created_by: dev1._id, assignee_id: jordan._id, priority: 'medium', status: 'open', labels: ['ml', 'clustering', 'python'] },
    { project_id: goMicro._id, title: 'Add circuit breaker pattern', description: 'Implement circuit breaker for resilient microservice communication', created_by: dev2._id, assignee_id: dev1._id, priority: 'medium', status: 'open', labels: ['go', 'resilience', 'pattern'] },
  ]);
  console.log('Created tasks');

  // ═══════════════════════════════════════════════
  // SNIPPETS
  // ═══════════════════════════════════════════════
  const snippets = await Snippet.insertMany([
    // --- existing snippets ---
    { user_id: alex._id, title: 'React Custom Hook for Debounced Search', description: 'A reusable React hook that debounces search input', language: 'javascript', code: 'import { useState, useEffect } from "react";\n\nexport function useDebounce(value, delay = 500) {\n  const [debounced, setDebounced] = useState(value);\n  useEffect(() => {\n    const timer = setTimeout(() => setDebounced(value), delay);\n    return () => clearTimeout(timer);\n  }, [value, delay]);\n  return debounced;\n}', tags: ['react', 'hooks', 'debounce'], visibility: 'public', project_id: taskFlow._id, likes_count: 0 },
    { user_id: alex._id, title: 'Express.js Request Logger Middleware', description: 'A simple request logger middleware for Express', language: 'javascript', code: 'function requestLogger(req, res, next) {\n  const start = Date.now();\n  res.on("finish", () => {\n    const duration = Date.now() - start;\n    console.log(\n      `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`\n    );\n  });\n  next();\n}', tags: ['express', 'middleware', 'logging'], visibility: 'public', project_id: null, likes_count: 0 },
    { user_id: sarah._id, title: 'Python Data Cleaner', description: 'Clean and preprocess data with pandas', language: 'python', code: 'import pandas as pd\nimport numpy as np\n\ndef clean_data(df):\n    df = df.drop_duplicates()\n    df = df.fillna(df.median(numeric_only=True))\n    return df', tags: ['python', 'pandas', 'data-cleaning'], visibility: 'public', project_id: dataViz._id, likes_count: 0 },
    { user_id: marcus._id, title: 'Flutter HTTP Client', description: 'HTTP client wrapper for Flutter with error handling', language: 'dart', code: 'import \'dart:convert\';\nimport \'package:http/http.dart\' as http;\n\nclass ApiClient {\n  final String baseUrl;\n  \n  Future<Map<String, dynamic>> get(String endpoint) async {\n    final response = await http.get(Uri.parse(\'$baseUrl/$endpoint\'));\n    return json.decode(response.body);\n  }\n}', tags: ['flutter', 'http', 'api'], visibility: 'public', project_id: healthTrack._id, likes_count: 0 },
    { user_id: priya._id, title: 'Go Concurrency Pattern', description: 'Worker pool pattern in Go', language: 'go', code: 'func worker(id int, jobs <-chan int, results chan<- int) {\n    for j := range jobs {\n        results <- j * 2\n    }\n}', tags: ['go', 'concurrency', 'goroutines'], visibility: 'public', project_id: cloudDeploy._id, likes_count: 0 },
    { user_id: demo._id, title: 'Mongoose Connection Setup', description: 'MongoDB connection with Mongoose', language: 'javascript', code: 'import mongoose from "mongoose";\n\nasync function connectDB(uri) {\n  try {\n    await mongoose.connect(uri);\n    console.log("MongoDB connected");\n  } catch (err) {\n    console.error("Connection error:", err);\n    process.exit(1);\n  }\n}', tags: ['mongoose', 'mongodb', 'backend'], visibility: 'public', project_id: devcollabApi._id, likes_count: 0 },
    { user_id: jordan._id, title: 'Vue.js Composables', description: 'Reusable Vue.js composables pattern', language: 'javascript', code: 'import { ref, onMounted, onUnmounted } from "vue";\n\nexport function useMouse() {\n  const x = ref(0);\n  const y = ref(0);\n  \n  function update(e) { x.value = e.pageX; y.value = e.pageY; }\n  onMounted(() => window.addEventListener("mousemove", update));\n  onUnmounted(() => window.removeEventListener("mousemove", update));\n  \n  return { x, y };\n}', tags: ['vue', 'composables', 'reactive'], visibility: 'public', project_id: vueStore._id, likes_count: 0 },
    { user_id: demo._id, title: 'Private API Key validator', description: 'A validator utility (private)', language: 'javascript', code: 'function validateApiKey(key) { return key && key.length === 32; }', tags: ['security', 'validation'], visibility: 'private', project_id: null, likes_count: 0 },
    // --- new snippets from dev users ---
    { user_id: dev1._id, title: 'Python JSON Parser with Error Handling', description: 'A robust JSON parser that provides detailed error messages for malformed input', language: 'python', code: 'import json\n\ndef safe_parse_json(data):\n    try:\n        return json.loads(data), None\n    except json.JSONDecodeError as e:\n        return None, {\n            "message": str(e),\n            "line": e.lineno,\n            "column": e.colno,\n            "position": e.pos\n        }', tags: ['python', 'json', 'parsing'], visibility: 'public', project_id: pyML._id, likes_count: 0 },
    { user_id: dev2._id, title: 'Go HTTP Router', description: 'A lightweight HTTP request router with middleware support', language: 'go', code: 'type Router struct {\n    routes map[string]http.HandlerFunc\n}\n\nfunc (r *Router) Handle(method, path string, handler http.HandlerFunc) {\n    key := method + ":" + path\n    r.routes[key] = handler\n}\n\nfunc (r *Router) ServeHTTP(w http.ResponseWriter, req *http.Request) {\n    key := req.Method + ":" + req.URL.Path\n    if handler, ok := r.routes[key]; ok {\n        handler(w, req)\n    } else {\n        http.NotFound(w, req)\n    }\n}', tags: ['go', 'http', 'router'], visibility: 'public', project_id: goMicro._id, likes_count: 0 },
    { user_id: dev3._id, title: 'Rust Error Handling with Custom Types', description: 'Custom Result type helpers for cleaner error handling in Rust', language: 'rust', code: 'pub type AppResult<T> = Result<T, AppError>;\n\n#[derive(Debug)]\npub enum AppError {\n    NotFound(String),\n    Validation(String),\n    Internal(String),\n}\n\nimpl std::fmt::Display for AppError {\n    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {\n        match self {\n            AppError::NotFound(msg) => write!(f, "Not found: {}", msg),\n            AppError::Validation(msg) => write!(f, "Validation error: {}", msg),\n            AppError::Internal(msg) => write!(f, "Internal error: {}", msg),\n        }\n    }\n}', tags: ['rust', 'error-handling', 'types'], visibility: 'public', project_id: rustyCLI._id, likes_count: 0 },
    { user_id: dev4._id, title: 'TypeScript Advanced Utility Types', description: 'Production-ready utility type definitions for TypeScript projects', language: 'typescript', code: 'type DeepPartial<T> = {\n  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];\n};\n\ntype NonEmptyArray<T> = [T, ...T[]];\n\ntype Brand<K, T> = K & { __brand: T };\n\ntype Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };', tags: ['typescript', 'types', 'utilities'], visibility: 'public', project_id: typeCore._id, likes_count: 0 },
    { user_id: dev5._id, title: 'Java Stream Collector Utilities', description: 'Custom stream collectors for common data processing patterns', language: 'java', code: 'import java.util.*;\nimport java.util.stream.*;\n\npublic class Collectors {\n    public static <T> Collector<T, ?, List<T>> toImmutableList() {\n        return Collector.of(\n            ArrayList::new,\n            List::add,\n            (left, right) -> { left.addAll(right); return left; },\n            Collections::unmodifiableList\n        );\n    }\n}', tags: ['java', 'streams', 'collections'], visibility: 'public', project_id: springBoard._id, likes_count: 0 },
    { user_id: dev6._id, title: 'C++ Memory Pool Allocator', description: 'A fast memory pool allocator for game development', language: 'cpp', code: 'template<typename T, size_t BlockSize = 4096>\nclass MemoryPool {\n    union Slot { T element; Slot* next; };\n    Slot* currentBlock;\n    Slot* freeSlot;\n    \npublic:\n    MemoryPool() : currentBlock(nullptr), freeSlot(nullptr) {}\n    \n    T* allocate() {\n        if (freeSlot == nullptr) allocateBlock();\n        Slot* slot = freeSlot;\n        freeSlot = slot->next;\n        return &slot->element;\n    }\n};', tags: ['cpp', 'memory', 'game-dev'], visibility: 'public', project_id: cppEngine._id, likes_count: 0 },
    { user_id: alex._id, title: 'Node.js JWT Auth Middleware', description: 'Production-ready JWT authentication middleware for Express', language: 'javascript', code: 'import jwt from "jsonwebtoken";\n\nexport function authenticate(req, res, next) {\n  const token = req.headers.authorization?.split(" ")[1];\n  if (!token) return res.status(401).json({ error: "No token provided" });\n  try {\n    const decoded = jwt.verify(token, process.env.JWT_SECRET);\n    req.user = decoded;\n    next();\n  } catch (err) {\n    return res.status(401).json({ error: "Invalid token" });\n  }\n}', tags: ['node', 'jwt', 'auth'], visibility: 'public', project_id: devcollabApi._id, likes_count: 0 },
    { user_id: sarah._id, title: 'Pandas DataFrame Summary Report', description: 'Generate a comprehensive summary report from a pandas DataFrame', language: 'python', code: 'import pandas as pd\n\ndef generate_report(df):\n    report = {\n        "shape": df.shape,\n        "columns": list(df.columns),\n        "dtypes": df.dtypes.astype(str).to_dict(),\n        "missing": df.isnull().sum().to_dict(),\n        "describe": df.describe(include="all").to_dict()\n    }\n    return report', tags: ['python', 'pandas', 'data-analysis'], visibility: 'public', project_id: dataViz._id, likes_count: 0 },
    // --- additional project snippets ---
    { user_id: alex._id, title: 'LocalStorage Note Manager', description: 'A simple note CRUD utility using browser localStorage API', language: 'javascript', code: 'class NoteManager {\n  constructor() {\n    this.notes = JSON.parse(localStorage.getItem("notes") || "[]");\n  }\n  add(title, content) {\n    this.notes.push({ id: Date.now(), title, content, createdAt: new Date() });\n    this.save();\n  }\n  delete(id) {\n    this.notes = this.notes.filter(n => n.id !== id);\n    this.save();\n  }\n  save() {\n    localStorage.setItem("notes", JSON.stringify(this.notes));\n  }\n}', tags: ['javascript', 'localstorage', 'notes'], visibility: 'public', project_id: privateNotes._id, likes_count: 0 },
    { user_id: dev3._id, title: 'Rust CLI Argument Parser', description: 'A lightweight argument parser for CLI tools without dependencies', language: 'rust', code: 'use std::env;\n\npub struct Args {\n    pub command: String,\n    pub flags: Vec<String>,\n    pub options: std::collections::HashMap<String, String>,\n}\n\npub fn parse_args() -> Args {\n    let args: Vec<String> = env::args().collect();\n    let mut result = Args {\n        command: String::new(),\n        flags: Vec::new(),\n        options: std::collections::HashMap::new(),\n    };\n    for arg in &args[1..] {\n        if arg.starts_with("--") {\n            result.flags.push(arg.clone());\n        }\n    }\n    result\n}', tags: ['rust', 'cli', 'parsing'], visibility: 'public', project_id: rustyCLI._id, likes_count: 0 },
    { user_id: dev2._id, title: 'Go Middleware Chain', description: 'A composable middleware chain pattern for HTTP handlers', language: 'go', code: 'type Middleware func(http.HandlerFunc) http.HandlerFunc\n\nfunc Chain(h http.HandlerFunc, middlewares ...Middleware) http.HandlerFunc {\n    for i := len(middlewares) - 1; i >= 0; i-- {\n        h = middlewares[i](h)\n    }\n    return h\n}\n\nfunc Logger(next http.HandlerFunc) http.HandlerFunc {\n    return func(w http.ResponseWriter, r *http.Request) {\n        log.Printf("%s %s", r.Method, r.URL.Path)\n        next(w, r)\n    }\n}', tags: ['go', 'http', 'middleware'], visibility: 'public', project_id: goMicro._id, likes_count: 0 },
    { user_id: dev5._id, title: 'Java REST Controller Template', description: 'Standard REST controller template with CRUD endpoints and error handling', language: 'java', code: '@RestController\n@RequestMapping("/api/v1/items")\npublic class ItemController {\n    private final ItemService service;\n\n    @GetMapping\n    public ResponseEntity<List<Item>> getAll() {\n        return ResponseEntity.ok(service.findAll());\n    }\n\n    @PostMapping\n    public ResponseEntity<Item> create(@RequestBody Item item) {\n        return ResponseEntity.status(201).body(service.save(item));\n    }\n}', tags: ['java', 'spring', 'rest'], visibility: 'public', project_id: springBoard._id, likes_count: 0 },
    { user_id: marcus._id, title: 'Flutter Local Notifications', description: 'Helper class for scheduling and showing local notifications in Flutter', language: 'dart', code: 'import \'package:flutter_local_notifications/flutter_local_notifications.dart\';\n\nclass NotificationService {\n  final FlutterLocalNotificationsPlugin plugin;\n\n  NotificationService() : plugin = FlutterLocalNotificationsPlugin();\n\n  Future<void> show(String title, String body) async {\n    const androidDetails = AndroidNotificationDetails(\'channel\', \'Health\');\n    const details = NotificationDetails(android: androidDetails);\n    await plugin.show(0, title, body, details);\n  }\n}', tags: ['flutter', 'notifications', 'mobile'], visibility: 'public', project_id: healthTrack._id, likes_count: 0 },
  ]);
  const [s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12, s13, s14, s15, s16, s17, s18, s19, s20, s21] = snippets;
  console.log(`Created ${snippets.length} snippets`);

  // ═══════════════════════════════════════════════
  // PULL REQUESTS
  // ═══════════════════════════════════════════════
  const pullRequests = await PullRequest.insertMany([
    // --- existing PRs ---
    { project_id: taskFlow._id, title: 'Add drag-and-drop board UI', description: 'Implements drag-and-drop functionality for the task board. Uses react-beautiful-dnd library.', from_branch: 'feature/drag-drop', to_branch: 'main', opened_by: demo._id, status: 'open' },
    { project_id: taskFlow._id, title: 'Implement WebSocket notifications', description: 'Adds real-time notifications using Socket.io', from_branch: 'feature/notifications', to_branch: 'main', opened_by: alex._id, status: 'open' },
    { project_id: dataViz._id, title: 'Add 3D scatter plot', description: 'Implements 3D scatter plots with interactive rotation', from_branch: 'feature/3d-plots', to_branch: 'main', opened_by: sarah._id, status: 'merged' },
    { project_id: dataViz._id, title: 'Performance optimization', description: 'Optimizes rendering for datasets with 100k+ points', from_branch: 'opt/rendering', to_branch: 'main', opened_by: alex._id, status: 'open' },
    { project_id: healthTrack._id, title: 'Step counting algorithm', description: 'Implements step counting using phone accelerometer', from_branch: 'feature/step-counter', to_branch: 'main', opened_by: marcus._id, status: 'open' },
    { project_id: cloudDeploy._id, title: 'AWS ECS deployment support', description: 'Adds ECS deployment support with Task Definitions', from_branch: 'feature/ecs', to_branch: 'main', opened_by: priya._id, status: 'open' },
    { project_id: vueStore._id, title: 'Product search feature', description: 'Full-text search with category filters', from_branch: 'feature/search', to_branch: 'main', opened_by: jordan._id, status: 'open' },
    // --- new PRs ---
    { project_id: taskFlow._id, title: 'Implement real-time notifications', description: 'Adds WebSocket-based real-time notifications for task assignments and updates', from_branch: 'feature/realtime-notifs', to_branch: 'main', opened_by: alex._id, status: 'open' },
    { project_id: devcollabApi._id, title: 'Add rate limiting', description: 'Implements configurable API rate limiting to prevent abuse using express-rate-limit', from_branch: 'feature/rate-limit', to_branch: 'main', opened_by: demo._id, status: 'open' },
    { project_id: pyML._id, title: 'Add model evaluation utils', description: 'Adds cross-validation helpers and evaluation metrics for ML models', from_branch: 'feature/evaluation', to_branch: 'main', opened_by: dev1._id, status: 'open' },
    { project_id: goMicro._id, title: 'Add health check endpoint', description: 'Adds a /healthz endpoint with dependency status checks', from_branch: 'feature/healthz', to_branch: 'main', opened_by: dev2._id, status: 'merged' },
    { project_id: springBoard._id, title: 'Add JWT auth filter', description: 'Implements a JWT-based authentication filter with role-based access control', from_branch: 'feature/jwt-auth', to_branch: 'main', opened_by: dev5._id, status: 'open' },
    { project_id: cppEngine._id, title: 'Sprite animation system', description: 'Adds sprite sheet animation support with frame interpolation', from_branch: 'feature/sprite-anim', to_branch: 'main', opened_by: dev6._id, status: 'open' },
    // --- additional PRs ---
    { project_id: healthTrack._id, title: 'Add water intake tracking', description: 'Adds water logging feature with daily goal tracking and reminders', from_branch: 'feature/water-tracker', to_branch: 'main', opened_by: demo._id, status: 'open' },
    { project_id: cloudDeploy._id, title: 'Add Azure deployment support', description: 'Adds Microsoft Azure deployment support with ARM template integration', from_branch: 'feature/azure', to_branch: 'main', opened_by: dev2._id, status: 'open' },
    { project_id: vueStore._id, title: 'Add order history page', description: 'Implements order history with status tracking and invoice download', from_branch: 'feature/order-history', to_branch: 'main', opened_by: demo._id, status: 'open' },
    { project_id: devcollabApi._id, title: 'Add GraphQL endpoint', description: 'Adds a GraphQL API endpoint alongside existing REST routes', from_branch: 'feature/graphql', to_branch: 'main', opened_by: alex._id, status: 'open' },
    { project_id: rustyCLI._id, title: 'Add JSON pretty-print command', description: 'Formats JSON input with configurable indentation and syntax highlighting', from_branch: 'feature/json-format', to_branch: 'main', opened_by: dev3._id, status: 'open' },
    { project_id: typeCore._id, title: 'Add Promise utility types', description: 'Adds Promise-related utility types and helpers for async operations', from_branch: 'feature/promise-utils', to_branch: 'main', opened_by: dev4._id, status: 'open' },
    { project_id: pyML._id, title: 'Implement PCA algorithm', description: 'Adds principal component analysis for dimensionality reduction', from_branch: 'feature/pca', to_branch: 'main', opened_by: dev1._id, status: 'open' },
  ]);
  const [pr1, pr2, pr3, pr4, pr5, pr6, pr7, pr8, pr9, pr10, pr11, pr12, pr13, pr14, pr15, pr16, pr17, pr18, pr19, pr20] = pullRequests;
  console.log(`Created ${pullRequests.length} pull requests`);

  // ═══════════════════════════════════════════════
  // PR COMMENTS
  // ═══════════════════════════════════════════════
  await PRComment.insertMany([
    // --- existing comments ---
    { pr_id: pr1._id, user_id: alex._id, content: 'Great work! I left some suggestions on the drag handler.' },
    { pr_id: pr1._id, user_id: demo._id, content: 'Thanks Alex! I\'ll review those and make updates.' },
    { pr_id: pr3._id, user_id: jordan._id, content: 'The interactive rotation is amazing!' },
    { pr_id: pr3._id, user_id: sarah._id, content: 'Thanks Jordan! Took some time to get the math right.' },
    { pr_id: pr6._id, user_id: sarah._id, content: 'Make sure to add IAM permissions documentation.' },
    // --- new comments ---
    { pr_id: pr1._id, user_id: sarah._id, content: 'The drag-and-drop implementation looks solid. Consider adding touch support.', line_reference: 45 },
    { pr_id: pr2._id, user_id: demo._id, content: 'Socket.io integration looks clean. Are we handling reconnection properly?', line_reference: 12 },
    { pr_id: pr2._id, user_id: alex._id, content: 'Yes, Socket.io has built-in reconnection. I\'ve configured exponential backoff.' },
    { pr_id: pr3._id, user_id: alex._id, content: 'The 3D rendering is impressive. What library did you use for the rotations?' },
    { pr_id: pr4._id, user_id: sarah._id, content: 'We should also add memoization for the heavy computations.', line_reference: 88 },
    { pr_id: pr4._id, user_id: alex._id, content: 'Good point, I\'ll add that in the next iteration.' },
    { pr_id: pr5._id, user_id: demo._id, content: 'The step counting accuracy is impressive. How are you handling edge cases?', line_reference: 32 },
    { pr_id: pr5._id, user_id: dev6._id, content: 'We filter out noise below a certain threshold. Works well for walking and running.' },
    { pr_id: pr6._id, user_id: jordan._id, content: 'Nice work on the ECS integration. We should document the IAM roles needed.', line_reference: 67 },
    { pr_id: pr7._id, user_id: demo._id, content: 'Search indexing looks good. We might want to add fuzzy search later.', line_reference: 23 },
    { pr_id: pr7._id, user_id: jordan._id, content: 'Agreed! Fuzzy search is on the roadmap for v2.' },
    { pr_id: pr8._id, user_id: demo._id, content: 'Real-time notifications are going to be a game changer for TaskFlow.' },
    { pr_id: pr10._id, user_id: dev4._id, content: 'The cross-validation implementation looks correct. Nice work!', line_reference: 55 },
    { pr_id: pr10._id, user_id: dev1._id, content: 'Thanks! I followed scikit-learn\'s implementation closely.' },
    { pr_id: pr12._id, user_id: dev2._id, content: 'The JWT filter looks good. We should also add refresh token support.', line_reference: 30 },
    // --- additional PR comments ---
    { pr_id: pr14._id, user_id: marcus._id, content: 'Water intake tracking will be a great addition to HealthTrack. The daily goal system looks well designed.' },
    { pr_id: pr14._id, user_id: demo._id, content: 'Thanks! I designed it to be flexible so users can customize their goals.' },
    { pr_id: pr15._id, user_id: priya._id, content: 'Azure support opens up a lot of enterprise opportunities. Great work!', line_reference: 42 },
    { pr_id: pr16._id, user_id: jordan._id, content: 'The order history page looks clean. The invoice download feature is a nice touch.' },
    { pr_id: pr16._id, user_id: demo._id, content: 'I used a simple HTML template for the invoices. Let me know if we should switch to PDF.' },
    { pr_id: pr17._id, user_id: demo._id, content: 'GraphQL will give frontend more flexibility in data fetching. Good addition.', line_reference: 15 },
    { pr_id: pr18._id, user_id: sarah._id, content: 'JSON formatting with color output sounds great. Can we add file input support too?', line_reference: 33 },
    { pr_id: pr18._id, user_id: dev3._id, content: 'Good idea! I\'ll add file input support in the next iteration.' },
    { pr_id: pr19._id, user_id: dev1._id, content: 'Promise utility types are really useful. I especially like the retry helper.', line_reference: 22 },
    { pr_id: pr20._id, user_id: dev4._id, content: 'PCA implementation looks solid. The explained variance ratio output is a nice addition.', line_reference: 48 },
  ]);
  console.log('Created PR comments');

  // ═══════════════════════════════════════════════
  // DISCUSSIONS
  // ═══════════════════════════════════════════════
  const discussions = await Discussion.insertMany([
    // --- existing discussions ---
    { project_id: taskFlow._id, author_id: demo._id, title: 'Should we migrate to TypeScript?', body: 'I think migrating to TypeScript would improve code quality and developer experience.', replies_count: 0 },
    { project_id: taskFlow._id, author_id: alex._id, title: 'New UI component library proposal', body: 'Let\'s discuss which UI library to use for the new design system.', replies_count: 0 },
    { project_id: dataViz._id, author_id: jordan._id, title: 'Dash app integration ideas', body: 'We could integrate with Plotly Dash for web-based dashboards.', replies_count: 0 },
    { project_id: cloudDeploy._id, author_id: sarah._id, title: 'Support for Kubernetes?', body: 'Would it make sense to add Kubernetes deployment support?', replies_count: 0 },
    { project_id: vueStore._id, author_id: demo._id, title: 'State management patterns', body: 'Comparing Pinia vs Vuex for our store layer.', replies_count: 0 },
    { project_id: devcollabApi._id, author_id: alex._id, title: 'API versioning strategy', body: 'Should we use URL prefix or header-based versioning?', replies_count: 0 },
    // --- new discussions ---
    { project_id: pyML._id, author_id: dev1._id, title: 'Model deployment strategies', body: 'What are the best approaches for deploying trained ML models to production?', replies_count: 0 },
    { project_id: goMicro._id, author_id: dev2._id, title: 'gRPC vs REST for microservices', body: 'Comparing gRPC and REST for inter-service communication in our architecture.', replies_count: 0 },
    { project_id: typeCore._id, author_id: dev4._id, title: 'Should we add Zod validation?', body: 'I think integrating Zod for runtime type validation would improve our TypeScript experience.', replies_count: 0 },
    { project_id: springBoard._id, author_id: dev5._id, title: 'Spring Boot 3 migration plan', body: 'We should plan the migration to Spring Boot 3 and Java 17.', replies_count: 0 },
    { project_id: cppEngine._id, author_id: dev6._id, title: 'CMake vs Bazel build system', body: 'Evaluating build system options for better scalability with our growing codebase.', replies_count: 0 },
    { project_id: healthTrack._id, author_id: marcus._id, title: 'Adding wearable device support', body: 'Exploring integration with Fitbit, Apple Watch, and Wear OS for better health tracking.', replies_count: 0 },
    { project_id: cloudDeploy._id, author_id: priya._id, title: 'Multi-region deployment strategy', body: 'How should we handle multi-region deployments for low-latency global access?', replies_count: 0 },
    { project_id: taskFlow._id, author_id: alex._id, title: 'Dark mode UI design', body: 'Let\'s design and implement a dark mode theme for the application.', replies_count: 0 },
    // --- additional discussions ---
    { project_id: healthTrack._id, author_id: marcus._id, title: 'Nutrition tracking roadmap', body: 'Planning the nutrition tracking feature: barcode scanning, meal logging, and dietary insights.', replies_count: 0 },
    { project_id: healthTrack._id, author_id: demo._id, title: 'Apple Health integration', body: 'Should we integrate with Apple HealthKit for seamless data syncing?', replies_count: 0 },
    { project_id: vueStore._id, author_id: jordan._id, title: 'Payment gateway options', body: 'Comparing Stripe, PayPal, and local payment providers for our global audience.', replies_count: 0 },
    { project_id: devcollabApi._id, author_id: demo._id, title: 'Webhook event system', body: 'Proposal for a webhook system that notifies external services of events.', replies_count: 0 },
    { project_id: privateNotes._id, author_id: alex._id, title: 'Feature request: tags and categories', body: 'We should add hierarchical categories and color-coded tags for better note organization.', replies_count: 0 },
    { project_id: rustyCLI._id, author_id: dev3._id, title: 'Community plugin system', body: 'Designing a plugin architecture so the community can contribute new CLI commands.', replies_count: 0 },
    { project_id: dataViz._id, author_id: sarah._id, title: 'Real-time data streaming', body: 'Adding WebSocket-based real-time data streaming for live dashboard updates.', replies_count: 0 },
    { project_id: cppEngine._id, author_id: dev6._id, title: 'Physics engine integration', body: 'Should we integrate Box2D or write our own physics engine for 2D games?', replies_count: 0 },
  ]);
  const [d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12, d13, d14, d15, d16, d17, d18, d19, d20, d21, d22] = discussions;
  console.log(`Created ${discussions.length} discussions`);

  // ═══════════════════════════════════════════════
  // DISCUSSION REPLIES
  // ═══════════════════════════════════════════════
  await DiscussionReply.insertMany([
    // --- existing replies ---
    { discussion_id: d1._id, author_id: alex._id, content: 'Good idea! I\'ve been thinking the same. TypeScript would catch many bugs early.' },
    { discussion_id: d1._id, author_id: demo._id, content: 'Agreed. The migration could be done incrementally.' },
    { discussion_id: d2._id, author_id: demo._id, content: 'I suggest we go with Material-UI for consistency.' },
    { discussion_id: d3._id, author_id: sarah._id, content: 'Great idea! I can work on the integration.' },
    { discussion_id: d3._id, author_id: priya._id, content: 'This would be useful for the CloudDeploy dashboard too.' },
    { discussion_id: d3._id, author_id: jordan._id, content: 'Let me create a POC and share it.' },
    { discussion_id: d4._id, author_id: priya._id, content: 'Yes! K8s support is the next big feature we need.' },
    { discussion_id: d4._id, author_id: sarah._id, content: 'I can help with the Helm charts.' },
    { discussion_id: d5._id, author_id: jordan._id, content: 'Pinia is more lightweight and has better TypeScript support.' },
    { discussion_id: d6._id, author_id: demo._id, content: 'I prefer URL prefix versioning — more explicit.' },
    { discussion_id: d6._id, author_id: alex._id, content: 'True, but header-based keeps URLs cleaner.' },
    // --- new replies ---
    { discussion_id: d1._id, author_id: dev4._id, content: 'I\'d love to help with the migration. We did a similar migration at my last company.' },
    { discussion_id: d2._id, author_id: dev4._id, content: 'I recommend using a Tailwind-based component library like shadcn/ui for maximum flexibility.' },
    { discussion_id: d3._id, author_id: dev1._id, content: 'I can help with the Python backend integration for the dashboards.' },
    { discussion_id: d4._id, author_id: dev2._id, content: 'Kubernetes would be a great addition. I have experience with K8s deployments.' },
    { discussion_id: d4._id, author_id: jordan._id, content: 'I\'ve been looking into this too. The monitoring story with K8s is much better.' },
    { discussion_id: d5._id, author_id: dev3._id, content: 'Pinia has been working great for us. The devtools integration is excellent.' },
    { discussion_id: d5._id, author_id: alex._id, content: 'We should standardize on one approach across all frontend projects.' },
    { discussion_id: d6._id, author_id: dev4._id, content: 'URL prefix is more RESTful and easier to debug in my opinion.' },
    { discussion_id: d6._id, author_id: priya._id, content: 'We use header-based at my work and it works fine. Both are valid approaches.' },
    { discussion_id: d7._id, author_id: alex._id, content: 'Good topic! MLflow is worth looking at for model versioning and deployment.' },
    { discussion_id: d7._id, author_id: dev1._id, content: 'Thanks, I\'ll check out MLflow. Docker containers with model servers seem like the way to go.' },
    { discussion_id: d8._id, author_id: priya._id, content: 'gRPC has better performance for internal services, especially with streaming.' },
    { discussion_id: d8._id, author_id: dev2._id, content: 'True, but REST is easier for external APIs and debugging. Maybe a hybrid approach?' },
    { discussion_id: d9._id, author_id: alex._id, content: 'Zod is great, we use it in TaskFlow. The inferred types are a game changer.' },
    { discussion_id: d9._id, author_id: dev4._id, content: 'Good to know, I\'ll look into integrating it with our existing validation.' },
    { discussion_id: d12._id, author_id: demo._id, content: 'I can help with the frontend integration for wearables. The Web Bluetooth API could work.' },
    { discussion_id: d12._id, author_id: sarah._id, content: 'We could add health data visualization dashboards for wearable data.' },
    { discussion_id: d13._id, author_id: sarah._id, content: 'This is crucial for latency optimization. We should look into global load balancers.' },
    { discussion_id: d13._id, author_id: dev1._id, content: 'I\'ve implemented multi-region deployments before, happy to share what I learned.' },
    { discussion_id: d14._id, author_id: jordan._id, content: 'Great idea! I\'ll create a design proposal with both light and dark mode variants.' },
    // --- additional replies ---
    { discussion_id: d10._id, author_id: dev5._id, content: 'Spring Boot 3 has some great features. The migration is worth the effort.' },
    { discussion_id: d10._id, author_id: dev2._id, content: 'We should also plan for Java 17 compatibility at the same time.' },
    { discussion_id: d11._id, author_id: dev3._id, content: 'Bazel is more scalable for large projects, but CMake has better ecosystem support for C++.' },
    { discussion_id: d11._id, author_id: alex._id, content: 'I\'d recommend starting with CMake and migrating to Bazel if we hit scaling issues.' },
    { discussion_id: d15._id, author_id: demo._id, content: 'Barcode scanning would be a great feature. We could use the phone camera API.' },
    { discussion_id: d15._id, author_id: marcus._id, content: 'I\'ll look into the Nutritionix API for food database integration.' },
    { discussion_id: d16._id, author_id: marcus._id, content: 'Apple Health integration is a must-have for iOS users. I\'ll start the research.' },
    { discussion_id: d16._id, author_id: dev4._id, content: 'We could use HealthKit on iOS and Google Fit API on Android.' },
    { discussion_id: d17._id, author_id: demo._id, content: 'Stripe has the best developer experience. I\'d recommend starting there.' },
    { discussion_id: d17._id, author_id: jordan._id, content: 'We can always add more providers later. Let\'s start with Stripe and PayPal.' },
    { discussion_id: d18._id, author_id: alex._id, content: 'Webhooks would enable great integrations with CI/CD pipelines and Slack.' },
    { discussion_id: d18._id, author_id: demo._id, content: 'We should use a webhook queue to ensure reliable delivery.' },
    { discussion_id: d19._id, author_id: demo._id, content: 'Hierarchical categories sound great. I can work on the backend API.' },
    { discussion_id: d19._id, author_id: alex._id, content: 'Let me design the data model for categories and tags.' },
    { discussion_id: d20._id, author_id: dev6._id, content: 'A plugin system would make Rusty CLI really powerful. I can help with the Rust side.' },
    { discussion_id: d20._id, author_id: dev3._id, content: 'We should design the plugin API carefully for backwards compatibility.' },
    { discussion_id: d21._id, author_id: alex._id, content: 'Real-time streaming would be amazing. We can use Server-Sent Events for simplicity.' },
    { discussion_id: d21._id, author_id: dev6._id, content: 'I\'ve used WebSockets for this before. Either approach works well.' },
    { discussion_id: d22._id, author_id: dev3._id, content: 'Box2D is battle-tested. I\'d recommend integrating it rather than building from scratch.' },
    { discussion_id: d22._id, author_id: dev6._id, content: 'True, but a custom 2D physics engine could be a great learning experience.' },
  ]);
  console.log('Created discussion replies');

  // ═══════════════════════════════════════════════
  // ACTIVITY LOGS
  // ═══════════════════════════════════════════════
  await ActivityLog.insertMany([
    // --- Alex (10 activities) ---
    { user_id: alex._id, action_type: 'create', entity_type: 'project', entity_id: taskFlow._id, description: 'Created project TaskFlow' },
    { user_id: alex._id, action_type: 'update', entity_type: 'task', entity_id: null, description: 'Updated task "Set up CI/CD pipeline" status to in_progress' },
    { user_id: alex._id, action_type: 'comment', entity_type: 'pr', entity_id: pr1._id, description: 'Reviewed PR "Add drag-and-drop board UI"' },
    { user_id: alex._id, action_type: 'create', entity_type: 'snippet', entity_id: s1._id, description: 'Created snippet "React Custom Hook for Debounced Search"' },
    { user_id: alex._id, action_type: 'create', entity_type: 'discussion', entity_id: d2._id, description: 'Created discussion "New UI component library proposal"' },
    { user_id: alex._id, action_type: 'create', entity_type: 'discussion', entity_id: d6._id, description: 'Created discussion "API versioning strategy"' },
    { user_id: alex._id, action_type: 'create', entity_type: 'discussion', entity_id: d14._id, description: 'Created discussion "Dark mode UI design"' },
    { user_id: alex._id, action_type: 'create', entity_type: 'pr', entity_id: pr2._id, description: 'Opened PR "Implement WebSocket notifications"' },
    { user_id: alex._id, action_type: 'create', entity_type: 'pr', entity_id: pr8._id, description: 'Opened PR "Implement real-time notifications"' },
    { user_id: alex._id, action_type: 'create', entity_type: 'snippet', entity_id: s15._id, description: 'Created snippet "Node.js JWT Auth Middleware"' },

    // --- Sarah (10 activities) ---
    { user_id: sarah._id, action_type: 'create', entity_type: 'project', entity_id: dataViz._id, description: 'Created project DataVizPro' },
    { user_id: sarah._id, action_type: 'create', entity_type: 'snippet', entity_id: s3._id, description: 'Created snippet "Python Data Cleaner"' },
    { user_id: sarah._id, action_type: 'create', entity_type: 'snippet', entity_id: s16._id, description: 'Created snippet "Pandas DataFrame Summary Report"' },
    { user_id: sarah._id, action_type: 'create', entity_type: 'discussion', entity_id: d4._id, description: 'Created discussion "Support for Kubernetes?"' },
    { user_id: sarah._id, action_type: 'reply', entity_type: 'discussion', entity_id: d3._id, description: 'Replied to discussion "Dash app integration ideas"' },
    { user_id: sarah._id, action_type: 'comment', entity_type: 'pr', entity_id: pr6._id, description: 'Reviewed PR "AWS ECS deployment support"' },
    { user_id: sarah._id, action_type: 'comment', entity_type: 'pr', entity_id: pr1._id, description: 'Commented on PR "Add drag-and-drop board UI"' },
    { user_id: sarah._id, action_type: 'update', entity_type: 'task', entity_id: null, description: 'Updated task "Add 3D scatter plot support"' },
    { user_id: sarah._id, action_type: 'create', entity_type: 'pr', entity_id: pr3._id, description: 'Opened PR "Add 3D scatter plot"' },
    { user_id: sarah._id, action_type: 'reply', entity_type: 'discussion', entity_id: d13._id, description: 'Replied to discussion "Multi-region deployment strategy"' },

    // --- Marcus (8 activities) ---
    { user_id: marcus._id, action_type: 'create', entity_type: 'project', entity_id: healthTrack._id, description: 'Created project HealthTrack' },
    { user_id: marcus._id, action_type: 'create', entity_type: 'snippet', entity_id: s4._id, description: 'Created snippet "Flutter HTTP Client"' },
    { user_id: marcus._id, action_type: 'update', entity_type: 'task', entity_id: null, description: 'Updated task "Implement step counting algorithm"' },
    { user_id: marcus._id, action_type: 'create', entity_type: 'pr', entity_id: pr5._id, description: 'Opened PR "Step counting algorithm"' },
    { user_id: marcus._id, action_type: 'create', entity_type: 'discussion', entity_id: d12._id, description: 'Created discussion "Adding wearable device support"' },
    { user_id: marcus._id, action_type: 'reply', entity_type: 'discussion', entity_id: d5._id, description: 'Replied to discussion "State management patterns"' },
    { user_id: marcus._id, action_type: 'like', entity_type: 'snippet', entity_id: s1._id, description: 'Liked snippet "React Custom Hook for Debounced Search"' },
    { user_id: marcus._id, action_type: 'login', entity_type: 'user', entity_id: null, description: 'Logged into DevCollab' },

    // --- Priya (9 activities) ---
    { user_id: priya._id, action_type: 'create', entity_type: 'project', entity_id: cloudDeploy._id, description: 'Created project CloudDeploy' },
    { user_id: priya._id, action_type: 'create', entity_type: 'snippet', entity_id: s5._id, description: 'Created snippet "Go Concurrency Pattern"' },
    { user_id: priya._id, action_type: 'update', entity_type: 'task', entity_id: null, description: 'Updated task "Add AWS ECS support"' },
    { user_id: priya._id, action_type: 'create', entity_type: 'pr', entity_id: pr6._id, description: 'Opened PR "AWS ECS deployment support"' },
    { user_id: priya._id, action_type: 'reply', entity_type: 'discussion', entity_id: d4._id, description: 'Replied to discussion "Support for Kubernetes?"' },
    { user_id: priya._id, action_type: 'create', entity_type: 'discussion', entity_id: d13._id, description: 'Created discussion "Multi-region deployment strategy"' },
    { user_id: priya._id, action_type: 'reply', entity_type: 'discussion', entity_id: d8._id, description: 'Replied to discussion "gRPC vs REST for microservices"' },
    { user_id: priya._id, action_type: 'login', entity_type: 'user', entity_id: null, description: 'Logged into DevCollab' },
    { user_id: priya._id, action_type: 'like', entity_type: 'snippet', entity_id: s4._id, description: 'Liked snippet "Flutter HTTP Client"' },

    // --- Jordan (9 activities) ---
    { user_id: jordan._id, action_type: 'create', entity_type: 'project', entity_id: vueStore._id, description: 'Created project VueStore' },
    { user_id: jordan._id, action_type: 'create', entity_type: 'snippet', entity_id: s7._id, description: 'Created snippet "Vue.js Composables"' },
    { user_id: jordan._id, action_type: 'create', entity_type: 'discussion', entity_id: d3._id, description: 'Created discussion "Dash app integration ideas"' },
    { user_id: jordan._id, action_type: 'comment', entity_type: 'pr', entity_id: pr3._id, description: 'Reviewed PR "Add 3D scatter plot"' },
    { user_id: jordan._id, action_type: 'create', entity_type: 'pr', entity_id: pr7._id, description: 'Opened PR "Product search feature"' },
    { user_id: jordan._id, action_type: 'reply', entity_type: 'discussion', entity_id: d5._id, description: 'Replied to discussion "State management patterns"' },
    { user_id: jordan._id, action_type: 'reply', entity_type: 'discussion', entity_id: d4._id, description: 'Replied to discussion "Support for Kubernetes?"' },
    { user_id: jordan._id, action_type: 'reply', entity_type: 'discussion', entity_id: d14._id, description: 'Replied to discussion "Dark mode UI design"' },
    { user_id: jordan._id, action_type: 'like', entity_type: 'snippet', entity_id: s3._id, description: 'Liked snippet "Python Data Cleaner"' },

    // --- Demo User (10 activities) ---
    { user_id: demo._id, action_type: 'create', entity_type: 'project', entity_id: devcollabApi._id, description: 'Created project DevCollab API' },
    { user_id: demo._id, action_type: 'register', entity_type: 'user', entity_id: null, description: 'Joined DevCollab' },
    { user_id: demo._id, action_type: 'follow', entity_type: 'user', entity_id: alex._id, description: 'Started following Alex Johnson' },
    { user_id: demo._id, action_type: 'create', entity_type: 'pr', entity_id: pr1._id, description: 'Opened PR "Add drag-and-drop board UI"' },
    { user_id: demo._id, action_type: 'comment', entity_type: 'pr', entity_id: pr1._id, description: 'Commented on PR "Add drag-and-drop board UI"' },
    { user_id: demo._id, action_type: 'create', entity_type: 'snippet', entity_id: s6._id, description: 'Created snippet "Mongoose Connection Setup"' },
    { user_id: demo._id, action_type: 'create', entity_type: 'discussion', entity_id: d1._id, description: 'Created discussion "Should we migrate to TypeScript?"' },
    { user_id: demo._id, action_type: 'create', entity_type: 'discussion', entity_id: d5._id, description: 'Created discussion "State management patterns"' },
    { user_id: demo._id, action_type: 'create', entity_type: 'pr', entity_id: pr9._id, description: 'Opened PR "Add rate limiting"' },
    { user_id: demo._id, action_type: 'update', entity_type: 'task', entity_id: null, description: 'Updated task "Write API documentation"' },

    // --- Admin User (5 activities) ---
    { user_id: admin._id, action_type: 'register', entity_type: 'user', entity_id: null, description: 'Registered as platform administrator' },
    { user_id: admin._id, action_type: 'update', entity_type: 'user', entity_id: null, description: 'Reviewed and dismissed content flag' },
    { user_id: admin._id, action_type: 'login', entity_type: 'user', entity_id: null, description: 'Logged into the admin dashboard' },
    { user_id: admin._id, action_type: 'update', entity_type: 'user', entity_id: null, description: 'Updated platform settings and security policies' },
    { user_id: admin._id, action_type: 'comment', entity_type: 'pr', entity_id: null, description: 'Left an admin review on platform guidelines' },

    // --- dev1 (Developer One) - 7 activities ---
    { user_id: dev1._id, action_type: 'create', entity_type: 'project', entity_id: pyML._id, description: 'Created project PyML Toolkit' },
    { user_id: dev1._id, action_type: 'create', entity_type: 'snippet', entity_id: s9._id, description: 'Created snippet "Python JSON Parser with Error Handling"' },
    { user_id: dev1._id, action_type: 'create', entity_type: 'pr', entity_id: pr10._id, description: 'Opened PR "Add model evaluation utils"' },
    { user_id: dev1._id, action_type: 'update', entity_type: 'task', entity_id: null, description: 'Updated task "Add random forest classifier"' },
    { user_id: dev1._id, action_type: 'create', entity_type: 'discussion', entity_id: d7._id, description: 'Created discussion "Model deployment strategies"' },
    { user_id: dev1._id, action_type: 'reply', entity_type: 'discussion', entity_id: d3._id, description: 'Replied to discussion "Dash app integration ideas"' },
    { user_id: dev1._id, action_type: 'comment', entity_type: 'pr', entity_id: pr4._id, description: 'Commented on PR "Performance optimization"' },

    // --- dev2 - 7 activities ---
    { user_id: dev2._id, action_type: 'create', entity_type: 'project', entity_id: goMicro._id, description: 'Created project GoMicro API' },
    { user_id: dev2._id, action_type: 'create', entity_type: 'snippet', entity_id: s10._id, description: 'Created snippet "Go HTTP Router"' },
    { user_id: dev2._id, action_type: 'create', entity_type: 'pr', entity_id: pr11._id, description: 'Opened PR "Add health check endpoint"' },
    { user_id: dev2._id, action_type: 'update', entity_type: 'task', entity_id: null, description: 'Updated task "Implement service discovery"' },
    { user_id: dev2._id, action_type: 'create', entity_type: 'discussion', entity_id: d8._id, description: 'Created discussion "gRPC vs REST for microservices"' },
    { user_id: dev2._id, action_type: 'reply', entity_type: 'discussion', entity_id: d4._id, description: 'Replied to discussion "Support for Kubernetes?"' },
    { user_id: dev2._id, action_type: 'comment', entity_type: 'pr', entity_id: pr12._id, description: 'Commented on PR "Add JWT auth filter"' },

    // --- dev3 - 7 activities ---
    { user_id: dev3._id, action_type: 'create', entity_type: 'project', entity_id: rustyCLI._id, description: 'Created project Rusty CLI' },
    { user_id: dev3._id, action_type: 'create', entity_type: 'snippet', entity_id: s11._id, description: 'Created snippet "Rust Error Handling with Custom Types"' },
    { user_id: dev3._id, action_type: 'update', entity_type: 'task', entity_id: null, description: 'Updated task "Implement grep-like tool"' },
    { user_id: dev3._id, action_type: 'comment', entity_type: 'pr', entity_id: pr7._id, description: 'Commented on PR "Product search feature"' },
    { user_id: dev3._id, action_type: 'like', entity_type: 'snippet', entity_id: s7._id, description: 'Liked snippet "Vue.js Composables"' },
    { user_id: dev3._id, action_type: 'reply', entity_type: 'discussion', entity_id: d5._id, description: 'Replied to discussion "State management patterns"' },
    { user_id: dev3._id, action_type: 'login', entity_type: 'user', entity_id: null, description: 'Logged into DevCollab' },

    // --- dev4 - 8 activities ---
    { user_id: dev4._id, action_type: 'create', entity_type: 'project', entity_id: typeCore._id, description: 'Created project TypeCore' },
    { user_id: dev4._id, action_type: 'create', entity_type: 'snippet', entity_id: s12._id, description: 'Created snippet "TypeScript Advanced Utility Types"' },
    { user_id: dev4._id, action_type: 'update', entity_type: 'task', entity_id: null, description: 'Updated task "Add utility types"' },
    { user_id: dev4._id, action_type: 'create', entity_type: 'discussion', entity_id: d9._id, description: 'Created discussion "Should we add Zod validation?"' },
    { user_id: dev4._id, action_type: 'reply', entity_type: 'discussion', entity_id: d1._id, description: 'Replied to discussion "Should we migrate to TypeScript?"' },
    { user_id: dev4._id, action_type: 'reply', entity_type: 'discussion', entity_id: d6._id, description: 'Replied to discussion "API versioning strategy"' },
    { user_id: dev4._id, action_type: 'comment', entity_type: 'pr', entity_id: pr10._id, description: 'Commented on PR "Add model evaluation utils"' },
    { user_id: dev4._id, action_type: 'login', entity_type: 'user', entity_id: null, description: 'Logged into DevCollab' },

    // --- dev5 - 7 activities ---
    { user_id: dev5._id, action_type: 'create', entity_type: 'project', entity_id: springBoard._id, description: 'Created project SpringBoard' },
    { user_id: dev5._id, action_type: 'create', entity_type: 'snippet', entity_id: s13._id, description: 'Created snippet "Java Stream Collector Utilities"' },
    { user_id: dev5._id, action_type: 'create', entity_type: 'pr', entity_id: pr12._id, description: 'Opened PR "Add JWT auth filter"' },
    { user_id: dev5._id, action_type: 'create', entity_type: 'discussion', entity_id: d10._id, description: 'Created discussion "Spring Boot 3 migration plan"' },
    { user_id: dev5._id, action_type: 'reply', entity_type: 'discussion', entity_id: d2._id, description: 'Replied to discussion "New UI component library proposal"' },
    { user_id: dev5._id, action_type: 'like', entity_type: 'snippet', entity_id: s6._id, description: 'Liked snippet "Mongoose Connection Setup"' },
    { user_id: dev5._id, action_type: 'login', entity_type: 'user', entity_id: null, description: 'Logged into DevCollab' },

    // --- dev6 - 7 activities ---
    { user_id: dev6._id, action_type: 'create', entity_type: 'project', entity_id: cppEngine._id, description: 'Created project CPP Game Engine' },
    { user_id: dev6._id, action_type: 'create', entity_type: 'snippet', entity_id: s14._id, description: 'Created snippet "C++ Memory Pool Allocator"' },
    { user_id: dev6._id, action_type: 'create', entity_type: 'pr', entity_id: pr13._id, description: 'Opened PR "Sprite animation system"' },
    { user_id: dev6._id, action_type: 'update', entity_type: 'task', entity_id: null, description: 'Updated task "Add sprite rendering"' },
    { user_id: dev6._id, action_type: 'create', entity_type: 'discussion', entity_id: d11._id, description: 'Created discussion "CMake vs Bazel build system"' },
    { user_id: dev6._id, action_type: 'comment', entity_type: 'pr', entity_id: pr5._id, description: 'Commented on PR "Step counting algorithm"' },
    { user_id: dev6._id, action_type: 'like', entity_type: 'snippet', entity_id: s4._id, description: 'Liked snippet "Flutter HTTP Client"' },
    // --- additional activities for new content ---
    { user_id: alex._id, action_type: 'create', entity_type: 'snippet', entity_id: s17._id, description: 'Created snippet "LocalStorage Note Manager"' },
    { user_id: alex._id, action_type: 'create', entity_type: 'discussion', entity_id: d19._id, description: 'Created discussion "Feature request: tags and categories"' },
    { user_id: alex._id, action_type: 'create', entity_type: 'pr', entity_id: pr17._id, description: 'Opened PR "Add GraphQL endpoint"' },
    { user_id: alex._id, action_type: 'comment', entity_type: 'pr', entity_id: pr14._id, description: 'Reviewed PR "Add water intake tracking"' },
    { user_id: demo._id, action_type: 'create', entity_type: 'pr', entity_id: pr14._id, description: 'Opened PR "Add water intake tracking"' },
    { user_id: demo._id, action_type: 'create', entity_type: 'pr', entity_id: pr16._id, description: 'Opened PR "Add order history page"' },
    { user_id: demo._id, action_type: 'create', entity_type: 'discussion', entity_id: d18._id, description: 'Created discussion "Webhook event system"' },
    { user_id: marcus._id, action_type: 'create', entity_type: 'discussion', entity_id: d15._id, description: 'Created discussion "Nutrition tracking roadmap"' },
    { user_id: marcus._id, action_type: 'create', entity_type: 'snippet', entity_id: s21._id, description: 'Created snippet "Flutter Local Notifications"' },
    { user_id: dev1._id, action_type: 'create', entity_type: 'pr', entity_id: pr20._id, description: 'Opened PR "Implement PCA algorithm"' },
    { user_id: dev2._id, action_type: 'create', entity_type: 'pr', entity_id: pr15._id, description: 'Opened PR "Add Azure deployment support"' },
    { user_id: dev2._id, action_type: 'create', entity_type: 'snippet', entity_id: s19._id, description: 'Created snippet "Go Middleware Chain"' },
    { user_id: dev3._id, action_type: 'create', entity_type: 'pr', entity_id: pr18._id, description: 'Opened PR "Add JSON pretty-print command"' },
    { user_id: dev3._id, action_type: 'create', entity_type: 'snippet', entity_id: s18._id, description: 'Created snippet "Rust CLI Argument Parser"' },
    { user_id: dev3._id, action_type: 'create', entity_type: 'discussion', entity_id: d20._id, description: 'Created discussion "Community plugin system"' },
    { user_id: dev4._id, action_type: 'create', entity_type: 'pr', entity_id: pr19._id, description: 'Opened PR "Add Promise utility types"' },
    { user_id: dev5._id, action_type: 'create', entity_type: 'snippet', entity_id: s20._id, description: 'Created snippet "Java REST Controller Template"' },
    { user_id: dev6._id, action_type: 'create', entity_type: 'discussion', entity_id: d22._id, description: 'Created discussion "Physics engine integration"' },
    { user_id: sarah._id, action_type: 'create', entity_type: 'discussion', entity_id: d21._id, description: 'Created discussion "Real-time data streaming"' },
    { user_id: jordan._id, action_type: 'create', entity_type: 'discussion', entity_id: d17._id, description: 'Created discussion "Payment gateway options"' },
  ]);
  console.log('Created activity logs');

  // ═══════════════════════════════════════════════
  // FLAGS
  // ═══════════════════════════════════════════════
  await Flag.insertMany([
    { reporter_id: alex._id, target_type: 'user', target_id: demo._id, reason: 'spam', description: 'Spamming in comments' },
    { reporter_id: sarah._id, target_type: 'user', target_id: null, reason: 'inappropriate', description: 'Inappropriate content in discussion' },
  ]);
  console.log('Created flags');

  // ═══════════════════════════════════════════════
  // SNIPPET LIKES (multiple users like each snippet)
  // ═══════════════════════════════════════════════
  const snippetLikePairs = [
    // s1: React Custom Hook for Debounced Search
    { snippet_id: s1._id, user_id: demo._id },
    { snippet_id: s1._id, user_id: marcus._id },
    { snippet_id: s1._id, user_id: dev4._id },
    { snippet_id: s1._id, user_id: dev1._id },
    { snippet_id: s1._id, user_id: jordan._id },
    // s2: Express.js Request Logger Middleware
    { snippet_id: s2._id, user_id: demo._id },
    { snippet_id: s2._id, user_id: dev5._id },
    { snippet_id: s2._id, user_id: dev2._id },
    // s3: Python Data Cleaner
    { snippet_id: s3._id, user_id: demo._id },
    { snippet_id: s3._id, user_id: jordan._id },
    { snippet_id: s3._id, user_id: dev1._id },
    { snippet_id: s3._id, user_id: alex._id },
    { snippet_id: s3._id, user_id: dev4._id },
    // s4: Flutter HTTP Client
    { snippet_id: s4._id, user_id: demo._id },
    { snippet_id: s4._id, user_id: priya._id },
    { snippet_id: s4._id, user_id: dev6._id },
    { snippet_id: s4._id, user_id: dev3._id },
    // s5: Go Concurrency Pattern
    { snippet_id: s5._id, user_id: demo._id },
    { snippet_id: s5._id, user_id: dev2._id },
    { snippet_id: s5._id, user_id: alex._id },
    { snippet_id: s5._id, user_id: sarah._id },
    // s6: Mongoose Connection Setup
    { snippet_id: s6._id, user_id: demo._id },
    { snippet_id: s6._id, user_id: dev5._id },
    { snippet_id: s6._id, user_id: dev1._id },
    // s7: Vue.js Composables
    { snippet_id: s7._id, user_id: demo._id },
    { snippet_id: s7._id, user_id: dev3._id },
    { snippet_id: s7._id, user_id: alex._id },
    { snippet_id: s7._id, user_id: jordan._id },
    // s8: Private API Key validator (private - only liked by demo)
    { snippet_id: s8._id, user_id: demo._id },
    // s9: Python JSON Parser
    { snippet_id: s9._id, user_id: demo._id },
    { snippet_id: s9._id, user_id: dev4._id },
    { snippet_id: s9._id, user_id: alex._id },
    // s10: Go HTTP Router
    { snippet_id: s10._id, user_id: dev5._id },
    { snippet_id: s10._id, user_id: dev2._id },
    { snippet_id: s10._id, user_id: priya._id },
    // s11: Rust Error Handling
    { snippet_id: s11._id, user_id: dev6._id },
    { snippet_id: s11._id, user_id: dev3._id },
    { snippet_id: s11._id, user_id: marcus._id },
    // s12: TypeScript Advanced Utility Types
    { snippet_id: s12._id, user_id: dev4._id },
    { snippet_id: s12._id, user_id: dev1._id },
    { snippet_id: s12._id, user_id: alex._id },
    // s13: Java Stream Collector Utilities
    { snippet_id: s13._id, user_id: dev5._id },
    { snippet_id: s13._id, user_id: dev2._id },
    // s14: C++ Memory Pool Allocator
    { snippet_id: s14._id, user_id: dev6._id },
    { snippet_id: s14._id, user_id: dev3._id },
    { snippet_id: s14._id, user_id: marcus._id },
    // s15: Node.js JWT Auth Middleware
    { snippet_id: s15._id, user_id: alex._id },
    { snippet_id: s15._id, user_id: demo._id },
    { snippet_id: s15._id, user_id: dev5._id },
    // s16: Pandas DataFrame Summary Report
    { snippet_id: s16._id, user_id: sarah._id },
    { snippet_id: s16._id, user_id: alex._id },
    { snippet_id: s16._id, user_id: dev4._id },
    // s17: LocalStorage Note Manager
    { snippet_id: s17._id, user_id: alex._id },
    { snippet_id: s17._id, user_id: demo._id },
    { snippet_id: s17._id, user_id: jordan._id },
    // s18: Rust CLI Argument Parser
    { snippet_id: s18._id, user_id: dev3._id },
    { snippet_id: s18._id, user_id: dev6._id },
    { snippet_id: s18._id, user_id: marcus._id },
    // s19: Go Middleware Chain
    { snippet_id: s19._id, user_id: dev2._id },
    { snippet_id: s19._id, user_id: priya._id },
    { snippet_id: s19._id, user_id: sarah._id },
    // s20: Java REST Controller Template
    { snippet_id: s20._id, user_id: dev5._id },
    { snippet_id: s20._id, user_id: dev1._id },
    { snippet_id: s20._id, user_id: alex._id },
    // s21: Flutter Local Notifications
    { snippet_id: s21._id, user_id: marcus._id },
    { snippet_id: s21._id, user_id: demo._id },
    { snippet_id: s21._id, user_id: jordan._id },
  ];

  await SnippetLike.insertMany(snippetLikePairs);
  console.log('Created snippet likes');

  // ═══════════════════════════════════════════════
  // UPDATE COUNTERS
  // ═══════════════════════════════════════════════

  // Update follower/following counts
  for (const user of users) {
    const followersCount = await Follow.countDocuments({ following_id: user._id });
    const followingCount = await Follow.countDocuments({ follower_id: user._id });
    await User.findByIdAndUpdate(user._id, { followers_count: followersCount, following_count: followingCount });
  }
  console.log('Updated follow counts');

  // Update snippet likes_count
  const allSnippets = await Snippet.find({});
  for (const snippet of allSnippets) {
    const count = await SnippetLike.countDocuments({ snippet_id: snippet._id });
    await Snippet.findByIdAndUpdate(snippet._id, { likes_count: count });
  }
  console.log('Updated snippet like counts');

  // Update discussion replies_count
  const allDiscussions = await Discussion.find({});
  for (const discussion of allDiscussions) {
    const count = await DiscussionReply.countDocuments({ discussion_id: discussion._id });
    await Discussion.findByIdAndUpdate(discussion._id, { replies_count: count });
  }
  console.log('Updated discussion reply counts');

  // Update user contributions_count
  for (const user of users) {
    const count = await ActivityLog.countDocuments({ user_id: user._id });
    await User.findByIdAndUpdate(user._id, { contributions_count: count });
  }
  console.log('Updated contribution counts');

  // ═══════════════════════════════════════════════
  // STAGGER TIMESTAMPS
  // ═══════════════════════════════════════════════
  console.log('Staggering timestamps for realistic dates...');
  await staggerTimestamps('users', 10, 180, ['created_at']);
  await staggerTimestamps('projects', 5, 90, ['created_at']);
  await staggerTimestamps('projects', 1, 30, ['updated_at']);
  await staggerTimestamps('tasks', 1, 45, ['created_at']);
  await staggerTimestamps('tasks', 1, 30, ['updated_at']);
  await staggerTimestamps('snippets', 5, 60, ['created_at']);
  await staggerTimestamps('pullrequests', 1, 30, ['created_at']);
  await staggerTimestamps('pullrequests', 1, 20, ['updated_at']);
  await staggerTimestamps('prcomments', 1, 30, ['created_at']);
  await staggerTimestamps('discussions', 3, 45, ['created_at']);
  await staggerTimestamps('discussionreplies', 1, 40, ['created_at']);
  await staggerTimestamps('activitylogs', 0, 60, ['created_at']);
  await staggerTimestamps('follows', 5, 60, ['created_at']);
  await staggerTimestamps('snippetlikes', 1, 30, ['created_at']);
  await staggerTimestamps('flags', 5, 30, ['created_at']);
  console.log('Timestamps staggered');

  // ═══════════════════════════════════════════════
  // DONE
  // ═══════════════════════════════════════════════
  console.log('\n✓ Seed completed successfully!');
  console.log('Login credentials:');
  console.log('  Admin:     alex@example.com    / password123');
  console.log('  Admin:     admin@devcollab.com / admin123');
  console.log('  Developer: dev1@devcollab.com  / dev123');
  console.log('  Developer: dev2@devcollab.com  / dev123');
  console.log('  Developer: dev3@devcollab.com  / dev123');
  console.log('  Developer: dev4@devcollab.com  / dev123');
  console.log('  Developer: dev5@devcollab.com  / dev123');
  console.log('  Developer: dev6@devcollab.com  / dev123');
  console.log('  Developer: demo@example.com    / password123');

  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
