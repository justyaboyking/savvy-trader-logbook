
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await signIn(username, password);
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error('Login failed: ' + (error.message || 'Please check your credentials'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-kings-black p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full mx-auto"
      >
        <div className="text-center mb-10">
          <h1 className="text-kings-red text-4xl font-bold tracking-tight mb-2">KINGS BASE</h1>
          <p className="text-gray-400">Trading Journal & Analytics</p>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="glass-card rounded-xl p-8 shadow-2xl backdrop-blur-xl"
        >
          <h2 className="text-2xl font-semibold text-white mb-6">Sign In</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
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
              />
            </div>
            
            <div>
              <button
                type="submit"
                disabled={loading}
                className="premium-button w-full"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </div>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Custom account creation by admin only
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;
