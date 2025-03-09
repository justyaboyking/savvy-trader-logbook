
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import AdminSidebar from './AdminSidebar';
import { Menu, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      // Navigation is handled in the signOut function
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="flex h-screen bg-kings-black overflow-hidden">
      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:relative md:translate-x-0 z-30 transition duration-300 ease-in-out`}
      >
        {user && user.role === 'admin' ? (
          <AdminSidebar />
        ) : (
          <Sidebar onCloseSidebar={() => setSidebarOpen(false)} />
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-kings-dark border-b border-kings-gray/30 backdrop-blur-sm flex items-center justify-between px-4 sm:px-6 py-4">
          <div className="flex items-center space-x-4">
            <button 
              onClick={toggleSidebar} 
              className="text-white md:hidden focus:outline-none"
              aria-label="Toggle menu"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <h1 className="text-white text-xl sm:text-2xl font-semibold tracking-tight">Kings Data Base</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {user && (
              <>
                <span className="text-white/70 text-sm hidden md:inline-block">
                  {user.email?.split('@')[0]}
                </span>
                <button 
                  onClick={handleLogout}
                  className="text-white/80 hover:text-kings-red text-sm transition-colors duration-200"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-kings-black p-4 sm:p-6">
          <div className="animate-fade-in max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
