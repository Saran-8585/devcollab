import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Avatar from './ui/avatar';
import Dropdown from './ui/dropdown';

const navLinks = [
  { path: '/', label: 'Explore', icon: '🔍' },
  { path: '/snippets', label: 'Snippets', icon: '📝' },
  { path: '/discussions', label: 'Discussions', icon: '💬' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const userItems = [
    { label: 'Dashboard', onClick: () => navigate('/dashboard'), icon: '📊' },
    { label: 'My Snippets', onClick: () => navigate('/snippets'), icon: '📝' },
    ...(user?.role === 'admin' ? [{ label: 'Admin Panel', onClick: () => navigate('/admin'), icon: '⚙️' }] : []),
    { separator: true },
    { label: 'Sign Out', onClick: () => { logout(); navigate('/'); }, icon: '🚪' },
  ];

  const guestItems = [
    { label: 'Sign In', onClick: () => navigate('/login') },
    { label: 'Register', onClick: () => navigate('/register') },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-slate-950/95 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5">
              <path d="M16 18l6-6-6-6" /><path d="M8 6l-6 6 6 6" />
            </svg>
            DevCollab
          </Link>
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => {
              const isActive = link.path === '/' ? location.pathname === '/' : location.pathname.startsWith(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                to="/snippets/new"
                className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90"
              >
                + New Snippet
              </Link>
              <Dropdown
                trigger={
                  <button className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-800">
                    <Avatar name={user.name} size="sm" />
                  </button>
                }
                items={userItems}
              />
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="px-3 py-1.5 text-sm text-slate-400 hover:text-white">Sign In</Link>
              <Link to="/register" className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm font-medium">Register</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
