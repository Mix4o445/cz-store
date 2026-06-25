import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Loader2, CheckCircle2, Trash2 } from 'lucide-react';
import {
  useProductReviews,
  useSubmitReview,
  useDeleteReview,
} from '@/hooks/useReviews';
import { useAuthStore } from '@/store/authStore';
import { getApiErrorMessage } from '@/hooks/useAuth';
import RatingStars from '@/components/common/RatingStars';
import StarInput from '@/components/common/StarInput';

function fmtDate(date, lang) {
  if (!date) return '';
  return new Intl.DateTimeFormat('fr-MA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}

export default function ProductReviews({ productId }) {
  const { t, i18n } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const { data, isLoading, isError, error, refetch } = useProductReviews(productId);
  const submit = useSubmitReview(productId);
  const remove = useDeleteReview(productId);

  const reviews = data?.reviews ?? [];
  const mine = data?.mine ?? null;

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [showSaved, setShowSaved] = useState(false);

  // When the user already has a review, prefill the form so it acts as edit.
  useEffect(() => {
    if (mine) {
      setRating(mine.rating);
      setComment(mine.comment ?? '');
    }
  }, [mine?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = (e) => {
    e.preventDefault();
    if (!rating) return;
    submit.mutate(
      { rating, comment },
      {
        onSuccess: () => {
          setShowSaved(true);
          setTimeout(() => setShowSaved(false), 2000);
        },
      }
    );
  };

  return (
    <section id="reviews" className="container-app py-12 md:py-16 border-t border-line">
      <header className="mb-10 flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-3">{t('reviews.eyebrow')}</p>
          <h2 className="font-display font-medium text-display-sm">{t('reviews.title')}</h2>
        </div>
        <p className="text-sm text-ink-muted whitespace-nowrap">
          {t('reviews.count', { count: reviews.length })}
        </p>
      </header>

      <div className="grid lg:grid-cols-[1fr_360px] gap-12">
        {/* Reviews list */}
        <div>
          {isLoading && (
            <div className="grid place-items-center py-12 text-ink-muted">
              <Loader2 size={22} className="animate-spin" />
            </div>
          )}
          {isError && (
            <div className="border border-line p-6 text-center text-sm">
              <p className="text-signal mb-3">{getApiErrorMessage(error, t('common.error'))}</p>
              <button onClick={() => refetch()} className="btn-outline">
                {t('common.retry')}
              </button>
            </div>
          )}
          {!isLoading && !isError && reviews.length === 0 && (
            <div className="border border-line p-12 text-center text-sm text-ink-muted">
              {t('reviews.empty')}
            </div>
          )}
          {reviews.length > 0 && (
            <ul className="divide-y divide-line border-y border-line">
              {reviews.map((r) => {
                const isMine = user?._id === r.user?._id;
                return (
                  <li key={r._id} className="py-6 space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-ink/5 grid place-items-center text-xs font-semibold text-ink">
                          {(r.user?.name ?? '?').slice(0, 1).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{r.user?.name ?? '—'}</p>
                          <p className="text-[11px] text-ink-muted">
                            {fmtDate(r.createdAt, i18n.language)}
                          </p>
                        </div>
                      </div>
                      <RatingStars value={r.rating} />
                    </div>
                    {r.comment && (
                      <p className="text-sm text-ink/80 leading-relaxed pl-11">{r.comment}</p>
                    )}
                    {isMine && (
                      <div className="pl-11">
                        <button
                          onClick={() => {
                            if (window.confirm(t('reviews.confirm_delete'))) {
                              remove.mutate(r._id);
                            }
                          }}
                          className="inline-flex items-center gap-1 text-xs text-ink-muted hover:text-signal"
                        >
                          <Trash2 size={12} strokeWidth={1.5} />
                          {t('reviews.delete')}
                        </button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Review form */}
        <aside className="lg:sticky lg:top-24 h-fit border border-line p-6 space-y-5">
          <h3 className="font-display text-lg font-medium">
            {mine ? t('reviews.update_yours') : t('reviews.write')}
          </h3>

          {!user ? (
            <div className="text-sm text-ink-muted space-y-3">
              <p>{t('reviews.must_login')}</p>
              <Link to="/login" className="btn-outline w-full text-center">
                {t('auth.login')}
              </Link>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <p className="text-[11px] uppercase tracking-wider-2 text-ink-muted mb-2">
                  {t('reviews.rating')}
                </p>
                <StarInput value={rating} onChange={setRating} />
              </div>
              <label className="block">
                <span className="text-[11px] uppercase tracking-wider-2 text-ink-muted">
                  {t('reviews.comment')}
                </span>
                <textarea
                  rows={4}
                  maxLength={2000}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={t('reviews.comment_placeholder')}
                  className="mt-2 w-full bg-transparent border-b border-ink/20 px-0 py-2.5 outline-none focus:border-ink resize-none"
                />
              </label>

              {submit.isError && (
                <p className="text-sm text-signal border-s-2 border-signal ps-3">
                  {getApiErrorMessage(submit.error)}
                </p>
              )}

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={submit.isPending || !rating}
                  className="btn-primary inline-flex items-center justify-center gap-2"
                >
                  {submit.isPending && <Loader2 size={14} className="animate-spin" />}
                  {mine ? t('reviews.update') : t('reviews.submit')}
                </button>
                {showSaved && (
                  <span className="inline-flex items-center gap-1 text-sm text-emerald-700">
                    <CheckCircle2 size={14} strokeWidth={1.8} />
                    {t('reviews.posted')}
                  </span>
                )}
              </div>
            </form>
          )}
        </aside>
      </div>
    </section>
  );
}
