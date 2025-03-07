
import { createClient } from '@supabase/supabase-js';
import { toast } from "sonner";

// Types for our database
export type User = {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'student';
  created_at: string;
};

export type Trade = {
  id: string;
  user_id: string;
  trade_date: string;
  market: 'futures' | 'forex' | 'crypto';
  symbol: string;
  type: 'buy' | 'sell';
  entry_price: number;
  stop_loss: number;
  take_profit: number;
  risk_reward: number;
  outcome: 'win' | 'loss' | 'pending';
  notes: string;
  created_at: string;
};

// Initialize Supabase client
const supabaseUrl = 'https://your-project-url.supabase.co';
const supabaseAnonKey = 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth functions
export const signIn = async (username: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: `${username}@kingsbase.com`, // Using email format for auth
      password,
    });

    if (error) {
      toast.error('Login failed: ' + error.message);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error('Logout failed: ' + error.message);
      throw error;
    }
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

// User functions for admin
export const createUser = async (username: string, email: string, password: string, role: 'admin' | 'student') => {
  try {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) {
      toast.error('User creation failed: ' + authError.message);
      throw authError;
    }

    // Create user profile
    const { data: profileData, error: profileError } = await supabase
      .from('users')
      .insert([{ 
        id: authData.user.id, 
        username, 
        email, 
        role 
      }]);

    if (profileError) {
      toast.error('User profile creation failed: ' + profileError.message);
      throw profileError;
    }

    toast.success('User created successfully');
    return { authData, profileData };
  } catch (error) {
    console.error('Create user error:', error);
    throw error;
  }
};

// Trade functions
export const createTrade = async (trade: Omit<Trade, 'id' | 'created_at'>) => {
  try {
    const { data, error } = await supabase
      .from('trades')
      .insert([trade])
      .select();

    if (error) {
      toast.error('Failed to create trade: ' + error.message);
      throw error;
    }

    toast.success('Trade saved successfully');
    return data[0];
  } catch (error) {
    console.error('Create trade error:', error);
    throw error;
  }
};

export const getUserTrades = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', userId)
      .order('trade_date', { ascending: false });

    if (error) {
      toast.error('Failed to fetch trades: ' + error.message);
      throw error;
    }

    return data as Trade[];
  } catch (error) {
    console.error('Get trades error:', error);
    throw error;
  }
};

// Helper function to check if user is admin
export const isUserAdmin = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data.role === 'admin';
  } catch (error) {
    console.error('Admin check error:', error);
    return false;
  }
};
