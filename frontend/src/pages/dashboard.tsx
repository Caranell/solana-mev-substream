import React, { useState } from 'react';
import { StatsSummary } from '@/components/dashboard/stats-summary';
import { TransactionTable } from '@/components/transactions/transaction-table';
import { TransactionStream } from '@/components/transactions/transaction-stream';
import { TimeFilterButtons } from '@/components/dashboard/time-filter';
import { MOCK_STATS, MOCK_TRANSACTIONS, TIME_FILTERS } from '@/lib/constants';
import { TimeFilter, TransactionType } from '@/types';
import { useSocket } from '@/context/socket-context';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function Dashboard() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('30D');
  const [txType, setTxType] = useState<'sandwiches' | 'arbitrages'>('sandwiches');
  const { recentTransactions, isConnected } = useSocket();

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {txType.charAt(0).toUpperCase() + txType.slice(1)}
          </h1>
          <p className="text-muted-foreground">
            Monitor {txType} transactions on Solana
          </p>
        </div>
        <TimeFilterButtons 
          filters={TIME_FILTERS} 
          activeFilter={timeFilter} 
          onChange={setTimeFilter} 
        />
      </div>

      <Tabs
        defaultValue="sandwiches"
        value={txType}
        onValueChange={(value) => setTxType(value as 'sandwiches' | 'arbitrages')}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="sandwiches">Sandwiches</TabsTrigger>
          <TabsTrigger value="arbitrages">Arbitrages</TabsTrigger>
        </TabsList>
        <TabsContent value="sandwiches" className="space-y-4">
          <StatsSummary data={MOCK_STATS} transactionType="sandwiches" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <TransactionTable 
                transactions={MOCK_TRANSACTIONS} 
                title="Sandwiches" 
                transactionType="sandwich"
                timeFilter={timeFilter}
              />
            </div>
            <div>
              <TransactionStream 
                initialTransactions={MOCK_TRANSACTIONS.filter(tx => tx.type === 'sandwich')} 
              />
            </div>
          </div>
        </TabsContent>
        <TabsContent value="arbitrages" className="space-y-4">
          <StatsSummary data={MOCK_STATS} transactionType="arbitrages" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <TransactionTable 
                transactions={MOCK_TRANSACTIONS} 
                title="Arbitrages" 
                transactionType="arbitrage"
                timeFilter={timeFilter}
              />
            </div>
            <div>
              <TransactionStream 
                initialTransactions={MOCK_TRANSACTIONS.filter(tx => tx.type === 'arbitrage')} 
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}