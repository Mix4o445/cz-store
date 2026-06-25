import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, Plus, Pencil, Trash2, ImageUp } from 'lucide-react';
import { useBrands, useCreateBrand, useUpdateBrand, useDeleteBrand } from '@/hooks/useBrands';
import { getApiErrorMessage } from '@/hooks/useAuth';
import { adminApi } from '@/api/admin.api';

const inputCls = 'w-full bg-transparent border-b border-ink/20 px-0 py-2.5 outline-none focus:border-ink';

function BrandForm({ initial, onCancel, onSaved }) {
  const { t } = useTranslation();
  const isEdit = !!initial?._id;
  const create = useCreateBrand();
  const update = useUpdateBrand();
  const [form, setForm] = useState({
    name: initial?.name ?? '',
    logo: initial?.logo ?? '',
    description: initial?.description ?? '',
    order: initial?.order ?? 0,
  });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);

  const onChange = (e) => {
    const { name, value, type } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'number' ? Number(value) : value }));
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
        <span className="text-[11px] uppercase tracking-wider-2 text-ink-muted">{t('admin.brands.name')}</span>
        <input name="name" value={form.name} onChange={onChange} required className={inputCls} />
      </label>
      <label className="block">
        <span className="text-[11px] uppercase tracking-wider-2 text-ink-muted">{t('admin.brands.order')}</span>
        <input name="order" type="number" value={form.order} onChange={onChange} className={inputCls} />
      </label>
      <div className="block sm:col-span-2">
        <span className="text-[11px] uppercase tracking-wider-2 text-ink-muted">{t('admin.brands.logo')}</span>
        <div className="flex items-center gap-2 mt-2">
          <input name="logo" type="url" value={form.logo} onChange={onChange} placeholder="https://…" className={inputCls} />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              e.target.value = '';
              if (!file) return;
              setUploading(true);
              setUploadError('');
              try {
                const { url } = await adminApi.uploadImage(file);
                setForm((f) => ({ ...f, logo: url }));
              } catch (err) {
                setUploadError(err?.response?.data?.message || 'Échec du téléchargement');
              } finally { setUploading(false); }
            }}
          />
          <button
            type="button"
            title="Télécharger un logo"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-ink-muted hover:text-ink rounded-full hover:bg-ink/5 shrink-0"
          >
            {uploading ? <Loader2 size={14} className="animate-spin" /> : <ImageUp size={14} />}
          </button>
        </div>
        {uploadError && <p className="mt-1 text-sm text-signal">{uploadError}</p>}
      </div>
      <label className="block sm:col-span-2">
        <span className="text-[11px] uppercase tracking-wider-2 text-ink-muted">{t('admin.brands.description')}</span>
        <textarea name="description" rows={2} value={form.description} onChange={onChange} className={`${inputCls} resize-none`} />
      </label>
      {m.isError && (
        <p className="sm:col-span-2 text-sm text-signal border-s-2 border-signal ps-3">
          {getApiErrorMessage(m.error)}
        </p>
      )}
      <div className="sm:col-span-2 flex items-center gap-3 pt-2">
        <button type="submit" disabled={m.isPending} className="btn-primary inline-flex items-center gap-2">
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

export default function AdminBrands() {
  const { t } = useTranslation();
  const { data: brands = [], isLoading } = useBrands();
  const remove = useDeleteBrand();
  const [editing, setEditing] = useState(null);

  return (
    <div>
      <header className="flex items-end justify-between border-b border-line pb-5 mb-8">
        <div>
          <h2 className="font-display text-2xl md:text-3xl font-medium">{t('admin.brands.title')}</h2>
          <p className="text-ink-muted text-sm mt-1">{t('admin.brands.sub')}</p>
        </div>
        {!editing && (
          <button onClick={() => setEditing('new')} className="btn-primary text-sm">
            <Plus size={14} strokeWidth={1.6} />
            {t('admin.brands.add')}
          </button>
        )}
      </header>

      {editing && (
        <div className="mb-8">
          <BrandForm
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
          {!isLoading && brands.length === 0 && (
            <div className="border border-line p-12 text-center text-sm text-ink-muted">
              {t('admin.brands.empty')}
            </div>
          )}
          {brands.length > 0 && (
            <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-line border border-line">
              {brands.map((b) => (
                <li key={b._id} className="bg-paper p-5 flex items-center gap-4">
                  <div className="w-12 h-12 bg-chrome shrink-0 grid place-items-center">
                    {b.logo ? (
                      <img src={b.logo} alt="" className="max-w-full max-h-full object-contain" />
                    ) : (
                      <span className="font-display text-sm">{b.name.slice(0, 2)}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{b.name}</p>
                    <p className="text-[11px] text-ink-muted truncate">{b.slug}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditing(b)}
                      className="p-2 text-ink-muted hover:text-ink rounded-full hover:bg-ink/5"
                    >
                      <Pencil size={14} strokeWidth={1.5} />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(t('admin.brands.confirm_delete'))) {
                          remove.mutate(b._id);
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
