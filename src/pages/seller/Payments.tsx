import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { paymentService } from '../../mocks/services';
import { OrderStatusBadge, LoadingSpinner, EmptyState } from '../../components/ui';
import type { Payment } from '../../types';
import { CreditCard, TrendingUp, Clock, CheckCircle } from 'lucide-react';

export function SellerPayments() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!user) return;
      const data = await paymentService.getBySeller(user.id);
      setPayments(data);
      setLoading(false);
    }
    load();
  }, [user]);

  const totalEarned = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalPaid = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
  const totalPending = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);

  const summaryCards = [
    {
      label: 'Total Earned',
      value: `₹${totalEarned.toLocaleString('en-IN')}`,
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'bg-primary-50 text-primary-600',
    },
    {
      label: 'Paid Out',
      value: `₹${totalPaid.toLocaleString('en-IN')}`,
      icon: <CheckCircle className="w-5 h-5" />,
      color: 'bg-success-50 text-success-600',
    },
    {
      label: 'Pending',
      value: `₹${totalPending.toLocaleString('en-IN')}`,
      icon: <Clock className="w-5 h-5" />,
      color: 'bg-warning-50 text-warning-600',
    },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-surface-900">Payments</h1>
        <p className="text-surface-500 mt-1">
          Track your earnings and payment history.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {summaryCards.map(card => (
          <div
            key={card.label}
            className="bg-white rounded-xl border border-surface-200 p-5"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${card.color} flex items-center justify-center`}>
                {card.icon}
              </div>
              <div>
                <p className="text-2xl font-bold text-surface-900">{card.value}</p>
                <p className="text-sm text-surface-500">{card.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Info Banner */}
      <div className="bg-primary-50 rounded-xl p-4 flex items-start gap-3">
        <CreditCard className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-primary-900">Direct Payments</p>
          <p className="text-sm text-primary-700">
            Payments go directly to your connected Razorpay/bank account. Roboexpert never holds your money.
          </p>
        </div>
      </div>

      {/* Payment History Table */}
      {loading ? (
        <LoadingSpinner />
      ) : payments.length === 0 ? (
        <EmptyState
          icon={<CreditCard className="w-8 h-8 text-surface-400" />}
          title="No payments yet"
          description="Payments will appear here once you receive orders."
        />
      ) : (
        <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-surface-200">
            <h2 className="text-lg font-semibold text-surface-900">Payment History</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-medium text-surface-500 uppercase tracking-wider border-b border-surface-100">
                  <th className="px-6 py-3">Payment ID</th>
                  <th className="px-6 py-3">Order</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Method</th>
                  <th className="px-6 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {payments.map(payment => (
                  <tr key={payment.id} className="hover:bg-surface-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-surface-900">
                      {payment.id}
                    </td>
                    <td className="px-6 py-4 text-sm text-primary-600 font-medium">
                      {payment.orderId}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-surface-900">
                      ₹{payment.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4">
                      <OrderStatusBadge status={payment.status} />
                    </td>
                    <td className="px-6 py-4 text-sm text-surface-600">{payment.method}</td>
                    <td className="px-6 py-4 text-sm text-surface-500">
                      {new Date(payment.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
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
}
