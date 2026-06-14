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

  // --- Users ---
  const users = await User.insertMany([
    { name: 'Alex Johnson', email: 'alex@example.com', password: hash, username: 'alexj', bio: 'Full-stack developer passionate about React and Node.js', location: 'San Francisco, CA', website: 'https://alexj.dev', primary_language: 'JavaScript', role: 'admin', followers_count: 15, following_count: 8 },
    { name: 'Sarah Chen', email: 'sarah@example.com', password: hash, username: 'sarahchen', bio: 'Python developer and data science enthusiast', location: 'New York, NY', website: 'https://sarahchen.io', primary_language: 'Python', role: 'developer', followers_count: 23, following_count: 12 },
    { name: 'Marcus Williams', email: 'marcus@example.com', password: hash, username: 'marcusw', bio: 'Mobile app developer (Flutter & React Native)', location: 'London, UK', website: null, primary_language: 'Dart', role: 'developer', followers_count: 7, following_count: 5 },
    { name: 'Priya Patel', email: 'priya@example.com', password: hash, username: 'priyap', bio: 'DevOps engineer & Go enthusiast', location: 'Bangalore, India', website: 'https://priyap.dev', primary_language: 'Go', role: 'developer', followers_count: 31, following_count: 9 },
    { name: 'Jordan Lee', email: 'jordan@example.com', password: hash, username: 'jordanl', bio: 'Frontend developer specializing in Vue.js and UI/UX', location: 'Seattle, WA', website: null, primary_language: 'Vue.js', role: 'moderator', followers_count: 12, following_count: 6 },
    { name: 'Demo User', email: 'demo@example.com', password: hash, username: 'demo', bio: 'Demo account for testing', location: null, website: null, primary_language: 'JavaScript', role: 'developer', skills: ['React', 'Node.js', 'MongoDB'], followers_count: 3, following_count: 2 },
  ]);
  const [alex, sarah, marcus, priya, jordan, demo] = users;
  console.log(`Created ${users.length} users`);

  // --- Follows ---
  await Follow.insertMany([
    { follower_id: demo._id, following_id: alex._id },
    { follower_id: demo._id, following_id: sarah._id },
    { follower_id: alex._id, following_id: demo._id },
    { follower_id: alex._id, following_id: priya._id },
    { follower_id: sarah._id, following_id: alex._id },
    { follower_id: sarah._id, following_id: jordan._id },
    { follower_id: marcus._id, following_id: alex._id },
    { follower_id: priya._id, following_id: alex._id },
    { follower_id: jordan._id, following_id: sarah._id },
  ]);
  console.log('Created follows');

  // --- Projects ---
  const projects = await Project.insertMany([
    { owner_id: alex._id, name: 'TaskFlow', description: 'A modern project management tool with real-time collaboration features', primary_language: 'JavaScript', visibility: 'public', tags: ['react', 'node', 'real-time'], stars_count: 42, forks_count: 12, tasks_count: 8, readme_content: '# TaskFlow\n\nA modern project management tool.\n\n## Features\n- Real-time collaboration\n- Task management\n- Team dashboards\n' },
    { owner_id: sarah._id, name: 'DataVizPro', description: 'Advanced data visualization library for Python with support for interactive charts', primary_language: 'Python', visibility: 'public', tags: ['python', 'visualization', 'data-science'], stars_count: 89, forks_count: 34, tasks_count: 15, readme_content: '# DataVizPro\n\nAdvanced data visualization library.\n\n## Features\n- Interactive charts\n- Statistical plots\n- Real-time data streams\n' },
    { owner_id: marcus._id, name: 'HealthTrack', description: 'A cross-platform health tracking mobile application', primary_language: 'Dart', visibility: 'public', tags: ['flutter', 'health', 'mobile'], stars_count: 18, forks_count: 5, tasks_count: 12, readme_content: '# HealthTrack\n\nCross-platform health tracking app.\n\n## Features\n- Step tracking\n- Sleep monitoring\n- Nutrition logging\n' },
    { owner_id: priya._id, name: 'CloudDeploy', description: 'Automated deployment tool for cloud infrastructure management', primary_language: 'Go', visibility: 'public', tags: ['go', 'devops', 'cloud'], stars_count: 56, forks_count: 23, tasks_count: 10, readme_content: '# CloudDeploy\n\nAutomated deployment tool.\n\n## Features\n- Multi-cloud support\n- Infrastructure as Code\n- Rollback capabilities\n' },
    { owner_id: jordan._id, name: 'VueStore', description: 'E-commerce frontend built with Vue.js and Pinia store', primary_language: 'Vue.js', visibility: 'public', tags: ['vue', 'ecommerce', 'pinia'], stars_count: 31, forks_count: 8, tasks_count: 6, readme_content: '# VueStore\n\nE-commerce frontend built with Vue.js.\n\n## Features\n- Product catalog\n- Shopping cart\n- Checkout flow\n' },
    { owner_id: demo._id, name: 'DevCollab API', description: 'The main API for the DevCollab platform', primary_language: 'JavaScript', visibility: 'public', tags: ['api', 'node', 'express', 'mongodb'], stars_count: 5, forks_count: 2, tasks_count: 4, readme_content: '# DevCollab API\n\nBackend API for DevCollab.\n\n## Features\n- User auth\n- Project management\n- Code snippets\n' },
    { owner_id: alex._id, name: 'Private Notes', description: 'Personal notes app (private)', primary_language: 'JavaScript', visibility: 'private', tags: ['notes', 'personal'], stars_count: 0, forks_count: 0, tasks_count: 0, readme_content: '# Private Notes\n\nA private note-taking application.\n' },
  ]);
  const [taskFlow, dataViz, healthTrack, cloudDeploy, vueStore, devcollabApi, privateNotes] = projects;
  console.log(`Created ${projects.length} projects`);

  // --- Project Collaborators ---
  await ProjectCollaborator.insertMany([
    { project_id: taskFlow._id, user_id: alex._id, role: 'owner' },
    { project_id: taskFlow._id, user_id: demo._id, role: 'collaborator' },
    { project_id: dataViz._id, user_id: sarah._id, role: 'owner' },
    { project_id: dataViz._id, user_id: alex._id, role: 'collaborator' },
    { project_id: dataViz._id, user_id: jordan._id, role: 'collaborator' },
    { project_id: healthTrack._id, user_id: marcus._id, role: 'owner' },
    { project_id: healthTrack._id, user_id: demo._id, role: 'collaborator' },
    { project_id: cloudDeploy._id, user_id: priya._id, role: 'owner' },
    { project_id: cloudDeploy._id, user_id: sarah._id, role: 'collaborator' },
    { project_id: vueStore._id, user_id: jordan._id, role: 'owner' },
    { project_id: vueStore._id, user_id: demo._id, role: 'collaborator' },
    { project_id: devcollabApi._id, user_id: demo._id, role: 'owner' },
    { project_id: devcollabApi._id, user_id: alex._id, role: 'collaborator' },
    { project_id: privateNotes._id, user_id: alex._id, role: 'owner' },
  ]);
  console.log('Created project collaborators');

  // --- Tasks ---
  await Task.insertMany([
    { project_id: taskFlow._id, title: 'Set up CI/CD pipeline', description: 'Configure GitHub Actions for automated testing and deployment', assignee_id: alex._id, priority: 'high', status: 'in_progress', tags: ['devops', 'ci-cd'] },
    { project_id: taskFlow._id, title: 'Implement drag-and-drop UI', description: 'Add drag-and-drop functionality for task cards on the board view', assignee_id: demo._id, priority: 'medium', status: 'open', tags: ['frontend', 'ui'] },
    { project_id: taskFlow._id, title: 'Add real-time notifications', description: 'Implement WebSocket-based notifications for task assignments', assignee_id: alex._id, priority: 'high', status: 'open', tags: ['backend', 'real-time'] },
    { project_id: taskFlow._id, title: 'Write unit tests', description: 'Achieve 80% test coverage for the main components', assignee_id: null, priority: 'medium', status: 'open', tags: ['testing'] },
    { project_id: dataViz._id, title: 'Add 3D scatter plot support', description: 'Implement 3D scatter plots using Matplotlib', assignee_id: sarah._id, priority: 'medium', status: 'open', tags: ['3d', 'visualization'] },
    { project_id: dataViz._id, title: 'Optimize rendering performance', description: 'Improve chart rendering speed for large datasets', assignee_id: alex._id, priority: 'high', status: 'open', tags: ['performance'] },
    { project_id: dataViz._id, title: 'Create documentation site', description: 'Build a documentation site using Sphinx', assignee_id: jordan._id, priority: 'low', status: 'completed', tags: ['docs'] },
    { project_id: healthTrack._id, title: 'Implement step counting algorithm', description: 'Build step counting using accelerometer data', assignee_id: marcus._id, priority: 'high', status: 'in_progress', tags: ['algorithm', 'mobile'] },
    { project_id: healthTrack._id, title: 'Design sleep tracking UI', description: 'Create sleep tracking dashboard with charts', assignee_id: demo._id, priority: 'medium', status: 'open', tags: ['ui', 'design'] },
    { project_id: cloudDeploy._id, title: 'Add AWS ECS support', description: 'Support deployment to AWS Elastic Container Service', assignee_id: priya._id, priority: 'high', status: 'in_progress', tags: ['aws', 'deployment'] },
    { project_id: cloudDeploy._id, title: 'Implement rollback feature', description: 'Add automatic rollback on deployment failure', assignee_id: sarah._id, priority: 'medium', status: 'open', tags: ['deployment', 'safety'] },
    { project_id: vueStore._id, title: 'Build product search', description: 'Implement product search with filters', assignee_id: jordan._id, priority: 'high', status: 'in_progress', tags: ['search', 'frontend'] },
    { project_id: vueStore._id, title: 'Integrate payment gateway', description: 'Add Stripe payment integration for checkout', assignee_id: demo._id, priority: 'high', status: 'open', tags: ['payment', 'stripe'] },
    { project_id: devcollabApi._id, title: 'Add rate limiting', description: 'Implement API rate limiting to prevent abuse', assignee_id: alex._id, priority: 'medium', status: 'open', tags: ['security'] },
    { project_id: devcollabApi._id, title: 'Write API documentation', description: 'Document all API endpoints with examples', assignee_id: demo._id, priority: 'low', status: 'open', tags: ['docs'] },
    { project_id: devcollabApi._id, title: 'Implement search functionality', description: 'Add full-text search across projects and snippets', assignee_id: alex._id, priority: 'high', status: 'in_progress', tags: ['backend'] },
  ]);
  console.log('Created tasks');

  // --- Snippets ---
  await Snippet.insertMany([
    { user_id: alex._id, title: 'React Custom Hook for Debounced Search', description: 'A reusable React hook that debounces search input', language: 'javascript', code: 'import { useState, useEffect } from "react";\n\nexport function useDebounce(value, delay = 500) {\n  const [debounced, setDebounced] = useState(value);\n  useEffect(() => {\n    const timer = setTimeout(() => setDebounced(value), delay);\n    return () => clearTimeout(timer);\n  }, [value, delay]);\n  return debounced;\n}', tags: ['react', 'hooks', 'debounce'], visibility: 'public', project_id: taskFlow._id, likes_count: 7 },
    { user_id: alex._id, title: 'Express.js Request Logger Middleware', description: 'A simple request logger middleware for Express', language: 'javascript', code: 'function requestLogger(req, res, next) {\n  const start = Date.now();\n  res.on("finish", () => {\n    const duration = Date.now() - start;\n    console.log(\n      `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`\n    );\n  });\n  next();\n}', tags: ['express', 'middleware', 'logging'], visibility: 'public', project_id: null, likes_count: 12 },
    { user_id: sarah._id, title: 'Python Data Cleaner', description: 'Clean and preprocess data with pandas', language: 'python', code: 'import pandas as pd\nimport numpy as np\n\ndef clean_data(df):\n    df = df.drop_duplicates()\n    df = df.fillna(df.median(numeric_only=True))\n    return df', tags: ['python', 'pandas', 'data-cleaning'], visibility: 'public', project_id: dataViz._id, likes_count: 15 },
    { user_id: marcus._id, title: 'Flutter HTTP Client', description: 'HTTP client wrapper for Flutter with error handling', language: 'dart', code: 'import \'dart:convert\';\nimport \'package:http/http.dart\' as http;\n\nclass ApiClient {\n  final String baseUrl;\n  \n  Future<Map<String, dynamic>> get(String endpoint) async {\n    final response = await http.get(Uri.parse(\'$baseUrl/$endpoint\'));\n    return json.decode(response.body);\n  }\n}', tags: ['flutter', 'http', 'api'], visibility: 'public', project_id: healthTrack._id, likes_count: 5 },
    { user_id: priya._id, title: 'Go Concurrency Pattern', description: 'Worker pool pattern in Go', language: 'go', code: 'func worker(id int, jobs <-chan int, results chan<- int) {\n    for j := range jobs {\n        results <- j * 2\n    }\n}', tags: ['go', 'concurrency', 'goroutines'], visibility: 'public', project_id: cloudDeploy._id, likes_count: 20 },
    { user_id: demo._id, title: 'Mongoose Connection Setup', description: 'MongoDB connection with Mongoose', language: 'javascript', code: 'import mongoose from "mongoose";\n\nasync function connectDB(uri) {\n  try {\n    await mongoose.connect(uri);\n    console.log("MongoDB connected");\n  } catch (err) {\n    console.error("Connection error:", err);\n    process.exit(1);\n  }\n}', tags: ['mongoose', 'mongodb', 'backend'], visibility: 'public', project_id: devcollabApi._id, likes_count: 3 },
    { user_id: jordan._id, title: 'Vue.js Composables', description: 'Reusable Vue.js composables pattern', language: 'javascript', code: 'import { ref, onMounted, onUnmounted } from "vue";\n\nexport function useMouse() {\n  const x = ref(0);\n  const y = ref(0);\n  \n  function update(e) { x.value = e.pageX; y.value = e.pageY; }\n  onMounted(() => window.addEventListener("mousemove", update));\n  onUnmounted(() => window.removeEventListener("mousemove", update));\n  \n  return { x, y };\n}', tags: ['vue', 'composables', 'reactive'], visibility: 'public', project_id: vueStore._id, likes_count: 8 },
    { user_id: demo._id, title: 'Private API Key validator', description: 'A validator utility (private)', language: 'javascript', code: 'function validateApiKey(key) { return key && key.length === 32; }', tags: ['security', 'validation'], visibility: 'private', project_id: null, likes_count: 0 },
  ]);
  console.log('Created snippets');

  // --- Pull Requests ---
  await PullRequest.insertMany([
    { project_id: taskFlow._id, title: 'Add drag-and-drop board UI', description: 'Implements drag-and-drop functionality for the task board. Uses react-beautiful-dnd library.', source_branch: 'feature/drag-drop', target_branch: 'main', opened_by: demo._id, status: 'open' },
    { project_id: taskFlow._id, title: 'Implement WebSocket notifications', description: 'Adds real-time notifications using Socket.io', source_branch: 'feature/notifications', target_branch: 'main', opened_by: alex._id, status: 'open' },
    { project_id: dataViz._id, title: 'Add 3D scatter plot', description: 'Implements 3D scatter plots with interactive rotation', source_branch: 'feature/3d-plots', target_branch: 'main', opened_by: sarah._id, status: 'merged' },
    { project_id: dataViz._id, title: 'Performance optimization', description: 'Optimizes rendering for datasets with 100k+ points', source_branch: 'opt/rendering', target_branch: 'main', opened_by: alex._id, status: 'open' },
    { project_id: healthTrack._id, title: 'Step counting algorithm', description: 'Implements step counting using phone accelerometer', source_branch: 'feature/step-counter', target_branch: 'main', opened_by: marcus._id, status: 'open' },
    { project_id: cloudDeploy._id, title: 'AWS ECS deployment support', description: 'Adds ECS deployment support with Task Definitions', source_branch: 'feature/ecs', target_branch: 'main', opened_by: priya._id, status: 'open' },
    { project_id: vueStore._id, title: 'Product search feature', description: 'Full-text search with category filters', source_branch: 'feature/search', target_branch: 'main', opened_by: jordan._id, status: 'open' },
  ]);
  console.log('Created pull requests');

  // --- PR Comments ---
  await PRComment.insertMany([
    { pr_id: (await PullRequest.findOne({ title: 'Add drag-and-drop board UI' }))._id, user_id: alex._id, content: 'Great work! I left some suggestions on the drag handler.' },
    { pr_id: (await PullRequest.findOne({ title: 'Add drag-and-drop board UI' }))._id, user_id: demo._id, content: 'Thanks Alex! I\'ll review those and make updates.' },
    { pr_id: (await PullRequest.findOne({ title: 'Add 3D scatter plot' }))._id, user_id: jordan._id, content: 'The interactive rotation is amazing!' },
    { pr_id: (await PullRequest.findOne({ title: 'Add 3D scatter plot' }))._id, user_id: sarah._id, content: 'Thanks Jordan! Took some time to get the math right.' },
    { pr_id: (await PullRequest.findOne({ title: 'AWS ECS deployment support' }))._id, user_id: sarah._id, content: 'Make sure to add IAM permissions documentation.' },
  ]);
  console.log('Created PR comments');

  // --- Discussions ---
  const discussions = await Discussion.insertMany([
    { project_id: taskFlow._id, author_id: demo._id, title: 'Should we migrate to TypeScript?', content: 'I think migrating to TypeScript would improve code quality and developer experience.', tags: ['typescript', 'discussion'], replies_count: 2 },
    { project_id: taskFlow._id, author_id: alex._id, title: 'New UI component library proposal', content: 'Let\'s discuss which UI library to use for the new design system.', tags: ['ui', 'design'], replies_count: 1 },
    { project_id: dataViz._id, author_id: jordan._id, title: 'Dash app integration ideas', content: 'We could integrate with Plotly Dash for web-based dashboards.', tags: ['dash', 'integration'], replies_count: 3 },
    { project_id: cloudDeploy._id, author_id: sarah._id, title: 'Support for Kubernetes?', content: 'Would it make sense to add Kubernetes deployment support?', tags: ['kubernetes', 'feature-request'], replies_count: 2 },
    { project_id: vueStore._id, author_id: demo._id, title: 'State management patterns', content: 'Comparing Pinia vs Vuex for our store layer.', tags: ['vue', 'state-management'], replies_count: 1 },
    { project_id: devcollabApi._id, author_id: alex._id, title: 'API versioning strategy', content: 'Should we use URL prefix or header-based versioning?', tags: ['api', 'versioning'], replies_count: 2 },
  ]);
  console.log('Created discussions');

  // --- Discussion Replies ---
  await DiscussionReply.insertMany([
    { discussion_id: discussions[0]._id, author_id: alex._id, content: 'Good idea! I\'ve been thinking the same. TypeScript would catch many bugs early.' },
    { discussion_id: discussions[0]._id, author_id: demo._id, content: 'Agreed. The migration could be done incrementally.' },
    { discussion_id: discussions[1]._id, author_id: demo._id, content: 'I suggest we go with Material-UI for consistency.' },
    { discussion_id: discussions[2]._id, author_id: sarah._id, content: 'Great idea! I can work on the integration.' },
    { discussion_id: discussions[2]._id, author_id: priya._id, content: 'This would be useful for the CloudDeploy dashboard too.' },
    { discussion_id: discussions[2]._id, author_id: jordan._id, content: 'Let me create a POC and share it.' },
    { discussion_id: discussions[3]._id, author_id: priya._id, content: 'Yes! K8s support is the next big feature we need.' },
    { discussion_id: discussions[3]._id, author_id: sarah._id, content: 'I can help with the Helm charts.' },
    { discussion_id: discussions[4]._id, author_id: jordan._id, content: 'Pinia is more lightweight and has better TypeScript support.' },
    { discussion_id: discussions[5]._id, author_id: demo._id, content: 'I prefer URL prefix versioning — more explicit.' },
    { discussion_id: discussions[5]._id, author_id: alex._id, content: 'True, but header-based keeps URLs cleaner.' },
  ]);
  console.log('Created discussion replies');

  // --- Activity Log ---
  await ActivityLog.insertMany([
    { user_id: alex._id, action_type: 'create', entity_type: 'project', entity_id: taskFlow._id, description: 'Created project TaskFlow' },
    { user_id: sarah._id, action_type: 'create', entity_type: 'project', entity_id: dataViz._id, description: 'Created project DataVizPro' },
    { user_id: marcus._id, action_type: 'create', entity_type: 'project', entity_id: healthTrack._id, description: 'Created project HealthTrack' },
    { user_id: priya._id, action_type: 'create', entity_type: 'project', entity_id: cloudDeploy._id, description: 'Created project CloudDeploy' },
    { user_id: jordan._id, action_type: 'create', entity_type: 'project', entity_id: vueStore._id, description: 'Created project VueStore' },
    { user_id: demo._id, action_type: 'create', entity_type: 'project', entity_id: devcollabApi._id, description: 'Created project DevCollab API' },
    { user_id: alex._id, action_type: 'update', entity_type: 'task', entity_id: null, description: 'Updated task status' },
    { user_id: demo._id, action_type: 'create', entity_type: 'pr', entity_id: null, description: 'Opened PR "Add drag-and-drop board UI"' },
    { user_id: alex._id, action_type: 'comment', entity_type: 'pr', entity_id: null, description: 'Commented on PR "Add drag-and-drop board UI"' },
    { user_id: sarah._id, action_type: 'create', entity_type: 'snippet', entity_id: null, description: 'Created snippet "Python Data Cleaner"' },
    { user_id: demo._id, action_type: 'register', entity_type: 'user', entity_id: null, description: 'Joined DevCollab' },
    { user_id: demo._id, action_type: 'follow', entity_type: 'user', entity_id: alex._id, description: 'Started following user' },
    { user_id: demo._id, action_type: 'create', entity_type: 'discussion', entity_id: discussions[0]._id, description: 'Created discussion "Should we migrate to TypeScript?"' },
  ]);
  console.log('Created activity logs');

  // --- Flags ---
  await Flag.insertMany([
    { reporter_id: alex._id, target_type: 'user', target_id: demo._id, reason: 'spam', description: 'Spamming in comments' },
    { reporter_id: sarah._id, target_type: 'user', target_id: null, reason: 'inappropriate', description: 'Inappropriate content in discussion' },
  ]);
  console.log('Created flags');

  // --- Snippet Likes ---
  const snippetDocs = await Snippet.find({});
  const demoUser = demo;
  for (const snippet of snippetDocs) {
    const exists = await SnippetLike.findOne({ snippet_id: snippet._id, user_id: demoUser._id });
    if (!exists) {
      await SnippetLike.create({ snippet_id: snippet._id, user_id: demoUser._id });
    }
  }
  for (const snippet of snippetDocs) {
    if (snippet.likes_count === 0) {
      await Snippet.findByIdAndUpdate(snippet._id, { $set: { likes_count: 1 } });
    }
  }
  console.log('Created snippet likes');

  console.log('\n✓ Seed completed successfully!');
  console.log('Login credentials: demo@example.com / password123');

  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
