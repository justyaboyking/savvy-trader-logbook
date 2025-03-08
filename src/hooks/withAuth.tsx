
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

// Protected route component
export const withAuth = (Component: React.ComponentType) => {
  return () => {
    const { session, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
      if (!loading && !session) {
        navigate('/');
      }
    }, [loading, session, navigate]);

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-kings-black">
          <div className="animate-pulse-slow text-white text-xl">Loading...</div>
        </div>
      );
    }

    return session ? <Component /> : null;
  };
};
