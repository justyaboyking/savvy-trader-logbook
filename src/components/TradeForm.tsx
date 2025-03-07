
import React, { useState } from 'react';
import { TradingPairs, Market, TradeType, NewTrade } from '@/types';
import RiskRewardCalculator from './RiskRewardCalculator';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { createTrade } from '@/lib/supabase';

const TradeForm: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const [tradeData, setTradeData] = useState<Partial<NewTrade>>({
    trade_date: new Date().toISOString().split('T')[0],
    market: 'futures',
    symbol: TradingPairs.futures[0],
    type: 'buy',
    outcome: 'pending',
    notes: '',
  });
  
  const [riskReward, setRiskReward] = useState<number>(0);

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
    
    if (!user) {
      toast.error('You must be logged in to submit a trade');
      return;
    }
    
    if (riskReward <= 0) {
      toast.error('Please ensure your risk-reward ratio is valid');
      return;
    }
    
    setLoading(true);
    
    try {
      // Format the data
      const formattedTrade: NewTrade = {
        ...tradeData as NewTrade,
        user_id: user.id,
        entry_price: parseFloat(tradeData.entry_price as any || 0),
        stop_loss: parseFloat(tradeData.stop_loss as any || 0),
        take_profit: parseFloat(tradeData.take_profit as any || 0),
        risk_reward: riskReward,
      };
      
      await createTrade(formattedTrade);
      
      // Reset form
      setTradeData({
        trade_date: new Date().toISOString().split('T')[0],
        market: 'futures',
        symbol: TradingPairs.futures[0],
        type: 'buy',
        outcome: 'pending',
        notes: '',
      });
      
      toast.success('Trade saved successfully');
    } catch (error) {
      console.error('Error saving trade:', error);
      toast.error('Failed to save trade');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      <div className="glass-card rounded-xl p-6 space-y-6">
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
              value={tradeData.trade_date || ''}
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
        <RiskRewardCalculator
          entryPrice={tradeData.entry_price || 0}
          stopLoss={tradeData.stop_loss || 0}
          takeProfit={tradeData.take_profit || 0}
          tradeType={tradeData.type as TradeType || 'buy'}
          onRiskRewardChange={handleRiskRewardChange}
        />
        
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
      </div>
      
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="premium-button w-full md:w-auto"
        >
          {loading ? 'Saving...' : 'Save Trade'}
        </button>
      </div>
    </form>
  );
};

export default TradeForm;
