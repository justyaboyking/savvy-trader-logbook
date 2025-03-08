
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, BarChart2, FileInput, BookOpen, Settings, Users, Disc } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface SidebarProps {
  onCloseSidebar?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onCloseSidebar }) => {
  const { isAdmin } = useAuth();

  const links = [
    { name: 'Dashboard', path: '/dashboard', icon: <Home size={20} /> },
    { name: 'Stats', path: '/stats', icon: <BarChart2 size={20} /> },
    { name: 'Input', path: '/trade-entry', icon: <FileInput size={20} /> },
    { name: 'Lessons', path: '/lessons', icon: <BookOpen size={20} /> },
  ];

  // Admin links
  const adminLinks = [
    { name: 'Admin Panel', path: '/admin', icon: <Users size={20} /> },
    { name: 'Settings', path: '/settings', icon: <Settings size={20} /> },
  ];

  return (
    <aside className="h-full w-64 bg-kings-dark border-r border-kings-gray/30 flex flex-col">
      <div className="p-6">
        <div className="flex items-center justify-center mb-8">
          <h1 className="text-kings-red text-2xl font-bold tracking-tighter">KINGS DATA BASE</h1>
        </div>

        <nav className="space-y-1 mt-8">
          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={onCloseSidebar}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-md transition-all duration-200 ${
                  isActive
                    ? 'bg-kings-red text-white'
                    : 'text-gray-300 hover:bg-kings-gray hover:text-white'
                }`
              }
            >
              {link.icon}
              <span>{link.name}</span>
            </NavLink>
          ))}

          {isAdmin && (
            <>
              <div className="pt-4 pb-2">
                <div className="flex items-center px-4">
                  <div className="w-full border-t border-kings-gray/50"></div>
                </div>
              </div>
              
              {adminLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={onCloseSidebar}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-4 py-3 rounded-md transition-all duration-200 ${
                      isActive
                        ? 'bg-kings-red text-white'
                        : 'text-gray-300 hover:bg-kings-gray hover:text-white'
                    }`
                  }
                >
                  {link.icon}
                  <span>{link.name}</span>
                </NavLink>
              ))}
            </>
          )}

          {/* Discord Link */}
          <a 
            href="https://discord.gg/mhGDfRgtpU" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center space-x-3 px-4 py-3 rounded-md transition-all duration-200 text-gray-300 hover:bg-kings-gray hover:text-white mt-4"
            onClick={onCloseSidebar}
          >
            <Disc size={20} />
            <span>Join Discord</span>
          </a>
        </nav>
      </div>

      <div className="mt-auto p-6">
        <div className="flex items-center justify-center">
          <div className="text-xs text-gray-500">© 2025 Kings Data Base</div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
