
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { withAuth } from '@/hooks/useAuth';
import { useAuth } from '@/hooks/useAuth';
import { useParams, useNavigate } from 'react-router-dom';
import { getTrade, updateTrade } from '@/lib/supabase';
import { TradingPairs, Market, TradeType, Trade, NewTrade } from '@/types';
import RiskRewardCalculator from '@/components/RiskRewardCalculator';
import { toast } from 'sonner';

const EditTrade = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [tradeData, setTradeData] = useState<Partial<Trade>>({});
  const [riskReward, setRiskReward] = useState<number>(0);

  useEffect(() => {
    const fetchTrade = async () => {
      if (!id || !user) return;
      
      try {
        setLoading(true);
        const trade = await getTrade(id);
        
        if (!trade) {
          toast.error('Trade not found');
          navigate('/stats');
          return;
        }
        
        // Check if this trade belongs to the current user
        if (trade.user_id !== user.id && !user.role === 'admin') {
          toast.error('You do not have permission to edit this trade');
          navigate('/stats');
          return;
        }
        
        setTradeData(trade);
        setRiskReward(trade.risk_reward);
      } catch (error) {
        console.error('Error fetching trade:', error);
        toast.error('Failed to load trade data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTrade();
  }, [id, user, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Handle market change - update symbol to first in new market
    if (name === 'market') {
      const market = value as Market;
      setTradeData({
        ...tradeData,
        market,
        symbol: TradingPairs[market][0]
      });
    } else {
      setTradeData({
        ...tradeData,
        [name]: value
      });
    }
  };

  const handleRiskRewardChange = (rr: number) => {
    setRiskReward(rr);
    setTradeData(prev => ({
      ...prev,
      risk_reward: rr
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !id) {
      toast.error('You must be logged in to update a trade');
      return;
    }
    
    if (riskReward <= 0) {
      toast.error('Please ensure your risk-reward ratio is valid');
      return;
    }
    
    setSaving(true);
    
    try {
      // Format the data
      const formattedTrade: Partial<Trade> = {
        ...tradeData,
        entry_price: parseFloat(String(tradeData.entry_price || 0)),
        stop_loss: parseFloat(String(tradeData.stop_loss || 0)),
        take_profit: parseFloat(String(tradeData.take_profit || 0)),
        risk_reward: riskReward,
      };
      
      await updateTrade(id, formattedTrade);
      toast.success('Trade updated successfully');
      
      // Navigate back to stats page
      navigate('/stats');
    } catch (error) {
      console.error('Error updating trade:', error);
      toast.error('Failed to update trade');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse-slow text-white text-xl">Loading trade data...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="glass-card rounded-xl p-6">
          <h1 className="text-2xl font-bold text-white mb-6">Edit Trade</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date */}
              <div>
                <label htmlFor="trade_date" className="block text-sm font-medium text-gray-300 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  id="trade_date"
                  name="trade_date"
                  value={tradeData.trade_date?.split('T')[0] || ''}
                  onChange={handleChange}
                  className="premium-input w-full"
                  required
                />
              </div>
              
              {/* Market Selection */}
              <div>
                <label htmlFor="market" className="block text-sm font-medium text-gray-300 mb-2">
                  Market
                </label>
                <select
                  id="market"
                  name="market"
                  value={tradeData.market || 'futures'}
                  onChange={handleChange}
                  className="premium-select w-full"
                  required
                >
                  <option value="futures">Futures</option>
                  <option value="forex">Forex</option>
                  <option value="crypto">Crypto</option>
                </select>
              </div>
              
              {/* Symbol Selection */}
              <div>
                <label htmlFor="symbol" className="block text-sm font-medium text-gray-300 mb-2">
                  Symbol
                </label>
                <select
                  id="symbol"
                  name="symbol"
                  value={tradeData.symbol || ''}
                  onChange={handleChange}
                  className="premium-select w-full"
                  required
                >
                  {tradeData.market && TradingPairs[tradeData.market as Market].map((symbol) => (
                    <option key={symbol} value={symbol}>
                      {symbol}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Trade Type */}
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-300 mb-2">
                  Trade Type
                </label>
                <select
                  id="type"
                  name="type"
                  value={tradeData.type || 'buy'}
                  onChange={handleChange}
                  className="premium-select w-full"
                  required
                >
                  <option value="buy">Buy (Long)</option>
                  <option value="sell">Sell (Short)</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Entry Price */}
              <div>
                <label htmlFor="entry_price" className="block text-sm font-medium text-gray-300 mb-2">
                  Entry Price
                </label>
                <input
                  type="number"
                  id="entry_price"
                  name="entry_price"
                  value={tradeData.entry_price || ''}
                  onChange={handleChange}
                  step="0.00001"
                  className="premium-input w-full"
                  required
                />
              </div>
              
              {/* Stop Loss */}
              <div>
                <label htmlFor="stop_loss" className="block text-sm font-medium text-gray-300 mb-2">
                  Stop Loss
                </label>
                <input
                  type="number"
                  id="stop_loss"
                  name="stop_loss"
                  value={tradeData.stop_loss || ''}
                  onChange={handleChange}
                  step="0.00001"
                  className="premium-input w-full"
                  required
                />
              </div>
              
              {/* Take Profit */}
              <div>
                <label htmlFor="take_profit" className="block text-sm font-medium text-gray-300 mb-2">
                  Take Profit
                </label>
                <input
                  type="number"
                  id="take_profit"
                  name="take_profit"
                  value={tradeData.take_profit || ''}
                  onChange={handleChange}
                  step="0.00001"
                  className="premium-input w-full"
                  required
                />
              </div>
            </div>
            
            {/* Risk-Reward Calculator */}
            {tradeData.entry_price && tradeData.stop_loss && tradeData.take_profit && (
              <RiskRewardCalculator
                entryPrice={tradeData.entry_price || 0}
                stopLoss={tradeData.stop_loss || 0}
                takeProfit={tradeData.take_profit || 0}
                tradeType={tradeData.type as TradeType || 'buy'}
                onRiskRewardChange={handleRiskRewardChange}
              />
            )}
            
            {/* Outcome */}
            <div>
              <label htmlFor="outcome" className="block text-sm font-medium text-gray-300 mb-2">
                Outcome
              </label>
              <select
                id="outcome"
                name="outcome"
                value={tradeData.outcome || 'pending'}
                onChange={handleChange}
                className="premium-select w-full"
                required
              >
                <option value="win">Win</option>
                <option value="loss">Loss</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            
            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-300 mb-2">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                value={tradeData.notes || ''}
                onChange={handleChange}
                rows={3}
                className="premium-input w-full"
                placeholder="Add any notes or thoughts about this trade..."
              ></textarea>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate('/stats')}
                className="px-4 py-2 border border-gray-600 rounded-md text-gray-300 hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="premium-button"
              >
                {saving ? 'Saving...' : 'Update Trade'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default withAuth(EditTrade);
