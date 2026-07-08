import React from "react";
import { useNavigate } from "react-router-dom";

// Dedicated failure landing for both gateways:
// - Cashfree: ThankYou's status check redirects here on a non-PAID outcome.
// - Razorpay: OrderSummary redirects here when the popup is cancelled/fails.
// "Try Again" returns to /order-summary to re-attempt with the same cart/address.
const PaymentFailed = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-[#f1f3f6] min-h-screen flex items-center justify-center font-sans">
      <div className="bg-white p-6 md:p-10 rounded shadow-sm max-w-lg w-full text-center">
        <div className="flex justify-center mb-6">
          <svg
            className="w-20 h-20 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-red-600 mb-2">Payment Failed</h1>
        <p className="text-lg text-gray-700 mb-6">
          Your payment could not be completed. You were not charged, or any
          amount debited will be refunded.
        </p>

        <div className="flex flex-col items-center gap-3">
          <button
            onClick={() => navigate("/order-summary")}
            className="bg-[#fb641b] text-white font-semibold py-3 px-10 rounded shadow-sm hover:bg-[#f4511e] uppercase tracking-wide text-sm w-full sm:w-auto"
          >
            Try Again
          </button>
          <button
            onClick={() => navigate("/cart")}
            className="text-[#2874f0] font-semibold py-2 px-10 uppercase tracking-wide text-sm hover:underline"
          >
            Back to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailed;
