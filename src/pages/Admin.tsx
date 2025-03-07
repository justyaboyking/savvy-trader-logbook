
import React from 'react';
import Layout from '@/components/Layout';
import { withAdmin } from '@/hooks/useAuth';
import AdminUserManagement from '@/components/AdminUserManagement';

const Admin = () => {
  return (
    <Layout>
      <div className="space-y-8">
        <header>
          <h1 className="text-3xl font-bold tracking-tight text-white">Admin Panel</h1>
          <p className="text-gray-400 mt-2">Manage users and system settings</p>
        </header>

        <AdminUserManagement />
      </div>
    </Layout>
  );
};

export default withAdmin(Admin);
