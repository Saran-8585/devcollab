import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function useApi(url, options = {}) {
  const { API } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await API.get(url, { params: options.params });
      setData(res.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (url) fetch(); }, [url]);

  return { data, loading, error, refetch: fetch };
}
