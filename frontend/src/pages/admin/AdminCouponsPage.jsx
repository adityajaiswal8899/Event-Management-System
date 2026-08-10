import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/bookingService';
import { useNotification } from '../../context/NotificationContext';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';
import { Tag, Plus, Trash2, Edit, X } from 'lucide-react';

export const AdminCouponsPage = () => {
  const { addToast } = useNotification();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [couponForm, setCouponForm] = useState({
    code: '',
    discount_type: 'PERCENTAGE',
    discount_value: 20,
    min_order_amount: 0,
    max_discount_amount: 500,
    max_uses: 100,
    is_active: true,
  });

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const data = await adminService.getCoupons();
      setCoupons(data);
    } catch (err) {
      console.error('Failed to load coupons:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    try {
      await adminService.createCoupon(couponForm);
      addToast({ type: 'success', message: `Coupon "${couponForm.code}" created!` });
      setModalOpen(false);
      setCouponForm({
        code: '',
        discount_type: 'PERCENTAGE',
        discount_value: 20,
        min_order_amount: 0,
        max_discount_amount: 500,
        max_uses: 100,
        is_active: true,
      });
      fetchCoupons();
    } catch (err) {
      addToast({ type: 'error', message: 'Failed to create coupon.' });
    }
  };

  const handleDelete = async (id, code) => {
    if (!window.confirm(`Delete coupon "${code}"?`)) return;
    try {
      await adminService.deleteCoupon(id);
      addToast({ type: 'success', message: 'Coupon deleted.' });
      setCoupons((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      addToast({ type: 'error', message: 'Failed to delete coupon.' });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-extrabold text-2xl text-slate-900 dark:text-white">
            Promo Coupons & Discounts
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Create promotional discount codes and configure order thresholds.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs shadow-md inline-flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>New Coupon</span>
        </button>
      </div>

      {loading ? (
        <TableSkeleton rows={4} />
      ) : coupons.length === 0 ? (
        <div className="p-12 rounded-3xl glass-card text-center text-xs text-slate-400">
          No active coupons found.
        </div>
      ) : (
        <div className="rounded-3xl glass-card border border-slate-200 dark:border-dark-300 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-dark-600/80 border-b border-slate-200 dark:border-dark-400 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Coupon Code</th>
                  <th className="p-4">Discount</th>
                  <th className="p-4">Min Order</th>
                  <th className="p-4">Max Cap</th>
                  <th className="p-4">Used / Limit</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-dark-400 font-medium text-slate-700 dark:text-slate-200">
                {coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-dark-400/30 transition-colors">
                    <td className="p-4">
                      <div className="font-mono font-bold text-sm text-primary-600 dark:text-primary-400 flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5" />
                        <span>{c.code}</span>
                      </div>
                    </td>

                    <td className="p-4 font-bold text-slate-900 dark:text-white">
                      {c.discount_value}{c.discount_type === 'PERCENTAGE' ? '%' : '₹'}
                    </td>

                    <td className="p-4 text-slate-600 dark:text-slate-300">
                      ₹{c.min_order_amount}
                    </td>

                    <td className="p-4 text-slate-600 dark:text-slate-300">
                      {c.max_discount_amount ? `₹${c.max_discount_amount}` : 'None'}
                    </td>

                    <td className="p-4 text-slate-600 dark:text-slate-300">
                      {c.used_count} / {c.max_uses}
                    </td>

                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        c.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {c.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDelete(c.id, c.code)}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-dark-500 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-slate-200 dark:border-dark-300 animate-slide-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-dark-400">
              <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                Create New Coupon
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Coupon Code (Uppercase) *
                </label>
                <input
                  type="text"
                  required
                  value={couponForm.code}
                  onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. FESTIVAL20"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-dark-600 border border-slate-200 dark:border-dark-400 text-xs font-mono font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Discount Type
                  </label>
                  <select
                    value={couponForm.discount_type}
                    onChange={(e) => setCouponForm({ ...couponForm, discount_type: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-dark-600 border border-slate-200 dark:border-dark-400 text-xs"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Discount Value *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={couponForm.discount_value}
                    onChange={(e) => setCouponForm({ ...couponForm, discount_value: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-dark-600 border border-slate-200 dark:border-dark-400 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Min Order (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={couponForm.min_order_amount}
                    onChange={(e) => setCouponForm({ ...couponForm, min_order_amount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-dark-600 border border-slate-200 dark:border-dark-400 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Max Discount Cap (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={couponForm.max_discount_amount}
                    onChange={(e) => setCouponForm({ ...couponForm, max_discount_amount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-dark-600 border border-slate-200 dark:border-dark-400 text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary-600 text-white font-bold text-xs shadow-md"
                >
                  Create Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
