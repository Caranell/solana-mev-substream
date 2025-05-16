import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
// import { CircleHelp, RefreshCcw } from "lucide-react";
import { Transaction } from "@/types";
// import { truncateAddress } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function TransactionStream() {
  const [transactions] = useState<Transaction[]>([]);
  const [isConnected] = useState(false);
  const [lastUpdate] = useState<Date | null>(null);

  // useEffect(() => {
  //   // Simulating WebSocket connection for demo purposes
  //   setIsConnected(true);
  //   setLastUpdate(new Date());

  //   // Mock new transactions coming in
  //   const interval = setInterval(() => {
  //     // Generate a random transaction based on existing ones
  //     const randomIndex = Math.floor(
  //       Math.random() * initialTransactions.length
  //     );
  //     const randomTx = { ...initialTransactions[randomIndex] };

  //     // Modify it slightly to simulate a new transaction
  //     randomTx.id = `new-${Date.now()}`;
  //     randomTx.timestamp = Date.now();
  //     randomTx.profit = randomTx.profit * (0.9 + Math.random() * 0.2);

  //     // Add new transaction to the top and remove last one
  //     setTransactions((prev) => [randomTx, ...prev.slice(0, 4)]);
  //     setLastUpdate(new Date());
  //   }, 5000);

  //   return () => {
  //     clearInterval(interval);
  //     setIsConnected(false);
  //   };
  // }, []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg">Transaction Stream</CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                {/* <CircleHelp className="h-4 w-4 text-muted-foreground" /> */}
              </TooltipTrigger>
              <TooltipContent>
                <p>Live transaction stream of MEV activity</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="flex items-center gap-2">
          {isConnected ? (
            <Badge
              variant="outline"
              className="bg-green-50 text-green-700 border-green-200 gap-1"
            >
              <span className="h-2 w-2 rounded-full bg-green-500"></span>{" "}
              Connected
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="bg-red-50 text-red-700 border-red-200 gap-1"
            >
              <span className="h-2 w-2 rounded-full bg-red-500"></span>{" "}
              Disconnected
            </Badge>
          )}
          {/* <RefreshCcw className="h-4 w-4 text-muted-foreground cursor-pointer" /> */}
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="text-xs text-muted-foreground mb-2">
          Last update:{" "}
          {lastUpdate
            ? new Intl.DateTimeFormat("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              }).format(lastUpdate)
            : "Never"}
        </div>
        <div className="space-y-4">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="flex flex-col gap-1 animate-in slide-in-from-right-5 duration-300"
            >
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col">
                  <div className="text-xs text-muted-foreground">Bot</div>
                  <div className="font-medium">{tx.bot}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">
                    {new Date(tx.timestamp).toLocaleTimeString()}
                  </div>
                  <div className="font-mono text-xs">
                    {tx.id.substring(0, 12)}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 items-center mt-1">
                <div className="flex items-center gap-1">
                  <Badge
                    variant="outline"
                    className={
                      tx.type === "sandwich"
                        ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                        : "bg-blue-50 text-blue-700 border-blue-200"
                    }
                  >
                    {tx.type}
                  </Badge>
                </div>
                <div className="text-right font-mono font-medium text-green-600">
                  +{tx.profit.toFixed(3)}
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
