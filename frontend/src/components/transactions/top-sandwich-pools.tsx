import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { TIME_MAPPING_LABELS } from "@/lib/constants";

interface SandwichPool {
  firstToken: string;
  secondToken: string;
  firstTokenSymbol: string;
  secondTokenSymbol: string;
  numberOfTrades: number;
  profit: number;
}

interface TopSandwichPoolsTableProps {
  pools: SandwichPool[];
  title: string;
  timeFilter: string;
}

export function TopSandwichPoolsTable({
  pools,
  title,
  timeFilter,
}: TopSandwichPoolsTableProps) {
  return (
    <div className="rounded-lg border bg-card">
      <div className="flex items-center justify-between p-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <Badge variant="outline">{TIME_MAPPING_LABELS[timeFilter as keyof typeof TIME_MAPPING_LABELS]}</Badge>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">#</TableHead>
            <TableHead>Pool</TableHead>
            <TableHead>Trades</TableHead>
            <TableHead>Profit</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pools.map((pool, index) => {
            const overallIndex = index + 1;
            return (
              <TableRow key={`${pool.firstToken}-${pool.secondToken}-${index}`} className="hover:bg-muted/50">
                <TableCell className="font-medium text-orange-500">
                  #{overallIndex}
                </TableCell>
                <TableCell>
                    <a
                      href={`https://solscan.io/account/${pool.firstToken}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 underline"
                    >
                      {pool.firstTokenSymbol || "UNKNOWN"}
                    </a>
                    {" / "}
                    <a
                      href={`https://solscan.io/account/${pool.secondToken}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 underline"
                    >
                      {pool.secondTokenSymbol || "UNKNOWN"}
                    </a>
                </TableCell>
                <TableCell>{pool.numberOfTrades}</TableCell>
                <TableCell className="text-green-500">{`${formatCurrency(
                  pool.profit,
                  7
                )} SOL`}</TableCell>
              </TableRow>
            );
          })}
          {pools.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={4}
                className="text-center py-4 text-muted-foreground"
              >
                No programs found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
