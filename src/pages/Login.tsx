
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
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast.error('Please enter both username and password');
      return;
    }

    if (isSignUp && !email) {
      toast.error('Please enter your email address');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (isSignUp) {
        // Handle sign up with actual email instead of generated one
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username,
              role: 'student',
            }
          }
        });
        
        if (error) throw error;
        
        toast.success('Account created successfully! You can now log in.');
        setIsSignUp(false);
        
        // Clear form fields after successful signup
        setUsername('');
        setPassword('');
        setEmail('');
      } else {
        // Handle login - either with username@kingsbase.com or with actual email
        const loginEmail = email || `${username}@kingsbase.com`;
        await signIn(loginEmail, password);
        // Navigation is handled in the AuthContext after successful login
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      toast.error(`${isSignUp ? 'Signup' : 'Login'} failed: ${error.message || 'Invalid credentials'}`);
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
            <p className="text-gray-400">
              {isSignUp 
                ? 'Create an account to start trading' 
                : 'Log in to access your trading dashboard'}
            </p>
          </div>
          
          <div className="glass-card rounded-xl p-8">
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
                  disabled={isSubmitting || loading}
                />
              </div>
              
              {isSignUp && (
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="premium-input w-full"
                    placeholder="Enter your email address"
                    required
                    disabled={isSubmitting || loading}
                  />
                </div>
              )}
              
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
                {isSubmitting || loading 
                  ? (isSignUp ? 'Creating Account...' : 'Logging in...') 
                  : (isSignUp ? 'Create Account' : 'Log In')}
              </button>
              
              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {isSignUp 
                    ? 'Already have an account? Log in' 
                    : "Don't have an account? Sign up"}
                </button>
              </div>
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
