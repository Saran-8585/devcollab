import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import Input from '../components/ui/input';
import Textarea from '../components/ui/textarea';
import Select from '../components/ui/select';
import Button from '../components/ui/button';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/toast';
import { LANGUAGES } from '../utils/constants';

export default function SnippetNew() {
  const { API } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState({
    title: '', description: '', language: 'JavaScript',
    code_content: '', tags: '', visibility: 'public', project_id: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    API.get('/projects').then(res => setProjects(res.data.projects)).catch(() => {});
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.code_content) {
      toast('Title and code are required', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const res = await API.post('/snippets', {
        ...form,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        project_id: form.project_id || null,
      });
      toast('Snippet posted!', 'success');
      navigate(`/snippets/${res.data.id}`);
    } catch (err) {
      toast(err.response?.data?.error || 'Failed to create snippet', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">New Snippet</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <Input name="title" value={form.title} onChange={handleChange} placeholder="Snippet title" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Language</label>
            <Select name="language" value={form.language} onChange={handleChange} options={LANGUAGES} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <Input name="description" value={form.description} onChange={handleChange} placeholder="Brief description" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Code <span className="text-red-400">*</span>
          </label>
          <textarea
            name="code_content"
            value={form.code_content}
            onChange={handleChange}
            className="w-full h-64 rounded-md border border-input bg-slate-950 p-4 font-mono text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary resize-y"
            placeholder="Paste your code here..."
            required
            spellCheck={false}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tags (comma separated)</label>
            <Input name="tags" value={form.tags} onChange={handleChange} placeholder="api, auth, utility" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Visibility</label>
            <Select name="visibility" value={form.visibility} onChange={handleChange}
              options={[{ value: 'public', label: 'Public' }, { value: 'private', label: 'Private' }]} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Link to Project (optional)</label>
            <Select name="project_id" value={form.project_id} onChange={handleChange}
              options={[{ value: '', label: 'None' }, ...projects.map(p => ({ value: p.id, label: p.name }))]} />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Posting...' : 'Post Snippet'}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}
