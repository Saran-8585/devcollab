import { useState, useRef, useEffect } from 'react';
import Tabs from '../components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import Button from '../components/ui/button';
import Textarea from '../components/ui/textarea';
import Select from '../components/ui/select';
import Badge from '../components/ui/badge';
import Separator from '../components/ui/separator';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/toast';
import { LANGUAGES } from '../utils/constants';

export default function AIAssistant() {
  const [activeTab, setActiveTab] = useState('Explain Code');

  const tabs = ['Explain Code', 'Fix My Bug', 'Generate Code', 'Code Review'];

  const tabContent = {
    'Explain Code': <ExplainCode />,
    'Fix My Bug': <FixBug />,
    'Generate Code': <GenerateCode />,
    'Code Review': <CodeReviewTool />,
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">AI Code Assistant</h1>
        <p className="text-sm text-slate-400 mt-1">Powered by local AI (Ollama/Gemma4)</p>
      </div>

      <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

      <div className="mt-6">
        {tabContent[activeTab]}
      </div>
    </div>
  );
}

function CodeEditor({ value, onChange, height = '200px', readOnly = false, placeholder = '' }) {
  return (
    <textarea
      value={value}
      onChange={onChange}
      readOnly={readOnly}
      placeholder={placeholder}
      className={`w-full rounded-md border border-input bg-slate-950 p-4 font-mono text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary resize-y`}
      style={{ minHeight: height, fontFamily: "'JetBrains Mono', 'Fira Code', monospace" }}
      spellCheck={false}
    />
  );
}

function ExplainCode() {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('JavaScript');
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const toast = useToast();

  const handleExplain = async () => {
    if (!code.trim()) { toast('Please enter code', 'error'); return; }
    setLoading(true);
    setExplanation('');
    try {
      const res = await fetch('/api/ai/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ code, language }),
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
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              const parsed = JSON.parse(line.slice(6));
              setExplanation(prev => prev + parsed.text);
            } catch (e) {}
          }
        }
      }
    } catch (err) {
      toast('AI explanation failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <label className="text-sm font-medium mb-1 block">Language</label>
          <Select value={language} onChange={e => setLanguage(e.target.value)} options={LANGUAGES} className="w-48" />
        </div>
        <Button onClick={handleExplain} disabled={loading}>
          {loading ? 'Explaining...' : 'Explain This Code'}
        </Button>
      </div>
      <CodeEditor value={code} onChange={e => setCode(e.target.value)} height="250px" placeholder="Paste your code here..." />
      {loading && !explanation && (
        <div className="flex items-center gap-3 text-slate-400 p-4">
          <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
          Analyzing code...
        </div>
      )}
      {explanation && (
        <Card className="border-primary/30">
          <CardHeader><CardTitle className="text-sm flex items-center gap-2"><span className="text-primary">🤖</span> AI Explanation</CardTitle></CardHeader>
          <CardContent>
            <div className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">{explanation}</div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function FixBug() {
  const { API } = useAuth();
  const [code, setCode] = useState('');
  const [bugDescription, setBugDescription] = useState('');
  const [language, setLanguage] = useState('JavaScript');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleFix = async () => {
    if (!code.trim() || !bugDescription.trim()) { toast('Please enter code and bug description', 'error'); return; }
    setLoading(true);
    try {
      const res = await API.post('/ai/fix-bug', { code, bug_description: bugDescription, language });
      setResult(res.data.result);
      toast('Bug analysis complete!', 'success');
    } catch (err) {
      toast('AI fix failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <label className="text-sm font-medium mb-1 block">Language</label>
          <Select value={language} onChange={e => setLanguage(e.target.value)} options={LANGUAGES} className="w-48" />
        </div>
        <Button onClick={handleFix} disabled={loading}>
          {loading ? 'Analyzing...' : 'Find & Fix Bug'}
        </Button>
      </div>
      <Textarea value={bugDescription} onChange={e => setBugDescription(e.target.value)} placeholder="Describe the bug..." className="min-h-[80px]" />
      <CodeEditor value={code} onChange={e => setCode(e.target.value)} height="250px" placeholder="Paste buggy code here..." />
      {result && (
        <div className="space-y-4">
          <Card className="border-red-800">
            <CardHeader><CardTitle className="text-sm text-red-400">🐛 Bug Identified</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-slate-300">{result.bug_identified}</p>
              <p className="text-sm text-slate-400 mt-2"><span className="text-slate-500">Root cause:</span> {result.root_cause}</p>
            </CardContent>
          </Card>
          <Card className="border-green-800">
            <CardHeader><CardTitle className="text-sm text-green-400">✅ Fixed Code</CardTitle></CardHeader>
            <CardContent>
              <CodeEditor value={result.fixed_code} readOnly height="250px" />
              <Button size="sm" className="mt-2" onClick={() => { navigator.clipboard.writeText(result.fixed_code); toast('Copied!', 'success'); }}>
                Copy Fixed Code
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm">Explanation</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-slate-300">{result.explanation}</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function GenerateCode() {
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('JavaScript');
  const [complexity, setComplexity] = useState('moderate');
  const [generatedCode, setGeneratedCode] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const { API } = useAuth();

  const handleGenerate = async () => {
    if (!description.trim()) { toast('Please describe what you want to build', 'error'); return; }
    setLoading(true);
    setGeneratedCode('');
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ description, language, complexity }),
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
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              const parsed = JSON.parse(line.slice(6));
              setGeneratedCode(prev => prev + parsed.text);
            } catch (e) {}
          }
        }
      }
    } catch (err) {
      toast('Code generation failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const saveAsSnippet = async () => {
    try {
      await API.post('/snippets', {
        title: `AI Generated: ${description.slice(0, 50)}`,
        description: `Generated by AI Assistant - ${language}`,
        language,
        code_content: generatedCode,
        tags: ['ai-generated'],
        visibility: 'private',
      });
      toast('Saved as snippet!', 'success');
    } catch (err) {
      toast('Failed to save', 'error');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3 items-end flex-wrap">
        <div className="w-48">
          <label className="text-sm font-medium mb-1 block">Language</label>
          <Select value={language} onChange={e => setLanguage(e.target.value)} options={LANGUAGES} />
        </div>
        <div className="w-40">
          <label className="text-sm font-medium mb-1 block">Complexity</label>
          <Select value={complexity} onChange={e => setComplexity(e.target.value)}
            options={[{ value: 'simple', label: 'Simple' }, { value: 'moderate', label: 'Moderate' }, { value: 'complex', label: 'Complex' }]} />
        </div>
        <Button onClick={handleGenerate} disabled={loading}>
          {loading ? 'Generating...' : 'Generate Code'}
        </Button>
      </div>
      <Textarea value={description} onChange={e => setDescription(e.target.value)}
        placeholder="Describe what you want to build in detail..." className="min-h-[100px]" />
      {generatedCode && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium">Generated Code</h3>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(generatedCode); toast('Copied!', 'success'); }}>
                Copy
              </Button>
              <Button size="sm" onClick={saveAsSnippet}>Save as Snippet</Button>
            </div>
          </div>
          <CodeEditor value={generatedCode} readOnly height="350px" />
        </div>
      )}
      {loading && !generatedCode && (
        <div className="flex items-center gap-3 text-slate-400 p-4">
          <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
          Generating code...
        </div>
      )}
    </div>
  );
}

function CodeReviewTool() {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('JavaScript');
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const { API } = useAuth();

  const handleReview = async () => {
    if (!code.trim()) { toast('Please enter code', 'error'); return; }
    setLoading(true);
    try {
      const res = await API.post('/ai/review-code', { code, language });
      if (res.data.success) {
        setReview(res.data.review);
        toast('Code review complete!', 'success');
      } else {
        toast('Review failed', 'error');
      }
    } catch (err) {
      toast('AI review failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <label className="text-sm font-medium mb-1 block">Language</label>
          <Select value={language} onChange={e => setLanguage(e.target.value)} options={LANGUAGES} className="w-48" />
        </div>
        <Button onClick={handleReview} disabled={loading}>
          {loading ? 'Reviewing...' : 'Review My Code'}
        </Button>
      </div>
      <CodeEditor value={code} onChange={e => setCode(e.target.value)} height="250px" placeholder="Paste your code for review..." />
      {review && renderReviewPanel(review, toast)}
      {loading && !review && (
        <div className="flex items-center gap-3 text-slate-400 p-4">
          <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
          Reviewing code...
        </div>
      )}
    </div>
  );
}

function renderReviewPanel(review, toast) {
  return (
    <Card className="border-primary/30">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <span className="text-primary">🤖</span> Code Review
          <Badge variant="secondary" className="ml-auto text-lg">{review.overall_score}/10</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-slate-300">{review.overall_assessment}</p>

        {review.issues?.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Issues ({review.issues.length})</h4>
            <div className="space-y-2">
              {review.issues.map((issue, i) => (
                <div key={i} className={`p-3 rounded-lg border text-sm ${
                  issue.severity === 'critical' ? 'border-red-800 bg-red-950/20' :
                  issue.severity === 'warning' ? 'border-amber-800 bg-amber-950/20' : 'border-blue-800 bg-blue-950/20'
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={issue.severity === 'critical' ? 'destructive' : issue.severity === 'warning' ? 'warning' : 'secondary'} className="text-xs">{issue.severity}</Badge>
                    {issue.line_reference && <span className="text-xs text-slate-500">Line {issue.line_reference}</span>}
                  </div>
                  <p className="text-slate-300">{issue.description}</p>
                  {issue.fix_suggestion && <p className="text-xs text-primary mt-1">Fix: {issue.fix_suggestion}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {review.strengths?.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2 text-green-400">✅ Strengths</h4>
            <ul className="space-y-1">{review.strengths.map((s, i) => <li key={i} className="text-sm text-slate-300">• {s}</li>)}</ul>
          </div>
        )}

        {review.security_concerns?.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2 text-red-400">🛡️ Security Concerns</h4>
            <ul className="space-y-1">{review.security_concerns.map((s, i) => <li key={i} className="text-sm text-slate-300">• {s}</li>)}</ul>
          </div>
        )}

        {review.performance_notes?.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2 text-amber-400">⚡ Performance Notes</h4>
            <ul className="space-y-1">{review.performance_notes.map((s, i) => <li key={i} className="text-sm text-slate-300">• {s}</li>)}</ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
