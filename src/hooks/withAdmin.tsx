
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

// Admin route component
export const withAdmin = (Component: React.ComponentType) => {
  return () => {
    const { isAdmin, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
      if (!loading && !isAdmin) {
        navigate('/dashboard');
      }
    }, [loading, isAdmin, navigate]);

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-kings-black">
          <div className="animate-pulse-slow text-white text-xl">Loading...</div>
        </div>
      );
    }

    return isAdmin ? <Component /> : null;
  };
};
