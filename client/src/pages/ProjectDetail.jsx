import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import Badge from '../components/ui/badge';
import Button from '../components/ui/button';
import Input from '../components/ui/input';
import Textarea from '../components/ui/textarea';
import Select from '../components/ui/select';
import Dialog from '../components/ui/dialog';
import Avatar from '../components/ui/avatar';
import Tabs from '../components/ui/tabs';
import Separator from '../components/ui/separator';
import Skeleton from '../components/ui/skeleton';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/toast';
import { formatDate, timeAgo, PRIORITIES, priorityColors, statusColors, categoryColors, labelColors, TASK_STATUSES } from '../utils/constants';
import EditHistory from '../components/EditHistory';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';

export default function ProjectDetail() {
  const { id } = useParams();
  const { user, API } = useAuth();
  const toast = useToast();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Overview');
  const [showAddTask, setShowAddTask] = useState(false);
  const [showAddCollab, setShowAddCollab] = useState(false);
  const [taskFilter, setTaskFilter] = useState({ assignee: '', priority: '', label: '' });

  const fetchProject = () => {
    setLoading(true);
    API.get(`/projects/${id}`)
      .then(res => { setProject(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchProject(); }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-4">
        <Skeleton className="h-8 w-96" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!project) return <div className="p-8 text-center text-slate-400">Project not found</div>;

  const { project: p, collaborators, taskCounts, tasks, snippets, pullRequests, discussions } = project;
  const isOwner = user?.id === p.owner_id;
  const isMember = collaborators?.some(c => c.id === user?.id);

  const TaskCard = ({ task }) => (
    <div className="p-3 rounded-lg border border-border bg-slate-800/50 space-y-2">
      <div className="flex items-start justify-between">
        <h4 className="font-medium text-sm">{task.title}</h4>
        <Badge className={priorityColors[task.priority]}>{task.priority}</Badge>
      </div>
      {task.assignee_name && (
        <div className="flex items-center gap-2">
          <Avatar name={task.assignee_name} size="sm" />
          <span className="text-xs text-slate-400">{task.assignee_name}</span>
        </div>
      )}
      <div className="flex flex-wrap gap-1">
        {task.labels?.map(l => <Badge key={l} className={`${labelColors[l] || 'bg-slate-600'} text-xs`}>{l}</Badge>)}
      </div>
      {task.due_date && <p className="text-xs text-slate-500">Due: {formatDate(task.due_date)}</p>}
      <div className="flex gap-2 pt-1">
        {TASK_STATUSES[TASK_STATUSES.indexOf(task.status) + 1] && (
          <button
            onClick={async () => {
              const nextStatus = TASK_STATUSES[TASK_STATUSES.indexOf(task.status) + 1];
              await API.put(`/tasks/${task.id}`, { status: nextStatus });
              toast(`Moved to ${nextStatus}`, 'success');
              fetchProject();
            }}
            className="text-xs text-primary hover:underline"
          >
            Move to {TASK_STATUSES[TASK_STATUSES.indexOf(task.status) + 1]}
          </button>
        )}
      </div>
    </div>
  );

  const kanbanColumns = ['backlog', 'in_progress', 'in_review', 'done'];
  const filteredTasks = tasks?.filter(t => {
    if (taskFilter.assignee && t.assignee_id !== parseInt(taskFilter.assignee)) return false;
    if (taskFilter.priority && t.priority !== taskFilter.priority) return false;
    if (taskFilter.label && !t.labels?.includes(taskFilter.label)) return false;
    return true;
  }) || [];

  const tabContent = {
    Overview: (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6 prose prose-invert prose-sm max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{p.readme_content || '*No README yet*'}</ReactMarkdown>
            </CardContent>
          </Card>
          <EditHistory entityType="project" entityId={p.id} />
        </div>
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Project Stats</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-slate-400">Tasks Open</span><span>{taskCounts?.find(t => t.status !== 'done')?.count || 0}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Tasks Closed</span><span>{taskCounts?.find(t => t.status === 'done')?.count || 0}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Collaborators</span><span>{collaborators?.length || 0}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Snippets</span><span>{snippets?.length || 0}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">⭐ Stars</span><span>{p.stars_count}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">⑂ Forks</span><span>{p.forks_count}</span></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm">Collaborators</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {collaborators?.map(c => (
                  <Link key={c.id} to={`/u/${c.username}`} className="flex flex-col items-center gap-1">
                    <Avatar name={c.name} size="sm" />
                    <span className="text-xs text-slate-400">{c.username}</span>
                  </Link>
                ))}
              </div>
              {isOwner && (
                <Button size="sm" variant="outline" className="w-full mt-3" onClick={() => setShowAddCollab(true)}>
                  + Add Collaborator
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    ),

    Tasks: (
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-3">
            <Select value={taskFilter.assignee} onChange={e => setTaskFilter({...taskFilter, assignee: e.target.value})}
              options={[{ value: '', label: 'All Assignees' }, ...(collaborators || []).map(c => ({ value: c.id, label: c.name }))]}
              className="w-40" />
            <Select value={taskFilter.priority} onChange={e => setTaskFilter({...taskFilter, priority: e.target.value})}
              options={[{ value: '', label: 'All Priorities' }, ...PRIORITIES.map(p => ({ value: p, label: p }))]}
              className="w-40" />
            <Select value={taskFilter.label} onChange={e => setTaskFilter({...taskFilter, label: e.target.value})}
              options={[{ value: '', label: 'All Labels' }, { value: 'Bug', label: 'Bug' }, { value: 'Feature', label: 'Feature' }, { value: 'Enhancement', label: 'Enhancement' }, { value: 'Docs', label: 'Docs' }, { value: 'Question', label: 'Question' }]}
              className="w-40" />
          </div>
          {isMember && <Button size="sm" onClick={() => setShowAddTask(true)}>+ Add Task</Button>}
        </div>

        <div className="grid grid-cols-4 gap-4">
          {kanbanColumns.map(col => (
            <div key={col}>
              <div className={`px-3 py-2 rounded-t-lg text-sm font-medium ${statusColors[col]} text-white`}>
                {col.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </div>
              <div className="space-y-2 p-2 border border-t-0 border-border rounded-b-lg min-h-[200px] bg-slate-900/50">
                {filteredTasks.filter(t => t.status === col).map(task => <TaskCard key={task.id} task={task} />)}
                {filteredTasks.filter(t => t.status === col).length === 0 && (
                  <p className="text-xs text-slate-500 text-center py-4">No tasks</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    ),

    'Code Snippets': (
      <div className="space-y-4">
        {snippets?.length > 0 ? snippets.map(s => (
          <Link key={s.id} to={`/snippets/${s.id}`}>
            <Card className="hover:border-slate-500 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-semibold">{s.title}</h3>
                    <p className="text-xs text-slate-400">{s.description}</p>
                  </div>
                  <Badge variant="secondary">{s.language}</Badge>
                </div>
                <SyntaxHighlighter language={s.language.toLowerCase()} style={atomOneDark}
                  customStyle={{ fontSize: '12px', padding: '12px', maxHeight: '120px' }} showLineNumbers={false}>
                  {s.code?.split('\n').slice(0, 6).join('\n')}
                </SyntaxHighlighter>
                <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
                  <span>by {s.author_username} · {timeAgo(s.created_at)}</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        )) : <p className="text-sm text-slate-500">No snippets linked to this project</p>}
      </div>
    ),

    'Pull Requests': (
      <div>
        <div className="flex justify-between mb-4">
          <h3 className="font-medium">Pull Requests</h3>
          <Link to={`/pr/new?project=${p.id}`}>
            <Button size="sm">+ New PR</Button>
          </Link>
        </div>
        {pullRequests?.length > 0 ? pullRequests.map(pr => (
          <Link key={pr.id} to={`/pr/${pr.id}`}>
            <Card className="mb-3 hover:border-slate-500 transition-colors">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${statusColors[pr.status]}`} />
                  <div>
                    <h4 className="font-medium text-sm">{pr.title}</h4>
                    <p className="text-xs text-slate-400">
                      {pr.author_username} · {pr.from_branch} → {pr.to_branch}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={pr.status === 'open' ? 'success' : pr.status === 'merged' ? 'secondary' : 'destructive'}>
                    {pr.status}
                  </Badge>
                  <span className="text-xs text-slate-500">💬 {pr.comments_count || 0}</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        )) : <p className="text-sm text-slate-500">No pull requests yet</p>}
      </div>
    ),

    Discussions: (
      <div>
        {discussions?.length > 0 ? discussions.map(d => (
          <Card key={d.id} className="mb-3">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Badge className={`${categoryColors[d.category] || 'bg-slate-600'} text-xs`}>{d.category}</Badge>
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{d.title}</h4>
                  <p className="text-xs text-slate-400">{d.author_username} · {timeAgo(d.created_at)}</p>
                </div>
                <div className="text-xs text-slate-500 text-right">
                  <div>💬 {d.replies_count}</div>
                  <div>👁️ {d.views_count}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )) : <p className="text-sm text-slate-500">No discussions yet</p>}
      </div>
    ),

    Settings: isOwner ? (
      <ProjectSettings project={p} API={API} toast={toast} onUpdate={fetchProject} />
    ) : <p className="text-sm text-slate-500">Only the project owner can access settings</p>,
  };

  const tabs = ['Overview', 'Tasks', 'Code Snippets', 'Pull Requests', 'Discussions', ...(isOwner ? ['Settings'] : [])];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold">{p.name}</h1>
          <Badge variant={p.visibility === 'public' ? 'secondary' : 'outline'}>{p.visibility}</Badge>
        </div>
        <p className="text-slate-400">{p.description}</p>
        <div className="flex items-center gap-3 mt-2 text-sm text-slate-500">
          <Link to={`/u/${p.owner_username}`} className="flex items-center gap-1">
            <Avatar name={p.owner_name} size="sm" /> {p.owner_username}
          </Link>
          <Badge variant="secondary" className="text-xs">{p.primary_language}</Badge>
          {p.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {p.tags.map(tag => (
                <Badge key={tag} variant="outline" className="text-[10px] px-1.5 py-0">{tag}</Badge>
              ))}
            </div>
          )}
          <span>Updated {timeAgo(p.updated_at)}</span>
        </div>
      </div>

      <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

      <div className="mt-6">
        {tabContent[activeTab]}
      </div>

      <Dialog open={showAddTask} onClose={() => setShowAddTask(false)} title="Add Task">
        <AddTaskForm projectId={p.id} collaborators={collaborators} API={API} toast={toast}
          onSuccess={() => { setShowAddTask(false); fetchProject(); }} />
      </Dialog>

      <Dialog open={showAddCollab} onClose={() => setShowAddCollab(false)} title="Add Collaborator">
        <AddCollabForm projectId={p.id} API={API} toast={toast}
          onSuccess={() => { setShowAddCollab(false); fetchProject(); }} />
      </Dialog>
    </div>
  );
}

function AddTaskForm({ projectId, collaborators, API, toast, onSuccess }) {
  const [form, setForm] = useState({ title: '', description: '', priority: 'Medium', labels: [], assignee_id: '', due_date: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await API.post('/tasks', { ...form, project_id: parseInt(projectId), assignee_id: form.assignee_id || null });
      toast('Task created!', 'success');
      onSuccess();
    } catch (err) {
      toast('Failed to create task', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="text-sm">Title</label>
        <Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
      </div>
      <div>
        <label className="text-sm">Description</label>
        <Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm">Priority</label>
          <Select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})} options={PRIORITIES} />
        </div>
        <div>
          <label className="text-sm">Assignee</label>
          <Select value={form.assignee_id} onChange={e => setForm({...form, assignee_id: e.target.value})}
            options={[{ value: '', label: 'Unassigned' }, ...(collaborators || []).map(c => ({ value: c.id, label: c.name }))]} />
        </div>
      </div>
      <div>
        <label className="text-sm">Due Date</label>
        <Input type="date" value={form.due_date} onChange={e => setForm({...form, due_date: e.target.value})} />
      </div>
      <Button type="submit" disabled={submitting}>{submitting ? 'Creating...' : 'Create Task'}</Button>
    </form>
  );
}

function AddCollabForm({ projectId, API, toast, onSuccess }) {
  const [username, setUsername] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await API.post(`/projects/${projectId}/collaborate`, { username });
      toast('Collaborator added!', 'success');
      onSuccess();
    } catch (err) {
      toast(err.response?.data?.error || 'Failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Input value={username} onChange={e => setUsername(e.target.value)} placeholder="Enter username" required />
      <Button type="submit" disabled={submitting}>{submitting ? 'Adding...' : 'Add'}</Button>
    </form>
  );
}

function ProjectSettings({ project, API, toast, onUpdate }) {
  const [form, setForm] = useState({
    name: project.name, description: project.description,
    visibility: project.visibility, primary_language: project.primary_language,
    tags: (project.tags || []).join(', '), readme_content: project.readme_content || '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await API.put(`/projects/${project.id}`, {
        ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      });
      toast('Project updated!', 'success');
      onUpdate();
    } catch (err) {
      toast('Failed to update', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await API.delete(`/projects/${project.id}`);
      toast('Project deleted', 'info');
      window.location.href = '/';
    } catch (err) {
      toast('Failed to delete', 'error');
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-sm">Project Settings</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-3">
            <Input label="Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Name" />
            <Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Description" />
            <Select value={form.visibility} onChange={e => setForm({...form, visibility: e.target.value})} options={['public', 'private']} />
            <Input value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} placeholder="Tags (comma separated)" />
            <Textarea value={form.readme_content} onChange={e => setForm({...form, readme_content: e.target.value})} className="min-h-[200px] font-mono text-xs" placeholder="README content (markdown)" />
            <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Save Changes'}</Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-red-900">
        <CardHeader><CardTitle className="text-sm text-red-400">Danger Zone</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-slate-400 mb-3">This action cannot be undone. The project and all its data will be permanently deleted.</p>
          <Button variant="destructive" onClick={() => setShowDelete(true)}>Delete Project</Button>
        </CardContent>
      </Card>

      <Dialog open={showDelete} onClose={() => setShowDelete(false)} title="Confirm Delete">
        <p className="text-sm text-slate-300 mb-4">Are you sure you want to delete this project?</p>
        <div className="flex gap-3">
          <Button variant="destructive" onClick={handleDelete}>Yes, Delete</Button>
          <Button variant="outline" onClick={() => setShowDelete(false)}>Cancel</Button>
        </div>
      </Dialog>
    </div>
  );
}
