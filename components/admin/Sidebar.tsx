import Link from "next/link";

const links = [
  { name: "Products", href: "/admin/products" },
  { name: "Orders", href: "/admin/orders" },
  { name: "Users", href: "/admin/users" },
  { name: "Analytics", href: "/admin/analytics" },
  { name: "Settings", href: "/admin/settings" },
];

export default function Sidebar() {
  return (
    <aside className="w-60 border-r border-neutral-300 px-8 py-12">
      <p className="text-xs tracking-widest text-neutral-500 mb-10">
        ADMIN
      </p>

      <nav className="space-y-5 text-sm">
        {links.map((l) => (
          <Link
            key={l.name}
            href={l.href}
            className="block text-neutral-700 hover:text-black transition"
          >
            {l.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
