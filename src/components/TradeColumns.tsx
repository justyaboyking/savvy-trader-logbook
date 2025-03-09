
import { ColumnDef } from "@tanstack/react-table";
import { Trade } from "@/types";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
      const amount = parseFloat(String(row.getValue("entry_price")));
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
      const rr = parseFloat(String(row.getValue("risk_reward")));
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
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      // Using an inline component with hooks
      return <EditButton tradeId={row.original.id} />;
    },
  }
];

// Separate component to use hooks
function EditButton({ tradeId }: { tradeId: string }) {
  const navigate = useNavigate();
  
  const handleEdit = () => {
    navigate(`/edit-trade/${tradeId}`);
  };
  
  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={handleEdit}
      className="h-8 w-8"
    >
      <Edit className="h-4 w-4" />
    </Button>
  );
}
