export default function OrdersPage() {
  return (
    <section className="space-y-12">
      <h1 className="text-3xl font-bold">Orders</h1>

      <div className="border border-neutral-300 p-8 flex justify-between">
        <div>
          <p className="text-sm text-neutral-500">Order #10234</p>
          <p className="mt-2">2 Items</p>
        </div>

        <div className="text-right">
          <p className="text-sm text-neutral-500">Total</p>
          <p>$190</p>
        </div>
      </div>
    </section>
  );
}
