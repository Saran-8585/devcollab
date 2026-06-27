import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import Badge from '../components/ui/badge';
import Button from '../components/ui/button';
import Select from '../components/ui/select';
import Tabs from '../components/ui/tabs';
import Skeleton from '../components/ui/skeleton';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/toast';
import { formatDate, timeAgo, PRIORITIES, TASK_STATUSES, priorityColors } from '../utils/constants';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function Dashboard() {
  const { user, API } = useAuth();
  const toast = useToast();
  const [summary, setSummary] = useState(null);
  const [myTasks, setMyTasks] = useState([]);
  const [myProjects, setMyProjects] = useState([]);
  const [mySnippets, setMySnippets] = useState([]);
  const [activity, setActivity] = useState([]);
  const [heatmap, setHeatmap] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Activity');
  const [taskFilter, setTaskFilter] = useState({ project: '', priority: '', status: '' });

  useEffect(() => {
    setLoading(true);
    Promise.all([
      API.get('/dashboard').then(r => {
        setSummary(r.data);
        setMyTasks(r.data.tasks || []);
        setActivity(r.data.activity || []);
      }),
      API.get('/projects').then(r => setMyProjects(r.data.projects)),
      API.get('/snippets', { params: { sort: 'newest' } }).then(r => setMySnippets(r.data.snippets)),
    ]).then(() => setLoading(false)).catch(() => setLoading(false));
  }, []);

  const filteredTasks = myTasks.filter(t => {
    if (taskFilter.project && t.project_id !== parseInt(taskFilter.project)) return false;
    if (taskFilter.priority && t.priority !== taskFilter.priority) return false;
    if (taskFilter.status && t.status !== taskFilter.status) return false;
    return true;
  });

  const activityHeatmap = () => {
    const weeks = 52;
    const days = 7;
    const today = new Date();
    const activityByDate = {};
    heatmap.forEach(h => { activityByDate[h.date] = h.count; });

    const getColor = (count) => {
      if (!count) return '#1e293b';
      if (count <= 2) return '#0e4429';
      if (count <= 5) return '#006d32';
      if (count <= 10) return '#26a641';
      return '#39d353';
    };

    const cells = [];
    for (let w = weeks - 1; w >= 0; w--) {
      for (let d = 0; d < days; d++) {
        const date = new Date(today);
        date.setDate(date.getDate() - (w * 7 + (6 - d)));
        const dateStr = date.toISOString().split('T')[0];
        cells.push({ date: dateStr, count: activityByDate[dateStr] || 0, week: weeks - 1 - w, day: d });
      }
    }

    return (
      <div className="overflow-x-auto">
        <svg width={Math.min(weeks * 14 + 40, 800)} height={days * 14 + 30}>
          {cells.map((cell, i) => (
            <rect key={i} x={cell.week * 14 + 30} y={cell.day * 14 + 10} width={12} height={12} rx={2} fill={getColor(cell.count)} className="heatmap-cell">
              <title>{cell.date}: {cell.count} contributions</title>
            </rect>
          ))}
          {['Mon', '', 'Wed', '', 'Fri', '', ''].map((label, i) => (
            <text key={i} x={2} y={i * 14 + 20} className="fill-slate-500 text-[10px]">{label}</text>
          ))}
        </svg>
      </div>
    );
  };

  const tabs = ['Activity', 'My Tasks', 'My Projects', 'My Snippets'];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-4 gap-4"><Skeleton className="h-24" /><Skeleton className="h-24" /><Skeleton className="h-24" /><Skeleton className="h-24" /></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[
          ['📋', 'Open Tasks', summary?.openTasks || 0, 'text-blue-400'],
          ['📁', 'My Projects', summary?.myProjects || 0, 'text-green-400'],
          ['📝', 'Snippets', summary?.mySnippets || 0, 'text-amber-400'],
          ['🔄', 'My PRs', summary?.myPRs || 0, 'text-purple-400'],
        ].map(([icon, label, count, color]) => (
          <Card key={label}>
            <CardContent className="p-4 flex items-center gap-4">
              <span className={`text-2xl ${color}`}>{icon}</span>
              <div>
                <div className="text-2xl font-bold">{count}</div>
                <div className="text-xs text-slate-400">{label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

      <div className="mt-6">
        {activeTab === 'Activity' && (
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="text-sm">Contribution Activity</CardTitle></CardHeader>
              <CardContent>{activityHeatmap()}</CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm">Recent Activity</CardTitle></CardHeader>
              <CardContent>
                {activity.length > 0 ? (
                  <div className="space-y-3">
                    {activity.slice(0, 20).map((a, i) => (
                      <div key={i} className="flex items-start gap-3 text-sm">
                        <div className="w-2 h-2 mt-1.5 rounded-full bg-primary flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-slate-300">{a.description}</p>
                          <p className="text-xs text-slate-500">{timeAgo(a.created_at)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-sm text-slate-500">No recent activity</p>}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'My Tasks' && (
          <div>
            <div className="flex gap-3 mb-4">
              <Select value={taskFilter.priority} onChange={e => setTaskFilter({...taskFilter, priority: e.target.value})}
                options={[{ value: '', label: 'All Priorities' }, ...PRIORITIES.map(p => ({ value: p, label: p }))]} className="w-40" />
              <Select value={taskFilter.status} onChange={e => setTaskFilter({...taskFilter, status: e.target.value})}
                options={[{ value: '', label: 'All Statuses' }, ...TASK_STATUSES.map(s => ({ value: s, label: s.replace('_', ' ') }))]} className="w-40" />
            </div>
            <div className="space-y-2">
              {filteredTasks.map(t => (
                <Card key={t.id}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge className={priorityColors[t.priority]}>{t.priority}</Badge>
                      <div>
                        <p className="text-sm font-medium">{t.title}</p>
                        <p className="text-xs text-slate-400">{t.project_name} · {t.status.replace('_', ' ')}</p>
                      </div>
                    </div>
                    <Select value={t.status} onChange={async (e) => {
                      await API.put(`/tasks/${t.id}`, { status: e.target.value });
                      toast('Status updated', 'success');
                      const res = await API.get('/dashboard');
                      setMyTasks(res.data.tasks || []);
                    }}
                      options={TASK_STATUSES.map(s => ({ value: s, label: s.replace('_', ' ') }))} className="w-36" />
                  </CardContent>
                </Card>
              ))}
              {filteredTasks.length === 0 && <p className="text-sm text-slate-500 py-4">No tasks found</p>}
            </div>
          </div>
        )}

        {activeTab === 'My Projects' && (
          <div>
            <div className="flex justify-between mb-4">
              <span className="text-sm text-slate-400">{myProjects.length} projects</span>
              <Link to="/projects/new"><Button size="sm">+ New Project</Button></Link>
            </div>
            {myProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myProjects.map(p => (
                  <Link key={p.id} to={`/projects/${p.id}`}>
                    <Card className="hover:border-slate-500 transition-colors cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={p.visibility === 'public' ? 'secondary' : 'outline'}>{p.visibility}</Badge>
                          <Badge variant="secondary" className="text-xs">{p.primary_language}</Badge>
                        </div>
                        <h3 className="font-semibold mb-1 truncate">{p.name}</h3>
                        <p className="text-xs text-slate-400 line-clamp-2">{p.description}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                          <span>⭐ {p.stars_count}</span>
                          <span>Updated {timeAgo(p.updated_at)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : <p className="text-sm text-slate-500">No projects yet</p>}
          </div>
        )}

        {activeTab === 'My Snippets' && (
          <div>
            {mySnippets.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-3 text-slate-400 font-medium">Title</th>
                      <th className="text-left py-2 px-3 text-slate-400 font-medium">Language</th>
                      <th className="text-left py-2 px-3 text-slate-400 font-medium">Likes</th>
                      <th className="text-left py-2 px-3 text-slate-400 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mySnippets.map(s => (
                      <tr key={s.id} className="border-b border-border hover:bg-slate-800/50">
                        <td className="py-2 px-3"><Link to={`/snippets/${s.id}`} className="text-primary hover:underline">{s.title}</Link></td>
                        <td className="py-2 px-3"><Badge variant="secondary" className="text-xs">{s.language}</Badge></td>
                        <td className="py-2 px-3">❤️ {s.likes_count}</td>
                        <td className="py-2 px-3 text-slate-400">{formatDate(s.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <p className="text-sm text-slate-500">No snippets yet</p>}
          </div>
        )}
      </div>
    </div>
  );
}
