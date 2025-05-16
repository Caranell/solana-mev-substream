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

interface ArbitrageProgram {
  program: string;
  numberOfTrades: number;
  profit: number;
}

interface TopArbProgramsTableProps {
  programs: ArbitrageProgram[];
  title: string; // e.g., "JUP Arbitrages", "Token X Arbitrages"
  timeFilter: keyof typeof TIME_MAPPING_LABELS;
}

export function TopArbProgramsTable({
  programs,
  title,
  timeFilter,
}: TopArbProgramsTableProps) {
  return (
    <div className="rounded-lg border bg-card">
      <div className="flex items-center justify-between p-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <Badge variant="outline">{TIME_MAPPING_LABELS[timeFilter]}</Badge>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">#</TableHead>
            <TableHead>Program</TableHead>
            <TableHead>Trades</TableHead>
            <TableHead>Profit</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {programs.map((program, index) => {
            const overallIndex = index + 1;
            return (
              <TableRow key={program.program} className="hover:bg-muted/50">
                <TableCell className="font-medium text-orange-500">
                  #{overallIndex}
                </TableCell>
                <TableCell>
                  <a
                    href={`https://solscan.io/account/${program.program}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 underline"
                  >
                    {program.program.slice(0, 6)}...
                    {program.program.slice(-6)}
                  </a>
                </TableCell>
                <TableCell>{program.numberOfTrades}</TableCell>
                <TableCell className="text-green-500">{`${formatCurrency(
                  program.profit,
                  7
                )} SOL`}</TableCell>
              </TableRow>
            );
          })}
          {programs.length === 0 && (
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
