
import React from 'react';
import Layout from '@/components/Layout';
import { withAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';

const Lessons = () => {
  return (
    <Layout>
      <motion.div 
        className="space-y-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <h1 className="text-3xl font-bold tracking-tight text-white">Lessons</h1>
          <p className="text-gray-400 mt-2">Educational content and trading insights</p>
        </motion.header>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6, type: "spring", stiffness: 300 }}
          className="glass-card rounded-xl p-8 text-center"
          whileHover={{ scale: 1.02 }}
        >
          <h2 className="text-2xl font-bold text-white mb-4">Coming Soon</h2>
          <p className="text-gray-400">
            Our educational content is currently being developed. Check back later for lessons and tutorials.
          </p>
        </motion.div>
      </motion.div>
    </Layout>
  );
};

export default withAuth(Lessons);
