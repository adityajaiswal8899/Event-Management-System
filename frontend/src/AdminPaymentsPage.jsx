import React, { useState, useEffect } from 'react';
import { adminService } from './bookingService';
import { TableSkeleton } from './components/common/LoadingSkeleton';
import { CreditCard, Search, ShieldCheck } from 'lucide-react';

export const AdminPaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const params = search ? { search } : {};
      const data = await adminService.getPayments(params);
      setPayments(data);
    } catch (err) {
      console.error('Failed to load payments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-extrabold text-2xl text-slate-900 dark:text-white">
            Razorpay Payment Transactions
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time transaction logs, gateway order IDs, and payment verification audits.
          </p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); fetchPayments(); }} className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search TXN, Razorpay ID, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 rounded-xl bg-white dark:bg-dark-500 border border-slate-200 dark:border-dark-400 text-xs focus:ring-2 focus:ring-primary-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
        </form>
      </div>

      {loading ? (
        <TableSkeleton rows={6} />
      ) : payments.length === 0 ? (
        <div className="p-12 rounded-3xl glass-card text-center text-xs text-slate-400">
          No payment transactions found.
        </div>
      ) : (
        <div className="rounded-3xl glass-card border border-slate-200 dark:border-dark-300 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-dark-600/80 border-b border-slate-200 dark:border-dark-400 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Transaction ID</th>
                  <th className="p-4">Razorpay IDs</th>
                  <th className="p-4">User</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-dark-400 font-medium text-slate-700 dark:text-slate-200">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-dark-400/30 transition-colors">
                    <td className="p-4 font-mono font-bold text-slate-900 dark:text-white">
                      {p.transaction_id}
                    </td>
                    <td className="p-4">
                      <div className="font-mono text-[11px] text-slate-700 dark:text-slate-300">
                        {p.razorpay_payment_id || 'Mock Checkout'}
                      </div>
                      <div className="font-mono text-[10px] text-slate-400">
                        {p.razorpay_order_id}
                      </div>
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-300">
                      <div>{p.user_email}</div>
                      <div className="text-[10px] text-slate-400">Ref: #{p.booking_number}</div>
                    </td>
                    <td className="p-4 font-bold text-slate-900 dark:text-white">
                      ₹{Number(p.amount).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        p.status === 'SUCCESSFUL'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400 whitespace-nowrap">
                      {new Date(p.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
