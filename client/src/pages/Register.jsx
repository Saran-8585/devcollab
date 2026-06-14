import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/toast';
import Button from '../components/ui/button';
import Input from '../components/ui/input';
import Select from '../components/ui/select';
import { LANGUAGES } from '../utils/constants';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', username: '', bio: '', primary_language: 'JavaScript', skills: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register({
        ...form,
        skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
      });
      toast('Account created!', 'success');
      navigate('/');
    } catch (err) {
      toast(err.response?.data?.error || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Join DevCollab</h1>
          <p className="text-slate-400 text-sm">Create your developer account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <Input name="name" value={form.name} onChange={handleChange} placeholder="Your full name" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Username</label>
              <Input name="username" value={form.username} onChange={handleChange} placeholder="yourhandle" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <Input name="password" type="password" value={form.password} onChange={handleChange} placeholder="At least 6 characters" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Bio</label>
            <Input name="bio" value={form.bio} onChange={handleChange} placeholder="Tell us about yourself" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Primary Language</label>
              <Select name="primary_language" value={form.primary_language} onChange={handleChange} options={LANGUAGES} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Skills (comma separated)</label>
              <Input name="skills" value={form.skills} onChange={handleChange} placeholder="React, Node.js, Python" />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>

        <p className="text-center text-sm text-slate-400 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
