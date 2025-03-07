
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  positive?: boolean;
  className?: string;
  loading?: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  positive,
  className,
  loading = false,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "glass-card rounded-xl p-6 flex flex-col",
        className
      )}
    >
      {loading ? (
        <>
          <div className="h-5 w-24 bg-gray-700 rounded animate-pulse mb-3"></div>
          <div className="h-8 w-16 bg-gray-700 rounded animate-pulse"></div>
        </>
      ) : (
        <>
          <h3 className="text-gray-400 text-sm font-medium mb-1">{title}</h3>
          <div className="flex items-end justify-between">
            <div className="text-2xl font-bold text-white">{value}</div>
            {change && (
              <div className={`text-sm font-medium ${positive ? 'text-green-500' : 'text-kings-red'}`}>
                {change}
              </div>
            )}
          </div>
        </>
      )}
    </motion.div>
  );
};

export default StatsCard;
