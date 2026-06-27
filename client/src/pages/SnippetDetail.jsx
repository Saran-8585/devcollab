import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import Badge from '../components/ui/badge';
import Button from '../components/ui/button';
import Avatar from '../components/ui/avatar';
import Separator from '../components/ui/separator';
import Skeleton from '../components/ui/skeleton';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/toast';
import { formatDate, timeAgo } from '../utils/constants';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import EditHistory from '../components/EditHistory';

export default function SnippetDetail() {
  const { id } = useParams();
  const { user, API } = useAuth();
  const toast = useToast();
  const [snippet, setSnippet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    API.get(`/snippets/${id}`)
      .then(res => { setSnippet(res.data.snippet); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  const handleCopy = () => {
    navigator.clipboard.writeText(snippet.code);
    setCopied(true);
    toast('Copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!snippet) return <div className="p-8 text-center text-slate-400">Snippet not found</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{snippet.title}</h1>
          <p className="text-slate-400 mt-1">{snippet.description}</p>
        </div>
        <Button onClick={handleCopy}>{copied ? 'Copied!' : 'Copy Code'}</Button>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <Badge variant="secondary">{snippet.language}</Badge>
        {snippet.tags?.map(t => <Badge key={t} variant="outline" className="text-xs">{t}</Badge>)}
        <span className="text-sm text-slate-500">by {snippet.author_username}</span>
        <span className="text-sm text-slate-500">{formatDate(snippet.created_at)}</span>
        <span className="text-sm text-slate-500">👁️ {snippet.views_count}</span>
        <span className="text-sm text-slate-500">❤️ {snippet.likes_count}</span>
      </div>

      <Card className="mb-6 overflow-hidden">
        <SyntaxHighlighter
          language={snippet.language.toLowerCase()}
          style={atomOneDark}
          showLineNumbers
          customStyle={{ fontSize: '13px', padding: '16px', margin: 0, borderRadius: 0 }}
        >
          {snippet.code}
        </SyntaxHighlighter>
      </Card>

      <div className="flex gap-3 mb-8">
        {user && (
          <Button variant="outline" onClick={async () => {
            try {
              const res = await API.post(`/snippets/${snippet.id}/like`);
              toast(res.data.liked ? 'Liked!' : 'Unliked', 'info');
              setSnippet(prev => ({ ...prev, likes_count: prev.likes_count + (res.data.liked ? 1 : -1) }));
            } catch (err) {
              toast('Action failed', 'error');
            }
          }}>
            ❤️ Like
          </Button>
        )}
      </div>

      <EditHistory entityType="snippet" entityId={snippet.id} />
    </div>
  );
}
