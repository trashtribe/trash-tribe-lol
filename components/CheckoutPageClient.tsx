"use client";

import type { User } from "@supabase/supabase-js";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useAuth } from "@/components/AuthProvider";
import type { CartItem } from "@/components/CartProvider";
import { useCart } from "@/components/CartProvider";
import { CheckoutCardPayment } from "@/components/CheckoutCardPayment";
import {
  computeCheckoutTotalEur,
  eurToStripeCents,
  getShippingEur,
} from "@/lib/checkout-totals";
import {
  cartItemsToStoredLines,
  saveCompletedOrder,
} from "@/lib/checkout-order-storage";
import { formatEuro } from "@/lib/format-currency";
import { createBrowserSupabaseClient } from "@/lib/supabase";

const COUNTRIES = [
  "Ireland",
  "United Kingdom",
  "France",
  "Germany",
  "Spain",
  "Italy",
  "Netherlands",
  "Belgium",
  "Portugal",
  "Austria",
  "Sweden",
  "Denmark",
  "Finland",
  "Poland",
  "United States",
  "Canada",
  "Australia",
  "Japan",
  "Other",
] as const;

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function digitCount(value: string) {
  return value.replace(/\D/g, "").length;
}

const inputClass =
  "mt-1 w-full border border-black/15 bg-white px-3 py-2.5 text-sm text-black placeholder:text-black/35 focus:border-black focus:outline-none focus:ring-1 focus:ring-black/20";
const labelClass =
  "text-[11px] font-bold tracking-[0.14em] text-black uppercase";
const errorClass = "mt-1 text-xs text-[#ff53e3]";

function cartLinesForApi(items: CartItem[]) {
  return items.map((i) => ({
    productId: i.productId,
    quantity: i.quantity,
    unitPrice: i.unitPrice,
    ...(i.variantId !== undefined ? { printifyVariantId: i.variantId } : {}),
  }));
}

function cartSignature(items: CartItem[]) {
  return items.map((i) => `${i.key}:${i.quantity}`).join("|");
}

export function CheckoutPageClient({
  onStripeElementsActiveChange,
}: {
  /** Enable Stripe Elements only after the customer starts payment (receives a PaymentIntent). */
  onStripeElementsActiveChange?: (active: boolean) => void;
} = {}) {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  // Same AuthProvider as root layout (`app/layout.tsx`) — wraps all routes via `<Providers>`; session is app-wide.
  const { user, loading: authLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");
  const [phone, setPhone] = useState("");
  const [shippingMethod, setShippingMethod] = useState<"standard" | "express">(
    "standard",
  );

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [summarySnapshot, setSummarySnapshot] = useState<CartItem[] | null>(
    null,
  );
  const [totalsSnapshot, setTotalsSnapshot] = useState<{
    subtotal: number;
    shipping: number;
    total: number;
  } | null>(null);

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [prepareError, setPrepareError] = useState<string | null>(null);
  const [preparingPayment, setPreparingPayment] = useState(false);

  const cartSig = useMemo(() => cartSignature(items), [items]);

  useEffect(() => {
    setClientSecret(null);
    setPrepareError(null);
    onStripeElementsActiveChange?.(false);
  }, [shippingMethod, cartSig, onStripeElementsActiveChange]);

  const displayItems = summarySnapshot ?? items;
  const displaySubtotal = totalsSnapshot?.subtotal ?? subtotal;
  const displayShipping =
    totalsSnapshot?.shipping ??
    getShippingEur(displaySubtotal, shippingMethod);
  const displayTotal =
    totalsSnapshot?.total ?? displaySubtotal + displayShipping;

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    const show = (field: string) => touched[field] || submitAttempted;

    if (show("email")) {
      if (!email.trim()) e.email = "Email is required.";
      else if (!isValidEmail(email)) e.email = "Enter a valid email.";
    }
    if (show("firstName") && !firstName.trim()) {
      e.firstName = "First name is required.";
    }
    if (show("lastName") && !lastName.trim()) {
      e.lastName = "Last name is required.";
    }
    if (show("address1") && !address1.trim()) {
      e.address1 = "Address is required.";
    }
    if (show("city") && !city.trim()) {
      e.city = "City is required.";
    }
    if (show("postalCode") && !postalCode.trim()) {
      e.postalCode = "Postal code is required.";
    }
    if (show("country") && !country) {
      e.country = "Select a country.";
    }
    if (show("phone")) {
      if (!phone.trim()) e.phone = "Phone number is required.";
      else if (digitCount(phone) < 8) {
        e.phone = "Enter a valid phone number.";
      }
    }
    return e;
  }, [
    email,
    firstName,
    lastName,
    address1,
    city,
    postalCode,
    country,
    phone,
    shippingMethod,
    touched,
    submitAttempted,
  ]);

  const isFormValid = useMemo((): boolean => {
    return (
      isValidEmail(email) &&
      firstName.trim().length > 0 &&
      lastName.trim().length > 0 &&
      address1.trim().length > 0 &&
      city.trim().length > 0 &&
      postalCode.trim().length > 0 &&
      country.length > 0 &&
      phone.trim().length > 0 &&
      digitCount(phone) >= 8 &&
      (shippingMethod === "standard" || shippingMethod === "express")
    );
  }, [
    email,
    firstName,
    lastName,
    address1,
    city,
    postalCode,
    country,
    phone,
    shippingMethod,
  ]);

  const blur = (field: string) => () =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  const validateAll = useCallback(() => {
    setTouched({
      email: true,
      firstName: true,
      lastName: true,
      address1: true,
      city: true,
      postalCode: true,
      country: true,
      phone: true,
      shippingMethod: true,
    });
    return (
      isValidEmail(email) &&
      firstName.trim() &&
      lastName.trim() &&
      address1.trim() &&
      city.trim() &&
      postalCode.trim() &&
      country &&
      phone.trim() &&
      digitCount(phone) >= 8
    );
  }, [
    email,
    firstName,
    lastName,
    address1,
    city,
    postalCode,
    country,
    phone,
  ]);

  const preparePayment = useCallback(async () => {
    setSubmitAttempted(true);
    if (!validateAll()) return;

    let accessToken: string | undefined;
    const supabase = createBrowserSupabaseClient();
    if (supabase) {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.access_token) {
        accessToken = session.access_token;
      }
    }

    setPrepareError(null);
    setPreparingPayment(true);

    try {
      const lines = cartLinesForApi(items);
      const { subtotal: st, shipping, total } = computeCheckoutTotalEur(
        lines,
        shippingMethod,
      );
      const amount = eurToStripeCents(total);

      const shippingName = `${firstName} ${lastName}`.trim();

      const payload: Record<string, unknown> = {
        amount,
        currency: "eur",
        items: lines,
        shippingMethod,
        shippingName,
        shippingAddress1: address1.trim(),
        shippingAddress2: address2.trim() || undefined,
        shippingCity: city.trim(),
        shippingPostalCode: postalCode.trim(),
        shippingCountry: country,
        shippingPhone: phone.trim(),
      };

      if (accessToken) {
        payload.accessToken = accessToken;
      } else {
        payload.guestEmail = email.trim();
      }

      const res = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await res.json()) as {
        clientSecret?: string;
        error?: string;
      };

      if (!res.ok || !data.clientSecret) {
        setPrepareError(data.error ?? "Could not start payment.");
        return;
      }

      onStripeElementsActiveChange?.(true);
      setClientSecret(data.clientSecret);
    } catch {
      setPrepareError("Network error. Try again.");
    } finally {
      setPreparingPayment(false);
    }
  }, [
    items,
    shippingMethod,
    validateAll,
    firstName,
    lastName,
    address1,
    address2,
    city,
    postalCode,
    country,
    phone,
    email,
    onStripeElementsActiveChange,
  ]);

  const handlePaymentSuccess = useCallback(
    (_paymentIntentId: string) => {
      const lines = cartLinesForApi(items);
      const { subtotal: st, shipping, total } = computeCheckoutTotalEur(
        lines,
        shippingMethod,
      );

      saveCompletedOrder({
        lines: cartItemsToStoredLines(items),
        subtotal: st,
        shipping,
        total,
        shippingMethod,
        email: email.trim(),
        placedAt: new Date().toISOString(),
      });
      setTotalsSnapshot({ subtotal: st, shipping, total });
      setSummarySnapshot([...items]);
      setOrderSuccess(true);
      clearCart();
      router.push("/order-confirmation");
    },
    [items, shippingMethod, email, clearCart, router],
  );

  if (displayItems.length === 0 && !orderSuccess) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="text-sm tt-text-on-light">Your cart is empty.</p>
        <Link
          href="/shop"
          className="mt-6 inline-block border border-black bg-black px-8 py-3 text-[11px] font-bold tracking-[0.2em] text-[#b8ff06] uppercase transition-opacity hover:opacity-90"
        >
          CONTINUE SHOPPING
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
      <h1 className="text-2xl font-bold tracking-[0.18em] tt-text-on-light uppercase sm:text-3xl">
        Checkout
      </h1>

      <div className="mt-10 flex flex-col gap-12 lg:mt-12 lg:flex-row lg:items-start lg:gap-16">
        <div className="min-w-0 flex-1 space-y-12">
          <section aria-labelledby="step-contact">
            <h2
              id="step-contact"
              className="border-b border-black/10 pb-3 text-sm font-bold tracking-[0.2em] tt-text-on-light uppercase"
            >
              Step 1 — Contact
            </h2>
            <div className="mt-6 space-y-5">
              <div>
                <label htmlFor="checkout-email" className={labelClass}>
                  Email
                </label>
                <input
                  id="checkout-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={blur("email")}
                  className={inputClass}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "err-email" : undefined}
                />
                {errors.email ? (
                  <p id="err-email" className={errorClass}>
                    {errors.email}
                  </p>
                ) : null}
              </div>
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={marketingOptIn}
                  onChange={(e) => setMarketingOptIn(e.target.checked)}
                  className="mt-1 h-4 w-4 border-black/30 accent-black"
                />
                <span className="text-sm tt-text-on-light">
                  Keep me updated on new drops
                </span>
              </label>
              {!authLoading && !user ? (
                <p className="text-[11px] text-black/50">
                  <Link
                    href="/account"
                    className="underline underline-offset-4 tt-text-secondary transition-opacity hover:opacity-80"
                  >
                    Sign in
                  </Link>{" "}
                  for faster checkout next time.
                </p>
              ) : null}
            </div>
          </section>

          <section aria-labelledby="step-shipping">
            <h2
              id="step-shipping"
              className="border-b border-black/10 pb-3 text-sm font-bold tracking-[0.2em] tt-text-on-light uppercase"
            >
              Step 2 — Shipping
            </h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <label htmlFor="checkout-first" className={labelClass}>
                  First name
                </label>
                <input
                  id="checkout-first"
                  name="firstName"
                  autoComplete="given-name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  onBlur={blur("firstName")}
                  className={inputClass}
                  aria-invalid={!!errors.firstName}
                />
                {errors.firstName ? (
                  <p className={errorClass}>{errors.firstName}</p>
                ) : null}
              </div>
              <div className="sm:col-span-1">
                <label htmlFor="checkout-last" className={labelClass}>
                  Last name
                </label>
                <input
                  id="checkout-last"
                  name="lastName"
                  autoComplete="family-name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  onBlur={blur("lastName")}
                  className={inputClass}
                  aria-invalid={!!errors.lastName}
                />
                {errors.lastName ? (
                  <p className={errorClass}>{errors.lastName}</p>
                ) : null}
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="checkout-address1" className={labelClass}>
                  Address line 1
                </label>
                <input
                  id="checkout-address1"
                  name="address1"
                  autoComplete="address-line1"
                  value={address1}
                  onChange={(e) => setAddress1(e.target.value)}
                  onBlur={blur("address1")}
                  className={inputClass}
                  aria-invalid={!!errors.address1}
                />
                {errors.address1 ? (
                  <p className={errorClass}>{errors.address1}</p>
                ) : null}
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="checkout-address2" className={labelClass}>
                  Address line 2{" "}
                  <span className="font-normal normal-case tracking-normal text-black/45">
                    (optional)
                  </span>
                </label>
                <input
                  id="checkout-address2"
                  name="address2"
                  autoComplete="address-line2"
                  value={address2}
                  onChange={(e) => setAddress2(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="checkout-city" className={labelClass}>
                  City
                </label>
                <input
                  id="checkout-city"
                  name="city"
                  autoComplete="address-level2"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  onBlur={blur("city")}
                  className={inputClass}
                  aria-invalid={!!errors.city}
                />
                {errors.city ? <p className={errorClass}>{errors.city}</p> : null}
              </div>
              <div>
                <label htmlFor="checkout-postal" className={labelClass}>
                  Postal code
                </label>
                <input
                  id="checkout-postal"
                  name="postalCode"
                  autoComplete="postal-code"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  onBlur={blur("postalCode")}
                  className={inputClass}
                  aria-invalid={!!errors.postalCode}
                />
                {errors.postalCode ? (
                  <p className={errorClass}>{errors.postalCode}</p>
                ) : null}
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="checkout-country" className={labelClass}>
                  Country
                </label>
                <select
                  id="checkout-country"
                  name="country"
                  autoComplete="country-name"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  onBlur={blur("country")}
                  className={`${inputClass} appearance-none bg-[length:12px] bg-[right_12px_center] bg-no-repeat`}
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='none' stroke='%23000' stroke-width='1.5' d='M1 1.5 6 6.5 11 1.5'/%3E%3C/svg%3E")`,
                  }}
                  aria-invalid={!!errors.country}
                >
                  <option value="">Select country</option>
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                {errors.country ? (
                  <p className={errorClass}>{errors.country}</p>
                ) : null}
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="checkout-phone" className={labelClass}>
                  Phone number
                </label>
                <input
                  id="checkout-phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onBlur={blur("phone")}
                  className={inputClass}
                  aria-invalid={!!errors.phone}
                />
                {errors.phone ? (
                  <p className={errorClass}>{errors.phone}</p>
                ) : null}
              </div>
            </div>
          </section>

          <section aria-labelledby="step-method">
            <h2
              id="step-method"
              className="border-b border-black/10 pb-3 text-sm font-bold tracking-[0.2em] tt-text-on-light uppercase"
            >
              Step 3 — Shipping method
            </h2>
            <fieldset className="mt-6 space-y-3">
              <legend className="sr-only">Shipping method</legend>
              <label
                className={`flex cursor-pointer flex-col gap-1 border p-4 transition-colors ${
                  shippingMethod === "standard"
                    ? "border-black bg-black/[0.02]"
                    : "border-black/15 hover:border-black/30"
                }`}
              >
                <span className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="shipping"
                    value="standard"
                    checked={shippingMethod === "standard"}
                    onChange={() => setShippingMethod("standard")}
                    className="mt-1 h-4 w-4 border-black/30 accent-black"
                  />
                  <span>
                    <span className="text-sm font-bold tracking-[0.12em] tt-text-on-light uppercase">
                      Standard (5–7 days)
                    </span>
                    <span className="mt-1 block text-sm tt-text-on-light">
                      {subtotal >= 100
                        ? "Free — your order qualifies."
                        : `${formatEuro(4.99)} — free on orders over €100.`}
                    </span>
                  </span>
                </span>
              </label>
              <label
                className={`flex cursor-pointer flex-col gap-1 border p-4 transition-colors ${
                  shippingMethod === "express"
                    ? "border-black bg-black/[0.02]"
                    : "border-black/15 hover:border-black/30"
                }`}
              >
                <span className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="shipping"
                    value="express"
                    checked={shippingMethod === "express"}
                    onChange={() => setShippingMethod("express")}
                    className="mt-1 h-4 w-4 border-black/30 accent-black"
                  />
                  <span>
                    <span className="text-sm font-bold tracking-[0.12em] tt-text-on-light uppercase">
                      Express (2–3 days)
                    </span>
                    <span className="mt-1 block text-sm tt-text-on-light">
                      {formatEuro(12.99)} flat rate.
                    </span>
                  </span>
                </span>
              </label>
            </fieldset>
          </section>

          {clientSecret ? (
            <section aria-labelledby="step-payment">
              <h2
                id="step-payment"
                className="border-b border-black/10 pb-3 text-sm font-bold tracking-[0.2em] tt-text-on-light uppercase"
              >
                Step 4 — Payment
              </h2>
              <p className="mt-4 text-sm tt-text-on-light">
                Pay securely with your card. Your order was created when you
                continued to payment; it will be marked paid after a successful
                charge.
              </p>
              <div className="mt-6 max-w-md">
                <CheckoutCardPayment
                  clientSecret={clientSecret}
                  disabled={orderSuccess}
                  onSuccess={handlePaymentSuccess}
                />
              </div>
            </section>
          ) : null}

          <div className="border-t border-black/10 pt-8 lg:hidden">
            <OrderSummaryBlock
              items={displayItems}
              subtotal={displaySubtotal}
              shippingCost={displayShipping}
              total={displayTotal}
              orderSuccess={orderSuccess}
              isFormValid={isFormValid}
              user={user}
              authLoading={authLoading}
              paymentReady={!!clientSecret}
              preparingPayment={preparingPayment}
              prepareError={prepareError}
              onContinueToPayment={preparePayment}
            />
          </div>
        </div>

        <aside className="hidden w-full shrink-0 lg:block lg:max-w-[380px] lg:sticky lg:top-24">
          <OrderSummaryBlock
            items={displayItems}
            subtotal={displaySubtotal}
            shippingCost={displayShipping}
            total={displayTotal}
            orderSuccess={orderSuccess}
            isFormValid={isFormValid}
            user={user}
            authLoading={authLoading}
            paymentReady={!!clientSecret}
            preparingPayment={preparingPayment}
            prepareError={prepareError}
            onContinueToPayment={preparePayment}
          />
        </aside>
      </div>
    </div>
  );
}

type OrderSummaryBlockProps = {
  items: CartItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  orderSuccess: boolean;
  isFormValid: boolean;
  user: User | null;
  authLoading: boolean;
  paymentReady: boolean;
  preparingPayment: boolean;
  prepareError: string | null;
  onContinueToPayment: () => void;
};

function OrderSummaryBlock({
  items,
  subtotal,
  shippingCost,
  total,
  orderSuccess,
  isFormValid,
  user,
  authLoading,
  paymentReady,
  preparingPayment,
  prepareError,
  onContinueToPayment,
}: OrderSummaryBlockProps) {
  return (
    <div className="border border-black/10 bg-white p-6">
      <h2 className="text-sm font-bold tracking-[0.2em] tt-text-on-light uppercase">
        Order summary
      </h2>
      <ul className="mt-6 space-y-4">
        {items.map((item) => (
          <li key={item.key} className="flex gap-3 border-b border-black/10 pb-4">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden border border-black/10 bg-white p-1">
              <Image
                src={item.imageSrc}
                alt={item.name}
                fill
                sizes="64px"
                className="object-contain object-center"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold tracking-[0.1em] tt-text-on-light uppercase">
                {item.name}
              </p>
              {item.size ? (
                <p className="mt-0.5 text-[11px] text-black/55">
                  Size: {item.size}
                </p>
              ) : null}
              <p className="mt-1 text-xs tt-text-on-light">
                Qty {item.quantity} · {formatEuro(item.unitPrice * item.quantity)}
              </p>
            </div>
          </li>
        ))}
      </ul>
      <dl className="mt-6 space-y-2 border-t border-black/10 pt-4 text-sm">
        <div className="flex justify-between tt-text-on-light">
          <dt>Subtotal</dt>
          <dd className="font-bold">{formatEuro(subtotal)}</dd>
        </div>
        <div className="flex justify-between tt-text-on-light">
          <dt>Shipping</dt>
          <dd className="font-bold">
            {shippingCost === 0 ? "Free" : formatEuro(shippingCost)}
          </dd>
        </div>
        <div className="flex justify-between border-t border-black/10 pt-3 text-base font-bold tt-text-on-light">
          <dt>Total</dt>
          <dd>{formatEuro(total)}</dd>
        </div>
      </dl>

      {prepareError ? (
        <p className="mt-4 text-center text-xs text-[#ff53e3]">{prepareError}</p>
      ) : null}

      {paymentReady ? (
        <p className="mt-6 text-center text-[11px] text-black/55">
          Enter your card details in the payment section and pay.
        </p>
      ) : (
        <>
          {!user && !authLoading ? (
            <p className="mt-6 text-center text-[11px] text-black/50">
              Checking out as guest.{" "}
              <Link
                href="/account"
                className="underline underline-offset-4 tt-text-secondary transition-opacity hover:opacity-80"
              >
                Sign in
              </Link>{" "}
              to track your orders.
            </p>
          ) : null}
          <button
            type="button"
            onClick={onContinueToPayment}
            disabled={
              orderSuccess ||
              items.length === 0 ||
              !isFormValid ||
              preparingPayment
            }
            className="mt-6 w-full bg-black py-3.5 text-center text-[11px] font-bold tracking-[0.22em] text-[#b8ff06] uppercase transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {orderSuccess
              ? "ORDER PLACED"
              : preparingPayment
                ? "PREPARING…"
                : "CONTINUE TO PAYMENT"}
          </button>
          {!isFormValid && !orderSuccess ? (
            <p className="mt-3 text-center text-[11px] text-black/45">
              Fill in all required fields to continue.
            </p>
          ) : null}
        </>
      )}
    </div>
  );
}
