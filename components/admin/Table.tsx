export type Column<T> = {
  key: keyof T;
  label: string;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
};

export default function Table<T extends Record<string, unknown>>({
  columns,
  data,
}: {
  columns: Column<T>[];
  data: T[];
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            {columns.map((c) => (
              <th
                key={String(c.key)}
                className="py-4 px-6 font-semibold text-slate-700 text-left"
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.map((row, i) => (
            <tr
              key={i}
              className="border-b border-slate-100 hover:bg-blue-50 transition-colors"
            >
              {columns.map((c) => {
                const value = row[c.key];

                return (
                  <td key={String(c.key)} className="py-4 px-6 text-slate-700">
                    {c.render ? c.render(value, row) : String(value)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {data.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-500">No data available</p>
        </div>
      )}
    </div>
  );
}
