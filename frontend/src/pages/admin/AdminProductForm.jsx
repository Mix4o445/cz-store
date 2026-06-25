import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, Plus, X, CheckCircle2, ImageUp } from 'lucide-react';
import { useBrands } from '@/hooks/useBrands';
import { useCategories } from '@/hooks/useCategories';
import { useCreateProduct, useUpdateProduct, useTags } from '@/hooks/useAdmin';
import { getApiErrorMessage } from '@/hooks/useAuth';
import TagInput from '@/components/common/TagInput';
import { adminApi } from '@/api/admin.api';

const EMPTY = {
  name: { fr: '' },
  description: { fr: '' },
  brand: '',
  category: '',
  price: 0,
  priceOld: '',
  stock: 0,
  isPromo: false,
  isFeatured: false,
  tags: [],
  images: [],
  variants: [],
  deliveryFee: 0,
  specs: {
    capacity: '',
    energyClass: '',
    coverage: '',
    inverter: false,
    wifi: false,
    heating: false,
    noise: '',
    warranty: '',
  },
};

function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-wider-2 text-ink-muted">{label}</span>
      <div className="mt-2">{children}</div>
      {hint && <span className="block mt-1 text-[11px] text-ink-muted">{hint}</span>}
    </label>
  );
}

const inputCls =
  'w-full bg-transparent border-b border-ink/20 px-0 py-2.5 outline-none focus:border-ink';

export default function AdminProductForm({ initial, onCancel, onSaved }) {
  const { t } = useTranslation();
  const isEdit = !!initial?._id;
  const create = useCreateProduct();
  const update = useUpdateProduct();
  const { data: brands = [] } = useBrands();
  const { data: categories = [] } = useCategories();
  const { data: tagSuggestions = [] } = useTags();

  const [showSaved, setShowSaved] = useState(false);
  const [uploadingIdx, setUploadingIdx] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);
  const pendingUploadIdx = useRef(null);
  const [form, setForm] = useState(() => {
    if (!initial) return EMPTY;
    return {
      ...EMPTY,
      ...initial,
      name: { fr: initial.name?.fr ?? '' },
      description: { fr: initial.description?.fr ?? '' },
      priceOld: initial.priceOld ?? '',
      tags: initial.tags ?? [],
      images: initial.images ?? [],
      deliveryFee: initial.deliveryFee ?? 0,
      variants: (initial.variants ?? []).map((v) => ({
        _id: v._id,
        capacity: v.capacity ?? '',
        price: v.price ?? '',
        priceOld: v.priceOld ?? '',
        stock: v.stock ?? 0,
      })),
      specs: { ...EMPTY.specs, ...(initial.specs ?? {}) },
      category: initial.category ?? '',
    };
  });

  const setField = (path, value) => {
    setForm((f) => {
      const next = structuredClone(f);
      const segs = path.split('.');
      let cur = next;
      for (let i = 0; i < segs.length - 1; i++) cur = cur[segs[i]];
      cur[segs[segs.length - 1]] = value;
      return next;
    });
  };

  const addImage = () => setField('images', [...form.images, '']);
  const setImage = (i, v) => setField('images', form.images.map((x, idx) => (idx === i ? v : x)));
  const removeImage = (i) => setField('images', form.images.filter((_, idx) => idx !== i));

  const addVariant = () =>
    setField('variants', [...form.variants, { capacity: '', price: '', priceOld: '', stock: 0 }]);
  const setVariant = (i, key, value) =>
    setField(
      'variants',
      form.variants.map((v, idx) => (idx === i ? { ...v, [key]: value } : v))
    );
  const removeVariant = (i) =>
    setField('variants', form.variants.filter((_, idx) => idx !== i));

  const hasVariants = form.variants.length > 0;

  const handle = (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      stock: form.stock === '' || form.stock == null ? undefined : Number(form.stock),
      deliveryFee:
        form.deliveryFee === '' || form.deliveryFee == null ? 0 : Number(form.deliveryFee),
      images: form.images.filter(Boolean),
      tags: form.tags.filter(Boolean),
      variants: form.variants
        .filter((v) => v.capacity && v.price !== '' && v.price != null)
        .map((v) => {
          const item = {
            capacity: String(v.capacity).trim(),
            price: Number(v.price),
            stock: Number(v.stock || 0),
          };
          if (v.priceOld !== '' && v.priceOld != null) item.priceOld = Number(v.priceOld);
          return item;
        }),
    };
    // Base price: only send if provided. If empty AND variants exist, backend
    // will derive it from the cheapest variant.
    if (form.price === '' || form.price == null) {
      delete payload.price;
    } else {
      payload.price = Number(form.price);
    }
    if (form.priceOld === '' || form.priceOld == null) {
      delete payload.priceOld;
    } else {
      payload.priceOld = Number(form.priceOld);
    }
    if (payload.stock === undefined) delete payload.stock;
    if (!payload.brand) delete payload.brand;
    if (!payload.category) delete payload.category;
    if (payload.variants.length === 0) delete payload.variants;

    const onSuccess = () => {
      setShowSaved(true);
      setTimeout(() => {
        setShowSaved(false);
        onSaved?.();
      }, 800);
    };

    if (isEdit) {
      update.mutate({ id: initial._id, ...payload }, { onSuccess });
    } else {
      create.mutate(payload, { onSuccess });
    }
  };

  const mutation = isEdit ? update : create;

  return (
    <form onSubmit={handle} className="space-y-10">
      <header className="flex items-center justify-between border-b border-line pb-5">
        <h2 className="font-display text-xl md:text-2xl font-medium">
          {isEdit ? t('admin.products.edit') : t('admin.products.add')}
        </h2>
        <button type="button" onClick={onCancel} className="btn-ghost text-xs uppercase tracking-wider-1">
          {t('account.cancel')}
        </button>
      </header>

      <section className="grid sm:grid-cols-2 gap-6">
        <Field label={t('admin.products.name_fr')}>
          <input
            type="text"
            required
            minLength={1}
            value={form.name.fr}
            onChange={(e) => setField('name.fr', e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label={t('admin.products.description_fr')}>
          <textarea
            rows={3}
            value={form.description.fr}
            onChange={(e) => setField('description.fr', e.target.value)}
            className={`${inputCls} resize-none`}
          />
        </Field>
      </section>

      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Field label={t('admin.products.brand')}>
          <select
            value={form.brand}
            onChange={(e) => setField('brand', e.target.value)}
            className={inputCls}
          >
            <option value="">{t('admin.products.category_none')}</option>
            {brands.map((b) => (
              <option key={b._id} value={b.name}>
                {b.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label={t('admin.products.category')}>
          <select
            value={form.category}
            onChange={(e) => setField('category', e.target.value)}
            className={inputCls}
          >
            <option value="">{t('admin.products.category_none')}</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name?.fr ?? c.slug}
              </option>
            ))}
          </select>
        </Field>
        <Field
          label={t('admin.products.price')}
          hint={hasVariants ? t('admin.products.price_hint_variants') : null}
        >
          <input
            type="number"
            min={0}
            step="any"
            required={!hasVariants}
            value={form.price}
            onChange={(e) => setField('price', e.target.value)}
            className={inputCls}
            placeholder={hasVariants ? '—' : ''}
          />
        </Field>
        <Field label={t('admin.products.price_old')}>
          <input
            type="number"
            min={0}
            step="any"
            value={form.priceOld}
            onChange={(e) => setField('priceOld', e.target.value)}
            className={inputCls}
            placeholder={hasVariants ? '—' : ''}
          />
        </Field>
        <Field label={t('admin.products.stock')}>
          <input
            type="number"
            min={0}
            value={form.stock}
            onChange={(e) => setField('stock', e.target.value)}
            className={inputCls}
            placeholder={hasVariants ? '—' : ''}
          />
        </Field>
        <Field
          label={t('admin.products.delivery_fee')}
          hint={t('admin.products.delivery_fee_hint')}
        >
          <input
            type="number"
            min={0}
            step="any"
            value={form.deliveryFee}
            onChange={(e) => setField('deliveryFee', e.target.value)}
            className={inputCls}
            placeholder="0"
          />
        </Field>
        <div className="sm:col-span-1 lg:col-span-3 flex items-end gap-6 pb-2">
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isPromo}
              onChange={(e) => setField('isPromo', e.target.checked)}
              className="accent-ink w-4 h-4"
            />
            {t('admin.products.is_promo')}
          </label>
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={(e) => setField('isFeatured', e.target.checked)}
              className="accent-ink w-4 h-4"
            />
            {t('admin.products.is_featured')}
          </label>
        </div>
      </section>

      <section>
        <Field label={t('admin.products.tags')} hint={t('admin.products.tags_hint')}>
          <TagInput
            value={form.tags}
            onChange={(tags) => setField('tags', tags)}
            suggestions={tagSuggestions}
            placeholder="ex: silencieux, salon, bureau…"
          />
        </Field>
      </section>

      <section>
        <p className="text-[11px] uppercase tracking-wider-2 text-ink-muted mb-3">
          {t('admin.products.images')}
        </p>
        {/* hidden file input shared by all rows */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            e.target.value = '';
            if (!file) return;
            const idx = pendingUploadIdx.current;
            setUploadingIdx(idx);
            setUploadError('');
            try {
              const { url } = await adminApi.uploadImage(file);
              setImage(idx, url);
            } catch (err) {
              setUploadError(err?.response?.data?.message || 'Échec du téléchargement');
            } finally {
              setUploadingIdx(null);
            }
          }}
        />
        <ul className="space-y-2">
          {form.images.map((url, i) => (
            <li key={i} className="flex items-center gap-2">
              <input
                type="url"
                value={url}
                onChange={(e) => setImage(i, e.target.value)}
                placeholder="https://…"
                className={inputCls}
              />
              <button
                type="button"
                title="Télécharger une image"
                disabled={uploadingIdx !== null}
                onClick={() => {
                  pendingUploadIdx.current = i;
                  fileInputRef.current?.click();
                }}
                className="p-2 text-ink-muted hover:text-ink rounded-full hover:bg-ink/5 shrink-0"
                aria-label="upload"
              >
                {uploadingIdx === i ? <Loader2 size={14} className="animate-spin" /> : <ImageUp size={14} />}
              </button>
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="p-2 text-ink-muted hover:text-signal rounded-full hover:bg-signal/5 shrink-0"
                aria-label="remove"
              >
                <X size={14} />
              </button>
            </li>
          ))}
        </ul>
        <button type="button" onClick={addImage} className="mt-3 text-sm link-underline inline-flex items-center gap-1">
          <Plus size={13} /> {t('admin.products.add_image')}
        </button>
        {uploadError && <p className="mt-2 text-sm text-signal">{uploadError}</p>}
      </section>

      <section>
        <p className="text-[11px] uppercase tracking-wider-2 text-ink-muted mb-1">
          {t('admin.products.variants')}
        </p>
        <p className="text-xs text-ink-muted mb-4">{t('admin.products.variants_sub')}</p>

        {form.variants.length > 0 && (
          <ul className="space-y-2 mb-3">
            <li className="hidden sm:grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-3 text-[10px] uppercase tracking-wider-2 text-ink-muted px-1">
              <span>{t('admin.products.variant_capacity')}</span>
              <span>{t('admin.products.variant_price')}</span>
              <span>{t('admin.products.variant_priceOld')}</span>
              <span>{t('admin.products.variant_stock')}</span>
              <span />
            </li>
            {form.variants.map((v, i) => (
              <li
                key={v._id ?? i}
                className="grid grid-cols-2 sm:grid-cols-[2fr_1fr_1fr_1fr_auto] gap-3 items-center"
              >
                <input
                  type="text"
                  required
                  value={v.capacity}
                  onChange={(e) => setVariant(i, 'capacity', e.target.value)}
                  placeholder="12000 BTU"
                  className={inputCls}
                />
                <input
                  type="number"
                  min={0}
                  step="any"
                  required
                  value={v.price}
                  onChange={(e) => setVariant(i, 'price', e.target.value)}
                  placeholder="Prix"
                  className={inputCls}
                />
                <input
                  type="number"
                  min={0}
                  step="any"
                  value={v.priceOld}
                  onChange={(e) => setVariant(i, 'priceOld', e.target.value)}
                  placeholder="—"
                  className={inputCls}
                />
                <input
                  type="number"
                  min={0}
                  value={v.stock}
                  onChange={(e) => setVariant(i, 'stock', e.target.value)}
                  placeholder="Stock"
                  className={inputCls}
                />
                <button
                  type="button"
                  onClick={() => removeVariant(i)}
                  className="p-2 text-ink-muted hover:text-signal rounded-full hover:bg-signal/5 justify-self-end"
                  aria-label="remove variant"
                >
                  <X size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}

        <button
          type="button"
          onClick={addVariant}
          className="text-sm link-underline inline-flex items-center gap-1"
        >
          <Plus size={13} /> {t('admin.products.add_variant')}
        </button>
      </section>

      <section>
        <p className="text-[11px] uppercase tracking-wider-2 text-ink-muted mb-4">
          {t('admin.products.specs')}
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Field label={t('admin.products.specs_capacity')}>
            <input type="text" value={form.specs.capacity} onChange={(e) => setField('specs.capacity', e.target.value)} className={inputCls} placeholder="12000 BTU" />
          </Field>
          <Field label={t('admin.products.specs_energy')}>
            <input type="text" value={form.specs.energyClass} onChange={(e) => setField('specs.energyClass', e.target.value)} className={inputCls} placeholder="A++" />
          </Field>
          <Field label={t('admin.products.specs_coverage')}>
            <input type="text" value={form.specs.coverage} onChange={(e) => setField('specs.coverage', e.target.value)} className={inputCls} placeholder="25 m²" />
          </Field>
          <Field label={t('admin.products.specs_noise')}>
            <input type="text" value={form.specs.noise} onChange={(e) => setField('specs.noise', e.target.value)} className={inputCls} placeholder="19 dB" />
          </Field>
          <Field label={t('admin.products.specs_warranty')}>
            <input type="text" value={form.specs.warranty} onChange={(e) => setField('specs.warranty', e.target.value)} className={inputCls} placeholder="3 ans" />
          </Field>
          <div className="flex flex-wrap items-end gap-6 pb-2">
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.specs.inverter} onChange={(e) => setField('specs.inverter', e.target.checked)} className="accent-ink w-4 h-4" />
              {t('admin.products.specs_inverter')}
            </label>
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.specs.wifi} onChange={(e) => setField('specs.wifi', e.target.checked)} className="accent-ink w-4 h-4" />
              {t('admin.products.specs_wifi')}
            </label>
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.specs.heating} onChange={(e) => setField('specs.heating', e.target.checked)} className="accent-ink w-4 h-4" />
              {t('admin.products.specs_heating')}
            </label>
          </div>
        </div>
      </section>

      {mutation.isError && (
        <p className="text-sm text-signal border-s-2 border-signal ps-3">
          {getApiErrorMessage(mutation.error)}
        </p>
      )}

      <div className="flex items-center gap-4 pt-2 border-t border-line">
        <button type="submit" disabled={mutation.isPending} className="btn-primary inline-flex items-center gap-2">
          {mutation.isPending && <Loader2 size={14} className="animate-spin" />}
          {t('admin.products.save')}
        </button>
        <button type="button" onClick={onCancel} className="btn-ghost text-sm">
          {t('account.cancel')}
        </button>
        {showSaved && (
          <span className="inline-flex items-center gap-1.5 text-sm text-emerald-700">
            <CheckCircle2 size={14} strokeWidth={1.8} />
            {t('admin.products.saved')}
          </span>
        )}
      </div>
    </form>
  );
}
