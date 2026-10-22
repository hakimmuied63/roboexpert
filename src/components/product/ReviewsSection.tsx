import { useEffect, useState, useRef } from 'react';
import { Star, ImagePlus, X, Flag } from 'lucide-react';
import { Button } from '../ui';
import {
  fetchProductReviews,
  createProductReview,
  reportProductReview,
  uploadReviewImage,
  type Review,
} from '../../lib/api';
import toast from 'react-hot-toast';

type Props = {
  productId: string;
  ratingAverage?: number;
  ratingCount?: number;
};

const StarRow = ({ value, size = 16 }: { value: number; size?: number }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((n) => (
      <Star
        key={n}
        style={{ width: size, height: size }}
        className={
          n <= Math.round(value) ? 'fill-yellow-400 text-yellow-400' : 'text-surface-300'
        }
      />
    ))}
  </div>
);

export function ReviewsSection({ productId, ratingAverage = 0, ratingCount = 0 }: Props) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingReviews, setLoadingReviews] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Guest verification fields
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');

  const [reportOpen, setReportOpen] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [reporting, setReporting] = useState(false);

  const loadReviews = async (p: number) => {
    setLoadingReviews(true);
    const data = await fetchProductReviews(productId, p, 10);
    if (data.ok) {
      setReviews(data.reviews);
      setTotalPages(data.pagination.pages);
    }
    setLoadingReviews(false);
  };

  useEffect(() => {
    loadReviews(1);
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    const remaining = 3 - images.length;
    if (remaining <= 0) {
      toast.error('Maximum 3 images per review');
      return;
    }

    setUploading(true);
    const newUrls: string[] = [];
    for (const file of files.slice(0, remaining)) {
      const url = await uploadReviewImage(file);
      if (url) newUrls.push(url);
      else toast.error(`Could not upload ${file.name}`);
    }
    setImages((prev) => [...prev, ...newUrls]);
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const submitReview = async () => {
    if (!orderNumber.trim() || !email.trim()) {
      toast.error('Please enter your Order Number and Email to verify.');
      return;
    }
    if (rating < 1) {
      toast.error('Please select a star rating');
      return;
    }
    setSubmitting(true);
    const result = await createProductReview(productId, {
      orderNumber: orderNumber.trim(),
      email: email.trim(),
      rating,
      comment: comment.trim() || undefined,
      images: images.length > 0 ? images : undefined,
    });
    setSubmitting(false);

    if (!result.ok) {
      toast.error(result.error || 'Could not submit review');
      return;
    }

    toast.success('Review submitted successfully!');
    setFormOpen(false);
    setOrderNumber('');
    setEmail('');
    setRating(0);
    setComment('');
    setImages([]);
    await loadReviews(1);
    setPage(1);
  };

  const submitReport = async () => {
    if (!reportOpen) return;
    if (reportReason.trim().length < 3) {
      toast.error('Please provide a reason');
      return;
    }
    setReporting(true);
    const ok = await reportProductReview(reportOpen, reportReason.trim());
    setReporting(false);
    if (!ok) {
      toast.error('Could not report review');
      return;
    }
    toast.success('Review reported');
    setReportOpen(null);
    setReportReason('');
  };

  return (
    <div className="mt-16 max-w-3xl">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <h2 className="text-lg font-semibold text-surface-900">Reviews & Ratings</h2>
          <div className="flex items-center gap-3 mt-2">
            <StarRow value={ratingAverage} size={18} />
            <span className="text-sm text-surface-600">
              {ratingAverage.toFixed(1)} / 5 · {ratingCount} review
              {ratingCount === 1 ? '' : 's'}
            </span>
          </div>
        </div>
        {!formOpen && (
          <Button onClick={() => setFormOpen(true)}>Write a review</Button>
        )}
      </div>

      {formOpen && (
        <div className="bg-white border border-surface-200 rounded-xl p-5 mb-6 space-y-4">
          
          {/* Guest Verification Section */}
          <div className="bg-surface-50 p-4 rounded-lg border border-surface-200 space-y-3">
            <p className="text-sm font-medium text-surface-900">
              Verify your purchase
            </p>
            <p className="text-xs text-surface-500">
              Enter the Order Number and Email used at checkout to verify you bought this item.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Order Number (e.g. ORD-2026-XXXX)"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 border border-surface-300 rounded-lg text-sm focus:outline-none focus:border-primary-500"
              />
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-surface-300 rounded-lg text-sm focus:outline-none focus:border-primary-500"
              />
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-surface-900 mb-2">Your rating</p>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onMouseEnter={() => setHoverRating(n)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(n)}
                  className="p-1"
                >
                  <Star
                    className={`w-7 h-7 ${
                      n <= (hoverRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-surface-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-surface-900 mb-2">
              Comment <span className="text-surface-400 font-normal">(optional)</span>
            </p>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              maxLength={2000}
              className="w-full px-3 py-2 border border-surface-300 rounded-lg text-sm focus:outline-none focus:border-primary-500 resize-none"
              placeholder="Share your experience with this product..."
            />
            <p className="text-xs text-surface-400 text-right mt-1">{comment.length}/2000</p>
          </div>

          <div>
            <p className="text-sm font-medium text-surface-900 mb-2">
              Photos <span className="text-surface-400 font-normal">(optional, max 3)</span>
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              {images.map((url, idx) => (
                <div key={idx} className="relative">
                  <img
                    src={url}
                    alt={`Review photo ${idx + 1}`}
                    className="w-20 h-20 rounded-lg object-cover border border-surface-200"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {images.length < 3 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-20 h-20 rounded-lg border-2 border-dashed border-surface-300 flex flex-col items-center justify-center text-surface-400 hover:border-primary-400 hover:text-primary-500 transition-colors disabled:opacity-50"
                >
                  <ImagePlus className="w-5 h-5" />
                  <span className="text-[10px] mt-1">
                    {uploading ? 'Uploading...' : 'Add'}
                  </span>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setFormOpen(false);
                setOrderNumber('');
                setEmail('');
                setRating(0);
                setComment('');
                setImages([]);
              }}
            >
              Cancel
            </Button>
            <Button onClick={submitReview} loading={submitting}>
              Submit Review
            </Button>
          </div>
        </div>
      )}

      {loadingReviews ? (
        <p className="text-sm text-surface-500">Loading reviews...</p>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-surface-500">
          No reviews yet. Be the first to share your experience.
        </p>
      ) : (
        <>
          <div className="space-y-4">
            {reviews.map((r) => (
              <div key={r._id} className="bg-white border border-surface-200 rounded-xl p-5">
                <div className="flex items-start justify-between flex-wrap gap-2 mb-2">
                  <div>
                    <p className="text-sm font-semibold text-surface-900">{r.buyerName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <StarRow value={r.rating} size={14} />
                      <span className="text-xs text-surface-500">
                        {new Date(r.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setReportOpen(r._id)}
                    className="inline-flex items-center gap-1 text-xs text-surface-400 hover:text-red-600 transition-colors"
                  >
                    <Flag className="w-3.5 h-3.5" />
                    Report
                  </button>
                </div>

                {r.comment && (
                  <p className="text-sm text-surface-700 whitespace-pre-line mt-2">
                    {r.comment}
                  </p>
                )}

                {r.images && r.images.length > 0 && (
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {r.images.map((url, i) => (
                      <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <img
                          src={url}
                          alt={`Review photo ${i + 1}`}
                          className="w-20 h-20 rounded-lg object-cover border border-surface-200 hover:opacity-90"
                        />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-6">
              <Button
                variant="outline"
                disabled={page <= 1}
                onClick={() => {
                  const p = page - 1;
                  setPage(p);
                  loadReviews(p);
                }}
              >
                Previous
              </Button>
              <span className="text-sm text-surface-600">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                disabled={page >= totalPages}
                onClick={() => {
                  const p = page + 1;
                  setPage(p);
                  loadReviews(p);
                }}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {reportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-surface-900 mb-1">Report this review</h2>
            <p className="text-sm text-surface-500 mb-4">
              Tell us what's wrong with this review. Admins will review it.
            </p>
            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              rows={3}
              maxLength={500}
              className="w-full px-3 py-2 border border-surface-300 rounded-lg text-sm focus:outline-none focus:border-primary-500 resize-none"
              placeholder="e.g. Spam, inappropriate language, fake review..."
            />
            <div className="flex gap-3 justify-end pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setReportOpen(null);
                  setReportReason('');
                }}
              >
                Cancel
              </Button>
              <Button onClick={submitReport} loading={reporting}>
                Report
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}