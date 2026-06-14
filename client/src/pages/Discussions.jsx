import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import Badge from '../components/ui/badge';
import Input from '../components/ui/input';
import Select from '../components/ui/select';
import Skeleton from '../components/ui/skeleton';
import { formatDate, timeAgo, categoryColors, DISCUSSION_CATEGORIES } from '../utils/constants';
import axios from 'axios';

export default function Discussions() {
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const API = axios.create({ baseURL: '/api' });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }, []);

  useEffect(() => {
    setLoading(true);
    API.get('/discussions/project/all')
      .then(res => {
        let items = res.data.discussions;
        if (search) items = items.filter(d => d.title.toLowerCase().includes(search.toLowerCase()));
        if (category) items = items.filter(d => d.category === category);
        setDiscussions(items);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [search, category]);

  const trending = [...discussions].sort((a, b) => b.replies_count - a.replies_count).slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Discussions</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="flex flex-wrap gap-3 mb-6">
            <Input placeholder="Search discussions..." value={search} onChange={e => setSearch(e.target.value)} className="w-64" />
            <Select value={category} onChange={e => setCategory(e.target.value)}
              options={[{ value: '', label: 'All Categories' }, ...DISCUSSION_CATEGORIES.map(c => ({ value: c, label: c.charAt(0).toUpperCase() + c.slice(1) }))]}
              className="w-40" />
          </div>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
            </div>
          ) : discussions.length > 0 ? (
            <div className="space-y-3">
              {discussions.map(d => (
                <Card key={d.id} className="hover:border-slate-500 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Badge className={`${categoryColors[d.category]} text-xs`}>{d.category}</Badge>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm truncate">{d.title}</h3>
                        <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                          <span>{d.author_username}</span>
                          <span>in <Link to={`/projects/${d.project_id}`} className="text-primary hover:underline">{d.project_name}</Link></span>
                          <span>{timeAgo(d.created_at)}</span>
                        </div>
                      </div>
                      <div className="text-right text-xs text-slate-500 flex-shrink-0">
                        <div>💬 {d.replies_count}</div>
                        <div>👁️ {d.views_count}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <svg className="inline-block mb-4" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="1.5">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <h3 className="text-lg font-medium text-slate-400">No discussions found</h3>
            </div>
          )}
        </div>

        {/* Trending Sidebar */}
        <div>
          <Card>
            <CardHeader><CardTitle className="text-sm">Trending Discussions</CardTitle></CardHeader>
            <CardContent>
              {trending.length > 0 ? (
                <div className="space-y-3">
                  {trending.map((d, i) => (
                    <div key={d.id} className="flex gap-3 text-sm">
                      <span className="text-slate-500 font-mono w-5">#{i + 1}</span>
                      <div>
                        <p className="text-xs text-slate-300 truncate">{d.title}</p>
                        <p className="text-xs text-slate-500">{d.replies_count} replies</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500">No trending discussions</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
