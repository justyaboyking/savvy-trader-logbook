
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface WinRateChartProps {
  wins: number;
  losses: number;
  loading?: boolean;
}

const WinRateChart: React.FC<WinRateChartProps> = ({ wins, losses, loading = false }) => {
  const data = [
    { name: 'Wins', value: wins },
    { name: 'Losses', value: losses },
  ];
  
  const COLORS = ['#10B981', '#E11D48'];
  
  if (loading) {
    return (
      <div className="glass-card rounded-xl p-6 h-72 flex items-center justify-center">
        <div className="animate-pulse-slow text-gray-400">Loading chart...</div>
      </div>
    );
  }
  
  return (
    <div className="glass-card rounded-xl p-6">
      <h3 className="text-lg font-medium text-white mb-4">Win/Loss Distribution</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={80}
              innerRadius={50}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="value"
              animationDuration={1000}
              animationBegin={200}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
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
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      <div className="flex justify-center space-x-8 mt-4">
        {data.map((entry, index) => (
          <div key={`legend-${index}`} className="flex items-center">
            <div
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <span className="text-sm text-gray-300">{entry.name}: {entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WinRateChart;
