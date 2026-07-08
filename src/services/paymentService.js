// Two gateways, two styles:
// - Razorpay: a fast in-page Checkout popup (frontend-only, uses the PUBLIC key id).
//   No page leaves the SPA — resolves on a confirmed payment.
// - Cashfree: phonepetest-style redirect to a PHP endpoint (secret stays server-side)
//   that forwards to the hosted page; confirmed on return at /thank-you.
//
// The SPA runs on Vercel and the Cashfree PHP backend runs on Hostinger (separate
// origin), so PHP_BASE must be the absolute Hostinger origin. Set VITE_PHP_BASE_URL
// in the Vercel project env, e.g. "https://your-site.hostingersite.com".

// The one switch: which gateway is active. Set in cart-teeee-main/.env.
export const PAYMENT_PROVIDER = import.meta.env.VITE_PAYMENT_PROVIDER || "razorpay";

// Absolute origin of the PHP payment backend (no trailing slash). Cashfree only.
export const PHP_BASE = (import.meta.env.VITE_PHP_BASE_URL || "").replace(/\/+$/, "");

// Confirm the real Cashfree outcome on return (called from /thank-you).
// Returns { status } where "PAID" means success.
export async function fetchCashfreeStatus(orderId) {
  const res = await fetch(
    `${PHP_BASE}/order_status.php?order_id=${encodeURIComponent(orderId)}`
  );
  if (!res.ok) throw new Error("Could not verify payment status");
  return res.json();
}

// Load an external script once and resolve when it's ready.
function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.body.appendChild(script);
  });
}

// Razorpay — fast in-page popup. Uses the PUBLIC key id only (the secret is never
// involved). The official checkout script is loaded lazily, only on this path.
// Resolves on a confirmed payment; rejects on cancel/failure.
async function payWithRazorpay({ amount, customer }) {
  await loadScript("https://checkout.razorpay.com/v1/checkout.js");

  return new Promise((resolve, reject) => {
    const rzp = new window.Razorpay({
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: Math.round(Number(amount) * 100), // paise
      currency: "INR",
      name: "Flipcart",
      description: "Order payment",
      prefill: {
        name: customer?.name || "",
        contact: customer?.phone || "",
      },
      theme: { color: "#2874f0" },
      handler: () => resolve(),
      modal: { ondismiss: () => reject(new Error("Payment cancelled")) },
    });

    rzp.on("payment.failed", (resp) =>
      reject(new Error(resp?.error?.description || "Payment failed"))
    );
    rzp.open();
  });
}

// Cashfree — redirect to the PHP endpoint that creates the order server-side and
// forwards the browser to the hosted page. Leaves the SPA, so the returned promise
// stays pending until the navigation happens.
function payWithCashfree({ amount, customer }) {
  const params = new URLSearchParams({
    amount,
    name: customer?.name || "",
    phone: customer?.phone || "",
  });
  window.location.href = `${PHP_BASE}/payment_cashfree.php?${params.toString()}`;
  return new Promise(() => {});
}

/**
 * Start checkout with whichever gateway is configured (VITE_PAYMENT_PROVIDER).
 * Razorpay resolves in-page on a confirmed payment (then OrderSummary navigates to
 * /thank-you). Cashfree redirects away and is confirmed on return at /thank-you.
 */
export async function startCheckout({ amount, customer }) {
  if (PAYMENT_PROVIDER === "cashfree") {
    return payWithCashfree({ amount, customer });
  }
  return payWithRazorpay({ amount, customer });
}
