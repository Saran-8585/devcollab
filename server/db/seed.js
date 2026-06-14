import bcrypt from 'bcryptjs';
import { initDatabase } from './database.js';

const db = initDatabase();

function clearData() {
  const tables = [
    'flags', 'activity_log', 'snippet_likes', 'follows', 'discussion_replies',
    'discussions', 'pr_comments', 'pull_requests', 'snippets',
    'tasks', 'project_collaborators', 'projects', 'users'
  ];
  for (const t of tables) {
    db.exec(`DELETE FROM ${t}`);
  }
}

const now = new Date();
function daysAgo(n) {
  const d = new Date(now);
  d.setDate(d.getDate() - n);
  return d.toISOString().replace('T', ' ').split('.')[0];
}
function hoursAgo(n) {
  const d = new Date(now);
  d.setHours(d.getHours() - n);
  return d.toISOString().replace('T', ' ').split('.')[0];
}

const languages = ['JavaScript', 'TypeScript', 'Python', 'Go', 'Rust', 'Java', 'C++', 'Ruby', 'PHP', 'Swift', 'Kotlin', 'SQL', 'CSS', 'HTML', 'Shell', 'Lua', 'R', 'Dart', 'Scala', 'Elixir'];

const devs = [
  { name: 'Kiran Patel', email: 'dev1@devcollab.com', username: 'devkiran', bio: 'Full-stack developer passionate about React and Node.js', primary_language: 'TypeScript', skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL'] },
  { name: 'Priya Sharma', email: 'dev2@devcollab.com', username: 'codepriya', bio: 'Pythonista and AI enthusiast', primary_language: 'Python', skills: ['Python', 'Machine Learning', 'Django', 'FastAPI'] },
  { name: 'Arjun Singh', email: 'dev3@devcollab.com', username: 'nullpointer', bio: 'Java veteran, Spring Boot expert', primary_language: 'Java', skills: ['Java', 'Spring Boot', 'Kafka', 'Docker'] },
  { name: 'Meera Joshi', email: 'dev4@devcollab.com', username: 'meeracodes', bio: 'Frontend wizard, UI/UX enthusiast', primary_language: 'TypeScript', skills: ['React', 'Vue.js', 'Tailwind CSS', 'Figma'] },
  { name: 'Rahul Verma', email: 'dev5@devcollab.com', username: 'rahuldev', bio: 'Go developer building scalable microservices', primary_language: 'Go', skills: ['Go', 'gRPC', 'Kubernetes', 'AWS'] },
  { name: 'Ananya Reddy', email: 'dev6@devcollab.com', username: 'ananyareddy', bio: 'Rustacean and systems programmer', primary_language: 'Rust', skills: ['Rust', 'Systems Programming', 'WebAssembly', 'Embedded'] },
  { name: 'Vikram Malhotra', email: 'dev7@devcollab.com', username: 'vikramdev', bio: 'Mobile developer - Flutter & Kotlin', primary_language: 'Dart', skills: ['Flutter', 'Kotlin', 'Firebase', 'Dart'] },
  { name: 'Divya Nair', email: 'dev8@devcollab.com', username: 'divyaintech', bio: 'DevOps engineer, CI/CD pipelines', primary_language: 'Python', skills: ['Python', 'Docker', 'Terraform', 'Jenkins'] },
  { name: 'Siddharth Rao', email: 'dev9@devcollab.com', username: 'sidcodes', bio: 'Backend developer, API design specialist', primary_language: 'JavaScript', skills: ['Node.js', 'Express', 'MongoDB', 'Redis'] },
  { name: 'Kavya Iyer', email: 'dev10@devcollab.com', username: 'kavyaiyer', bio: 'Data engineer, big data pipelines', primary_language: 'Python', skills: ['Python', 'Spark', 'SQL', 'Airflow'] },
  { name: 'Rohit Gupta', email: 'dev11@devcollab.com', username: 'rohitg', bio: 'Full-stack JS/TS developer', primary_language: 'TypeScript', skills: ['React', 'Next.js', 'Prisma', 'TypeScript'] },
  { name: 'Neha Kapoor', email: 'dev12@devcollab.com', username: 'nehakapoor', bio: 'Security researcher and ethical hacker', primary_language: 'Python', skills: ['Python', 'Security', 'Penetration Testing', 'Bash'] },
  { name: 'Amit Thakur', email: 'dev13@devcollab.com', username: 'amitthakur', bio: 'Cloud architect, AWS certified', primary_language: 'Go', skills: ['Go', 'AWS', 'Terraform', 'Cloud Architecture'] },
  { name: 'Pooja Deshmukh', email: 'dev14@devcollab.com', username: 'poojadeshmukh', bio: 'ML engineer, NLP specialist', primary_language: 'Python', skills: ['Python', 'NLP', 'Transformers', 'PyTorch'] },
  { name: 'Manish Agarwal', email: 'dev15@devcollab.com', username: 'manisha_dev', bio: 'Open source contributor, Rust enthusiast', primary_language: 'Rust', skills: ['Rust', 'TypeScript', 'CLI Tools', 'WebAssembly'] },
];

const projects = [
  { name: 'ReactFlow Dashboard', description: 'A drag-and-drop dashboard builder built with React Flow and TypeScript. Supports custom widgets, real-time data binding, and responsive layouts.', primary_language: 'TypeScript', visibility: 'public', tags: ['react', 'dashboard', 'drag-drop', 'visualization'] },
  { name: 'PyTorch Image Classifier', description: 'Deep learning image classification toolkit with pre-trained models and transfer learning support.', primary_language: 'Python', visibility: 'public', tags: ['deep-learning', 'computer-vision', 'pytorch'] },
  { name: 'Go Microservice Framework', description: 'Lightweight microservice framework for Go with built-in service discovery, circuit breakers, and tracing.', primary_language: 'Go', visibility: 'public', tags: ['microservices', 'go', 'framework'] },
  { name: 'Rust CLI Password Manager', description: 'Terminal-based password manager with encryption, auto-fill scripts, and browser extension integration.', primary_language: 'Rust', visibility: 'public', tags: ['cli', 'security', 'password-manager'] },
  { name: 'Spring Boot E-Commerce API', description: 'Production-ready e-commerce backend with payment integration, inventory management, and order processing.', primary_language: 'Java', visibility: 'public', tags: ['e-commerce', 'spring-boot', 'api'] },
  { name: 'Flutter Fitness Tracker', description: 'Cross-platform fitness tracking app with workout plans, progress charts, and social features.', primary_language: 'Dart', visibility: 'public', tags: ['flutter', 'fitness', 'mobile'] },
  { name: 'Vue.js Component Library', description: 'A comprehensive Vue 3 component library with dark mode, accessibility, and tree-shaking support.', primary_language: 'TypeScript', visibility: 'public', tags: ['vue', 'components', 'ui-library'] },
  { name: 'Express API Boilerplate', description: 'Production-ready Express.js API with authentication, rate limiting, logging, and testing setup.', primary_language: 'JavaScript', visibility: 'public', tags: ['express', 'boilerplate', 'nodejs'] },
  { name: 'SQL Query Optimizer', description: 'Tool that analyzes SQL queries and suggests indexes, rewrites, and performance improvements.', primary_language: 'SQL', visibility: 'private', tags: ['sql', 'optimization', 'database'] },
  { name: 'Kubernetes Deployment Manager', description: 'Web UI for managing Kubernetes deployments with rolling updates, rollbacks, and monitoring.', primary_language: 'Go', visibility: 'private', tags: ['kubernetes', 'devops', 'deployment'] },
  { name: 'Rust Web Server', description: 'High-performance HTTP server built in Rust with async I/O and WebSocket support.', primary_language: 'Rust', visibility: 'public', tags: ['rust', 'http', 'async', 'websocket'] },
  { name: 'Python Data Pipeline', description: 'ETL framework for building data pipelines with built-in connectors for major data sources.', primary_language: 'Python', visibility: 'private', tags: ['etl', 'data-pipeline', 'python'] },
  { name: 'React Native Chat App', description: 'Real-time messaging app with end-to-end encryption and file sharing capabilities.', primary_language: 'TypeScript', visibility: 'public', tags: ['react-native', 'chat', 'messaging'] },
  { name: 'Sass Mixin Library', description: 'Collection of useful Sass mixins and functions for faster CSS development.', primary_language: 'CSS', visibility: 'public', tags: ['sass', 'css', 'mixins'] },
  { name: 'Terraform AWS Modules', description: 'Reusable Terraform modules for common AWS infrastructure patterns.', primary_language: 'Shell', visibility: 'public', tags: ['terraform', 'aws', 'infrastructure'] },
  { name: 'Ruby on Rails Blog Engine', description: 'Feature-rich blogging engine with markdown support, SEO optimization, and analytics.', primary_language: 'Ruby', visibility: 'private', tags: ['rails', 'blog', 'cms'] },
  { name: 'PHP Laravel CRM', description: 'Customer relationship management system built with Laravel and Livewire.', primary_language: 'PHP', visibility: 'private', tags: ['laravel', 'crm', 'php'] },
  { name: 'Swift iOS Calculator', description: 'Advanced calculator app with graphing capabilities and unit conversions.', primary_language: 'Swift', visibility: 'public', tags: ['ios', 'calculator', 'swift'] },
  { name: 'Kotlin Android Weather App', description: 'Beautiful weather app with animated backgrounds, widgets, and location-based forecasts.', primary_language: 'Kotlin', visibility: 'public', tags: ['android', 'weather', 'kotlin'] },
  { name: 'Scala Data Analytics Library', description: 'Functional data analytics library for Scala with DataFrame API and visualization support.', primary_language: 'Scala', visibility: 'private', tags: ['scala', 'data-analytics', 'functional'] },
];

const taskTitles = [
  'Implement user authentication', 'Add password reset flow', 'Create landing page', 'Build search component',
  'Write API documentation', 'Add pagination support', 'Implement dark mode toggle', 'Set up CI/CD pipeline',
  'Add unit tests for auth module', 'Create database migration script', 'Optimize image loading', 'Add rate limiting',
  'Implement WebSocket connection', 'Add export to CSV feature', 'Create notification system', 'Build admin dashboard',
  'Add file upload support', 'Implement caching layer', 'Create error boundary component', 'Add input validation',
  'Fix login redirect bug', 'Update dependencies', 'Add loading skeletons', 'Create type definitions',
  'Implement search debounce', 'Add accessibility labels', 'Create responsive grid layout', 'Build settings page',
  'Add data persistence layer', 'Create onboarding flow', 'Implement two-factor auth', 'Add webhook support',
  'Build activity feed', 'Add real-time notifications', 'Create data export API', 'Implement role-based access',
  'Add email template system', 'Build analytics dashboard', 'Create subscription management', 'Add payment gateway',
  'Implement search filters', 'Add bulk operations', 'Create audit log system', 'Build reporting module',
  'Add API versioning', 'Implement feature flags', 'Create A/B testing framework', 'Add localization support',
  'Build landing page SEO', 'Add social login providers', 'Implement queue system', 'Create backup scheduler',
  'Add content moderation', 'Build recommendation engine', 'Implement data sync', 'Add offline support',
  'Create widget system', 'Build plugin architecture', 'Add custom theme support', 'Implement data migration tool',
];

const snippetContents = {
  JavaScript: `// Debounce utility function
function debounce(func, wait, immediate) {
  let timeout;
  return function executedFunction() {
    const context = this;
    const args = arguments;
    const later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

export default debounce;`,

  TypeScript: `// Generic API response wrapper
interface ApiResponse<T> {
  data: T;
  message: string;
  status: number;
  timestamp: string;
}

class ApiClient {
  private baseUrl: string;
  private token: string;

  constructor(baseUrl: string, token: string) {
    this.baseUrl = baseUrl;
    this.token = token;
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    const response = await fetch(\`\${this.baseUrl}\${endpoint}\`, {
      headers: {
        'Authorization': \`Bearer \${this.token}\`,
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  }
}`,

  Python: `# Quick sort implementation
def quicksort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quicksort(left) + middle + quicksort(right)

# Example usage
data = [3, 6, 8, 10, 1, 2, 1]
sorted_data = quicksort(data)
print(f"Original: {data}")
print(f"Sorted: {sorted_data}")`,

  Go: `// HTTP server with middleware
package main

import (
    "fmt"
    "log"
    "net/http"
    "time"
)

func loggingMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        start := time.Now()
        next.ServeHTTP(w, r)
        log.Printf("%s %s %v", r.Method, r.URL.Path, time.Since(start))
    })
}

func helloHandler(w http.ResponseWriter, r *http.Request) {
    fmt.Fprintf(w, "Hello, DevCollab!")
}

func main() {
    mux := http.NewServeMux()
    mux.HandleFunc("/", helloHandler)
    handler := loggingMiddleware(mux)
    log.Fatal(http.ListenAndServe(":8080", handler))
}`,

  Rust: `// Simple web server in Rust
use std::net::TcpListener;
use std::io::{Read, Write};

fn main() {
    let listener = TcpListener::bind("127.0.0.1:7878").unwrap();
    println!("Server listening on port 7878");

    for stream in listener.incoming() {
        let mut stream = stream.unwrap();
        let mut buffer = [0; 1024];
        stream.read(&mut buffer).unwrap();

        let response = "HTTP/1.1 200 OK\r\nContent-Type: text/html\r\n\r\n<html><body><h1>Hello from Rust!</h1></body></html>";
        stream.write_all(response.as_bytes()).unwrap();
        stream.flush().unwrap();
    }
}`,

  SQL: `-- Analyze monthly revenue trends
WITH monthly_revenue AS (
    SELECT
        DATE_TRUNC('month', order_date) AS month,
        SUM(total_amount) AS revenue,
        COUNT(DISTINCT customer_id) AS active_customers
    FROM orders
    WHERE status = 'completed'
    GROUP BY DATE_TRUNC('month', order_date)
)
SELECT
    month,
    revenue,
    active_customers,
    ROUND(revenue / active_customers, 2) AS revenue_per_customer,
    ROUND(
        (revenue - LAG(revenue) OVER (ORDER BY month))
        / LAG(revenue) OVER (ORDER BY month) * 100, 2
    ) AS growth_percentage
FROM monthly_revenue
ORDER BY month DESC;`,

  CSS: `/* Animated gradient background */
.hero-section {
    background: linear-gradient(
        135deg,
        #667eea 0%,
        #764ba2 50%,
        #f093fb 100%
    );
    background-size: 400% 400%;
    animation: gradient 15s ease infinite;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
}

@keyframes gradient {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
}

.card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
    transition: all 0.3s ease;
}`,
};

const prTitles = [
  'feat: Add user authentication module', 'fix: Resolve login redirect loop', 'refactor: Improve API response structure',
  'feat: Implement dark mode toggle', 'fix: Correct pagination offset calculation', 'feat: Add file upload with progress',
  'chore: Update dependencies to latest', 'fix: Handle empty state in search results', 'feat: Add export to CSV',
  'refactor: Extract common utilities', 'feat: Add WebSocket real-time updates', 'fix: Memory leak in event listeners',
  'feat: Implement search with debounce', 'fix: Mobile responsive layout issues', 'feat: Add notification preferences',
  'refactor: Migrate to TypeScript', 'feat: Add rate limiting middleware', 'fix: CORS configuration for production',
  'feat: Add activity feed timeline', 'chore: Configure CI/CD pipeline', 'feat: Implement role-based access control',
  'fix: Date formatting timezone bug', 'feat: Add bulk delete operations', 'refactor: Optimize database queries',
  'feat: Add webhook event system', 'fix: Accessibility keyboard navigation', 'feat: Add localization support',
  'chore: Add unit test coverage', 'feat: Implement data export API', 'fix: Session expiry handling'
];

const codeDiffs = [
`-  const result = await fetch('/api/data');
-  return result.json();
+  const response = await fetch('/api/data');
+  if (!response.ok) {
+    throw new Error(\`HTTP error! status: \${response.status}\`);
+  }
+  return response.json();`,

`- function calculateTotal(items) {
-   return items.reduce((sum, item) => sum + item.price, 0);
+ function calculateTotal(items, taxRate = 0) {
+   const subtotal = items.reduce((sum, item) => sum + item.price, 0);
+   const tax = subtotal * taxRate;
+   return subtotal + tax;
  }`,

`- const user = db.query('SELECT * FROM users WHERE id = ' + userId);
+ const user = db.query('SELECT * FROM users WHERE id = ?', [userId]);`,

`- useEffect(() => {
-   fetchData();
- }, []);
+ useEffect(() => {
+   fetchData();
+ }, []);
+ 
+ useEffect(() => {
+   return () => {
+     cleanup();
+   };
+ }, []);`,
];

function seededRandom(seed) {
  let s = seed;
  return function() {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

const rand = seededRandom(42);

function pick(arr) {
  return arr[Math.floor(rand() * arr.length)];
}

function pickN(arr, n) {
  const shuffled = [...arr].sort(() => rand() - 0.5);
  return shuffled.slice(0, n);
}

async function seed() {
  console.log('Clearing existing data...');
  clearData();

  console.log('Creating users...');
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const devPassword = await bcrypt.hash('dev123', 10);

  const insertUser = db.prepare(
    `INSERT INTO users (name, email, password, username, bio, location, website, primary_language, skills, role, contributions_count, followers_count, following_count, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );

  db.transaction(() => {
    insertUser.run('Admin User', 'admin@devcollab.com', hashedPassword, 'admin', 'Platform administrator', 'San Francisco, CA', 'https://admin.dev', 'TypeScript', JSON.stringify(['Admin', 'Management', 'DevOps']), 'admin', 0, 0, 0, daysAgo(90));

    for (const dev of devs) {
      insertUser.run(
        dev.name, dev.email, devPassword, dev.username,
        dev.bio, pick(['Bangalore, India', 'Mumbai, India', 'Remote', 'San Francisco, CA', 'New York, NY', 'London, UK', 'Berlin, Germany']),
        `https://${dev.username}.dev`, dev.primary_language,
        JSON.stringify(dev.skills), 'developer',
        Math.floor(rand() * 50), Math.floor(rand() * 100), Math.floor(rand() * 50),
        daysAgo(Math.floor(rand() * 80) + 10)
      );
    }
  })();

  console.log('Creating projects...');
  const insertProject = db.prepare(
    `INSERT INTO projects (owner_id, name, description, visibility, primary_language, tags, readme_content, stars_count, forks_count, is_archived, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );

  db.transaction(() => {
    for (let i = 0; i < projects.length; i++) {
      const p = projects[i];
      const ownerId = Math.floor(rand() * 15) + 2;
      const projectId = i + 1;
      insertProject.run(
        ownerId, p.name, p.description, p.visibility, p.primary_language,
        JSON.stringify(p.tags),
        '# ' + p.name + '\n\n' + p.description + '\n\n## Getting Started\n\n```bash\nnpm install\nnpm run dev\n```\n\n## Features\n\n- **' + p.tags.join('**\n- **') + '**\n\n## Contributing\n\nPull requests are welcome. For major changes, please open an issue first.',
        Math.floor(rand() * 200), Math.floor(rand() * 50), Math.floor(rand() * 2) ? 0 : 1,
        daysAgo(Math.floor(rand() * 80) + 5), hoursAgo(Math.floor(rand() * 720))
      );
    }
  })();

  console.log('Creating project collaborators...');
  const insertCollab = db.prepare(
    `INSERT INTO project_collaborators (project_id, user_id, role, joined_at) VALUES (?, ?, ?, ?)`
  );

  db.transaction(() => {
    for (let i = 1; i <= 20; i++) {
      const collabCount = Math.floor(rand() * 4) + 1;
      for (let j = 0; j < collabCount; j++) {
        const userId = Math.floor(rand() * 15) + 2;
        insertCollab.run(i, userId, j === 0 ? 'owner' : 'collaborator', daysAgo(Math.floor(rand() * 60)));
      }
    }
  })();

  console.log('Creating tasks...');
  const insertTask = db.prepare(
    `INSERT INTO tasks (project_id, title, description, status, priority, labels, assignee_id, created_by, due_date, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );

  const statuses = ['backlog', 'in_progress', 'in_review', 'done'];
  const priorities = ['Low', 'Medium', 'High', 'Critical'];
  const labelOptions = ['Bug', 'Feature', 'Enhancement', 'Docs', 'Question'];

  db.transaction(() => {
    for (let i = 0; i < 60; i++) {
      const projectId = (i % 20) + 1;
      const assigneeId = Math.floor(rand() * 15) + 2;
      const createdBy = Math.floor(rand() * 15) + 2;
      insertTask.run(
        projectId, taskTitles[i], `Description for: ${taskTitles[i]}\n\n## Acceptance Criteria\n- [ ] Criterion 1\n- [ ] Criterion 2\n- [ ] Criterion 3`,
        pick(statuses), pick(priorities),
        JSON.stringify(pickN(labelOptions, Math.floor(rand() * 2) + 1)),
        assigneeId, createdBy,
        daysAgo(Math.floor(rand() * 14) - 7),
        daysAgo(Math.floor(rand() * 30)), hoursAgo(Math.floor(rand() * 720))
      );
    }
  })();

  console.log('Creating snippets...');
  const insertSnippet = db.prepare(
    `INSERT INTO snippets (user_id, project_id, title, description, language, code_content, tags, visibility, views_count, likes_count, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );

  const snippetTitles = [
    'Debounce Utility Function', 'API Response Wrapper', 'Quick Sort Implementation',
    'Go HTTP Server', 'Rust TCP Server', 'SQL Monthly Revenue Analysis',
    'Animated Gradient Hero', 'Array Chunk Helper', 'JWT Auth Middleware',
    'React Custom Hook: useLocalStorage', 'Docker Compose Setup', 'CSS Grid Layout',
    'Python Data Validation', 'TypeScript Utility Types', 'Redis Cache Wrapper',
    'React Context Provider', 'Node.js Stream Processing', 'SQL Join Examples',
    'Rust Error Handling', 'Go Concurrency Pattern', 'Kubernetes Deployment YAML',
    'React Error Boundary', 'Python Async/Await Pattern', 'Shell Script Backup',
    'CSS Animation Keyframes', 'TypeScript Generic Repository', 'Express Rate Limiter',
    'React Portal Component', 'SQL Index Strategy', 'Python Singleton Pattern',
    'Go Testing Patterns', 'Rust Trait Implementation', 'Vue Composition API',
    'React Render Props Pattern', 'Python Decorator Examples', 'Shell Script Automation',
    'CSS Custom Properties', 'TypeScript Decorators', 'Node.js Event Emitter', 'SQL Stored Procedure'
  ];

  db.transaction(() => {
    for (let i = 0; i < 40; i++) {
      const userId = (i % 15) + 2;
      const projectId = (i % 20) + 1;
      const lang = pick(languages);
      const code = snippetContents[lang] || snippetContents[pick(Object.keys(snippetContents))];
      insertSnippet.run(
        userId, projectId, snippetTitles[i],
        `A useful ${lang} snippet for everyday development.`,
        lang, code,
        JSON.stringify(pickN(labelOptions, 2)),
        'public', Math.floor(rand() * 500), Math.floor(rand() * 100),
        daysAgo(Math.floor(rand() * 50))
      );
    }
  })();

  console.log('Creating pull requests...');
  const insertPR = db.prepare(
    `INSERT INTO pull_requests (project_id, opened_by, title, description, from_branch, to_branch, code_diff, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );

  db.transaction(() => {
    for (let i = 0; i < 30; i++) {
      const projectId = (i % 20) + 1;
      const userId = (i % 15) + 2;
      const status = i < 20 ? 'open' : (i < 25 ? 'merged' : 'closed');
      insertPR.run(
        projectId, userId, prTitles[i],
        `## Summary\n\nThis PR addresses ${prTitles[i].toLowerCase()}.\n\n## Changes\n- ${Math.floor(rand() * 5) + 1} files changed\n- ${Math.floor(rand() * 100) + 10} additions\n- ${Math.floor(rand() * 50)} deletions\n\n## Checklist\n- [x] Code compiles\n- [x] Tests pass\n- [x] Self-reviewed`,
        pick(['feature', 'fix', 'chore', 'refactor']),
        pick(['main', 'develop', 'master']),
        pick(codeDiffs),
        status,
        daysAgo(Math.floor(rand() * 30)), hoursAgo(Math.floor(rand() * 720))
      );
    }
  })();

  console.log('Creating discussions...');
  const insertDiscussion = db.prepare(
    `INSERT INTO discussions (project_id, author_id, title, body, category, views_count, replies_count, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  );

  const discussionTitles = [
    'How should we structure the API?', 'Proposal: Migrate to TypeScript', 'Bug: Infinite loop in search component',
    'Feature request: Dark mode', 'Best practices for state management', 'Code review guidelines discussion',
    'Tech stack decision: React vs Vue', 'Performance optimization ideas', 'Documentation improvement plan',
    'Testing strategy for microservices', 'Database migration approach', 'API versioning strategy',
    'Error handling best practices', 'Deployment pipeline review', 'Security audit results',
    'Accessibility improvements roadmap', 'Mobile responsive design patterns', 'Caching strategy discussion',
    'Logging and monitoring setup', 'Package management workflow', 'Code style guide update',
    'New developer onboarding process', 'Open source contribution guidelines', 'Release planning for v2.0',
    'Technical debt reduction plan'
  ];

  const categories = ['announcement', 'question', 'idea', 'poll', 'general'];

  db.transaction(() => {
    for (let i = 0; i < 25; i++) {
      const projectId = (i % 20) + 1;
      const authorId = (i % 15) + 2;
      insertDiscussion.run(
        projectId, authorId, discussionTitles[i],
        `## ${discussionTitles[i]}\n\nI'd like to start a discussion about this topic. Here are my thoughts...\n\nPlease share your feedback and suggestions below!\n\n---\n\n_Originally posted by user ${authorId}_`,
        pick(categories),
        Math.floor(rand() * 300), Math.floor(rand() * 15),
        daysAgo(Math.floor(rand() * 40))
      );
    }
  })();

  console.log('Creating discussion replies...');
  const insertReply = db.prepare(
    `INSERT INTO discussion_replies (discussion_id, author_id, content, likes_count, created_at)
     VALUES (?, ?, ?, ?, ?)`
  );

  db.transaction(() => {
    for (let i = 1; i <= 25; i++) {
      const replyCount = Math.floor(rand() * 5) + 1;
      for (let j = 0; j < replyCount; j++) {
        insertReply.run(
          i, (j % 15) + 2,
          `Great point! I think we should consider this from a different perspective. ${pick(['+1', 'Agreed!', 'Good suggestion.', 'Let me add to this...', 'I had similar thoughts.'])}`,
          Math.floor(rand() * 20), daysAgo(Math.floor(rand() * 30))
        );
      }
    }
  })();

  console.log('Creating follows...');
  const insertFollow = db.prepare(
    `INSERT INTO follows (follower_id, following_id, created_at) VALUES (?, ?, ?)`
  );

  db.transaction(() => {
    const seen = new Set();
    for (let i = 0; i < 80; i++) {
      const follower = Math.floor(rand() * 15) + 2;
      const following = Math.floor(rand() * 15) + 2;
      if (follower !== following && !seen.has(`${follower}-${following}`)) {
        seen.add(`${follower}-${following}`);
        insertFollow.run(follower, following, daysAgo(Math.floor(rand() * 60)));
      }
    }
  })();

  console.log('Creating snippet likes...');
  const insertLike = db.prepare(
    `INSERT INTO snippet_likes (snippet_id, user_id, created_at) VALUES (?, ?, ?)`
  );

  db.transaction(() => {
    for (let i = 0; i < 100; i++) {
      const snippetId = Math.floor(rand() * 40) + 1;
      const userId = Math.floor(rand() * 15) + 2;
      try {
        insertLike.run(snippetId, userId, daysAgo(Math.floor(rand() * 30)));
      } catch (e) { }
    }
  })();

  console.log('Creating activity log...');
  const insertActivity = db.prepare(
    `INSERT INTO activity_log (user_id, action_type, entity_type, entity_id, description, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`
  );

  const actions = [
    { type: 'create', entity: 'project', desc: u => `Created new project` },
    { type: 'complete', entity: 'task', desc: u => `Completed a task` },
    { type: 'create', entity: 'snippet', desc: u => `Posted a code snippet` },
    { type: 'create', entity: 'pull_request', desc: u => `Opened a pull request` },
    { type: 'review', entity: 'pull_request', desc: u => `Reviewed a pull request` },
    { type: 'comment', entity: 'discussion', desc: u => `Commented on a discussion` },
    { type: 'create', entity: 'discussion', desc: u => `Started a discussion` },
    { type: 'star', entity: 'project', desc: u => `Starred a project` },
    { type: 'follow', entity: 'user', desc: u => `Followed another developer` },
  ];

  db.transaction(() => {
    for (let i = 0; i < 200; i++) {
      const userId = (i % 15) + 2;
      const action = pick(actions);
      const daysBack = Math.floor(rand() * 90);
      insertActivity.run(
        userId, action.type, action.entity,
        Math.floor(rand() * 40) + 1,
        action.desc(userId),
        daysAgo(daysBack)
      );
    }
  })();

  console.log('Creating flags...');
  const insertFlag = db.prepare(
    `INSERT INTO flags (entity_type, entity_id, flagged_by, reason, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`
  );

  db.transaction(() => {
    for (let i = 0; i < 5; i++) {
      insertFlag.run(
        pick(['snippet', 'project']),
        Math.floor(rand() * 20) + 1,
        Math.floor(rand() * 15) + 2,
        pick(['Inappropriate content', 'Spam', 'Copyright violation', 'Not relevant', 'Duplicate']),
        'pending',
        daysAgo(Math.floor(rand() * 10))
      );
    }
  })();

  console.log('Updating follower/following counts...');
  db.exec(`
    UPDATE users SET followers_count = (
      SELECT COUNT(*) FROM follows WHERE following_id = users.id
    );
    UPDATE users SET following_count = (
      SELECT COUNT(*) FROM follows WHERE follower_id = users.id
    );
  `);

  console.log('Seed complete!');
  console.log('Admin: admin@devcollab.com / admin123');
  console.log('Devs: dev1@devcollab.com through dev15@devcollab.com / dev123');
}

seed().catch(console.error);
