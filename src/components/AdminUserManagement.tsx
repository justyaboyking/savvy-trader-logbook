
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { User } from '@/types';
import { Pencil, Trash2, UserPlus } from 'lucide-react';

const AdminUserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    role: 'student' as 'admin' | 'student',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data as User[]);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewUser({ ...newUser, [name]: value });
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);

      // Email is generated from username
      const email = `${newUser.username}@kingsbase.com`;

      // Create the user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password: newUser.password,
        email_confirm: true,
        user_metadata: {
          username: newUser.username,
          role: newUser.role
        }
      });

      if (authError) throw authError;

      toast.success('User created successfully');
      setShowAddModal(false);
      setNewUser({
        username: '',
        password: '',
        role: 'student',
      });
      fetchUsers();
    } catch (error: any) {
      console.error('Error creating user:', error);
      
      // Special handling for the service_role issue
      if (error.message?.includes('service_role')) {
        toast.error('Admin API requires service role. Please use the Supabase dashboard to create users directly.');
      } else {
        toast.error(`Failed to create user: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      
      // Delete user from auth
      const { error: authError } = await supabase.auth.admin.deleteUser(userId);
      if (authError) {
        console.error('Error deleting auth user:', authError);
        toast.error(`Failed to delete user: ${authError.message}`);
        return;
      }
      
      // The user record in 'users' table should be automatically deleted due to the ON DELETE CASCADE
      
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast.error(`Failed to delete user: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">User Management</h2>
        <button
          className="premium-button flex items-center space-x-2"
          onClick={() => setShowAddModal(true)}
        >
          <UserPlus size={18} />
          <span>Add User</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="glass-card rounded-xl p-4 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-kings-gray/30">
              <th className="text-left py-3 px-4 text-gray-400 font-medium">Username</th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium">Email</th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium">Role</th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium">Created</th>
              <th className="text-right py-3 px-4 text-gray-400 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-400">
                  Loading users...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-400">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="border-b border-kings-gray/10 hover:bg-kings-gray/10">
                  <td className="py-3 px-4 text-white">{user.username}</td>
                  <td className="py-3 px-4 text-white">{user.email}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-block px-2 py-1 rounded text-xs ${
                      user.role === 'admin' ? 'bg-kings-red/20 text-kings-red' : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-400">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end space-x-2">
                      <button 
                        className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-kings-gray/30"
                        title="Edit user"
                      >
                        <Pencil size={16} />
                      </button>
                      <button 
                        className="p-2 text-gray-400 hover:text-kings-red rounded-full hover:bg-kings-gray/30"
                        title="Delete user"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="glass-card rounded-xl p-6 max-w-lg w-full animate-fade-in">
            <h3 className="text-xl font-semibold text-white mb-6">Add New User</h3>
            
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={newUser.username}
                  onChange={handleInputChange}
                  className="premium-input w-full"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">
                  Email will be automatically set to username@kingsbase.com
                </p>
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={newUser.password}
                  onChange={handleInputChange}
                  className="premium-input w-full"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-300 mb-2">
                  Role
                </label>
                <select
                  id="role"
                  name="role"
                  value={newUser.role}
                  onChange={handleInputChange}
                  className="premium-select w-full"
                  required
                >
                  <option value="student">Student</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="premium-button-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="premium-button"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserManagement;
