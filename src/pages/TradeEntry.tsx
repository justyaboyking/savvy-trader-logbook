
import React from 'react';
import Layout from '@/components/Layout';
import TradeForm from '@/components/TradeForm';
import { withAuth } from '@/hooks/useAuth';

const TradeEntry = () => {
  return (
    <Layout>
      <div className="space-y-8">
        <header>
          <h1 className="text-3xl font-bold tracking-tight text-white">Trade Entry</h1>
          <p className="text-gray-400 mt-2">Record your trading activity</p>
        </header>

        <TradeForm />
      </div>
    </Layout>
  );
};

export default withAuth(TradeEntry);
