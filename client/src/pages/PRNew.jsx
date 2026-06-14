import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import Input from '../components/ui/input';
import Textarea from '../components/ui/textarea';
import Select from '../components/ui/select';
import Button from '../components/ui/button';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/toast';

export default function PRNew() {
  const { API } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState({
    project_id: searchParams.get('project') || '',
    title: '', description: '', from_branch: 'feature', to_branch: 'main', code_diff: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    API.get('/projects').then(res => setProjects(res.data.projects)).catch(() => {});
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.project_id) {
      toast('Title and project are required', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const res = await API.post('/prs', form);
      toast('Pull request opened!', 'success');
      navigate(`/pr/${res.data.id}`);
    } catch (err) {
      toast('Failed to create PR', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">New Pull Request</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Project</label>
          <Select name="project_id" value={form.project_id} onChange={handleChange}
            options={[{ value: '', label: 'Select a project...' }, ...projects.map(p => ({ value: p.id, label: p.name }))]}
            required />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <Input name="title" value={form.title} onChange={handleChange} placeholder="A descriptive title" required />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description (markdown)</label>
          <Textarea name="description" value={form.description} onChange={handleChange} placeholder="Describe your changes..." className="min-h-[120px]" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">From Branch</label>
            <Input name="from_branch" value={form.from_branch} onChange={handleChange} placeholder="feature/my-feature" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">To Branch</label>
            <Input name="to_branch" value={form.to_branch} onChange={handleChange} placeholder="main" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Code Diff</label>
          <textarea
            name="code_diff"
            value={form.code_diff}
            onChange={handleChange}
            className="w-full h-48 rounded-md border border-input bg-slate-950 p-4 font-mono text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary resize-y"
            placeholder={`Paste your code diff here...\n\nExample:\n-function oldFunction() {\n+function newFunction() {\n   return true;\n }`}
            spellCheck={false}
          />
        </div>

        <div className="flex gap-3">
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Pull Request'}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}
