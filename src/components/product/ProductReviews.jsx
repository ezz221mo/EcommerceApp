import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiStar, HiOutlineDotsVertical } from 'react-icons/hi';
import { useAuth } from '../../hooks/useAuth';
import { useProductStore } from '../../store';
import { setReview, getReviewsByProduct, getUserReview, deleteUserReview } from '../../services/reviewService';
import toast from 'react-hot-toast';

const StarInput = ({ value, onChange, hover, setHover, disabled }) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map(i => (
      <button
        key={i}
        type="button"
        disabled={disabled}
        onClick={() => onChange(i)}
        onMouseEnter={() => setHover(i)}
        onMouseLeave={() => setHover(0)}
        className={`transition-colors ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <HiStar
          className={`w-7 h-7 ${
            i <= (hover || value)
              ? 'text-amber-400 fill-amber-400'
              : 'text-stone-200 dark:text-stone-700'
          }`}
        />
      </button>
    ))}
  </div>
);

function formatDate(dateVal) {
  const d = dateVal?.toDate ? dateVal.toDate() : new Date(dateVal);
  const now = new Date();
  const diff = now - d;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function ProductReviews({ product }) {
  const productId = product?.id;
  const { currentUser, userData, isStoreOwner } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userReview, setUserReview] = useState(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [menuReviewId, setMenuReviewId] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const menuRef = useRef(null);

  const closeMenu = useCallback(() => setMenuReviewId(null), []);

  useEffect(() => {
    if (!menuReviewId) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuReviewId(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuReviewId]);

  const isSellerOwner = currentUser && isStoreOwner &&
    product?.sellerEmail === currentUser.email;

  useEffect(() => {
    if (!productId) return;
    let cancelled = false;
    (async () => {
      try {
        const [allReviews, myReview] = await Promise.all([
          getReviewsByProduct(productId),
          currentUser ? getUserReview(productId, currentUser.uid) : null,
        ]);
        if (cancelled) return;
        const sorted = [...(allReviews || [])].sort((a, b) => {
          const aTime = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
          const bTime = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
          return bTime - aTime;
        });
        setReviews(sorted);
        setUserReview(myReview);
        if (myReview) {
          setRating(myReview.rating);
          setComment(myReview.comment || '');
        }
      } catch {
        if (!cancelled) {
          toast.error('Failed to load reviews', { style: { borderRadius: '12px' } });
        }
      }
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [productId, currentUser]);

  const isReviewer = currentUser && !isSellerOwner;

  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0
    ? reviews.reduce((s, r) => s + r.rating, 0) / totalReviews
    : 0;

  useEffect(() => {
    if (productId) {
      useProductStore.getState().updateProduct(productId, {
        rating: +avgRating.toFixed(1),
        reviews: totalReviews,
      });
    }
  }, [productId, avgRating, totalReviews]);

  const distribution = [0, 0, 0, 0, 0];
  reviews.forEach(r => { if (r.rating >= 1 && r.rating <= 5) distribution[r.rating - 1]++; });
  const maxCount = Math.max(...distribution, 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser || rating === 0) return;
    setSubmitting(true);
    try {
      await setReview(productId, currentUser.uid, {
        rating,
        comment,
        buyerName: userData?.name || 'Anonymous',
        buyerEmail: userData?.email || '',
        buyerPhoto: userData?.photoURL || null,
      });
      const [allReviews, myReview] = await Promise.all([
        getReviewsByProduct(productId),
        getUserReview(productId, currentUser.uid),
      ]);
      const sorted = [...(allReviews || [])].sort((a, b) => {
        const aTime = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
        const bTime = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
        return bTime - aTime;
      });
      setReviews(sorted);
      setUserReview(myReview);
      setEditModalOpen(false);
      toast.success('Review submitted', { style: { borderRadius: '12px' } });
    } catch {
      toast.error('Failed to submit review', { style: { borderRadius: '12px' } });
    }
    setSubmitting(false);
  };

  const handleDelete = async () => {
    if (!currentUser || !userReview) return;
    try {
      await deleteUserReview(productId, currentUser.uid);
      setReviews(prev => prev.filter(r => r.uid !== currentUser.uid));
      setUserReview(null);
      setRating(0);
      setComment('');
      toast.success('Review deleted', { style: { borderRadius: '12px' } });
    } catch {
      toast.error('Failed to delete review', { style: { borderRadius: '12px' } });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <svg className="animate-spin w-6 h-6 text-orange-500" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  return (
    <>
    <section className="border-t border-stone-200 dark:border-stone-800 pt-12 mt-16">
      <div className="grid lg:grid-cols-3 gap-10">
        {/* Rating Summary */}
        <div>
          <h2 className="font-display text-2xl font-bold text-stone-900 dark:text-stone-100 mb-6">
            Customer Reviews
          </h2>
          <div className="flex items-center gap-3 mb-4">
            <span className="font-display text-5xl font-bold text-stone-900 dark:text-stone-100">
              {avgRating > 0 ? avgRating.toFixed(1) : '0.0'}
            </span>
            <div>
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map(i => (
                  <HiStar
                    key={i}
                    className={`w-5 h-5 ${i <= Math.round(avgRating) ? 'text-amber-400 fill-amber-400' : 'text-stone-200 dark:text-stone-700'}`}
                  />
                ))}
              </div>
              <p className="text-sm text-stone-500 dark:text-stone-400 mt-0.5">
                {totalReviews} review{totalReviews !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Distribution bars */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map(star => {
              const idx = star - 1;
              const count = distribution[idx];
              const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-2 text-sm">
                  <span className="w-6 text-right text-stone-500 dark:text-stone-400 font-medium">{star}</span>
                  <HiStar className="w-3.5 h-3.5 text-amber-400 fill-amber-400 flex-shrink-0" />
                  <div className="flex-1 h-2.5 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-6 text-right text-stone-500 dark:text-stone-400 text-xs">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Reviews List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Add / Edit Review — buyer only, not seller of this product */}
          {isReviewer && (
            <div className="card p-5">
              <h4 className="font-semibold text-stone-900 dark:text-stone-100 mb-4">
                {userReview ? 'Your Review' : 'Write a Review'}
              </h4>
              {!userReview ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <StarInput
                    value={rating}
                    onChange={setRating}
                    hover={hoverRating}
                    setHover={setHoverRating}
                    disabled={submitting}
                  />
                  {rating === 0 && <p className="text-xs text-rose-500">Please select a rating</p>}
                  <textarea
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    placeholder="Share your thoughts about this product..."
                    rows={3}
                    className="input-field resize-none"
                    required
                  />
                  <div className="flex items-center gap-3">
                    <button
                      type="submit"
                      disabled={rating === 0 || submitting}
                      className="btn-primary text-sm"
                    >
                      {submitting ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </div>
                </form>
              ) : (
                <div>
                  <p className="text-sm text-stone-500 dark:text-stone-400">
                    You have reviewed this product. Use the <span className="font-semibold">&middot;&middot;&middot;</span> menu to edit or delete.
                  </p>
                </div>
              )}
            </div>
          )}

          {reviews.length === 0 && !currentUser && (
            <div className="text-center py-12">
              <p className="text-stone-400 text-sm">No reviews yet.</p>
              <p className="text-stone-400 text-xs mt-1">Sign in to be the first to review.</p>
            </div>
          )}

          {reviews.length === 0 && isReviewer && !userReview && (
            <div className="text-center py-12">
              <p className="text-stone-400 text-sm">No reviews yet.</p>
              <p className="text-stone-400 text-xs mt-1">Be the first to review this product.</p>
            </div>
          )}

          {reviews.length === 0 && isSellerOwner && (
            <div className="text-center py-12">
              <p className="text-stone-400 text-sm">No reviews yet.</p>
            </div>
          )}

          {isSellerOwner && (
            <div className="text-center py-4">
              <p className="text-stone-400 text-xs italic">Sellers cannot review their own products.</p>
            </div>
          )}

          {/* Individual reviews */}
          {reviews.map((review, i) => {
            const isAuthor = currentUser && review.uid === currentUser.uid;
            return (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="relative p-5 bg-stone-50 dark:bg-stone-800/50 rounded-2xl"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-teal-500
                                    flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {(review.buyerName || 'A').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-stone-900 dark:text-stone-100 text-sm">
                        {review.buyerName || 'Anonymous'}
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map(i => (
                            <HiStar
                              key={i}
                              className={`w-3.5 h-3.5 ${i <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-stone-200 dark:text-stone-700'}`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-stone-400">{formatDate(review.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* 3-dot menu — only for the review author */}
                  {isAuthor && (
                    <div className="relative" ref={menuReviewId === review.id ? menuRef : null}>
                      <button
                        onClick={() => setMenuReviewId(menuReviewId === review.id ? null : review.id)}
                        className="p-1.5 rounded-xl hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
                      >
                        <HiOutlineDotsVertical className="w-4 h-4 text-stone-500" />
                      </button>
                      <AnimatePresence>
                        {menuReviewId === review.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.92, y: -4 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.92, y: -4 }}
                            transition={{ duration: 0.12 }}
                            className="absolute right-0 top-full mt-1 w-32 bg-white dark:bg-stone-800
                                       rounded-xl shadow-xl border border-stone-200 dark:border-stone-700
                                       overflow-hidden z-20"
                          >
                            <button
                              onClick={() => {
                                closeMenu();
                                setRating(review.rating);
                                setComment(review.comment || '');
                                setEditModalOpen(true);
                              }}
                              className="w-full px-4 py-2.5 text-left text-sm font-medium
                                         text-stone-700 dark:text-stone-300
                                         hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => { closeMenu(); setConfirmDeleteId(review.id); }}
                              className="w-full px-4 py-2.5 text-left text-sm font-medium
                                         text-rose-600 dark:text-rose-400
                                         hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                            >
                              Delete
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
                {review.comment && (
                  <p className="text-stone-600 dark:text-stone-400 text-sm leading-relaxed">
                    {review.comment}
                  </p>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>

      {/* ── Delete Confirmation Dialog ── */}
      <AnimatePresence>
        {confirmDeleteId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setConfirmDeleteId(null)}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white dark:bg-stone-900 rounded-3xl shadow-2xl p-6 max-w-sm w-full"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="font-display text-lg font-bold text-stone-900 dark:text-stone-100 mb-2">
                Delete Review?
              </h3>
              <p className="text-sm text-stone-500 dark:text-stone-400 mb-6">
                This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  className="btn-secondary flex-1 justify-center text-sm py-2.5"
                >
                  Cancel
                </button>
                <button
                  onClick={() => { setConfirmDeleteId(null); handleDelete(); }}
                  className="btn-primary flex-1 justify-center text-sm py-2.5 bg-rose-600 hover:bg-rose-700 dark:bg-rose-500 dark:hover:bg-rose-600"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Edit Review Modal ── */}
      <AnimatePresence>
        {editModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setEditModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white dark:bg-stone-900 rounded-3xl shadow-2xl p-6 max-w-md w-full"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="font-display text-lg font-bold text-stone-900 dark:text-stone-100 mb-4">
                Edit Your Review
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <StarInput
                  value={rating}
                  onChange={setRating}
                  hover={hoverRating}
                  setHover={setHoverRating}
                  disabled={submitting}
                />
                {rating === 0 && <p className="text-xs text-rose-500">Please select a rating</p>}
                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="Share your thoughts about this product..."
                  rows={3}
                  className="input-field resize-none"
                  required
                />
                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={rating === 0 || submitting}
                    className="btn-primary text-sm"
                  >
                    {submitting ? 'Updating...' : 'Update Review'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditModalOpen(false)}
                    className="text-sm text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
