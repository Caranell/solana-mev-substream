import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { useSocket } from "@/context/socket-context";
import { MEV_TYPES } from "@/lib/constants";
import { formatNumber } from "@/lib/utils";

export function TransactionStream({
  lastBundles,
  mevType,
}: {
  // @ts-ignore
  lastBundles: any[];
  mevType: string;
}) {
  const { recentBundles } = useSocket();
  const bundles =
    recentBundles.length > 0
      ? recentBundles.filter((bundle) => bundle.mevType === mevType)
      : lastBundles;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg">Transaction Stream</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-4 h-[440px] overflow-y-auto">
          {bundles.map((bundle) => (
            <div
              key={bundle.bundleId}
              className="flex flex-col gap-1 animate-in slide-in-from-right-5 duration-300"
            >
              {/* Top section: blockSlot and time */}
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col">
                  <div className="text-xs text-muted-foreground">
                    Block Slot
                  </div>
                  <div className="font-medium">{bundle.blockSlot || "N/A"}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Time</div>
                  <div className="font-medium">
                    {new Date(bundle.blockTime * 1000).toLocaleTimeString()}
                  </div>
                </div>
              </div>

              {/* Middle section: Simplified trades */}
              <div className="mt-2 bg-muted/30 p-2 rounded-md">
                {mevType === MEV_TYPES.ARBITRAGE ? (
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">
                      Arbitrage Swaps
                    </div>
                    {bundle.trades?.map((trade: any, index: number) => (
                      <Trade key={index} trade={trade} index={index} />
                    )) || (
                      <div className="text-sm">No trade data available</div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">
                      Sandwich Attack
                    </div>

                    {bundle.trades?.map((trade: any, index: number) => (
                      <SandwichTrade key={index} trade={trade} index={index} />
                    )) || (
                      <div className="text-sm">No trade data available</div>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom section: MEV type and profit */}
              <div className="grid grid-cols-2 items-center mt-2">
                <div className="flex items-center gap-1">
                  <Badge
                    variant="outline"
                    className={
                      bundle.mevType === MEV_TYPES.SANDWICH
                        ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                        : "bg-blue-50 text-blue-700 border-blue-200"
                    }
                  >
                    {bundle.mevType === MEV_TYPES.SANDWICH
                      ? "Sandwich"
                      : "Arbitrage"}
                  </Badge>
                </div>
                <div className="text-right font-mono font-medium text-green-600">
                  +{bundle.profit.toFixed(5)}
                </div>
              </div>
              <div className="h-px w-full bg-border my-2"></div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// @ts-ignore
const Trade = ({ trade, index }: { trade: any; index: number }) => {
  const [firstToken, secondToken] = getTokensFromTrade(trade);
  const [firstTokenAmount, secondTokenAmount] = getTokenAmountsFromTrade(trade);

  console.log("index", index);
  return (
    <div key={index} className="flex items-center gap-1 text-sm">
      <span className="font-medium">{`${firstToken} → ${secondToken}`}</span>

      <span className="text-xs text-muted-foreground ml-auto">
        {formatNumber(firstTokenAmount, 4)} →{" "}
        {formatNumber(secondTokenAmount, 4)}
      </span>
    </div>
  );
};

const SandwichTrade = ({ trade, index }: { trade: any; index: number }) => {
  console.log("trade", trade);
  const [firstToken, secondToken] = getTokensFromTrade(trade);
  const [firstTokenAmount, secondTokenAmount] = getTokenAmountsFromTrade(trade);

  return (
    <div key={index} className="flex items-center gap-1 text-sm">
      <span className="font-medium">{`${firstToken} → ${secondToken}`}</span>
      {index % 2 === 0 ? (
        <Badge
          variant="outline"
          className="bg-red-50 text-red-700 border-red-200"
        >
          Attacker
        </Badge>
      ) : (
        <Badge
          variant="outline"
          className="bg-yellow-50 text-yellow-700 border-yellow-200"
        >
          Victim
        </Badge>
      )}
      <span className="text-xs text-muted-foreground ml-auto">
        {formatNumber(firstTokenAmount, 4)} →{" "}
        {formatNumber(secondTokenAmount, 4)}
      </span>
    </div>
  );
};

const getTokensFromTrade = (trade: any) => {
  const firstToken =
    trade.baseAmount < 0 ? trade.baseTokenSymbol : trade.quoteTokenSymbol;
  const secondToken =
    trade.baseAmount < 0 ? trade.quoteTokenSymbol : trade.baseTokenSymbol;

  return [firstToken, secondToken];
};

const getTokenAmountsFromTrade = (trade: any) => {
  const firstTokenAmount =
    trade.baseAmount < 0 ? trade.baseAmount : trade.quoteAmount;
  const secondTokenAmount =
    trade.baseAmount < 0 ? trade.quoteAmount : trade.baseAmount;

  return [firstTokenAmount, secondTokenAmount];
};
