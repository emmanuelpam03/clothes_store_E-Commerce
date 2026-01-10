export default function StatCard({
  title,
  value,
  change,
  icon: Icon,
}: {
  title: string;
  value: string;
  change?: string;
  icon?: React.ReactNode;
}) {
  const isPositive = change?.startsWith("+");

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="text-sm text-slate-600 font-medium">{title}</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
          {change && (
            <p
              className={`text-xs font-semibold mt-2 ${
                isPositive ? "text-green-600" : "text-red-600"
              }`}
            >
              {change} from last month
            </p>
          )}
        </div>
        {Icon && <div className="text-slate-300">{Icon}</div>}
      </div>
    </div>
  );
}
