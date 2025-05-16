import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { TimeFilter, Transaction } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number | undefined, precision = 2): string {
  if (num === undefined) return "0";
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(precision)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(precision)}K`;
  }
  return num.toFixed(precision);
}

export function formatCurrency(num: number): string {
  return formatNumber(num, 2);
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp).toISOString().slice(0, 10).replace(/-/g, '-');
}

export function formatTime(timestamp: number): string {
  return new Date(timestamp).toISOString().slice(11, 19);
}

export function formatDateTime(timestamp: number): string {
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

export function filterTransactionsByTimeRange(transactions: Transaction[], timeFilter: TimeFilter): Transaction[] {
  const now = Date.now();
  let timeRange: number;
  
  switch (timeFilter) {
    case '1D':
      timeRange = 24 * 60 * 60 * 1000; // 24 hours in ms
      break;
    case '7D':
      timeRange = 7 * 24 * 60 * 60 * 1000; // 7 days in ms
      break;
    case '14D':
      timeRange = 14 * 24 * 60 * 60 * 1000; // 14 days in ms
      break;
    default:
      timeRange = 1 * 24 * 60 * 60 * 1000; // 1 day in ms
      break;
  }
  
  return transactions.filter(tx => now - tx.timestamp <= timeRange);
}

export function truncateAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function randomColor(): string {
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-red-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}