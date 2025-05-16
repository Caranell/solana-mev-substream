export type TimeFilter = '1' | '7' | '14';

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


