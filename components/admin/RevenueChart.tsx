"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  formatCurrencyCompactFromCents,
  formatCurrencyFromCents,
} from "@/lib/money";
import { useStoreSettings } from "@/lib/store-settings-client";

type MonthData = {
  month: string;
  revenue: number;
  orders: number;
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: ReadonlyArray<{
    value: number;
    payload: MonthData;
  }>;
  currency: string;
}

function CustomTooltip({ active, payload, currency }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-4">
        <p className="font-semibold text-slate-900 mb-2">
          {payload[0].payload.month}
        </p>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-sm text-slate-600">Revenue:</span>
            <span className="text-sm font-bold text-slate-900">
              {formatCurrencyFromCents(Number(payload[0].value), currency)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500" />
            <span className="text-sm text-slate-600">Orders:</span>
            <span className="text-sm font-bold text-slate-900">
              {payload[1]?.value || 0}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
}

export default function RevenueChart({ data }: { data: MonthData[] }) {
  const { currency } = useStoreSettings();

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-80 flex items-center justify-center text-slate-500">
        No revenue data available
      </div>
    );
  }

  return (
    <div className="w-full min-h-80 h-80">
      <ResponsiveContainer width="100%" height="100%" minHeight={320}>
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="month"
            stroke="#64748b"
            style={{ fontSize: "12px" }}
            tickLine={false}
          />
          <YAxis
            yAxisId="left"
            stroke="#3b82f6"
            style={{ fontSize: "12px" }}
            tickLine={false}
            tickFormatter={(value: number) =>
              formatCurrencyCompactFromCents(value, currency)
            }
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke="#a855f7"
            style={{ fontSize: "12px" }}
            tickLine={false}
          />
          <Tooltip
            content={(props) => (
              <CustomTooltip {...props} currency={currency} />
            )}
          />
          <Legend
            wrapperStyle={{ fontSize: "14px", paddingTop: "20px" }}
            iconType="circle"
          />
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="revenue"
            stroke="#3b82f6"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorRevenue)"
            name="Revenue"
          />
          <Area
            yAxisId="right"
            type="monotone"
            dataKey="orders"
            stroke="#a855f7"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorOrders)"
            name="Orders"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
