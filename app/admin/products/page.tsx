import Link from "next/link";
import Table, { Column } from "@/components/admin/Table";
import { Plus } from "lucide-react";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import { getAllProductsAdmin } from "@/app/actions/admin.actions";
import ProductActions from "@/components/admin/ProductActions";

type Product = {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  price: number;
  inventory: {
    quantity: number;
  } | null;
  category: {
    name: string;
  } | null;
  _count: {
    orderItems: number;
  };
};

const columns: Column<Product>[] = [
  { key: "name", label: "Product Name" },
  {
    key: "category",
    label: "Category",
    render: (v) => {
      const cat = v as Product["category"];
      return <span>{cat?.name || "Uncategorized"}</span>;
    },
  },
  {
    key: "active",
    label: "Status",
    render: (v) => (
      <span
        className={`text-xs font-semibold px-3 py-1 rounded-full ${
          v === true
            ? "bg-green-100 text-green-700"
            : "bg-slate-100 text-slate-700"
        }`}
      >
        {v === true ? "Active" : "Inactive"}
      </span>
    ),
  },
  {
    key: "price",
    label: "Price",
    render: (v) => `$${((v as number) / 100).toFixed(2)}`,
  },
  {
    key: "inventory",
    label: "Stock",
    render: (v) => {
      const inv = v as Product["inventory"];
      return <span>{inv?.quantity ?? 0}</span>;
    },
  },
  {
    key: "_count",
    label: "Sales",
    render: (v) => {
      const count = v as Product["_count"];
      return <span>{count.orderItems}</span>;
    },
  },
  {
    key: "id",
    label: "Actions",
    render: (_, row) => (
      <ProductActions productSlug={row.slug} productName={row.name} />
    ),
  },
];

export default async function ProductsPage() {
  const session = await auth();
  if (session?.user.role !== "ADMIN") {
    notFound();
  }

  const products = await getAllProductsAdmin();

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
        {products.length > 0 ? (
          <Table columns={columns} data={products} />
        ) : (
          <div className="text-center py-12 text-slate-500">
            <p className="text-lg font-medium">No products yet</p>
            <p className="text-sm mt-2">
              Create your first product to get started
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
