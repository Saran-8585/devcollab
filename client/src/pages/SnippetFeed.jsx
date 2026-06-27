import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent } from '../components/ui/card';
import Badge from '../components/ui/badge';
import Input from '../components/ui/input';
import Select from '../components/ui/select';
import Skeleton from '../components/ui/skeleton';
import { LANGUAGES, timeAgo } from '../utils/constants';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';

export default function SnippetFeed() {
  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const API = axios.create({ baseURL: '/api' });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }, []);

  useEffect(() => {
    setLoading(true);
    API.get('/snippets', { params: { language, search, sort } })
      .then(res => { setSnippets(res.data.snippets); setLoading(false); })
      .catch(() => setLoading(false));
  }, [language, search, sort]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Snippets</h1>
          <p className="text-sm text-slate-400">Discover and share code snippets</p>
        </div>
        <Link to="/snippets/new" className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90">
          + New Snippet
        </Link>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <Input
          placeholder="Search snippets..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-64"
        />
        <Select value={language} onChange={e => setLanguage(e.target.value)} options={[{ value: 'all', label: 'All Languages' }, ...LANGUAGES.map(l => ({ value: l, label: l }))]} className="w-40" />
        <Select value={sort} onChange={e => setSort(e.target.value)} options={[{ value: 'newest', label: 'Newest' }, { value: 'likes', label: 'Most Liked' }]} className="w-40" />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <Card key={i}><CardContent className="p-4 space-y-3"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-24 w-full" /><Skeleton className="h-4 w-1/2" /></CardContent></Card>
          ))}
        </div>
      ) : snippets.length === 0 ? (
        <div className="text-center py-16">
          <svg className="inline-block mb-4" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="1.5">
            <path d="M16 18l6-6-6-6" /><path d="M8 6l-6 6 6 6" />
          </svg>
          <h3 className="text-lg font-medium text-slate-400">No snippets found</h3>
          <p className="text-sm text-slate-500 mt-1">Be the first to share a snippet!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {snippets.map(s => (
            <Link key={s.id} to={`/snippets/${s.id}`}>
              <Card className="h-full hover:border-slate-500 transition-colors cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary" className="text-xs">{s.language}</Badge>
                    <span className="text-xs text-slate-500">❤️ {s.likes_count}</span>
                  </div>
                  <h3 className="font-semibold text-sm mb-1">{s.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-1 mb-2">{s.description}</p>
                  <div className="rounded overflow-hidden">
                    <SyntaxHighlighter
                      language={s.language.toLowerCase()}
                      style={atomOneDark}
                      customStyle={{ fontSize: '11px', padding: '8px', margin: 0, maxHeight: '150px' }}
                      showLineNumbers={false}
                    >
                      {s.code?.split('\n').slice(0, 8).join('\n')}
                    </SyntaxHighlighter>
                  </div>
                  <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
                    <span>by {s.author_username}</span>
                    <span>{timeAgo(s.created_at)}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
