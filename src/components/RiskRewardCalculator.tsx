
import React, { useEffect, useState } from 'react';

interface RiskRewardCalculatorProps {
  entryPrice: number | string;
  stopLoss: number | string;
  takeProfit: number | string;
  tradeType: 'buy' | 'sell';
  onRiskRewardChange: (rr: number) => void;
}

const RiskRewardCalculator: React.FC<RiskRewardCalculatorProps> = ({
  entryPrice,
  stopLoss,
  takeProfit,
  tradeType,
  onRiskRewardChange,
}) => {
  const [riskReward, setRiskReward] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const entry = parseFloat(entryPrice as string);
    const sl = parseFloat(stopLoss as string);
    const tp = parseFloat(takeProfit as string);

    if (isNaN(entry) || isNaN(sl) || isNaN(tp)) {
      setRiskReward(null);
      setError(null);
      return;
    }

    try {
      let risk, reward;

      if (tradeType === 'buy') {
        // Long position: entry < TP, entry > SL
        if (sl >= entry) {
          setError("Stop loss should be below entry price for buy orders");
          setRiskReward(null);
          onRiskRewardChange(0);
          return;
        }
        if (tp <= entry) {
          setError("Take profit should be above entry price for buy orders");
          setRiskReward(null);
          onRiskRewardChange(0);
          return;
        }
        
        risk = entry - sl;
        reward = tp - entry;
      } else {
        // Short position: entry > TP, entry < SL
        if (sl <= entry) {
          setError("Stop loss should be above entry price for sell orders");
          setRiskReward(null);
          onRiskRewardChange(0);
          return;
        }
        if (tp >= entry) {
          setError("Take profit should be below entry price for sell orders");
          setRiskReward(null);
          onRiskRewardChange(0);
          return;
        }
        
        risk = sl - entry;
        reward = entry - tp;
      }

      if (risk === 0) {
        setError("Risk cannot be zero");
        setRiskReward(null);
        onRiskRewardChange(0);
        return;
      }

      const rr = parseFloat((reward / risk).toFixed(2));
      setRiskReward(rr);
      setError(null);
      onRiskRewardChange(rr);
    } catch (err) {
      console.error("Error calculating R:R", err);
      setError("Error calculating risk-reward ratio");
      setRiskReward(null);
      onRiskRewardChange(0);
    }
  }, [entryPrice, stopLoss, takeProfit, tradeType, onRiskRewardChange]);

  return (
    <div className="mt-4 p-4 rounded-lg bg-kings-dark/50 border border-kings-gray/30">
      <h3 className="text-white font-medium mb-2">Risk-Reward Calculator</h3>
      
      {error ? (
        <div className="text-kings-red text-sm">{error}</div>
      ) : riskReward !== null ? (
        <div className="flex items-center space-x-2">
          <span className="text-gray-400">R:R Ratio:</span>
          <span className="font-semibold text-white">1:{riskReward}</span>
          <span className={`text-sm ${riskReward >= 1.5 ? 'text-green-500' : riskReward >= 1 ? 'text-yellow-500' : 'text-kings-red'}`}>
            {riskReward >= 1.5 ? 'Excellent' : riskReward >= 1 ? 'Good' : 'Poor'}
          </span>
        </div>
      ) : (
        <div className="text-gray-400 text-sm">Enter all values to calculate R:R</div>
      )}
    </div>
  );
};

export default RiskRewardCalculator;
