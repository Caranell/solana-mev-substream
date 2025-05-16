import { useState } from "react";
import { StatsSummary } from "@/components/dashboard/stats-summary";
import { BundlesTable } from "@/components/transactions/bundles-table";
import { TransactionStream } from "@/components/transactions/transaction-stream";
import { TimeFilterButtons } from "@/components/dashboard/time-filter";
import {
  MEV_TYPES,
  TIME_FILTERS,
  TIME_MAPPING,
  TIME_MAPPING_VALUES,
} from "@/lib/constants";
import { TimeFilter } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { getBundles, getStatistics } from "@/lib/api";

const MEV_TYPES_LABELS = {
  [MEV_TYPES.ARBITRAGE]: "🔄 Arbitrages",
  [MEV_TYPES.SANDWICH]: "🥪 Sandwiches",
};

export function Dashboard() {
  const [timeFilter, setTimeFilter] = useState<string>(TIME_MAPPING["7D"]);
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
            {MEV_TYPES_LABELS[txType]}
          </h1>
          {/* <p className="text-muted-foreground">
            Monitor {MEV_TYPES_LABELS[txType]} transactions on Solana
          </p> */}
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
          <TabsTrigger value={MEV_TYPES.ARBITRAGE}>🔄 Arbitrages</TabsTrigger>
          <TabsTrigger value={MEV_TYPES.SANDWICH}>🥪 Sandwiches</TabsTrigger>
        </TabsList>
        <TabsContent value={MEV_TYPES.SANDWICH} className="space-y-4">
          <StatsSummary data={stats} transactionType={MEV_TYPES.SANDWICH} />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <BundlesTable
                bundles={transactions || []}
                title="Sandwiches"
                transactionType={MEV_TYPES.SANDWICH}
                timeFilter={timeFilter}
              />
            </div>
            <div>
              <TransactionStream mevType={MEV_TYPES.SANDWICH} />
            </div>
          </div>
        </TabsContent>
        <TabsContent value={MEV_TYPES.ARBITRAGE} className="space-y-4">
          <StatsSummary data={stats} transactionType={MEV_TYPES.ARBITRAGE} />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <BundlesTable
                bundles={transactions || []}
                title="Arbitrages"
                transactionType={MEV_TYPES.ARBITRAGE}
                timeFilter={timeFilter}
                timeFilterLabel={TIME_MAPPING[timeFilter]}
              />
            </div>
            <div>
              <TransactionStream mevType={MEV_TYPES.ARBITRAGE} />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
