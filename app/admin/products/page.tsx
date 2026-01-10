import Link from "next/link";
import Table, { Column } from "@/components/admin/Table";

type Product = {
  id: string;
  name: string;
  status: "Active" | "Draft";
  price: string;
  stock: number;
};

const columns: Column<Product>[] = [
  { key: "name", label: "Name" },
  {
    key: "status",
    label: "Status",
    render: (v) => (
      <span className="text-xs tracking-wide">
        {v}
      </span>
    ),
  },
  { key: "price", label: "Price" },
  { key: "stock", label: "Stock" },
];

const products: Product[] = [
  { id: "1", name: "Basic Slim Fit T-Shirt", status: "Active", price: "$99", stock: 32 },
  { id: "2", name: "Full Sleeve Zipper", status: "Draft", price: "$99", stock: 0 },
];

export default function ProductsPage() {
  return (
    <section className="space-y-12">
      <header className="flex justify-between items-end">
        <h1 className="text-3xl font-bold tracking-tight">
          Products
        </h1>

        <Link
          href="/admin/products/new"
          className="text-sm underline underline-offset-4"
        >
          Add Product
        </Link>
      </header>

      <Table
        columns={[
          ...columns,
          {
            key: "id",
            label: "",
            render: (_, row) => (
              <Link
                href={`/admin/products/${row.id}`}
                className="text-sm underline"
              >
                Edit
              </Link>
            ),
          },
        ]}
        data={products}
      />
    </section>
  );
}
