
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';

const Login = () => {
  const navigate = useNavigate();
  const { signIn, loading } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast.error('Please enter both username and password');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await signIn(username, password);
      // Navigation is handled in the AuthContext after successful login
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(`Login failed: ${error.message || 'Invalid login credentials'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-black min-h-screen flex flex-col">
      <div className="dark-bg-gradient absolute inset-0 z-0"></div>
      
      <div className="flex-1 flex flex-col md:flex-row items-center justify-center px-4 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">KingsBase</h1>
            <p className="text-gray-400">Log in to access your trading dashboard</p>
          </div>
          
          <div className="glass-card rounded-xl p-8">
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="premium-input w-full"
                  placeholder="Enter your username"
                  required
                  disabled={isSubmitting || loading}
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="premium-input w-full"
                  placeholder="Enter your password"
                  required
                  disabled={isSubmitting || loading}
                />
              </div>
              
              <button
                type="submit"
                className="premium-button w-full"
                disabled={isSubmitting || loading}
              >
                {isSubmitting || loading ? 'Logging in...' : 'Log In'}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
      
      <div className="p-8 text-center text-gray-600 relative z-10">
        <p>&copy; {new Date().getFullYear()} KingsBase. All rights reserved.</p>
      </div>
    </div>
  );
};

export default Login;
