type RoleBadgeProps = {
  role?: "USER" | "ADMIN";
};

export default function RoleBadge({ role }: RoleBadgeProps) {
  if (role !== "ADMIN") return null;

  return (
    <span className="ml-2 rounded-full bg-red-600 px-2 py-0.5 text-xs font-semibold text-white">
      Admin
    </span>
  );
}
