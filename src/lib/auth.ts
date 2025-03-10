
import { supabase } from './supabase';
import { toast } from 'sonner';
import { UserRole } from '@/types';

// Register a new user
export const registerUser = async (
  username: string,
  password: string,
  role: UserRole = 'student'
) => {
  try {
    const email = `${username}@kingsbase.com`;
    
    // Create the user in Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          role
        }
      }
    });
    
    if (error) throw error;
    
    toast.success('User registered successfully');
    return data.user;
  } catch (error: any) {
    console.error('Registration error:', error);
    toast.error(`Registration failed: ${error.message}`);
    throw error;
  }
};
