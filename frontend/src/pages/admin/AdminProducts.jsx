import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, Plus, Pencil, Trash2, Copy, Star } from 'lucide-react';
import { useProductList } from '@/hooks/useProducts';
import { useDeleteProduct, useDuplicateProduct, useUpdateProduct } from '@/hooks/useAdmin';
import { getApiErrorMessage } from '@/hooks/useAuth';
import { formatPrice } from '@/utils/formatPrice';
import AdminProductForm from './AdminProductForm';

export default function AdminProducts() {
  const { t } = useTranslation();
  const { data, isLoading, isError, error, refetch } = useProductList({ limit: 100 });
  const remove = useDeleteProduct();
  const duplicate = useDuplicateProduct();
  const update = useUpdateProduct();
  const [editing, setEditing] = useState(null); // null | 'new' | product
  const [duplicatingId, setDuplicatingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  const togglePopular = (p) => {
    setTogglingId(p._id);
    update.mutate(
      { id: p._id, isPopular: !p.isPopular },
      { onSettled: () => setTogglingId(null) }
    );
  };

  const products = data?.items ?? [];

  return (
    <div>
      <header className="flex items-end justify-between border-b border-line pb-5 mb-8">
        <div>
          <h2 className="font-display text-2xl md:text-3xl font-medium">{t('admin.products.title')}</h2>
          <p className="text-ink-muted text-sm mt-1">{t('admin.products.sub')}</p>
        </div>
        {!editing && (
          <button onClick={() => setEditing('new')} className="btn-primary text-sm">
            <Plus size={14} strokeWidth={1.6} />
            {t('admin.products.add')}
          </button>
        )}
      </header>

      {editing && (
        <AdminProductForm
          initial={editing === 'new' ? null : editing}
          onCancel={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            refetch();
          }}
        />
      )}

      {!editing && (
        <>
          {isLoading && (
            <div className="grid place-items-center py-12 text-ink-muted">
              <Loader2 size={26} className="animate-spin" />
            </div>
          )}
          {isError && (
            <div className="border border-line p-6 text-center text-sm">
              <p className="text-signal mb-3">{getApiErrorMessage(error, t('common.error'))}</p>
              <button onClick={() => refetch()} className="btn-outline">{t('common.retry')}</button>
            </div>
          )}
          {duplicate.isError && (
            <p className="mb-4 text-sm text-signal border-s-2 border-signal ps-3">
              {getApiErrorMessage(duplicate.error)}
            </p>
          )}
          {!isLoading && !isError && products.length === 0 && (
            <div className="border border-line p-12 text-center text-sm text-ink-muted">
              {t('admin.products.empty')}
            </div>
          )}
          {products.length > 0 && (
            <div className="overflow-x-auto -mx-6 md:mx-0">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-[11px] uppercase tracking-wider-2 text-ink-muted">
                    <th className="text-start font-medium px-6 md:px-0 py-3">{t('admin.products.name_fr')}</th>
                    <th className="text-start font-medium py-3">{t('admin.products.brand')}</th>
                    <th className="text-end font-medium py-3">{t('admin.products.price')}</th>
                    <th className="text-end font-medium py-3">{t('admin.products.stock')}</th>
                    <th className="text-start font-medium py-3">{t('admin.products.tags')}</th>
                    <th className="text-center font-medium py-3">{t('admin.products.is_popular')}</th>
                    <th className="py-3 text-end pe-6 md:pe-0"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line border-y border-line">
                  {products.map((p) => (
                    <tr key={p._id} className="align-middle">
                      <td className="py-3 ps-6 md:ps-0 pe-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-chrome shrink-0">
                            {p.images?.[0] && <img src={p.images[0]} alt="" className="w-full h-full object-cover" />}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium truncate">{p.name?.fr}</p>
                            <p className="text-[11px] text-ink-muted truncate">{p.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 pe-3 text-ink-muted whitespace-nowrap">{p.brand ?? '—'}</td>
                      <td className="py-3 pe-3 text-end price">{formatPrice(p.price)}</td>
                      <td className={`py-3 pe-3 text-end num ${p.stock === 0 ? 'text-signal' : ''}`}>
                        {p.stock ?? 0}
                      </td>
                      <td className="py-3 pe-3">
                        {Array.isArray(p.tags) && p.tags.length ? (
                          <div className="flex flex-wrap gap-1">
                            {p.tags.slice(0, 3).map((tag) => (
                              <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-ink/5 rounded">
                                {tag}
                              </span>
                            ))}
                            {p.tags.length > 3 && (
                              <span className="text-[10px] text-ink-muted">+{p.tags.length - 3}</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-ink-muted">—</span>
                        )}
                      </td>
                      <td className="py-3 pe-3 text-center">
                        <button
                          type="button"
                          onClick={() => togglePopular(p)}
                          disabled={togglingId === p._id}
                          title={
                            p.isPopular
                              ? t('admin.products.unmark_popular')
                              : t('admin.products.mark_popular')
                          }
                          aria-label={
                            p.isPopular
                              ? t('admin.products.unmark_popular')
                              : t('admin.products.mark_popular')
                          }
                          aria-pressed={!!p.isPopular}
                          className={`inline-flex items-center justify-center w-8 h-8 rounded-full transition-colors disabled:opacity-50 ${
                            p.isPopular
                              ? 'bg-ink text-paper hover:bg-primary'
                              : 'text-ink-muted hover:text-ink hover:bg-ink/5'
                          }`}
                        >
                          {togglingId === p._id ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : (
                            <Star
                              size={14}
                              strokeWidth={1.5}
                              className={p.isPopular ? 'fill-current' : ''}
                            />
                          )}
                        </button>
                      </td>
                      <td className="py-3 pe-6 md:pe-0 text-end">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => setEditing(p)}
                            className="p-2 text-ink-muted hover:text-ink rounded-full hover:bg-ink/5"
                            aria-label={t('admin.products.edit')}
                          >
                            <Pencil size={14} strokeWidth={1.5} />
                          </button>
                          <button
                            onClick={() => {
                              setDuplicatingId(p._id);
                              duplicate.mutate(p._id, {
                                onSettled: () => setDuplicatingId(null),
                              });
                            }}
                            disabled={duplicatingId === p._id}
                            className="p-2 text-ink-muted hover:text-ink rounded-full hover:bg-ink/5 disabled:opacity-50"
                            aria-label={t('admin.products.duplicate')}
                            title={t('admin.products.duplicate')}
                          >
                            {duplicatingId === p._id ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <Copy size={14} strokeWidth={1.5} />
                            )}
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(t('admin.products.confirm_delete'))) {
                                remove.mutate(p._id);
                              }
                            }}
                            className="p-2 text-ink-muted hover:text-signal rounded-full hover:bg-signal/5"
                            aria-label={t('admin.products.delete')}
                          >
                            <Trash2 size={14} strokeWidth={1.5} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
