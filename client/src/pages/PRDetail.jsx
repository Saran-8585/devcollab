import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import Badge from '../components/ui/badge';
import Button from '../components/ui/button';
import Input from '../components/ui/input';
import Textarea from '../components/ui/textarea';
import Separator from '../components/ui/separator';
import Skeleton from '../components/ui/skeleton';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/toast';
import { formatDate, statusColors, timeAgo } from '../utils/constants';
import ReactMarkdown from 'react-markdown';
import EditHistory from '../components/EditHistory';

export default function PRDetail() {
  const { id } = useParams();
  const { user, API } = useAuth();
  const toast = useToast();
  const [pr, setPr] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [reviewStatus, setReviewStatus] = useState('pending');
  const [lineRef, setLineRef] = useState('');

  const fetchPR = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/prs/${id}`);
      setPr(res.data);
    } catch (err) {
      toast('Failed to load PR', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPR(); }, [id]);

  const addComment = async () => {
    if (!comment.trim()) return;
    try {
      await API.post(`/prs/${id}/comments`, {
        content: comment,
        line_reference: lineRef || null,
        review_status: reviewStatus,
      });
      toast('Comment added!', 'success');
      setComment('');
      setLineRef('');
      fetchPR();
    } catch (err) {
      toast('Failed to add comment', 'error');
    }
  };

  const mergePR = async () => {
    try {
      await API.patch(`/prs/${id}/status`, { status: 'merged' });
      toast('PR merged!', 'success');
      fetchPR();
    } catch (err) {
      toast('Failed to merge', 'error');
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-4">
        <Skeleton className="h-8 w-96" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!pr) return <div className="p-8 text-center text-slate-400">PR not found</div>;

  const { pullRequest, comments } = pr;

  const diffLines = (pullRequest.code_diff || '').split('\n');
  const oldLines = [];
  const newLines = [];

  diffLines.forEach(line => {
    if (line.startsWith('-')) {
      oldLines.push({ text: line.slice(1), type: 'removed' });
      newLines.push({ text: '', type: 'empty' });
    } else if (line.startsWith('+')) {
      oldLines.push({ text: '', type: 'empty' });
      newLines.push({ text: line.slice(1), type: 'added' });
    } else {
      const content = line.startsWith(' ') ? line.slice(1) : line;
      oldLines.push({ text: content, type: 'normal' });
      newLines.push({ text: content, type: 'normal' });
    }
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className={`w-3 h-3 rounded-full ${statusColors[pullRequest.status]}`} />
            <h1 className="text-2xl font-bold">{pullRequest.title}</h1>
            <Badge variant={pullRequest.status === 'open' ? 'success' : pullRequest.status === 'merged' ? 'secondary' : 'destructive'}>
              {pullRequest.status}
            </Badge>
          </div>
          <p className="text-sm text-slate-400">
            {pullRequest.author_username} opened · {formatDate(pullRequest.created_at)} · {pullRequest.from_branch} → {pullRequest.to_branch}
          </p>
        </div>
        <div className="flex gap-2">
          {pr.pullRequest.status === 'open' && (
            <Button variant="success" onClick={mergePR}>Merge PR</Button>
          )}
        </div>
      </div>

      {/* Description */}
      {pullRequest.description && (
        <Card className="mb-6">
          <CardContent className="p-4 prose prose-invert prose-sm max-w-none">
            <ReactMarkdown>{pullRequest.description}</ReactMarkdown>
          </CardContent>
        </Card>
      )}

      {/* Diff Viewer */}
      <Card className="mb-6 overflow-hidden">
        <CardHeader className="border-b border-border py-2 px-4">
          <CardTitle className="text-sm">Code Changes</CardTitle>
        </CardHeader>
        <div className="flex">
          <div className="w-1/2 border-r border-border">
            <div className="bg-slate-800 text-xs text-slate-400 px-4 py-1 border-b border-border">Old</div>
            <div className="font-mono text-xs">
              {oldLines.map((line, i) => (
                <div key={i} className={`flex ${line.type === 'removed' ? 'bg-red-950/50 text-red-300' : line.type === 'empty' ? 'bg-slate-900/30' : ''}`}>
                  <span className="w-10 text-right pr-2 text-slate-600 select-none border-r border-border py-0.5">{i + 1}</span>
                  <span className="flex-1 py-0.5 px-2 whitespace-pre">{line.text}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="w-1/2">
            <div className="bg-slate-800 text-xs text-slate-400 px-4 py-1 border-b border-border">New</div>
            <div className="font-mono text-xs">
              {newLines.map((line, i) => (
                <div key={i} className={`flex ${line.type === 'added' ? 'bg-green-950/50 text-green-300' : line.type === 'empty' ? 'bg-slate-900/30' : ''}`}>
                  <span className="w-10 text-right pr-2 text-slate-600 select-none border-r border-border py-0.5">{i + 1}</span>
                  <span className="flex-1 py-0.5 px-2 whitespace-pre">{line.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Human Reviews */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Reviews ({comments?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 mb-4">
            {comments?.map(c => (
              <div key={c.id} className="p-3 rounded-lg bg-slate-800/50 border border-border">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium">{c.author_name}</span>
                  <Badge variant={c.review_status === 'approved' ? 'success' : c.review_status === 'changes_requested' ? 'destructive' : 'secondary'} className="text-xs">
                    {c.review_status}
                  </Badge>
                  {c.line_reference && <span className="text-xs text-slate-500">Line {c.line_reference}</span>}
                </div>
                <p className="text-sm text-slate-300">{c.content}</p>
                <p className="text-xs text-slate-500 mt-1">{timeAgo(c.created_at)}</p>
              </div>
            ))}
            {(!comments || comments.length === 0) && (
              <p className="text-sm text-slate-500">No reviews yet</p>
            )}
          </div>

          {user && pr.pullRequest.status === 'open' && (
            <div className="space-y-3">
              <Separator />
              <h4 className="text-sm font-medium">Add Review</h4>
              <div className="flex gap-3">
                <Input value={lineRef} onChange={e => setLineRef(e.target.value)} placeholder="Line reference (optional)" className="w-40" />
                <Select value={reviewStatus} onChange={e => setReviewStatus(e.target.value)}
                  options={[
                    { value: 'pending', label: 'Pending' },
                    { value: 'approved', label: 'Approve' },
                    { value: 'changes_requested', label: 'Request Changes' },
                  ]}
                  className="w-40" />
              </div>
              <Textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Write your review..." />
              <Button onClick={addComment}>Submit Review</Button>
            </div>
          )}
        </CardContent>
      </Card>

      <EditHistory entityType="pull_request" entityId={pullRequest.id} />
    </div>
  );
}

function Select({ className, options, value, onChange, ...props }) {
  return (
    <select className={`flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ${className}`} value={value} onChange={onChange} {...props}>
      {(options || []).map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
}
