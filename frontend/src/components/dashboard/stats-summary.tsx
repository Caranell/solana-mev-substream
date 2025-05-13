import React from 'react';
import { DataCard } from '@/components/ui/data-card';
import { Sandwich, Banknote, AlertTriangle, Users, ShieldAlert } from 'lucide-react';
import { formatNumber } from '@/lib/utils';
import { StatsData } from '@/types';

interface StatsSummaryProps {
  data: StatsData;
  transactionType: 'sandwiches' | 'arbitrages';
}

export function StatsSummary({ data, transactionType }: StatsSummaryProps) {
  const stats = data[transactionType];

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
      <DataCard
        title="Total Transactions"
        value={formatNumber(stats.totalTransactions, 0)}
        icon={transactionType === 'sandwiches' ? <Sandwich className="h-4 w-4" /> : <Banknote className="h-4 w-4" />}
        subtitle={`${transactionType.charAt(0).toUpperCase() + transactionType.slice(1)}`}
      />
      <DataCard
        title="Extracted Value"
        value={formatNumber(stats.extractedValue)}
        icon={<Banknote className="h-4 w-4" />}
        subtitle="SOL"
        trend="up"
        trendValue="2.5% from last period"
      />
      <DataCard
        title="Cost"
        value={formatNumber(stats.cost)}
        icon={<AlertTriangle className="h-4 w-4" />}
        subtitle="SOL"
      />
      <DataCard
        title="Victims"
        value={formatNumber(stats.victims, 0)}
        icon={<Users className="h-4 w-4" />}
        subtitle="Unique addresses"
      />
      <DataCard
        title="Attackers"
        value={formatNumber(stats.attackers, 0)}
        icon={<ShieldAlert className="h-4 w-4" />}
        subtitle="Unique bots"
      />
    </div>
  );
}