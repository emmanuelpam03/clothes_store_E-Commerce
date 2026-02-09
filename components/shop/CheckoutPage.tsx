"use client";

import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart/cart";
import { createOrderAction } from "@/app/actions/order.actions";
import { toast } from "sonner";

interface FormData {
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  zipCode: string;
  country: string;
  paymentMethod: "cod"; // Pay on Delivery
}

export default function Checkout() {
  const [step, setStep] = useState<"INFORMATION" | "SHIPPING" | "PAYMENT">(
    "INFORMATION",
  );
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { items } = useCart();

  const [formData, setFormData] = useState<FormData>({
    email: "",
    phone: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    zipCode: "",
    country: "",
    paymentMethod: "cod",
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});

  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const shipping = 5;
  const total = subtotal + shipping;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateStep = (currentStep: typeof step): boolean => {
    const newErrors: Partial<FormData> = {};

    // Only validate fields for current step
    if (currentStep === "INFORMATION") {
      if (!formData.email) newErrors.email = "Email is required";
      if (!formData.phone) newErrors.phone = "Phone is required";
    } else if (currentStep === "SHIPPING") {
      if (!formData.firstName) newErrors.firstName = "First name is required";
      if (!formData.lastName) newErrors.lastName = "Last name is required";
      if (!formData.address) newErrors.address = "Address is required";
      if (!formData.city) newErrors.city = "City is required";
      if (!formData.zipCode) newErrors.zipCode = "Zip code is required";
      if (!formData.country) newErrors.country = "Country is required";
    }
    // PAYMENT step has no validation needed

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (!validateStep(step)) return;

    if (step === "INFORMATION") {
      setStep("SHIPPING");
    } else if (step === "SHIPPING") {
      setStep("PAYMENT");
    }
  };

  const handlePlaceOrder = async () => {
    // Validate all required fields before placing order
    const allErrors: Partial<FormData> = {};
    if (!formData.email) allErrors.email = "Email is required";
    if (!formData.phone) allErrors.phone = "Phone is required";
    if (!formData.firstName) allErrors.firstName = "First name is required";
    if (!formData.lastName) allErrors.lastName = "Last name is required";
    if (!formData.address) allErrors.address = "Address is required";
    if (!formData.city) allErrors.city = "City is required";
    if (!formData.zipCode) allErrors.zipCode = "Zip code is required";
    if (!formData.country) allErrors.country = "Country is required";

    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    try {
      const cartItems = items.map((item) => ({
        productId: item.id,
        quantity: item.qty,
      }));

      await createOrderAction(cartItems);
      toast.success("Order placed successfully! Pay on delivery.");
      router.push("/order");
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create order",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const stepClasses = (stepName: typeof step) =>
    `text-sm font-semibold ${
      stepName === step ? "text-black" : "text-neutral-400"
    }`;

  return (
    <div className="min-h-screen bg-neutral-100">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-black mb-8">CHECKOUT</h1>

        {/* STEPS */}
        <div className="flex gap-8 mb-12">
          <span className={stepClasses("INFORMATION")}>INFORMATION</span>
          <span className={stepClasses("SHIPPING")}>SHIPPING</span>
          <span className={stepClasses("PAYMENT")}>PAYMENT</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* LEFT — FORM */}
          <div className="space-y-6">
            {/* INFORMATION */}
            {(step === "INFORMATION" ||
              step === "SHIPPING" ||
              step === "PAYMENT") && (
              <>
                <div>
                  <h2 className="text-sm font-semibold mb-4">CONTACT INFO</h2>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full border px-4 py-3 mb-3 ${
                      errors.email ? "border-red-500" : "border-neutral-300"
                    }`}
                    disabled={step !== "INFORMATION"}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs">{errors.email}</p>
                  )}

                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full border px-4 py-3 ${
                      errors.phone ? "border-red-500" : "border-neutral-300"
                    }`}
                    disabled={step !== "INFORMATION"}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-xs">{errors.phone}</p>
                  )}
                </div>
              </>
            )}

            {/* SHIPPING */}
            {(step === "SHIPPING" || step === "PAYMENT") && (
              <>
                <div>
                  <h2 className="text-sm font-semibold mb-4">
                    SHIPPING ADDRESS
                  </h2>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <input
                      type="text"
                      name="firstName"
                      placeholder="First Name"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={`w-full border px-4 py-3 ${
                        errors.firstName
                          ? "border-red-500"
                          : "border-neutral-300"
                      }`}
                      disabled={step !== "SHIPPING"}
                    />
                    <input
                      type="text"
                      name="lastName"
                      placeholder="Last Name"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={`w-full border px-4 py-3 ${
                        errors.lastName
                          ? "border-red-500"
                          : "border-neutral-300"
                      }`}
                      disabled={step !== "SHIPPING"}
                    />
                  </div>

                  <input
                    type="text"
                    name="address"
                    placeholder="Address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className={`w-full border px-4 py-3 mb-3 ${
                      errors.address ? "border-red-500" : "border-neutral-300"
                    }`}
                    disabled={step !== "SHIPPING"}
                  />

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <input
                      type="text"
                      name="city"
                      placeholder="City"
                      value={formData.city}
                      onChange={handleInputChange}
                      className={`w-full border px-4 py-3 ${
                        errors.city ? "border-red-500" : "border-neutral-300"
                      }`}
                      disabled={step !== "SHIPPING"}
                    />
                    <input
                      type="text"
                      name="zipCode"
                      placeholder="Zip Code"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      className={`w-full border px-4 py-3 ${
                        errors.zipCode ? "border-red-500" : "border-neutral-300"
                      }`}
                      disabled={step !== "SHIPPING"}
                    />
                  </div>

                  <input
                    type="text"
                    name="country"
                    placeholder="Country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className={`w-full border px-4 py-3 ${
                      errors.country ? "border-red-500" : "border-neutral-300"
                    }`}
                    disabled={step !== "SHIPPING"}
                  />
                </div>
              </>
            )}

            {/* PAYMENT */}
            {step === "PAYMENT" && (
              <>
                <div>
                  <h2 className="text-sm font-semibold mb-4">PAYMENT METHOD</h2>
                  <label className="flex items-center border border-neutral-300 p-4 cursor-pointer hover:bg-neutral-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={formData.paymentMethod === "cod"}
                      onChange={handleInputChange}
                      className="mr-3"
                    />
                    <div>
                      <p className="text-sm font-semibold">Pay on Delivery</p>
                      <p className="text-xs text-neutral-500">
                        Pay when you receive your order
                      </p>
                    </div>
                  </label>
                </div>
              </>
            )}

            {/* BUTTONS */}
            <div className="flex gap-4 pt-6">
              {step !== "INFORMATION" && (
                <button
                  onClick={() => {
                    if (step === "SHIPPING") setStep("INFORMATION");
                    else if (step === "PAYMENT") setStep("SHIPPING");
                  }}
                  className="flex-1 bg-neutral-300 text-black px-6 py-4 text-xs uppercase font-semibold hover:bg-neutral-400 transition"
                >
                  <ArrowLeft className="inline mr-2 h-4 w-4" />
                  Back
                </button>
              )}
              {step !== "PAYMENT" ? (
                <button
                  onClick={handleNextStep}
                  className="flex-1 bg-black text-white px-6 py-4 text-xs uppercase font-semibold hover:bg-neutral-800 transition"
                >
                  Continue to {step === "INFORMATION" ? "Shipping" : "Payment"}
                </button>
              ) : (
                <button
                  onClick={handlePlaceOrder}
                  disabled={isLoading}
                  className="flex-1 bg-black text-white px-6 py-4 text-xs uppercase font-semibold hover:bg-neutral-800 transition disabled:opacity-60"
                >
                  {isLoading ? "Placing Order..." : "Place Order"}
                </button>
              )}
            </div>
          </div>

          {/* RIGHT — ORDER SUMMARY */}
          <div className="border border-neutral-300 p-8 bg-white h-fit">
            <h2 className="text-sm font-semibold mb-6">YOUR ORDER</h2>

            <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 pb-4 border-b">
                  {item.image && (
                    <div className="relative w-20 h-20 shrink-0">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{item.title}</p>
                    <p className="text-xs text-neutral-500">
                      {item.subtitle} x {item.qty}
                    </p>
                    <p className="text-sm mt-2">
                      ${(item.price * item.qty).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2 border-t pt-4">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Shipping</span>
                <span>${shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-bold border-t pt-4 mt-4">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
