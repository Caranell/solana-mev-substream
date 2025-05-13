import { TimeFilter } from '@/types';

export const TIME_FILTERS: { value: TimeFilter; label: string }[] = [
  { value: '24H', label: '24H' },
  { value: '7D', label: '7D' },
  { value: '30D', label: '30D' },
];

export const MOCK_TRANSACTIONS = [
  {
    id: '1',
    type: 'sandwich',
    timestamp: Date.now() - 1000 * 60 * 60 * 2,
    profit: 34.81,
    cost: 2.6201,
    extra: 37.43,
    bot: 'B91p1BSf',
  },
  {
    id: '2',
    type: 'sandwich',
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 3,
    profit: 21.7635,
    cost: 2.4111,
    extra: 24.17,
    bot: 'B91p1BSf',
  },
  {
    id: '3',
    type: 'sandwich',
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 2,
    profit: 17.7061,
    cost: 4.0719,
    extra: 21.78,
    bot: 'B91p1BSf',
  },
  {
    id: '4',
    type: 'sandwich',
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 10,
    profit: 17.5099,
    cost: 0.9704,
    extra: 18.48,
    bot: 'B91p1BSf',
  },
  {
    id: '5',
    type: 'sandwich',
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 5,
    profit: 15.9738,
    cost: 3.6654,
    extra: 19.64,
    bot: 'B91p1BSf',
  },
  {
    id: '6',
    type: 'arbitrage',
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 15,
    profit: 88051.024,
    cost: 0.00,
    extra: 88051.024,
    bot: 'B91p1BSf',
  },
  {
    id: '7',
    type: 'arbitrage',
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 8,
    profit: 26.149,
    cost: 0.00,
    extra: 26.149,
    bot: 'B91p1BSf',
  },
  {
    id: '8',
    type: 'arbitrage',
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 12,
    profit: 599.058,
    cost: 0.9691,
    extra: 600.027,
    bot: 'B91p1BSf',
  },
  {
    id: '9',
    type: 'arbitrage',
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 1,
    profit: 1102.299,
    cost: 0.00,
    extra: 1102.299,
    bot: 'B91p1BSf',
  },
];

export const MOCK_STATS = {
  sandwiches: {
    totalTransactions: 286351,
    extractedValue: 24933321,
    cost: 2029176,
    victims: 99462,
    attackers: 95,
  },
  arbitrages: {
    totalTransactions: 173245,
    extractedValue: 18765432,
    cost: 987654,
    victims: 0,
    attackers: 78,
  },
};