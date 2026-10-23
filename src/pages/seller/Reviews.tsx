import { useEffect, useState } from 'react';
import { Star, Flag, MessageSquare, AlertTriangle } from 'lucide-react';
import { LoadingSpinner, EmptyState, Button } from '../../components/ui';
import { fetchSellerReviews, reportSellerReview, type SellerReview } from '../../lib/api';
import toast from 'react-hot-toast';

const StarRow = ({ value }: { value: number }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((n) => (
      <Star
        key={n}
        className={`w-4 h-4 ${
          n <= value ? 'fill-yellow-400 text-yellow-400' : 'text-surface-300'
        }`}
      />
    ))}
  </div>
);

export function SellerReviews() {
  const [reviews, setReviews] = useState<SellerReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportingId, setReportingId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    const data = await fetchSellerReviews();
    setReviews(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const submitReport = async () => {
    if (!reportingId || reportReason.trim().length < 3) {
      toast.error('Please provide a reason');
      return;
    }
    setSubmitting(true);
    const ok = await reportSellerReview(reportingId, reportReason.trim());
    setSubmitting(false);

    if (!ok) {
      toast.error('Could not report review');
      return;
    }

    toast.success('Review reported to admin');
    setReviews((prev) =>
      prev.map((r) => (r._id === reportingId ? { ...r, reported: true } : r))
    );
    setReportingId(null);
    setReportReason('');
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900">Reviews</h1>
        <p className="text-surface-500 mt-1">
          Read what buyers are saying about your products. Flag inappropriate reviews.
        </p>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : reviews.length === 0 ? (
        <EmptyState
          icon={<MessageSquare className="w-8 h-8 text-surface-400" />}
          title="No reviews yet"
          description="When buyers review your products, they will appear here."
        />
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r._id} className="bg-white border border-surface-200 rounded-xl p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-[250px]">
                  <div className="flex items-center gap-2 mb-1">
                    <StarRow value={r.rating} />
                    <span className="text-sm font-semibold text-surface-900 ml-1">
                      {r.buyerName}
                    </span>
                    <span className="text-xs text-surface-400">
                      {new Date(r.createdAt).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                  <p className="text-sm text-primary-600 font-medium mb-2">
                    {r.productId?.name || 'Unknown Product'}
                  </p>
                  <p className="text-sm text-surface-700 bg-surface-50 p-3 rounded-lg border border-surface-100">
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

                <div>
                  {r.reported ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 text-sm font-medium rounded-lg">
                      <AlertTriangle className="w-4 h-4" />
                      Reported to Admin
                    </span>
                  ) : (
                    <Button
                      variant="outline"
                      className="text-surface-500 hover:text-red-600 hover:border-red-300"
                      icon={<Flag className="w-4 h-4" />}
                      onClick={() => setReportingId(r._id)}
                    >
                      Report Review
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Report Modal */}
      {reportingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-surface-900 mb-1">Report this review</h2>
            <p className="text-sm text-surface-500 mb-4">
              Flag this review for the admin to investigate. They will review the comment and decide whether to hide it.
            </p>
            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              rows={3}
              maxLength={500}
              className="w-full px-3 py-2 border border-surface-300 rounded-lg text-sm focus:outline-none focus:border-primary-500 resize-none"
              placeholder="e.g. Fake review, abusive language, irrelevant..."
            />
            <div className="flex gap-3 justify-end pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setReportingId(null);
                  setReportReason('');
                }}
              >
                Cancel
              </Button>
              <Button onClick={submitReport} loading={submitting}>
                Submit Report
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}