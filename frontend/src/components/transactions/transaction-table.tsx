import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowDownIcon, ArrowUpIcon } from '@radix-ui/react-icons';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { TransactionType, Transaction } from '@/types';
import { Badge } from '@/components/ui/badge';

interface TransactionTableProps {
  transactions: Transaction[];
  title: string;
  transactionType: TransactionType;
  timeFilter: string;
}

type SortField = 'timestamp' | 'profit' | 'cost' | 'extra';
type SortDirection = 'asc' | 'desc';

export function TransactionTable({ 
  transactions, 
  title, 
  transactionType, 
  timeFilter 
}: TransactionTableProps) {
  const [sortField, setSortField] = useState<SortField>('profit');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedTransactions = [...transactions]
    .filter(tx => tx.type === transactionType)
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  return (
    <div className="rounded-lg border bg-card">
      <div className="flex items-center justify-between p-4">
        <h3 className="text-lg font-semibold">Top {title}</h3>
        <Badge variant="outline">{timeFilter} Days</Badge>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">#</TableHead>
            <TableHead>
              <button 
                className="flex items-center gap-1"
                onClick={() => handleSort('timestamp')}
              >
                Time
                {sortField === 'timestamp' && (
                  sortDirection === 'asc' ? <ArrowUpIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />
                )}
              </button>
            </TableHead>
            <TableHead>
              <button 
                className="flex items-center gap-1"
                onClick={() => handleSort('profit')}
              >
                Profit
                {sortField === 'profit' && (
                  sortDirection === 'asc' ? <ArrowUpIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />
                )}
              </button>
            </TableHead>
            <TableHead>
              <button 
                className="flex items-center gap-1"
                onClick={() => handleSort('cost')}
              >
                Cost
                {sortField === 'cost' && (
                  sortDirection === 'asc' ? <ArrowUpIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />
                )}
              </button>
            </TableHead>
            <TableHead>
              <button 
                className="flex items-center gap-1"
                onClick={() => handleSort('extra')}
              >
                Extra
                {sortField === 'extra' && (
                  sortDirection === 'asc' ? <ArrowUpIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />
                )}
              </button>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedTransactions.map((transaction, index) => (
            <TableRow key={transaction.id} className="hover:bg-muted/50">
              <TableCell className="font-medium text-orange-500">#{index + 1}</TableCell>
              <TableCell>{formatDateTime(transaction.timestamp)}</TableCell>
              <TableCell className="text-blue-500">{formatCurrency(transaction.profit)}</TableCell>
              <TableCell className="text-purple-500">{formatCurrency(transaction.cost)}</TableCell>
              <TableCell className="text-green-500">{formatCurrency(transaction.extra)}</TableCell>
            </TableRow>
          ))}
          {sortedTransactions.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                No transactions found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}