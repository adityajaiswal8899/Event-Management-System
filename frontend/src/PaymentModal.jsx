import React, { useState } from 'react';
import { CreditCard, QrCode, Building, Wallet, ShieldCheck, X, Loader2, CheckCircle } from 'lucide-react';

export const PaymentModal = ({ isOpen, onClose, orderData, onPaymentSuccess }) => {
  const [selectedMethod, setSelectedMethod] = useState('upi');
  const [upiId, setUpiId] = useState('user@okaxis');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8892');
  const [expiry, setExpiry] = useState('12/28');
  const [cvv, setCvv] = useState('888');
  const [processing, setProcessing] = useState(false);

  if (!isOpen || !orderData) return null;

  const handlePayNow = async (e) => {
    e.preventDefault();
    setProcessing(true);

    // Simulate payment gateway delay & generate signature
    setTimeout(() => {
      const paymentResponse = {
        booking_id: orderData.booking_id,
        razorpay_order_id: orderData.order_id,
        razorpay_payment_id: `pay_mock_${Date.now()}`,
        razorpay_signature: `sig_mock_${Date.now()}`,
        payment_method: selectedMethod,
      };
      setProcessing(false);
      onPaymentSuccess(paymentResponse);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-dark-500 rounded-3xl border border-slate-200 dark:border-dark-300 shadow-2xl max-w-lg w-full overflow-hidden animate-slide-up">
        
        {/* Header with Razorpay Branding */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center font-bold text-base">
              ₹
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">AJ Events Checkout</div>
              <div className="text-sm font-bold tracking-tight">Razorpay Secure Payment</div>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={processing}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Order Summary Strip */}
        <div className="p-4 bg-slate-50 dark:bg-dark-600 border-b border-slate-200 dark:border-dark-400 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-xs">
              {orderData.event_title}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              Booking Ref: #{orderData.booking_number}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-400">Amount Due</div>
            <div className="text-lg font-extrabold text-primary-600 dark:text-primary-400">
              ₹{Number(orderData.amount / 100).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <form onSubmit={handlePayNow} className="p-6 space-y-5">
          <div className="grid grid-cols-4 gap-2">
            {[
              { id: 'upi', label: 'UPI / QR', icon: QrCode },
              { id: 'card', label: 'Card', icon: CreditCard },
              { id: 'netbanking', label: 'NetBanking', icon: Building },
              { id: 'wallet', label: 'Wallet', icon: Wallet },
            ].map((method) => {
              const Icon = method.icon;
              const isSelected = selectedMethod === method.id;
              return (
                <button
                  type="button"
                  key={method.id}
                  onClick={() => setSelectedMethod(method.id)}
                  className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 border text-xs font-semibold transition-all ${
                    isSelected
                      ? 'border-primary-500 bg-primary-50/80 text-primary-700 dark:bg-primary-950/40 dark:text-primary-300 ring-2 ring-primary-500/20'
                      : 'border-slate-200 dark:border-dark-400 bg-white dark:bg-dark-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[11px]">{method.label}</span>
                </button>
              );
            })}
          </div>

          {/* Dynamic Payment Method Fields */}
          {selectedMethod === 'upi' && (
            <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-dark-600 border border-slate-200 dark:border-dark-400">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
                Enter VPA / UPI ID (Google Pay, PhonePe, Paytm, BHIM)
              </label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                required
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-dark-400 bg-white dark:bg-dark-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="yourname@okhdfcbank"
              />
              <div className="flex gap-2 text-[11px] text-slate-500">
                <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-dark-400 font-mono">GPay</span>
                <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-dark-400 font-mono">PhonePe</span>
                <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-dark-400 font-mono">Paytm</span>
              </div>
            </div>
          )}

          {selectedMethod === 'card' && (
            <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-dark-600 border border-slate-200 dark:border-dark-400">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                  Card Number
                </label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-dark-400 bg-white dark:dark-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                    Valid Thru
                  </label>
                  <input
                    type="text"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-dark-400 bg-white dark:bg-dark-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                    CVV
                  </label>
                  <input
                    type="password"
                    maxLength="4"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-dark-400 bg-white dark:bg-dark-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>
          )}

          {(selectedMethod === 'netbanking' || selectedMethod === 'wallet') && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-dark-600 border border-slate-200 dark:border-dark-400 text-xs text-slate-600 dark:text-slate-300">
              Select your preferred provider: <strong className="text-primary-600">HDFC Bank, ICICI Bank, SBI, Axis Bank</strong>. Redirecting securely upon confirmation.
            </div>
          )}

          {/* Security Banner & Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={processing}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {processing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing Secure Payment...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  <span>Pay ₹{Number(orderData.amount / 100).toLocaleString()} Now</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-1.5 mt-3 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>PCI-DSS Level 1 Certified • End-to-End Encrypted</span>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
};
