
import { ColumnDef } from "@tanstack/react-table";
import { Trade } from "@/types";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export const columns: ColumnDef<Trade>[] = [
  {
    accessorKey: "trade_date",
    header: "Date",
    cell: ({ row }) => {
      const date = new Date(row.getValue("trade_date"));
      return <div>{format(date, "MMM dd, yyyy")}</div>;
    },
  },
  {
    accessorKey: "symbol",
    header: "Symbol",
    cell: ({ row }) => {
      return (
        <div className="font-medium">{row.getValue("symbol")}</div>
      );
    },
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("type") as string;
      return (
        <Badge variant={type === "buy" ? "default" : "destructive"}>
          {type === "buy" ? "LONG" : "SHORT"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "entry_price",
    header: "Entry",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("entry_price"));
      const formatted = new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 5,
      }).format(amount);
      
      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "risk_reward",
    header: "R:R",
    cell: ({ row }) => {
      const rr = row.getValue("risk_reward") as number;
      return <div className="text-right">1:{rr.toFixed(2)}</div>;
    },
  },
  {
    accessorKey: "outcome",
    header: "Outcome",
    cell: ({ row }) => {
      const outcome = row.getValue("outcome") as string;
      let badgeVariant = "outline";
      
      if (outcome === "win") badgeVariant = "success";
      else if (outcome === "loss") badgeVariant = "destructive";
      
      return (
        <Badge variant={badgeVariant as any} className="uppercase">
          {outcome}
        </Badge>
      );
    },
  }
];
