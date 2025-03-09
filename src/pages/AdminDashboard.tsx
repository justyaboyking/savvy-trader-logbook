
import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { withAdmin } from '@/hooks/useAuth';
import { getAllUsers, getUserTradesAdmin } from '@/lib/supabase';
import { User, Trade, UserRole } from '@/types';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { ArrowRight, TrendingUp, TrendingDown, Percent, DollarSign } from 'lucide-react';

type UserStats = {
  userId: string;
  username: string;
  email: string;
  totalTrades: number;
  winRate: number;
  avgRiskReward: number;
  expectedValue: number;
};

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [userStats, setUserStats] = useState<UserStats[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsersData = async () => {
      try {
        setLoading(true);
        // Get all student users
        const allUsers = await getAllUsers();
        const students = allUsers.filter(user => user.role === 'student');
        // Ensure the role is of type UserRole
        const typedStudents: User[] = students.map(user => ({
          ...user,
          role: user.role as UserRole
        }));
        setUsers(typedStudents);
        
        // Get stats for each student
        const statsPromises = typedStudents.map(async (user) => {
          const trades = await getUserTradesAdmin(user.id);
          return calculateUserStats(user, trades);
        });
        
        const stats = await Promise.all(statsPromises);
        setUserStats(stats);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsersData();
  }, []);

  const calculateUserStats = (user: User, trades: Trade[]): UserStats => {
    const completedTrades = trades.filter(t => t.outcome !== 'pending');
    const wins = completedTrades.filter(t => t.outcome === 'win').length;
    const losses = completedTrades.filter(t => t.outcome === 'loss').length;
    const totalCompleted = completedTrades.length;
    
    const winRate = totalCompleted ? (wins / totalCompleted) * 100 : 0;
    
    const avgRiskReward = completedTrades.reduce((acc, trade) => acc + trade.risk_reward, 0) / 
      (completedTrades.length || 1);
    
    // Expected value = (Win Rate × Average RR) - (1 - Win Rate)
    const winRateDecimal = winRate / 100;
    const expectedValue = (winRateDecimal * avgRiskReward) - (1 - winRateDecimal);
    
    return {
      userId: user.id,
      username: user.username,
      email: user.email,
      totalTrades: trades.length,
      winRate: parseFloat(winRate.toFixed(2)),
      avgRiskReward: parseFloat(avgRiskReward.toFixed(2)),
      expectedValue: parseFloat(expectedValue.toFixed(2)),
    };
  };

  const viewUserStats = (userId: string) => {
    navigate(`/admin/user-stats/${userId}`);
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse-slow text-white text-xl">Loading user data...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="glass-card rounded-xl p-6">
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-gray-400 mt-1">View all student statistics and performance</p>
        </div>
        
        {userStats.length === 0 ? (
          <div className="glass-card rounded-xl p-6 text-center">
            <p className="text-gray-400">No students found in the system.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {userStats.map((stats) => (
              <Card 
                key={stats.userId} 
                className="glass-card rounded-xl p-5 cursor-pointer hover:bg-kings-dark/50 transition-all"
                onClick={() => viewUserStats(stats.userId)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium text-white">{stats.username}</h3>
                    <p className="text-gray-400 text-sm">{stats.email}</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-kings-red" />
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div className="flex flex-col">
                    <span className="text-gray-400 text-xs uppercase">Trades</span>
                    <div className="flex items-center mt-1">
                      <TrendingUp className="h-4 w-4 text-gray-300 mr-1" />
                      <span className="text-white font-medium">{stats.totalTrades}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col">
                    <span className="text-gray-400 text-xs uppercase">Win Rate</span>
                    <div className="flex items-center mt-1">
                      <Percent className="h-4 w-4 text-gray-300 mr-1" />
                      <span className={`font-medium ${stats.winRate >= 50 ? 'text-green-400' : 'text-kings-red'}`}>
                        {stats.winRate}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col">
                    <span className="text-gray-400 text-xs uppercase">Avg R:R</span>
                    <div className="flex items-center mt-1">
                      <TrendingDown className="h-4 w-4 text-gray-300 mr-1" />
                      <span className="text-white font-medium">1:{stats.avgRiskReward.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col">
                    <span className="text-gray-400 text-xs uppercase">Expected Value</span>
                    <div className="flex items-center mt-1">
                      <DollarSign className="h-4 w-4 text-gray-300 mr-1" />
                      <span className={`font-medium ${stats.expectedValue > 0 ? 'text-green-400' : 'text-kings-red'}`}>
                        {stats.expectedValue > 0 ? '+' : ''}{stats.expectedValue.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default withAdmin(AdminDashboard);
