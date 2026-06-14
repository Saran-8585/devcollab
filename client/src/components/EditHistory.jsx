import { useState, useEffect } from 'react';
import Avatar from './ui/avatar';
import Separator from './ui/separator';
import { useAuth } from '../context/AuthContext';
import { timeAgo } from '../utils/constants';

export default function EditHistory({ entityType, entityId }) {
  const { user, API } = useAuth();
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    API.get(`/activity/${entityType}/${entityId}`)
      .then(res => setEntries(res.data.entries))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open, entityType, entityId]);

  const actionLabel = (action) => {
    const labels = {
      create: 'Created', update: 'Updated', delete: 'Deleted',
      like: 'Liked', comment: 'Reviewed', collaborate: 'Added collaborator',
      reply: 'Replied', follow: 'Followed', unfollow: 'Unfollowed',
      login: 'Logged in', register: 'Joined',
      ai_review: 'AI reviewed', ai_explain: 'AI explained',
      ai_fix: 'AI fixed', ai_generate: 'AI generated',
    };
    return labels[action] || action;
  };

  return (
    <div className="mt-6">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
      >
        <span className="text-slate-600">{open ? '▾' : '▸'}</span>
        Activity History
        {!open && entries.length > 0 && <span className="text-slate-600">({entries.length})</span>}
      </button>

      {open && (
        <div className="mt-2 space-y-1 pl-3 border-l border-border">
          {loading && <p className="text-xs text-slate-500 py-1">Loading...</p>}

          {!loading && entries.length === 0 && (
            <p className="text-xs text-slate-500 py-1">No activity recorded yet</p>
          )}

          {!loading && entries.map((entry, i) => {
            const isYou = user?.id === entry.user_id;
            return (
              <div key={entry.id}>
                <div className="flex items-start gap-2 py-1.5">
                  <Avatar name={entry.user_name} size="sm" className="mt-0.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-medium text-slate-300">{entry.user_name}</span>
                      {isYou && <span className="text-[10px] text-primary font-medium">(you)</span>}
                      <span className="text-xs text-slate-500">{actionLabel(entry.action_type)}</span>
                    </div>
                    {entry.description && (
                      <p className="text-xs text-slate-400 truncate">{entry.description}</p>
                    )}
                    <p className="text-[10px] text-slate-600 mt-0.5">{timeAgo(entry.created_at)}</p>
                  </div>
                </div>
                {i < entries.length - 1 && <Separator className="my-0.5" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
