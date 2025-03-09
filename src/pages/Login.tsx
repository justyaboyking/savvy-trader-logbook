
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
      // Success toast will be handled in the signIn function
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error('Login failed: ' + (error.message || 'Please check your credentials'));
    } finally {
      setLoading(false);
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-kings-black to-kings-dark p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-md w-full mx-auto"
      >
        <motion.div 
          className="text-center mb-10"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-kings-red text-4xl font-bold tracking-tight mb-2 drop-shadow-lg">KINGS DATA BASE</h1>
          <p className="text-gray-100">Trading Journal & Analytics</p>
        </motion.div>
        
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="bg-kings-gray/90 backdrop-blur-xl rounded-xl p-8 shadow-2xl border border-white/10"
        >
          <motion.h2 variants={item} className="text-2xl font-semibold text-white mb-6">Sign In</motion.h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div variants={item}>
              <label htmlFor="username" className="block text-sm font-medium text-gray-200 mb-2">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-kings-lightgray text-white premium-input w-full"
                placeholder="Enter your username"
                required
              />
            </motion.div>
            
            <motion.div variants={item}>
              <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-kings-lightgray text-white premium-input w-full"
                placeholder="Enter your password"
                required
              />
            </motion.div>
            
            <motion.div variants={item} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <button
                type="submit"
                disabled={loading}
                className="premium-button w-full"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </motion.div>
          </form>
          
          <motion.div variants={item} className="mt-6 text-center">
            <p className="text-gray-200 text-sm">
              Custom account creation by admin only
            </p>
          </motion.div>

          <motion.div variants={item} className="mt-4 text-center">
            <p className="text-gray-200 text-xs">
              Demo Accounts: <br />
              Student: ghaith/justustestingoutshitforfunyk <br />
              Admin: king/king
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;
