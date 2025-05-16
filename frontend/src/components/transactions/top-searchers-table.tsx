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

interface Searcher {
  searcherAddress: string;
  numberOfTrades: number;
  profit: number;
}

interface TopSearchersTableProps {
  searchers: Searcher[];
  timeFilter: keyof typeof TIME_MAPPING_LABELS;
  mevType: string;
}

export function TopSearchersTable({
  searchers,
  timeFilter,
  mevType,
}: TopSearchersTableProps) {
  return (
    <div className="rounded-lg border bg-card">
      <div className="flex items-center justify-between p-4">
        <h3 className="text-lg font-semibold">
          {mevType === MEV_TYPES.SANDWICH ? "Top Attackers" : "Top Searchers"}
        </h3>
        <Badge variant="outline">{TIME_MAPPING_LABELS[timeFilter]}</Badge>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">#</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Trades</TableHead>
            <TableHead>Profit</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {searchers.map((searcher, index) => {
            const overallIndex = index + 1;
            return (
              <TableRow key={searcher.address} className="hover:bg-muted/50">
                <TableCell className="font-medium text-orange-500">
                  #{overallIndex}
                </TableCell>
                <TableCell>
                  <a
                    href={`https://solscan.io/account/${searcher.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 underline"
                  >
                    {searcher.searcherAddress.slice(0, 6)}...
                    {searcher.searcherAddress.slice(-6)}
                  </a>
                </TableCell>
                <TableCell>{searcher.numberOfTrades}</TableCell>
                <TableCell className="text-green-500">{`${formatCurrency(
                  searcher.profit,
                  7
                )} SOL`}</TableCell>
              </TableRow>
            );
          })}
          {searchers.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={4}
                className="text-center py-4 text-muted-foreground"
              >
                No searchers found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
