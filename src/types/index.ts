
// User related types
export type UserRole = 'admin' | 'student';

export type User = {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  created_at: string;
};

// Trade related types
export type Market = 'futures' | 'forex' | 'crypto';
export type TradeType = 'buy' | 'sell';
export type TradeOutcome = 'win' | 'loss' | 'pending';

export type Trade = {
  id: string;
  user_id: string;
  trade_date: string;
  market: Market;
  symbol: string;
  type: TradeType;
  entry_price: number;
  stop_loss: number;
  take_profit: number;
  risk_reward: number;
  outcome: TradeOutcome;
  notes: string;
  created_at: string;
};

export type NewTrade = Omit<Trade, 'id' | 'created_at'>;

// Trading pairs
export const TradingPairs = {
  futures: ['NQ', 'GC', 'CL', 'ES'],
  forex: ['EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'USD/CAD', 'USD/CHF', 'NZD/USD'],
  crypto: ['BTC', 'ETH', 'AVAX', 'SOL', 'XRP', 'ADA', 'DOT']
};

// Stats types
export type TradeStats = {
  totalTrades: number;
  wins: number;
  losses: number;
  winRate: number;
  avgRiskReward: number;
  expectedValue: number;
  profitFactor: number;
  isProfitable: boolean;
};

export type SymbolPerformance = {
  symbol: string;
  trades: number;
  winRate: number;
  avgRiskReward: number;
};
