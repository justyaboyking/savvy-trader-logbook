
import React from 'react';
import Layout from '@/components/Layout';
import { withAdmin } from '@/hooks/useAuth';
import AdminUserManagement from '@/components/AdminUserManagement';
import { motion } from 'framer-motion';

const Admin = () => {
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
          <h1 className="text-3xl font-bold tracking-tight text-white">Admin Panel</h1>
          <p className="text-gray-400 mt-2">Manage users and system settings</p>
        </motion.header>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <AdminUserManagement />
        </motion.div>
      </motion.div>
    </Layout>
  );
};

export default withAdmin(Admin);
