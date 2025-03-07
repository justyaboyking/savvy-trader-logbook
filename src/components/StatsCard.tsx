
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
      whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)' }}
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
          <motion.h3 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="text-gray-400 text-sm font-medium mb-1"
          >
            {title}
          </motion.h3>
          <div className="flex items-end justify-between">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="text-2xl font-bold text-white"
            >
              {value}
            </motion.div>
            {change && (
              <motion.div 
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className={`text-sm font-medium ${positive ? 'text-green-500' : 'text-kings-red'}`}
              >
                {change}
              </motion.div>
            )}
          </div>
        </>
      )}
    </motion.div>
  );
};

export default StatsCard;
