import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
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
  const [aiExplaining, setAiExplaining] = useState(false);
  const [aiExplanation, setAiExplanation] = useState('');
  const [copied, setCopied] = useState(false);
  const explanationRef = useRef(null);

  useEffect(() => {
    API.get(`/snippets/${id}`)
      .then(res => { setSnippet(res.data.snippet); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  const handleCopy = () => {
    navigator.clipboard.writeText(snippet.code_content);
    setCopied(true);
    toast('Copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAiExplain = async () => {
    setAiExplaining(true);
    setAiExplanation('');
    try {
      const res = await fetch('/api/ai/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ code: snippet.code_content, language: snippet.language }),
      });

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            try {
              const parsed = JSON.parse(data);
              setAiExplanation(prev => prev + parsed.text);
            } catch (e) {}
          }
        }
      }
    } catch (err) {
      toast('AI explanation failed', 'error');
    } finally {
      setAiExplaining(false);
    }
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
          {snippet.code_content}
        </SyntaxHighlighter>
      </Card>

      <div className="flex gap-3 mb-8">
        <Button onClick={handleAiExplain} disabled={aiExplaining}>
          {aiExplaining ? 'Explaining...' : '🤖 AI Explain'}
        </Button>
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

      {aiExplanation && (
        <Card className="mb-6 border-primary/30">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <span className="text-primary">🤖</span> AI Explanation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div ref={explanationRef} className="prose prose-invert prose-sm max-w-none text-slate-300 whitespace-pre-wrap">
              {aiExplanation}
            </div>
          </CardContent>
        </Card>
      )}

      {aiExplaining && !aiExplanation && (
        <Card className="mb-6 border-primary/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-slate-400">
              <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
              AI is analyzing your code...
            </div>
          </CardContent>
        </Card>
      )}

      <EditHistory entityType="snippet" entityId={snippet.id} />
    </div>
  );
}
