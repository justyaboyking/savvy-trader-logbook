
import React from 'react';
import Layout from '@/components/Layout';
import { withAuth } from '@/hooks/useAuth';

const Lessons = () => {
  return (
    <Layout>
      <div className="space-y-8">
        <header>
          <h1 className="text-3xl font-bold tracking-tight text-white">Lessons</h1>
          <p className="text-gray-400 mt-2">Educational content and trading insights</p>
        </header>

        <div className="glass-card rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Coming Soon</h2>
          <p className="text-gray-400">
            Our educational content is currently being developed. Check back later for lessons and tutorials.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default withAuth(Lessons);
