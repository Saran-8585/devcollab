import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { ToastProvider } from './components/ui/toast';
import Login from './pages/Login';
import Register from './pages/Register';
import Explore from './pages/Explore';
import Profile from './pages/Profile';
import ProjectDetail from './pages/ProjectDetail';
import SnippetFeed from './pages/SnippetFeed';
import SnippetDetail from './pages/SnippetDetail';
import SnippetNew from './pages/SnippetNew';
import PRDetail from './pages/PRDetail';
import PRNew from './pages/PRNew';
import AIAssistant from './pages/AIAssistant';
import Dashboard from './pages/Dashboard';
import Discussions from './pages/Discussions';
import AdminDashboard from './pages/AdminDashboard';

export default function App() {
  return (
    <ToastProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<Layout />}>
          <Route path="/" element={<Explore />} />
          <Route path="/u/:username" element={<Profile />} />
          <Route path="/projects/:id" element={<ProtectedRoute><ProjectDetail /></ProtectedRoute>} />
          <Route path="/snippets" element={<SnippetFeed />} />
          <Route path="/snippets/:id" element={<SnippetDetail />} />
          <Route path="/snippets/new" element={<ProtectedRoute><SnippetNew /></ProtectedRoute>} />
          <Route path="/pr/:id" element={<ProtectedRoute><PRDetail /></ProtectedRoute>} />
          <Route path="/pr/new" element={<ProtectedRoute><PRNew /></ProtectedRoute>} />
          <Route path="/ai-assistant" element={<ProtectedRoute><AIAssistant /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/discussions" element={<Discussions />} />
          <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        </Route>
      </Routes>
    </ToastProvider>
  );
}
