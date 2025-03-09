
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, BarChart } from 'lucide-react';

const AdminSidebar = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };
  
  return (
    <div className="bg-kings-dark border-r border-kings-gray h-full p-4 space-y-6">
      <div className="text-gray-400 text-xs uppercase font-medium px-2">Admin Tools</div>
      
      <nav className="space-y-1">
        <Link 
          to="/admin/dashboard" 
          className={`flex items-center px-2 py-2 rounded-md transition-colors ${
            isActive('/admin/dashboard') 
              ? 'bg-kings-red/20 text-kings-red' 
              : 'text-gray-300 hover:bg-kings-gray/20 hover:text-white'
          }`}
        >
          <LayoutDashboard className="h-5 w-5 mr-3" />
          Student Dashboard
        </Link>
        
        <Link 
          to="/admin" 
          className={`flex items-center px-2 py-2 rounded-md transition-colors ${
            location.pathname === '/admin' 
              ? 'bg-kings-red/20 text-kings-red' 
              : 'text-gray-300 hover:bg-kings-gray/20 hover:text-white'
          }`}
        >
          <Users className="h-5 w-5 mr-3" />
          User Management
        </Link>
        
        <Link 
          to="/stats" 
          className={`flex items-center px-2 py-2 rounded-md transition-colors ${
            location.pathname === '/stats' 
              ? 'bg-kings-red/20 text-kings-red' 
              : 'text-gray-300 hover:bg-kings-gray/20 hover:text-white'
          }`}
        >
          <BarChart className="h-5 w-5 mr-3" />
          My Stats
        </Link>
      </nav>
    </div>
  );
};

export default AdminSidebar;
