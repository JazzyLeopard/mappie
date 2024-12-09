import { useEffect, useState } from 'react';

export function useUserCount() {
  const [userCount, setUserCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserCount() {
      try {
        const response = await fetch('/api/user-count');
        const data = await response.json();
        setUserCount(data.count);
      } catch (error) {
        console.error('Error fetching user count:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchUserCount();
  }, []);

  return { userCount, loading };
} 