import { DataCard } from "@/components/ui/data-card";
// import {
//   Sandwich,
//   Banknote,
//   Users,
//   ShieldAlert,
//   Package,
//   ArrowRightLeft,
//   UserX,
// } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import { MEV_TYPES } from "@/lib/constants";

interface BaseBundlesStatistics {
  numberOfBundles: number;
  numberOfTransactions: number;
  totalProfit: number;
  uniqueSenders: number;
}

interface SandwichStatisticsOnly {
  victims: number;
  attackers: number;
}

type ArbitrageStats = BaseBundlesStatistics;
type SandwichStats = BaseBundlesStatistics & SandwichStatisticsOnly;

interface StatsSummaryProps {
  data: ArbitrageStats | SandwichStats;
  transactionType: string;
}

export function StatsSummary({ data, transactionType }: StatsSummaryProps) {
  const isSandwich = transactionType === MEV_TYPES.SANDWICH;

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      <DataCard
        title="Total Bundles"
        value={formatNumber(data?.numberOfBundles, 0)}
        // icon={<Package className="h-4 w-4" />}
        subtitle="Bundles processed"
      />
      <DataCard
        title="Total Transactions"
        value={formatNumber(data?.numberOfTransactions, 0)}
        // icon={
        //   isSandwich ? (
        //     <Sandwich className="h-4 w-4" />
        //   ) : (
        //     <ArrowRightLeft className="h-4 w-4" />
        //   )
        // }
        subtitle={`${
          transactionType.charAt(0).toUpperCase() + transactionType.slice(1)
        }`}
      />
      <DataCard
        title="Total Profit"
        value={formatNumber(data?.totalProfit)}
        // icon={<Banknote className="h-4 w-4" />}
        subtitle="SOL"
      />
      <DataCard
        title="Unique Senders"
        value={formatNumber(data?.uniqueSenders, 0)}
        // icon={<Users className="h-4 w-4" />}
        subtitle="Unique addresses"
      />
      {isSandwich && (
        <>
          <DataCard
            title="Victims"
            value={formatNumber((data as SandwichStats)?.victims, 0)}
            // icon={<UserX className="h-4 w-4 text-red-500" />}
            subtitle="Affected users"
          />
          <DataCard
            title="Unique Attackers"
            value={formatNumber((data as SandwichStats)?.attackers, 0)}
            // icon={<ShieldAlert className="h-4 w-4" />}
            subtitle="Unique bots"
          />
        </>
      )}
    </div>
  );
}
