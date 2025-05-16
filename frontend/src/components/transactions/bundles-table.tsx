import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowDownIcon, ArrowUpIcon } from "@radix-ui/react-icons";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { TransactionType } from "@/types";
import { Badge } from "@/components/ui/badge";
import { MEV_TYPES, TIME_MAPPING_LABELS } from "@/lib/constants";

interface BundlesTableProps {
  // @ts-ignore
  bundles: any[];
  title: string;
  transactionType: TransactionType;
  timeFilter: string;
  timeFilterLabel: string;
}

type SortField = "timestamp" | "profit" | "cost" | "extra";
type SortDirection = "asc" | "desc";

export function BundlesTable({
  bundles,
  title,
  transactionType,
  timeFilter,
  timeFilterLabel,
}: BundlesTableProps) {
  console.log('timeFilter', timeFilter)
  const [sortField, setSortField] = useState<SortField>("profit");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const isSandwich = transactionType === MEV_TYPES.SANDWICH;
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const sortedBundles = [...bundles]
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  return (
    <div className="rounded-lg border bg-card">
      <div className="flex items-center justify-between p-4">
        <h3 className="text-lg font-semibold">Top {title}</h3>
        <Badge variant="outline">{TIME_MAPPING_LABELS[timeFilter]}</Badge>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">#</TableHead>
            <TableHead>
              <button
                className="flex items-center gap-1"
                onClick={() => handleSort("timestamp")}
              >
                Time
                {sortField === "timestamp" &&
                  (sortDirection === "asc" ? (
                    <ArrowUpIcon className="h-4 w-4" />
                  ) : (
                    <ArrowDownIcon className="h-4 w-4" />
                  ))}
              </button>
            </TableHead>
            {isSandwich ? (
              <div></div>
            ) : (
              <TableHead>
                {/* <button
                  className="flex items-center gap-1"
                > */}
                Transaction
                {/* </button> */}
              </TableHead>
            )}
            <TableHead>
              <button
                className="flex items-center gap-1"
                onClick={() => handleSort("profit")}
              >
                Profit
                {sortField === "profit" &&
                  (sortDirection === "asc" ? (
                    <ArrowUpIcon className="h-4 w-4" />
                  ) : (
                    <ArrowDownIcon className="h-4 w-4" />
                  ))}
              </button>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedBundles.map((bundle, index) => {
            return (
              <TableRow key={bundle.bundleId} className="hover:bg-muted/50">
                <TableCell className="font-medium text-orange-500">
                  #{index + 1}
                </TableCell>
                <TableCell>{formatDateTime(bundle.blockTime)}</TableCell>
                <TableCell>
                  <a
                    href={`https://solscan.io/tx/${bundle.trades[0].txId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 underline"
                  >
                    {bundle.trades[0].txId.slice(0, 6)}...{bundle.trades[0].txId.slice(-6)}
                  </a>
                </TableCell>
                <TableCell className="text-green-500">{`${formatCurrency(
                  bundle.profit,
                  7
                )} SOL`}</TableCell>
              </TableRow>
            );
          })}
          {sortedBundles.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center py-4 text-muted-foreground"
              >
                No transactions found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
