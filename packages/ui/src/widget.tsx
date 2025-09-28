import { TrendingDown, TrendingUp } from "lucide-react";
import { Card } from "./card";

interface WidgetProps {
  title: string;
  value: number;
  trend: number;
}

export function Widget({ title, value, trend }: WidgetProps) {
  const isPositive = trend >= 0;
  return (
    <Card className="flex flex-col gap-2 p-6">
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="text-3xl font-bold">{value}</p>
      <div className={`flex items-center gap-2 text-sm ${isPositive ? "text-emerald-500" : "text-rose-500"}`}>
        {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
        <span>{isPositive ? "+" : ""}{trend.toFixed(1)}%</span>
      </div>
    </Card>
  );
}
