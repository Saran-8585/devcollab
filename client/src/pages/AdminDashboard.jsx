import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import Badge from '../components/ui/badge';
import Button from '../components/ui/button';
import Skeleton from '../components/ui/skeleton';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/toast';
import { formatDate } from '../utils/constants';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';

export default function AdminDashboard() {
  const { user, API } = useAuth();
  const toast = useToast();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('overview');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      API.get('/admin/stats').then(r => setStats(r.data)),
      API.get('/admin/users').then(r => setUsers(r.data.users)),
      API.get('/admin/flags').then(r => setFlags(r.data.flags)),
    ]).then(() => setLoading(false)).catch(() => setLoading(false));
  }, []);

  const suspendUser = async (userId) => {
    try {
      const res = await API.patch(`/admin/users/${userId}/suspend`);
      toast(res.data.message, 'info');
      const r = await API.get('/admin/users');
      setUsers(r.data.users);
    } catch (err) {
      toast('Failed', 'error');
    }
  };

  const dismissFlag = async (flagId) => {
    try {
      await API.patch(`/admin/flags/${flagId}`);
      toast('Flag dismissed', 'success');
      setFlags(flags.filter(f => f.id !== flagId));
    } catch (err) {
      toast('Failed', 'error');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
      </div>
    );
  }

  const sections = [
    { id: 'overview', label: 'Overview' },
    { id: 'users', label: 'Users' },
    { id: 'flags', label: 'Flags' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      <div className="flex gap-2 mb-6">
        {sections.map(s => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeSection === s.id ? 'bg-primary text-primary-foreground' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {activeSection === 'overview' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              ['👨‍💻', 'Total Developers', stats?.stats.totalDevs, 'text-blue-400'],
              ['📁', 'Total Projects', stats?.stats.totalProjects, 'text-green-400'],
              ['📝', 'Total Snippets', stats?.stats.totalSnippets, 'text-amber-400'],
              ['🤖', 'AI Reviews', stats?.stats.totalAIReviews, 'text-purple-400'],
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

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="text-sm">Projects by Language</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={stats?.projectsByLanguage || []}>
                    <XAxis dataKey="language" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                    <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-sm">New Registrations (Weekly)</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={stats?.registrationsPerWeek || []}>
                    <XAxis dataKey="week" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                    <Line type="monotone" dataKey="count" stroke="#22c55e" strokeWidth={2} dot={{ fill: '#22c55e' }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader><CardTitle className="text-sm">AI Tool Usage (Daily)</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={stats?.aiUsage || []}>
                    <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                    <Bar dataKey="explain_count" name="Explain" stackId="a" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="fix_count" name="Fix" stackId="a" fill="#22c55e" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="generate_count" name="Generate" stackId="a" fill="#f59e0b" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="review_count" name="Review" stackId="a" fill="#8b5cf6" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeSection === 'users' && (
        <Card>
          <CardHeader><CardTitle className="text-sm">User Management ({users.length} users)</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-3 text-slate-400 font-medium">Name</th>
                    <th className="text-left py-2 px-3 text-slate-400 font-medium">Email</th>
                    <th className="text-left py-2 px-3 text-slate-400 font-medium">Role</th>
                    <th className="text-left py-2 px-3 text-slate-400 font-medium">Status</th>
                    <th className="text-left py-2 px-3 text-slate-400 font-medium">Joined</th>
                    <th className="text-right py-2 px-3 text-slate-400 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} className="border-b border-border hover:bg-slate-800/50">
                      <td className="py-2 px-3 font-medium">{u.name}<br /><span className="text-xs text-slate-500">@{u.username}</span></td>
                      <td className="py-2 px-3 text-slate-300">{u.email}</td>
                      <td className="py-2 px-3"><Badge variant={u.role === 'admin' ? 'default' : 'secondary'}>{u.role}</Badge></td>
                      <td className="py-2 px-3">
                        <Badge variant={u.is_suspended ? 'destructive' : 'success'}>{u.is_suspended ? 'Suspended' : 'Active'}</Badge>
                      </td>
                      <td className="py-2 px-3 text-slate-400">{formatDate(u.created_at)}</td>
                      <td className="py-2 px-3 text-right">
                        {u.role !== 'admin' && (
                          <Button size="sm" variant={u.is_suspended ? 'outline' : 'destructive'}
                            onClick={() => suspendUser(u.id)}>
                            {u.is_suspended ? 'Activate' : 'Suspend'}
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {activeSection === 'flags' && (
        <Card>
          <CardHeader><CardTitle className="text-sm">Content Moderation ({flags.length} pending)</CardTitle></CardHeader>
          <CardContent>
            {flags.length > 0 ? (
              <div className="space-y-3">
                {flags.map(f => (
                  <div key={f.id} className="p-4 rounded-lg border border-border bg-slate-800/50 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="destructive" className="text-xs">{f.entity_type}</Badge>
                        <span className="text-sm font-medium">Entity #{f.entity_id}</span>
                      </div>
                      <p className="text-xs text-slate-400">Flagged by {f.flagger_username}</p>
                      {f.reason && <p className="text-sm text-slate-300 mt-1">Reason: {f.reason}</p>}
                      <p className="text-xs text-slate-500 mt-1">{formatDate(f.created_at)}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => dismissFlag(f.id)}>Dismiss</Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No pending flags</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
