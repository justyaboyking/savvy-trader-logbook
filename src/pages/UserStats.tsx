
import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { withAdmin } from '@/hooks/useAuth';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserById, getUserTradesAdmin } from '@/lib/supabase';
import { User, Trade, UserRole } from '@/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { DataTable } from '@/components/DataTable';
import { columns } from '@/components/TradeColumns';
import WinRateChart from '@/components/charts/WinRateChart';
import RRDistributionChart from '@/components/charts/RRDistributionChart';
import StatsCard from '@/components/StatsCard';

const UserStats = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [stats, setStats] = useState({
    totalTrades: 0,
    wins: 0,
    losses: 0,
    winRate: 0,
    avgRiskReward: 0,
    expectedValue: 0,
    profitFactor: 0,
    isProfitable: false
  });

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) return;
      
      try {
        setLoading(true);
        // Get user info
        const userData = await getUserById(userId);
        if (!userData) {
          navigate('/admin/dashboard');
          return;
        }
        
        // Ensure user role is of type UserRole
        const typedUser: User = {
          ...userData,
          role: userData.role as UserRole
        };
        
        setUser(typedUser);
        
        // Get user trades
        const tradesData = await getUserTradesAdmin(userId);
        setTrades(tradesData);
        
        // Calculate stats
        calculateStats(tradesData);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [userId, navigate]);

  const calculateStats = (trades: Trade[]) => {
    if (!trades.length) return;

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
    
    // Profit factor = (Win Rate × Average RR) / (1 - Win Rate)
    const profitFactor = wins === 0 ? 0 : 
      losses === 0 ? Number.POSITIVE_INFINITY : 
      (winRateDecimal * avgRiskReward) / (1 - winRateDecimal);
    
    setStats({
      totalTrades: trades.length,
      wins,
      losses,
      winRate: parseFloat(winRate.toFixed(2)),
      avgRiskReward: parseFloat(avgRiskReward.toFixed(2)),
      expectedValue: parseFloat(expectedValue.toFixed(2)),
      profitFactor: parseFloat(profitFactor.toFixed(2)),
      isProfitable: expectedValue > 0
    });
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
          <Button 
            variant="outline" 
            size="sm" 
            className="mb-4" 
            onClick={() => navigate('/admin/dashboard')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
          </Button>
          
          <h1 className="text-2xl font-bold text-white">{user?.username}'s Statistics</h1>
          <p className="text-gray-400 mt-1">{user?.email}</p>
        </div>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <StatsCard 
            title="Total Trades" 
            value={stats.totalTrades}
            loading={loading}
            className="animate-hover-float"
          />
          <StatsCard 
            title="Win Rate" 
            value={`${stats.winRate}%`}
            loading={loading}
            className="animate-hover-float"
          />
          <StatsCard 
            title="Avg Risk-Reward" 
            value={`1:${stats.avgRiskReward}`}
            loading={loading}
            className="animate-hover-float"
          />
          <StatsCard 
            title="Profitable" 
            value={stats.isProfitable ? 'Yes' : 'No'}
            change={stats.expectedValue > 0 ? '+' + stats.expectedValue : stats.expectedValue.toString()}
            positive={stats.expectedValue > 0}
            className={`animate-hover-float ${stats.expectedValue > 0 ? 'border-green-500/20 hover:border-green-500/40' : 'border-kings-red/20 hover:border-kings-red/40'}`}
            loading={loading}
          />
        </div>
        
        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <WinRateChart wins={stats.wins} losses={stats.losses} loading={loading} />
          <RRDistributionChart trades={trades} loading={loading} />
        </div>
        
        {/* Trades Table */}
        <div className="glass-card rounded-xl p-6">
          <h3 className="text-lg font-medium text-white mb-4">Trade History</h3>
          
          {trades.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              This user has not recorded any trades yet.
            </div>
          ) : (
            <DataTable columns={columns} data={trades} />
          )}
        </div>
      </div>
    </Layout>
  );
};

export default withAdmin(UserStats);
