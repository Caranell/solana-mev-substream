export type TimeFilter = '24H' | '7D' | '30D';

export type TransactionType = 'sandwich' | 'arbitrage';

export interface Transaction {
  id: string;
  type: TransactionType;
  timestamp: number;
  profit: number;
  cost: number;
  extra: number;
  bot: string;
  victims?: string[];
  tokens?: {
    symbol: string;
    amount: number;
  }[];
}

export interface StatsSummary {
  totalTransactions: number;
  extractedValue: number;
  cost: number;
  victims: number;
  attackers: number;
}

export interface StatsData {
  sandwiches: StatsSummary;
  arbitrages: StatsSummary;
}