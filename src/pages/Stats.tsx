
import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { withAuth } from '@/hooks/useAuth';
import { useAuth } from '@/hooks/useAuth';
import { getUserTrades } from '@/lib/supabase';
import { Trade, TradeStats, SymbolPerformance } from '@/types';
import { motion } from 'framer-motion';
import WinRateChart from '@/components/charts/WinRateChart';
import RRDistributionChart from '@/components/charts/RRDistributionChart';
import StatsCard from '@/components/StatsCard';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { LineChart, Line, CartesianGrid, Legend } from 'recharts';
import { DataTable } from '@/components/DataTable';
import { columns } from '@/components/TradeColumns';

const Stats = () => {
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
  const [symbolPerformance, setSymbolPerformance] = useState<SymbolPerformance[]>([]);

  useEffect(() => {
    const fetchTrades = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const tradesData = await getUserTrades(user.id);
        setTrades(tradesData);
        
        // Calculate statistics
        calculateStats(tradesData);
        calculateSymbolPerformance(tradesData);
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

  const calculateSymbolPerformance = (trades: Trade[]) => {
    const symbolMap = new Map<string, { trades: number, wins: number, totalRR: number }>();
    
    trades.forEach(trade => {
      if (!symbolMap.has(trade.symbol)) {
        symbolMap.set(trade.symbol, { trades: 0, wins: 0, totalRR: 0 });
      }
      
      const current = symbolMap.get(trade.symbol)!;
      current.trades++;
      
      if (trade.outcome === 'win') {
        current.wins++;
      }
      
      current.totalRR += trade.risk_reward;
    });
    
    const performance: SymbolPerformance[] = [];
    
    symbolMap.forEach((value, symbol) => {
      performance.push({
        symbol,
        trades: value.trades,
        winRate: value.trades ? (value.wins / value.trades) * 100 : 0,
        avgRiskReward: value.trades ? value.totalRR / value.trades : 0
      });
    });
    
    // Sort by trade count descending
    setSymbolPerformance(performance.sort((a, b) => b.trades - a.trades));
  };

  const prepareWinStreak = () => {
    if (!trades.length) return [];
    
    // Sort trades by date (ascending)
    const sortedTrades = [...trades]
      .filter(t => t.outcome !== 'pending')
      .sort((a, b) => new Date(a.trade_date).getTime() - new Date(b.trade_date).getTime());
    
    // Calculate cumulative win/loss for each trade
    let cumulative = 0;
    return sortedTrades.map((trade, index) => {
      if (trade.outcome === 'win') cumulative++;
      else if (trade.outcome === 'loss') cumulative--;
      
      return {
        index: index + 1,
        date: new Date(trade.trade_date).toLocaleDateString(),
        outcome: trade.outcome,
        cumulative
      };
    });
  };

  return (
    <Layout>
      <div className="space-y-8">
        <motion.div
          className="glass-card rounded-xl p-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            Advanced Trading Statistics
          </h1>
          <p className="text-gray-400 mt-1">Detailed analysis of your trading performance</p>
        </motion.div>

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

        {/* Additional Advanced Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          <StatsCard 
            title="Profit Factor" 
            value={stats.profitFactor.toFixed(2)}
            loading={loading}
            className="animate-hover-float"
          />
          <StatsCard 
            title="Expected Value" 
            value={stats.expectedValue.toFixed(2)}
            loading={loading}
            className="animate-hover-float"
          />
          <StatsCard 
            title="W/L Ratio" 
            value={stats.losses > 0 ? (stats.wins / stats.losses).toFixed(2) : 'N/A'}
            loading={loading}
            className="animate-hover-float"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <WinRateChart wins={stats.wins} losses={stats.losses} loading={loading} />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <RRDistributionChart trades={trades} loading={loading} />
          </motion.div>
        </div>

        {/* Win Streak Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="glass-card rounded-xl p-6"
        >
          <h3 className="text-lg font-medium text-white mb-4">Win/Loss Streak Analysis</h3>
          
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
                <LineChart data={prepareWinStreak()} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <XAxis 
                    dataKey="index" 
                    tick={{ fill: '#aaa', fontSize: 12 }}
                    axisLine={{ stroke: '#444' }}
                    tickLine={{ stroke: '#444' }}
                    label={{ value: 'Trade Number', position: 'insideBottom', fill: '#aaa', dy: 10 }}
                  />
                  <YAxis 
                    tick={{ fill: '#aaa', fontSize: 12 }}
                    axisLine={{ stroke: '#444' }}
                    tickLine={{ stroke: '#444' }}
                    label={{ value: 'Cumulative W/L', angle: -90, position: 'insideLeft', fill: '#aaa', dx: -10 }}
                  />
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: '#222', 
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                    }}
                    itemStyle={{ color: '#fff' }}
                    labelStyle={{ color: '#aaa' }}
                    formatter={(value, name) => [value, name === 'cumulative' ? 'Cumulative W/L' : name]}
                    labelFormatter={(value) => `Trade #${value}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="cumulative" 
                    stroke="#E11D48" 
                    strokeWidth={2}
                    dot={{ 
                      fill: '#E11D48',
                      strokeWidth: 1,
                      r: 4,
                      strokeDasharray: '',
                    }}
                    activeDot={{ r: 6, fill: '#fff', stroke: '#E11D48' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>

        {/* Symbol Performance */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="glass-card rounded-xl p-6"
        >
          <h3 className="text-lg font-medium text-white mb-4">Symbol Performance</h3>
          
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-pulse-slow text-gray-400">Loading chart...</div>
            </div>
          ) : symbolPerformance.length === 0 ? (
            <div className="h-64 flex items-center justify-center">
              <div className="text-gray-400">No symbol performance data available</div>
            </div>
          ) : (
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={symbolPerformance.slice(0, 10)} 
                  margin={{ top: 5, right: 20, left: 10, bottom: 25 }}
                  layout="vertical"
                >
                  <XAxis 
                    type="number"
                    tick={{ fill: '#aaa', fontSize: 12 }}
                    axisLine={{ stroke: '#444' }}
                    tickLine={{ stroke: '#444' }}
                  />
                  <YAxis 
                    type="category"
                    dataKey="symbol" 
                    tick={{ fill: '#aaa', fontSize: 12 }}
                    axisLine={{ stroke: '#444' }}
                    tickLine={{ stroke: '#444' }}
                    width={80}
                  />
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
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
                  <Legend />
                  <Bar 
                    dataKey="winRate" 
                    name="Win Rate (%)" 
                    fill="#3B82F6" 
                    radius={[0, 4, 4, 0]}
                    animationDuration={1500}
                  />
                  <Bar 
                    dataKey="avgRiskReward" 
                    name="Avg RR" 
                    fill="#E11D48" 
                    radius={[0, 4, 4, 0]}
                    animationDuration={1500}
                    animationBegin={300}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>

        {/* Recent Trades Table */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="glass-card rounded-xl p-6"
        >
          <h3 className="text-lg font-medium text-white mb-4">Recent Trades</h3>
          
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-pulse-slow text-gray-400">Loading trades...</div>
            </div>
          ) : trades.length === 0 ? (
            <div className="h-64 flex items-center justify-center">
              <div className="text-gray-400">No trades available</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <DataTable columns={columns} data={trades} />
            </div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
};

export default withAuth(Stats);
