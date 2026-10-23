import { useEffect, useState } from 'react';
import { Flag, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { LoadingSpinner, EmptyState, Button, Badge } from '../../components/ui';
import { fetchReportedReviews, handleReportedReviewAction, type ReportedReview } from '../../lib/api';
import toast from 'react-hot-toast';

export function AdminReviews() {
  const [reviews, setReviews] = useState<ReportedReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const data = await fetchReportedReviews();
    setReviews(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleAction = async (id: string, action: 'hide' | 'dismiss') => {
    setBusyId(id);
    const ok = await handleReportedReviewAction(id, action);
    setBusyId(null);

    if (!ok) {
      toast.error(`Could not ${action} review`);
      return;
    }

    toast.success(action === 'hide' ? 'Review hidden' : 'Report dismissed');
    setReviews((prev) => prev.filter((r) => r._id !== id));
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900">Reported Reviews</h1>
        <p className="text-surface-500 mt-1">
          Review flagged comments and images. Hide inappropriate content or dismiss false reports.
        </p>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : reviews.length === 0 ? (
        <EmptyState
          icon={<CheckCircle2 className="w-8 h-8 text-green-500" />}
          title="No reported reviews"
          description="All clear. Nobody has flagged a review yet."
        />
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r._id} className="bg-white border border-surface-200 rounded-xl p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-[250px]">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="danger" className="bg-red-50 text-red-700">
                      <Flag className="w-3 h-3 mr-1" />
                      Reported
                    </Badge>
                    <span className="text-xs text-surface-500">
                      {new Date(r.reportedAt).toLocaleDateString('en-IN')}
                    </span>
                  </div>

                  <div className="bg-red-50 border border-red-100 rounded-lg p-3 mb-4">
                    <p className="text-xs font-semibold text-red-800 uppercase tracking-wide mb-1">
                      Report Reason
                    </p>
                    <p className="text-sm text-red-900">{r.reportReason}</p>
                    <p className="text-xs text-red-700 mt-2">
                      Reported by: {r.reportedBy?.name || 'Unknown'} ({r.reportedByRole})
                    </p>
                  </div>

                  <p className="text-sm font-medium text-surface-900 mb-1">
                    Review on:{' '}
                    <span className="text-primary-600">
                      {r.productId?.name || 'Unknown Product'}
                    </span>
                  </p>

                  <div className="bg-surface-50 rounded-lg p-3 border border-surface-100 mt-2">
                    <p className="text-sm font-semibold text-surface-900">
                      {r.buyerName} · {r.rating} stars
                    </p>
                    <p className="text-sm text-surface-700 mt-1">
                      "{r.comment || 'No comment provided'}"
                    </p>
                    {r.images && r.images.length > 0 && (
                      <div className="flex gap-2 mt-3">
                        {r.images.map((url, i) => (
                          <img
                            key={i}
                            src={url}
                            alt="Review attachment"
                            className="w-16 h-16 rounded object-cover border border-surface-200"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2 shrink-0">
                  <Button
                    variant="outline"
                    className="text-red-600 border-red-300 hover:bg-red-50"
                    icon={<XCircle className="w-4 h-4" />}
                    loading={busyId === r._id}
                    onClick={() => handleAction(r._id, 'hide')}
                  >
                    Hide Review
                  </Button>
                  <Button
                    variant="outline"
                    className="text-surface-600"
                    icon={<CheckCircle2 className="w-4 h-4" />}
                    loading={busyId === r._id}
                    onClick={() => handleAction(r._id, 'dismiss')}
                  >
                    Dismiss Report
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}