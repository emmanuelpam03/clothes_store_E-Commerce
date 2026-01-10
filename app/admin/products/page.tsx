import Link from "next/link";
import Table, { Column } from "@/components/admin/Table";
import { Plus } from "lucide-react";

type Product = {
  id: string;
  name: string;
  status: "Active" | "Draft";
  price: string;
  stock: number;
};

const columns: Column<Product>[] = [
  { key: "name", label: "Product Name" },
  {
    key: "status",
    label: "Status",
    render: (v) => (
      <span
        className={`text-xs font-semibold px-3 py-1 rounded-full ${
          v === "Active"
            ? "bg-green-100 text-green-700"
            : "bg-slate-100 text-slate-700"
        }`}
      >
        {String(v)}
      </span>
    ),
  },
  { key: "price", label: "Price" },
  { key: "stock", label: "Stock" },
  {
    key: "id",
    label: "",
    render: (_, row) => (
      <Link
        href={`/admin/products/${row.id}`}
        className="text-blue-600 hover:text-blue-800 font-medium text-sm"
      >
        Edit
      </Link>
    ),
  },
];

const products: Product[] = [
  {
    id: "1",
    name: "Basic Slim Fit T-Shirt",
    status: "Active",
    price: "$29.99",
    stock: 32,
  },
  {
    id: "2",
    name: "Full Sleeve Zipper",
    status: "Draft",
    price: "$49.99",
    stock: 0,
  },
  {
    id: "3",
    name: "Premium Cotton Hoodie",
    status: "Active",
    price: "$79.99",
    stock: 15,
  },
];

export default function ProductsPage() {
  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Products</h1>
          <p className="text-slate-600 mt-1">
            Manage your product catalog and inventory.
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
        >
          <Plus size={18} />
          Add Product
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-8">
        <Table columns={columns} data={products} />
      </div>
    </div>
  );
}
