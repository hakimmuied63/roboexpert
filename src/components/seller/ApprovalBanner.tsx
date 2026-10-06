import { Clock, ShieldX, Ban } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function ApprovalBanner() {
  const { user } = useAuth();

  if (!user || user.role !== 'seller') return null;
  if (user.approvalStatus === 'approved') return null;

  const config = (() => {
    switch (user.approvalStatus) {
      case 'pending':
        return {
          bg: 'bg-amber-50 border-amber-200',
          text: 'text-amber-900',
          subtext: 'text-amber-800',
          iconColor: 'text-amber-600',
          Icon: Clock,
          title: 'Your account is under review',
          message:
            'You can set up your shop and add products now. Our team will review your account shortly. You will be notified once approved.',
        };
      case 'rejected':
        return {
          bg: 'bg-red-50 border-red-200',
          text: 'text-red-900',
          subtext: 'text-red-800',
          iconColor: 'text-red-600',
          Icon: ShieldX,
          title: 'Your account application was rejected',
          message:
            user.approvalNote ||
            'Your seller application was not approved. Please contact support for more details.',
        };
      case 'suspended':
        return {
          bg: 'bg-red-50 border-red-200',
          text: 'text-red-900',
          subtext: 'text-red-800',
          iconColor: 'text-red-600',
          Icon: Ban,
          title: 'Your account has been suspended',
          message:
            user.approvalNote ||
            'Your account is temporarily suspended. Please contact support.',
        };
      default:
        return null;
    }
  })();

  if (!config) return null;

  const { bg, text, subtext, iconColor, Icon, title, message } = config;

  return (
    <div className={`border-b ${bg}`}>
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-start gap-3">
        <div className={`flex-shrink-0 ${iconColor}`}>
          <Icon className="w-5 h-5 mt-0.5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold ${text}`}>{title}</p>
          <p className={`text-xs mt-0.5 ${subtext}`}>{message}</p>
        </div>
      </div>
    </div>
  );
}