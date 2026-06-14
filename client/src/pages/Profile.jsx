import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import Badge from '../components/ui/badge';
import Button from '../components/ui/button';
import Avatar from '../components/ui/avatar';
import Skeleton from '../components/ui/skeleton';
import Tabs from '../components/ui/tabs';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/toast';
import { formatDate, timeAgo, LANGUAGES } from '../utils/constants';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function Profile() {
  const { username } = useParams();
  const { user: currentUser, API } = useAuth();
  const toast = useToast();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/users/${username}`);
      setProfile(res.data);
      setIsFollowing(res.data.isFollowing);
    } catch (err) {
      toast('Failed to load profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, [username]);

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await API.delete(`/follow/${profile.user.id}`);
        setIsFollowing(false);
        toast('Unfollowed', 'info');
      } else {
        await API.post(`/follow/${profile.user.id}`);
        setIsFollowing(true);
        toast('Following!', 'success');
      }
    } catch (err) {
      toast(err.response?.data?.error || 'Action failed', 'error');
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!profile) return <div className="p-8 text-center text-slate-400">User not found</div>;

  const { user, projects, snippets, activity } = profile;

  const activityHeatmap = () => {
    const weeks = 52;
    const days = 7;
    const today = new Date();
    const activityByDate = {};
    (activity || []).forEach(a => {
      const d = a.created_at?.split(' ')[0];
      activityByDate[d] = (activityByDate[d] || 0) + 1;
    });

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
        const count = activityByDate[dateStr] || 0;
        cells.push({ date: dateStr, count, week: weeks - 1 - w, day: d });
      }
    }

    return (
      <div className="overflow-x-auto">
        <svg width={weeks * 14 + 40} height={days * 14 + 30} className="mx-auto">
          {cells.map((cell, i) => (
            <rect
              key={i}
              x={cell.week * 14 + 30}
              y={cell.day * 14 + 10}
              width={12}
              height={12}
              rx={2}
              fill={getColor(cell.count)}
              className="heatmap-cell"
            >
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

  const langData = (() => {
    const counts = {};
    projects?.forEach(p => { counts[p.primary_language] = (counts[p.primary_language] || 0) + 1; });
    snippets?.forEach(s => { counts[s.language] = (counts[s.language] || 0) + 1; });
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    return Object.entries(counts).map(([name, value]) => ({ name, value, pct: Math.round(value / total * 100) }));
  })();

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Cover Card */}
      <Card className="mb-6">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <Avatar name={user.name} size="xl" />
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold">{user.name}</h1>
                  <p className="text-slate-400">@{user.username}</p>
                </div>
                {currentUser && currentUser.id !== user.id && (
                  <Button onClick={handleFollow} variant={isFollowing ? 'outline' : 'default'}>
                    {isFollowing ? 'Following' : 'Follow'}
                  </Button>
                )}
              </div>
              {user.bio && <p className="mt-2 text-sm text-slate-300">{user.bio}</p>}
              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-slate-400">
                {user.location && <span>📍 {user.location}</span>}
                {user.website && <span>🔗 {user.website}</span>}
                <span>📅 Joined {formatDate(user.created_at)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        {[
          ['Projects', projects?.length || 0],
          ['Snippets', snippets?.length || 0],
          ['Contributions', user.contributions_count],
          ['Followers', user.followers_count],
          ['Following', user.following_count],
        ].map(([label, count]) => (
          <Card key={label}>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{count}</div>
              <div className="text-xs text-slate-400">{label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Activity Graph */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-sm">Contribution Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {activityHeatmap()}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Languages */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Languages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {langData.slice(0, 8).map(l => (
                <div key={l.name}>
                  <div className="flex justify-between text-xs mb-1">
                    <span>{l.name}</span>
                    <span className="text-slate-400">{l.pct}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${l.pct}%` }} />
                  </div>
                </div>
              ))}
              {langData.length === 0 && <p className="text-xs text-slate-500">No language data</p>}
            </div>
          </CardContent>
        </Card>

        {/* Pinned Projects */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm">Pinned Projects</CardTitle>
          </CardHeader>
          <CardContent>
            {projects?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {projects.slice(0, 6).map(p => (
                  <Link key={p.id} to={`/projects/${p.id}`}>
                    <div className="p-3 rounded-lg border border-border hover:border-slate-500 transition-colors">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="text-xs">{p.primary_language}</Badge>
                        <span className="text-xs text-slate-500">⭐ {p.stars_count}</span>
                      </div>
                      <h4 className="font-medium text-sm truncate">{p.name}</h4>
                      <p className="text-xs text-slate-500 truncate">{p.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">No pinned projects</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {activity?.length > 0 ? (
            <div className="space-y-3">
              {activity.slice(0, 15).map((a, i) => (
                <div key={i} className="flex items-start gap-3 text-sm">
                  <div className="w-2 h-2 mt-1.5 rounded-full bg-primary flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-slate-300">{a.description}</p>
                    <p className="text-xs text-slate-500">{timeAgo(a.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No recent activity</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
