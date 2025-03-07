
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Trade } from '@/types';

interface RRDistributionChartProps {
  trades: Trade[];
  loading?: boolean;
}

const RRDistributionChart: React.FC<RRDistributionChartProps> = ({ trades, loading = false }) => {
  const calculateRRDistribution = () => {
    const distribution = [
      { name: '<1', count: 0 },
      { name: '1-1.5', count: 0 },
      { name: '1.5-2', count: 0 },
      { name: '2-3', count: 0 },
      { name: '>3', count: 0 },
    ];
    
    trades.forEach(trade => {
      const rr = trade.risk_reward;
      
      if (rr < 1) {
        distribution[0].count++;
      } else if (rr >= 1 && rr < 1.5) {
        distribution[1].count++;
      } else if (rr >= 1.5 && rr < 2) {
        distribution[2].count++;
      } else if (rr >= 2 && rr < 3) {
        distribution[3].count++;
      } else {
        distribution[4].count++;
      }
    });
    
    return distribution;
  };
  
  if (loading) {
    return (
      <div className="glass-card rounded-xl p-6 h-72 flex items-center justify-center">
        <div className="animate-pulse-slow text-gray-400">Loading chart...</div>
      </div>
    );
  }
  
  const data = calculateRRDistribution();
  
  return (
    <div className="glass-card rounded-xl p-6">
      <h3 className="text-lg font-medium text-white mb-4">Risk-Reward Distribution</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 20 }}>
            <XAxis 
              dataKey="name" 
              tick={{ fill: '#aaa', fontSize: 12 }}
              axisLine={{ stroke: '#444' }}
              tickLine={{ stroke: '#444' }}
            />
            <YAxis 
              tick={{ fill: '#aaa', fontSize: 12 }}
              axisLine={{ stroke: '#444' }}
              tickLine={{ stroke: '#444' }}
            />
            <Tooltip
              formatter={(value) => [`${value} trades`, '']}
              contentStyle={{ 
                backgroundColor: '#222', 
                border: 'none',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
              }}
              itemStyle={{ color: '#fff' }}
              labelStyle={{ color: '#aaa' }}
            />
            <Bar 
              dataKey="count" 
              name="Trades" 
              fill="#3B82F6" 
              radius={[4, 4, 0, 0]}
              animationDuration={1500}
              animationBegin={300}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RRDistributionChart;
