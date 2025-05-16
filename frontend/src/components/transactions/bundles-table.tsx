import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { MEV_TYPES, TIME_MAPPING_LABELS } from "@/lib/constants";
import { Button } from "@/components/ui/button";

interface Bundle {
  bundleId: string;
  blockTime: number;
  profit: number;
  cost?: number;
  extra?: unknown;
  trades: { txId: string; signer: string }[];
}

interface BundlesTableProps {
  bundles: Bundle[];
  title: string;
  transactionType: string;
  timeFilter: string;
}

export function BundlesTable({
  bundles,
  title,
  transactionType,
  timeFilter,
}: BundlesTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const isSandwich = transactionType === MEV_TYPES.SANDWICH;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedBundles = bundles.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const totalPages = Math.ceil(bundles.length / itemsPerPage);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  return (
    <div className="rounded-lg border bg-card">
      <div className="flex items-center justify-between p-4">
        <h3 className="text-lg font-semibold">Top {title}</h3>
        <Badge variant="outline">{TIME_MAPPING_LABELS[timeFilter as keyof typeof TIME_MAPPING_LABELS]}</Badge>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">#</TableHead>
            <TableHead>
              Time
            </TableHead>
            {isSandwich ? (
              <TableHead>Trades</TableHead>
            ) : (
              <TableHead>Transaction</TableHead>
            )}
            <TableHead>
              <div className="flex items-center">
                Profit
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedBundles.map((bundle, index) => {
            const overallIndex = indexOfFirstItem + index + 1;
            return (
              <TableRow key={bundle.bundleId} className="hover:bg-muted/50">
                <TableCell className="font-medium text-orange-500">
                  #{overallIndex}
                </TableCell>
                <TableCell>{formatDateTime(bundle.blockTime)}</TableCell>
                {isSandwich ? (
                  <TableCell>
                    <div className="flex gap-3">
                      <a
                        href={`https://solscan.io/tx/${bundle.trades[0].txId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 underline"
                      >
                        attacker #1
                      </a>
                      <a
                        href={`https://solscan.io/tx/${bundle.trades[1].txId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 underline"
                      >
                        victim
                      </a>
                      <a
                        href={`https://solscan.io/tx/${bundle.trades?.[2]?.txId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 underline"
                      >
                        attacker #2
                      </a>
                    </div>
                  </TableCell>
                ) : (
                  <TableCell>
                    <a
                      href={`https://solscan.io/tx/${bundle.trades[0].txId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 underline"
                    >
                      {bundle.trades[0].txId.slice(0, 6)}...
                      {bundle.trades[0].txId.slice(-6)}
                    </a>
                  </TableCell>
                )}
                <TableCell className="text-green-500">{`${formatCurrency(
                  bundle.profit,
                  7
                )} SOL`}</TableCell>
              </TableRow>
            );
          })}
          {paginatedBundles.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={4}
                className="text-center py-4 text-muted-foreground"
              >
                No transactions found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {totalPages > 1 && (
        <div className="flex items-center justify-between p-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
