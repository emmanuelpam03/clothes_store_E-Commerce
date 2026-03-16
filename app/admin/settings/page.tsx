"use client";

import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { toast } from "sonner";
import {
  getAdminStoreSettingsAction,
  getAvailableProductCollectionsAction,
  updateAdminStoreSettingsAction,
  type AdminStoreSettingsFormValues,
} from "@/app/actions/store-settings.actions";

export default function SettingsPage() {
  const [settings, setSettings] = useState<AdminStoreSettingsFormValues>({
    brandName: "Clothes Store",
    supportEmail: "support@clothesstore.com",
    currency: "USD",
    sizeSystem: "US",
    homeCollectionId: "",
    shippingOrigin: "United States",
    shippingCost: 10,
    returnWindowDays: 30,
    lowStockThreshold: 10,
    freeShippingThreshold: 100,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [availableCollections, setAvailableCollections] = useState<
    { id: string; name: string }[]
  >([]);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const [persistedSettings, collections] = await Promise.all([
          getAdminStoreSettingsAction(),
          getAvailableProductCollectionsAction(),
        ]);
        setSettings(persistedSettings);
        setAvailableCollections(collections);
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to load settings. Using defaults.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const isNumericField = [
      "shippingCost",
      "returnWindowDays",
      "lowStockThreshold",
      "freeShippingThreshold",
    ].includes(e.target.name);

    setSettings({
      ...settings,
      [e.target.name]: isNumericField
        ? Number(e.target.value || 0)
        : e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateAdminStoreSettingsAction(settings);
      toast.success("Settings saved successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save settings",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 bg-slate-50 min-h-screen">
        <div className="bg-white rounded-xl border border-slate-200 p-8 max-w-4xl">
          <p className="text-slate-600">Loading store settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
      <div>
        <h1 className="text-4xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-600 mt-1">
          Manage your brand, fulfillment, and fit preferences.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl border border-slate-200 p-8 space-y-8 max-w-4xl"
      >
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900">
            Brand & Support
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Brand Name
              </label>
              <input
                type="text"
                name="brandName"
                value={settings.brandName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="brandName"
                className="block text-sm font-semibold text-slate-700 mb-2"
              >
                Support Email
              </label>
              <input
                type="email"
                name="supportEmail"
                value={settings.supportEmail}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </section>

        <section className="space-y-4 pt-6 border-t border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">
            Pricing & Merchandising
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Currency
              </label>
              <select
                name="currency"
                value={settings.currency}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>USD</option>
                <option>EUR</option>
                <option>GBP</option>
                <option>JPY</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Size System
              </label>
              <select
                name="sizeSystem"
                value={settings.sizeSystem}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>US</option>
                <option>EU</option>
                <option>UK</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Low Stock Threshold
              </label>
              <input
                type="number"
                min="0"
                name="lowStockThreshold"
                value={settings.lowStockThreshold}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="homeCollectionId"
                className="block text-sm font-semibold text-slate-700 mb-2"
              >
                Homepage Featured Collection
              </label>
              <select
                id="homeCollectionId"
                name="homeCollectionId"
                value={settings.homeCollectionId}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={availableCollections.length === 0}
              >
                {availableCollections.length === 0 ? (
                  <option value="">No collections found</option>
                ) : (
                  [
                    <option key="" value="">
                      Select a collection
                    </option>,
                    ...availableCollections.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    )),
                  ]
                )}
              </select>
              <p className="text-xs text-slate-500 mt-2">
                Shows featured products from the selected collection in the
                homepage “NEW COLLECTION” slider.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-4 pt-6 border-t border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">
            Shipping & Returns
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Shipping Origin
              </label>
              <input
                type="text"
                name="shippingOrigin"
                value={settings.shippingOrigin}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Shipping Cost
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                name="shippingCost"
                value={settings.shippingCost}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Free Shipping Threshold
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                name="freeShippingThreshold"
                value={settings.freeShippingThreshold}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Return Window (Days)
              </label>
              <input
                type="number"
                min="0"
                name="returnWindowDays"
                value={settings.returnWindowDays}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </section>

        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition"
          >
            <Save size={18} />
            {saving ? "Saving..." : "Save Settings"}
          </button>
          <p className="text-xs text-slate-500 mt-3">
            These settings are used by checkout, cart messaging, and return
            policy windows.
          </p>
        </div>
      </form>

      <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-4xl">
        <h3 className="text-lg font-semibold text-slate-900 mb-3">
          Storefront Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="rounded-lg bg-slate-50 p-4 border border-slate-200">
            <p className="text-slate-500">Brand</p>
            <p className="text-slate-900 font-medium mt-1">
              {settings.brandName}
            </p>
          </div>
          <div className="rounded-lg bg-slate-50 p-4 border border-slate-200">
            <p className="text-slate-500">Support</p>
            <p className="text-slate-900 font-medium mt-1">
              {settings.supportEmail}
            </p>
          </div>
          <div className="rounded-lg bg-slate-50 p-4 border border-slate-200">
            <p className="text-slate-500">Currency & Size</p>
            <p className="text-slate-900 font-medium mt-1">
              {settings.currency} · {settings.sizeSystem}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
