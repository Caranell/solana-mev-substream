import { useState } from "react";
import { StatsSummary } from "@/components/dashboard/stats-summary";
import { TransactionTable } from "@/components/transactions/transaction-table";
import { TransactionStream } from "@/components/transactions/transaction-stream";
import { TimeFilterButtons } from "@/components/dashboard/time-filter";
import { MEV_TYPES, TIME_FILTERS, TIME_MAPPING } from "@/lib/constants";
import { TimeFilter } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { getBundles, getStatistics } from "@/lib/api";


export function Dashboard() {
  console.log('dashboard')
  const [timeFilter, setTimeFilter] = useState<TimeFilter>(
    TIME_MAPPING.ONE_WEEK as TimeFilter
  );
  const [txType, setTxType] = useState(MEV_TYPES.ARBITRAGE);

  const { data: transactions } = useQuery({
    queryKey: ["transactions", timeFilter, txType],
    queryFn: () =>
      getBundles({
        period: timeFilter,
        mevType: txType,
      }),
  });

  const { data: stats } = useQuery({
    queryKey: ["stats", timeFilter, txType],
    queryFn: () =>
      getStatistics({
        period: timeFilter,
        mevType: txType,
      }),
  });

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
        defaultValue={MEV_TYPES.ARBITRAGE}
        value={txType}
        onValueChange={(value) => setTxType(value)}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value={MEV_TYPES.SANDWICH}>Sandwiches</TabsTrigger>
          <TabsTrigger value={MEV_TYPES.ARBITRAGE}>Arbitrages</TabsTrigger>
        </TabsList>
        <TabsContent value={MEV_TYPES.SANDWICH} className="space-y-4">
          <StatsSummary data={stats} transactionType="sandwiches" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <TransactionTable
                transactions={transactions || []}
                title="Sandwiches"
                transactionType="sandwich"
                timeFilter={timeFilter}
              />
            </div>
            <div>
              <TransactionStream />
            </div>
          </div>
        </TabsContent>
        <TabsContent value={MEV_TYPES.ARBITRAGE} className="space-y-4">
          <StatsSummary data={stats} transactionType="arbitrages" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <TransactionTable
                transactions={transactions || []}
                title="Arbitrages"
                transactionType="arbitrage"
                timeFilter={timeFilter}
              />
            </div>
            <div>
              <TransactionStream />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
