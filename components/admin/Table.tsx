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
    <table className="w-full text-sm border-t border-neutral-300">
      <thead>
        <tr className="text-neutral-500">
          {columns.map((c) => (
            <th
              key={String(c.key)}
              className="py-4 px-2 font-normal text-left"
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
            className="border-t border-neutral-200 hover:bg-neutral-200/40 transition"
          >
            {columns.map((c) => {
              const value = row[c.key];

              return (
                <td key={String(c.key)} className="py-4 px-2">
                  {c.render
                    ? c.render(value, row)
                    : String(value)}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
