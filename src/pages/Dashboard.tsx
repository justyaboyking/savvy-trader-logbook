
import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import StatsCard from '@/components/StatsCard';
import { withAuth } from '@/hooks/useAuth';
import { useAuth } from '@/hooks/useAuth';
import { getUserTrades } from '@/lib/supabase';
import { Trade, TradeStats } from '@/types';
import WinRateChart from '@/components/charts/WinRateChart';
import RRDistributionChart from '@/components/charts/RRDistributionChart';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const { user } = useAuth();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<TradeStats>({
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
    const fetchTrades = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const tradesData = await getUserTrades(user.id);
        setTrades(tradesData);
        
        // Calculate statistics
        calculateStats(tradesData);
      } catch (error) {
        console.error('Error fetching trades:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrades();
  }, [user]);

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

  const prepareChartData = () => {
    // Create a map to organize trades by date
    const tradesByDate = new Map();
    
    trades.forEach(trade => {
      const date = trade.trade_date.split('T')[0];
      if (!tradesByDate.has(date)) {
        tradesByDate.set(date, []);
      }
      tradesByDate.get(date).push(trade);
    });
    
    // Convert to array of objects for the chart
    const last7Dates = [...tradesByDate.keys()]
      .sort()
      .slice(-7);
    
    return last7Dates.map(date => {
      const dayTrades = tradesByDate.get(date) || [];
      const completed = dayTrades.filter(t => t.outcome !== 'pending');
      const dayWins = completed.filter(t => t.outcome === 'win').length;
      const dayLosses = completed.filter(t => t.outcome === 'loss').length;
      const dayWinRate = completed.length ? (dayWins / completed.length) * 100 : 0;
      
      return {
        date: new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        trades: dayTrades.length,
        winRate: parseFloat(dayWinRate.toFixed(2))
      };
    });
  };

  return (
    <Layout>
      <div className="space-y-8">
        <header>
          <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard</h1>
          <p className="text-gray-400 mt-2">Your trading performance at a glance</p>
        </header>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard 
            title="Total Trades" 
            value={stats.totalTrades}
            loading={loading}
          />
          <StatsCard 
            title="Win Rate" 
            value={`${stats.winRate}%`}
            loading={loading}
          />
          <StatsCard 
            title="Avg Risk-Reward" 
            value={`1:${stats.avgRiskReward}`}
            loading={loading}
          />
          <StatsCard 
            title="Profitable" 
            value={stats.isProfitable ? 'Yes' : 'No'}
            change={stats.expectedValue > 0 ? '+' + stats.expectedValue : stats.expectedValue.toString()}
            positive={stats.expectedValue > 0}
            className={stats.expectedValue > 0 ? 'border-green-500/20' : 'border-kings-red/20'}
            loading={loading}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <WinRateChart wins={stats.wins} losses={stats.losses} loading={loading} />
          <RRDistributionChart trades={trades} loading={loading} />
        </div>

        {/* Recent Activity Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="glass-card rounded-xl p-6"
        >
          <h3 className="text-lg font-medium text-white mb-4">Recent Trading Activity</h3>
          
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-pulse-slow text-gray-400">Loading chart...</div>
            </div>
          ) : trades.length === 0 ? (
            <div className="h-64 flex items-center justify-center">
              <div className="text-gray-400">No trading data available</div>
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={prepareChartData()} margin={{ top: 5, right: 5, left: 5, bottom: 20 }}>
                  <defs>
                    <linearGradient id="colorTrades" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorWinRate" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#E11D48" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#E11D48" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="date" 
                    tick={{ fill: '#aaa', fontSize: 12 }}
                    axisLine={{ stroke: '#444' }}
                    tickLine={{ stroke: '#444' }}
                  />
                  <YAxis 
                    yAxisId="left"
                    tick={{ fill: '#aaa', fontSize: 12 }}
                    axisLine={{ stroke: '#444' }}
                    tickLine={{ stroke: '#444' }}
                    orientation="left"
                  />
                  <YAxis 
                    yAxisId="right"
                    tick={{ fill: '#aaa', fontSize: 12 }}
                    axisLine={{ stroke: '#444' }}
                    tickLine={{ stroke: '#444' }}
                    orientation="right"
                    domain={[0, 100]}
                    unit="%"
                  />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: '#222', 
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                    }}
                    itemStyle={{ color: '#fff' }}
                    labelStyle={{ color: '#aaa' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="trades" 
                    yAxisId="left"
                    stroke="#3B82F6" 
                    fillOpacity={1} 
                    fill="url(#colorTrades)" 
                    name="Trades"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="winRate" 
                    yAxisId="right"
                    stroke="#E11D48" 
                    fillOpacity={1} 
                    fill="url(#colorWinRate)" 
                    name="Win Rate"
                    unit="%"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
};

export default withAuth(Dashboard);
