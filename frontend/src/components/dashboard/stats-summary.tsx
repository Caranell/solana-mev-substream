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

interface ArbitrageStatisticsOnly {
  uniqueArbitragePrograms: number;
}

type ArbitrageStats = BaseBundlesStatistics & ArbitrageStatisticsOnly;
type SandwichStats = BaseBundlesStatistics & SandwichStatisticsOnly;

interface StatsSummaryProps {
  data: ArbitrageStats | SandwichStats;
  transactionType: string;
}

export function StatsSummary({ data, transactionType }: StatsSummaryProps) {
  const isSandwich = transactionType === MEV_TYPES.SANDWICH;
  console.log('MEV_TYPES.SANDWICH', MEV_TYPES)
  console.log('isSandwich', isSandwich)

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-4 lg:grid-cols-4">
      {
        isSandwich ? (
          <SandwichSummary data={data as SandwichStats} />
        ) : (
          <ArbitrageSummary data={data as ArbitrageStats} />
        )
      }
    </div>
  );
}

export function SandwichSummary({ data }: { data: SandwichStats }) {
  return (
    <>
      <DataCard
        title="Sandwiches"
        value={formatNumber((data as SandwichStats)?.numberOfBundles, 0)}
      />
      <DataCard
        title="Profit"
        value={`${formatNumber(data?.totalProfit)} SOL`}
        subtitle="Value extracted from victims"
      />
      <DataCard
        title="Attackers"
        value={formatNumber((data as SandwichStats)?.attackers, 0)}
      />
      <DataCard
        title="Victims"
        value={formatNumber((data as SandwichStats)?.victims, 0)}
      />
    </>
  );
}
export function ArbitrageSummary({ data }: { data: ArbitrageStats }) {
  return (
    <>
      <DataCard
        title="Arbitrages"
        value={formatNumber(data?.numberOfBundles, 0)}
      />
      <DataCard
        title="Revenue"
        value={`${formatNumber(data?.totalProfit)} SOL`}
      />
      <DataCard
        title="Searchers"
        value={formatNumber(data?.uniqueSenders, 0)}
        subtitle="Number of searchers doing arbs"
      />
      <DataCard
        title="Arb programs"
        value={formatNumber(data?.uniqueArbitragePrograms, 0)}
        subtitle="Unique arb programs"
      />
    </>
  );
}
