// src/hooks/useUserProfile.ts
import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-expo';

type UserProfile = {
  id: string;
  name: string;
  profileImageUrl: string;
  role: 'user' | 'driver';
};

export const useUserProfile = () => {
  const { userId } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserProfile = async () => {
    console.log('Fetching user profile for userId:', userId); // Log để debug
    if (!userId) {
      console.log('No userId found');
      setError('User not logged in');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3000/users/${userId}`);
      console.log('API response status:', response.status); // Log để debug
      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }
      const data = await response.json();
      console.log('Fetched user profile:', data); // Log để debug
      setProfile(data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching user profile:', err.message);
      setError(err.message);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, [userId]);

  return { profile, loading, error };
};