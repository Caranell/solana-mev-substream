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
  transactionType: TransactionType;
  timeFilter: keyof typeof TIME_MAPPING_LABELS;
}

type SortField = "blockTime" | "profit" | "cost" | "extra";
type SortDirection = "asc" | "desc";

export function BundlesTable({
  bundles,
  title,
  transactionType,
  timeFilter,
}: BundlesTableProps) {
  const [sortField, setSortField] = useState<SortField>("profit");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const isSandwich = transactionType === MEV_TYPES.SANDWICH;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const sortedBundles = [...bundles].sort((a, b) => {
    let aValue: number | undefined;
    let bValue: number | undefined;

    if (sortField === "blockTime" || sortField === "profit") {
      aValue = a[sortField];
      bValue = b[sortField];
    } else if (sortField === "cost" || sortField === "extra") {
      aValue =
        typeof a[sortField] === "number" ? (a[sortField] as number) : undefined;
      bValue =
        typeof b[sortField] === "number" ? (b[sortField] as number) : undefined;
    }

    // Handle undefined values for sorting, treating them as minimal
    const valA =
      aValue === undefined
        ? sortDirection === "asc"
          ? Infinity
          : -Infinity
        : aValue;
    const valB =
      bValue === undefined
        ? sortDirection === "asc"
          ? Infinity
          : -Infinity
        : bValue;

    if (sortDirection === "asc") {
      return valA > valB ? 1 : -1;
    } else {
      return valA < valB ? 1 : -1;
    }
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedBundles = sortedBundles.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const totalPages = Math.ceil(sortedBundles.length / itemsPerPage);

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
        <Badge variant="outline">{TIME_MAPPING_LABELS[timeFilter]}</Badge>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">#</TableHead>
            <TableHead>
              {/* <button
                className="flex items-center gap-1"
                onClick={() => handleSort("blockTime")}
              > */}
              Time
              {/* {sortField === "blockTime" &&
                  (sortDirection === "asc" ? (
                    <ArrowUpIcon className="h-4 w-4" />
                  ) : (
                    <ArrowDownIcon className="h-4 w-4" />
                  ))} */}
              {/* </button> */}
            </TableHead>
            {isSandwich ? (
              <TableHead>Trades</TableHead>
            ) : (
              <TableHead>Transaction</TableHead>
            )}
            <TableHead>
              {/* <button
                className="flex items-center gap-1"
                onClick={() => handleSort("profit")}
              > */}
              <div className="flex items-center">
                Profit
                <ArrowDownIcon className="h-4 w-4" />
              </div>
              {/* {sortField === "profit" &&
                  (sortDirection === "asc" ? (
                    <ArrowUpIcon className="h-4 w-4" />
                  ) : (
                    <ArrowDownIcon className="h-4 w-4" />
                  ))} */}
              {/* </button> */}
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
                        href={`https://solscan.io/tx/${bundle.trades[2].txId}`}
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
                colSpan={isSandwich ? 3 : 4}
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
