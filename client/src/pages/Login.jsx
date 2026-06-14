import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/toast';
import Button from '../components/ui/button';
import Input from '../components/ui/input';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast('Welcome back!', 'success');
      navigate('/');
    } catch (err) {
      toast(err.response?.data?.error || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fillCreds = (e, pw) => {
    setEmail(e);
    setPassword(pw);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <svg className="inline-block" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
            <path d="M16 18l6-6-6-6" /><path d="M8 6l-6 6 6 6" />
          </svg>
          <h1 className="text-2xl font-bold mt-2">DevCollab</h1>
          <p className="text-slate-400 text-sm">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-6 p-4 rounded-lg bg-slate-800/50 border border-slate-700">
          <p className="text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">Seed Credentials</p>
          <div className="space-y-1.5">
            {[
              ['Admin', 'admin@devcollab.com', 'admin123'],
              ['Dev 1', 'dev1@devcollab.com', 'dev123'],
              ['Dev 2', 'dev2@devcollab.com', 'dev123'],
            ].map(([label, e, pw]) => (
              <button
                key={label}
                onClick={() => fillCreds(e, pw)}
                className="w-full text-left px-3 py-1.5 rounded text-sm bg-slate-700/50 hover:bg-slate-700 transition-colors"
              >
                <span className="text-slate-400">{label}:</span>{' '}
                <span className="text-slate-200">{e}</span>
                <span className="text-slate-500"> / {pw}</span>
              </button>
            ))}
          </div>
        </div>

        <p className="text-center text-sm text-slate-400 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary hover:underline">Register</Link>
        </p>
      </div>
    </div>
  );
}
