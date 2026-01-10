export default function SettingsPage() {
  return (
    <section className="max-w-xl space-y-12">
      <h1 className="text-3xl font-bold">Settings</h1>

      <div className="space-y-6 text-sm">
        <input className="w-full border-b border-neutral-300 bg-transparent py-2 outline-none" placeholder="Store name" />
        <input className="w-full border-b border-neutral-300 bg-transparent py-2 outline-none" placeholder="Admin email" />

        <button className="underline underline-offset-4">
          Save Changes
        </button>
      </div>
    </section>
  );
}
