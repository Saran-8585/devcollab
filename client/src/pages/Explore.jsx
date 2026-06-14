import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import Badge from '../components/ui/badge';
import Skeleton from '../components/ui/skeleton';
import Avatar from '../components/ui/avatar';
import Select from '../components/ui/select';
import { LANGUAGES, timeAgo } from '../utils/constants';
import { useAuth } from '../context/AuthContext';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import js from 'react-syntax-highlighter/dist/esm/languages/hljs/javascript';
import python from 'react-syntax-highlighter/dist/esm/languages/hljs/python';
import go from 'react-syntax-highlighter/dist/esm/languages/hljs/go';
import rust from 'react-syntax-highlighter/dist/esm/languages/hljs/rust';
import sql from 'react-syntax-highlighter/dist/esm/languages/hljs/sql';
import css from 'react-syntax-highlighter/dist/esm/languages/hljs/css';

SyntaxHighlighter.registerLanguage('javascript', js);
SyntaxHighlighter.registerLanguage('python', python);
SyntaxHighlighter.registerLanguage('go', go);
SyntaxHighlighter.registerLanguage('rust', rust);
SyntaxHighlighter.registerLanguage('sql', sql);
SyntaxHighlighter.registerLanguage('css', css);

export default function Explore() {
  const [projects, setProjects] = useState([]);
  const [snippets, setSnippets] = useState([]);
  const [topDevs, setTopDevs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [langFilter, setLangFilter] = useState('all');
  const [sort, setSort] = useState('stars');
  const { user } = useAuth();
  const API = axios.create({ baseURL: '/api' });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      API.get('/projects', { params: { language: langFilter, sort } }).then(r => r.data.projects),
      API.get('/snippets', { params: { sort: 'likes' } }).then(r => r.data.snippets),
      API.get('/users/devkiran').then(r => {
        const allDevs = [
          { ...r.data.user, projects: r.data.projects },
        ];
        return allDevs;
      }).catch(() => []),
    ]).then(([proj, snips, devs]) => {
      setProjects(proj);
      setSnippets(snips.slice(0, 4));
      setTopDevs(devs);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [langFilter, sort]);

  const FeaturedProjects = () => (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Featured Projects</h2>
        <div className="flex gap-3">
          <Select
            value={langFilter}
            onChange={e => setLangFilter(e.target.value)}
            options={[{ value: 'all', label: 'All Languages' }, ...LANGUAGES.map(l => ({ value: l, label: l }))]}
            className="w-40"
          />
          <Select
            value={sort}
            onChange={e => setSort(e.target.value)}
            options={[
              { value: 'stars', label: 'Most Starred' },
              { value: 'updated', label: 'Recently Updated' },
              { value: 'newest', label: 'Newest' },
            ]}
            className="w-40"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}><CardContent className="p-4 space-y-2"><Skeleton className="h-5 w-3/4" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-1/2" /></CardContent></Card>
        )) : projects.map(p => (
          <Link key={p.id} to={`/projects/${p.id}`}>
            <Card className="h-full hover:border-slate-500 transition-colors cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Avatar name={p.owner_name} size="sm" />
                  <span className="text-xs text-slate-400">{p.owner_username}</span>
                </div>
                <h3 className="font-semibold mb-1 truncate">{p.name}</h3>
                <p className="text-sm text-slate-400 line-clamp-2 mb-3">{p.description}</p>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <Badge variant="secondary">{p.primary_language}</Badge>
                  <span>⭐ {p.stars_count}</span>
                  <span>⑂ {p.forks_count}</span>
                  <span className="ml-auto">{timeAgo(p.updated_at)}</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );

  const TrendingSnippets = () => (
    <section className="mt-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Trending Snippets</h2>
        <Link to="/snippets" className="text-sm text-primary hover:underline">View all →</Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}><CardContent className="p-4 space-y-2"><Skeleton className="h-4 w-full" /><Skeleton className="h-20 w-full" /></CardContent></Card>
        )) : snippets.map(s => (
          <Link key={s.id} to={`/snippets/${s.id}`}>
            <Card className="h-full hover:border-slate-500 transition-colors cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary" className="text-xs">{s.language}</Badge>
                  <span className="text-xs text-slate-500">❤️ {s.likes_count}</span>
                </div>
                <h3 className="font-semibold text-sm mb-1 truncate">{s.title}</h3>
                <div className="rounded overflow-hidden">
                  <SyntaxHighlighter
                    language={s.language.toLowerCase()}
                    style={atomOneDark}
                    customStyle={{ fontSize: '11px', padding: '8px', margin: 0, maxHeight: '120px' }}
                    showLineNumbers={false}
                  >
                    {s.code_content?.split('\n').slice(0, 8).join('\n')}
                  </SyntaxHighlighter>
                </div>
                <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
                  <span>{s.author_username}</span>
                  <span>{timeAgo(s.created_at)}</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );

  const TopDevelopersPlaceholder = () => (
    <section className="mt-10">
      <h2 className="text-xl font-bold mb-6">Top Developers</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1,2,3,4,5,6].map(i => (
          <Link key={i} to={`/u/dev${i}`}>
            <Card className="hover:border-slate-500 transition-colors cursor-pointer">
              <CardContent className="p-4 flex items-center gap-4">
                <Avatar name={`Dev ${i}`} size="lg" />
                <div>
                  <h3 className="font-semibold">dev{i}@devcollab.com</h3>
                  <p className="text-xs text-slate-400">@{`dev${i}`}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                    <Badge variant="secondary">{LANGUAGES[i % LANGUAGES.length]}</Badge>
                    <span>{Math.floor(Math.random() * 20)} projects</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Explore</h1>
        <p className="text-slate-400 mt-1">Discover projects, snippets, and developers</p>
      </div>
      <FeaturedProjects />
      <TrendingSnippets />
      <TopDevelopersPlaceholder />
    </div>
  );
}
