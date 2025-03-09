
import React from 'react';
import Layout from '@/components/Layout';
import { withAdmin } from '@/hooks/useAuth';
import AdminUserManagement from '@/components/AdminUserManagement';
import { Button } from '@/components/ui/button';
import { School } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Admin = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="glass-card rounded-xl p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
              <p className="text-gray-400 mt-1">Manage users and view student statistics</p>
            </div>
            <Button 
              className="premium-button flex items-center gap-2" 
              onClick={() => navigate('/admin/dashboard')}
            >
              <School className="h-5 w-5" />
              View Students Dashboard
            </Button>
          </div>
        </div>
        
        <AdminUserManagement />
      </div>
    </Layout>
  );
};

export default withAdmin(Admin);
