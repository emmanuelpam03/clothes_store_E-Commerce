export default function NewProductPage() {
  return (
    <section className="max-w-2xl space-y-12">
      <h1 className="text-3xl font-bold">New Product</h1>

      <div className="space-y-6 text-sm">
        <input className="w-full border-b border-neutral-300 bg-transparent py-2 outline-none" placeholder="Product name" />
        <input className="w-full border-b border-neutral-300 bg-transparent py-2 outline-none" placeholder="Price" />
        <input className="w-full border-b border-neutral-300 bg-transparent py-2 outline-none" placeholder="Stock" />
        <textarea className="w-full border-b border-neutral-300 bg-transparent py-2 outline-none" placeholder="Description" />

        <button className="mt-6 underline underline-offset-4">
          Save Product
        </button>
      </div>
    </section>
  );
}
