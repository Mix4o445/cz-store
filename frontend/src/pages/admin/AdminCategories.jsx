import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, Plus, Pencil, Trash2, ImageUp, X, Image as ImageIcon } from 'lucide-react';
import { useCategories } from '@/hooks/useCategories';
import { useCreateCategory, useUpdateCategory, useDeleteCategory } from '@/hooks/useAdmin';
import { getApiErrorMessage } from '@/hooks/useAuth';
import { adminApi } from '@/api/admin.api';

const inputCls = 'w-full bg-transparent border-b border-ink/20 px-0 py-2.5 outline-none focus:border-ink';

function CategoryForm({ initial, onCancel, onSaved }) {
  const { t } = useTranslation();
  const isEdit = !!initial?._id;
  const create = useCreateCategory();
  const update = useUpdateCategory();
  const [form, setForm] = useState({
    name: { fr: initial?.name?.fr ?? '' },
    icon: initial?.icon ?? '',
    image: initial?.image ?? '',
    order: initial?.order ?? 0,
  });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);

  const onPickFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    setUploadError('');
    try {
      const { url } = await adminApi.uploadImage(file);
      setForm((f) => ({ ...f, image: url }));
    } catch (err) {
      setUploadError(err?.response?.data?.message || t('admin.categories.upload_error'));
    } finally {
      setUploading(false);
    }
  };

  const handle = (e) => {
    e.preventDefault();
    const payload = { ...form, order: Number(form.order || 0) };
    const cb = { onSuccess: () => onSaved?.() };
    if (isEdit) update.mutate({ id: initial._id, ...payload }, cb);
    else create.mutate(payload, cb);
  };
  const m = isEdit ? update : create;

  return (
    <form onSubmit={handle} className="border border-line p-6 grid sm:grid-cols-2 gap-5">
      <label className="block">
        <span className="text-[11px] uppercase tracking-wider-2 text-ink-muted">{t('admin.categories.name_fr')}</span>
        <input
          required
          value={form.name.fr}
          onChange={(e) => setForm((f) => ({ ...f, name: { ...f.name, fr: e.target.value } }))}
          className={inputCls}
        />
      </label>
      <label className="block">
        <span className="text-[11px] uppercase tracking-wider-2 text-ink-muted">{t('admin.categories.icon')}</span>
        <input
          value={form.icon}
          onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
          placeholder="Wind, Layers…"
          className={inputCls}
        />
      </label>
      <label className="block">
        <span className="text-[11px] uppercase tracking-wider-2 text-ink-muted">{t('admin.categories.order')}</span>
        <input
          type="number"
          value={form.order}
          onChange={(e) => setForm((f) => ({ ...f, order: e.target.value }))}
          className={inputCls}
        />
      </label>

      {/* Image upload */}
      <div className="sm:col-span-2">
        <span className="text-[11px] uppercase tracking-wider-2 text-ink-muted">
          {t('admin.categories.image')}
        </span>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onPickFile}
        />
        <div className="mt-2 flex items-start gap-4">
          {form.image ? (
            <div className="relative shrink-0">
              <img
                src={form.image}
                alt=""
                className="w-28 h-28 object-cover border border-line"
              />
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, image: '' }))}
                className="absolute -top-2 -end-2 bg-paper border border-line p-1 rounded-full text-ink-muted hover:text-signal"
                aria-label="remove image"
              >
                <X size={12} />
              </button>
            </div>
          ) : (
            <div className="w-28 h-28 shrink-0 grid place-items-center border border-dashed border-ink/20 text-ink-muted">
              <ImageIcon size={22} strokeWidth={1.4} />
            </div>
          )}
          <div className="flex-1 space-y-2">
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 border border-line px-3 py-2 text-sm hover:bg-ink/5 disabled:opacity-60"
            >
              {uploading ? <Loader2 size={14} className="animate-spin" /> : <ImageUp size={14} />}
              {t('admin.categories.upload_image')}
            </button>
            <input
              type="url"
              value={form.image}
              onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
              placeholder="https://…"
              className={inputCls}
            />
            <p className="text-[11px] text-ink-muted">{t('admin.categories.image_hint')}</p>
          </div>
        </div>
        {uploadError && <p className="mt-2 text-sm text-signal">{uploadError}</p>}
      </div>

      {m.isError && (
        <p className="sm:col-span-2 text-sm text-signal border-s-2 border-signal ps-3">
          {getApiErrorMessage(m.error)}
        </p>
      )}
      <div className="sm:col-span-2 flex items-center gap-3 pt-2">
        <button type="submit" disabled={m.isPending || uploading} className="btn-primary inline-flex items-center gap-2">
          {m.isPending && <Loader2 size={14} className="animate-spin" />}
          {t('admin.products.save')}
        </button>
        <button type="button" onClick={onCancel} className="btn-ghost text-sm">
          {t('account.cancel')}
        </button>
      </div>
    </form>
  );
}

export default function AdminCategories() {
  const { t } = useTranslation();
  const { data: categories = [], isLoading } = useCategories();
  const remove = useDeleteCategory();
  const [editing, setEditing] = useState(null);

  return (
    <div>
      <header className="flex items-end justify-between border-b border-line pb-5 mb-8">
        <div>
          <h2 className="font-display text-2xl md:text-3xl font-medium">{t('admin.categories.title')}</h2>
          <p className="text-ink-muted text-sm mt-1">{t('admin.categories.sub')}</p>
        </div>
        {!editing && (
          <button onClick={() => setEditing('new')} className="btn-primary text-sm">
            <Plus size={14} strokeWidth={1.6} />
            {t('admin.categories.add')}
          </button>
        )}
      </header>

      {editing && (
        <div className="mb-8">
          <CategoryForm
            initial={editing === 'new' ? null : editing}
            onCancel={() => setEditing(null)}
            onSaved={() => setEditing(null)}
          />
        </div>
      )}

      {!editing && (
        <>
          {isLoading && (
            <div className="grid place-items-center py-12 text-ink-muted">
              <Loader2 size={26} className="animate-spin" />
            </div>
          )}
          {!isLoading && categories.length === 0 && (
            <div className="border border-line p-12 text-center text-sm text-ink-muted">
              {t('admin.categories.empty')}
            </div>
          )}
          {categories.length > 0 && (
            <ul className="grid sm:grid-cols-2 gap-px bg-line border border-line">
              {categories.map((c) => (
                <li key={c._id} className="bg-paper p-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    {c.image ? (
                      <img src={c.image} alt="" className="w-12 h-12 object-cover border border-line shrink-0" />
                    ) : (
                      <div className="w-12 h-12 grid place-items-center border border-dashed border-ink/20 text-ink-muted shrink-0">
                        <ImageIcon size={16} strokeWidth={1.4} />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-medium truncate">{c.name?.fr}</p>
                      <p className="text-[10px] text-ink-muted mt-0.5">{c.slug}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditing(c)}
                      className="p-2 text-ink-muted hover:text-ink rounded-full hover:bg-ink/5"
                    >
                      <Pencil size={14} strokeWidth={1.5} />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(t('admin.categories.confirm_delete'))) {
                          remove.mutate(c._id);
                        }
                      }}
                      className="p-2 text-ink-muted hover:text-signal rounded-full hover:bg-signal/5"
                    >
                      <Trash2 size={14} strokeWidth={1.5} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
