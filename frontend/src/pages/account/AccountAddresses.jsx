import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Loader2, MapPin, Pencil, Trash2, Star, X } from 'lucide-react';
import {
  useAddresses,
  useAddAddress,
  useUpdateAddress,
  useDeleteAddress,
} from '@/hooks/useUser';
import { getApiErrorMessage } from '@/hooks/useAuth';
import SectionHeader from './SectionHeader';

function AddressForm({ initial, onCancel, onSubmit, isPending, error }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    label: initial?.label ?? '',
    name: initial?.name ?? '',
    phone: initial?.phone ?? '',
    address: initial?.address ?? '',
    city: initial?.city ?? '',
    wilaya: initial?.wilaya ?? '',
    isDefault: initial?.isDefault ?? false,
  });
  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };
  const handle = (e) => {
    e.preventDefault();
    onSubmit(form);
  };
  const Field = ({ label, ...props }) => (
    <label className="block">
      <span className="text-[11px] uppercase tracking-wider-2 text-ink-muted">{label}</span>
      <input
        {...props}
        className="mt-2 w-full bg-transparent border-b border-ink/20 px-0 py-2.5 outline-none focus:border-ink"
      />
    </label>
  );

  return (
    <form onSubmit={handle} className="border border-line p-6 grid sm:grid-cols-2 gap-5">
      <Field
        label={t('account.addresses.label')}
        name="label"
        type="text"
        placeholder={t('account.addresses.label_placeholder')}
        value={form.label}
        onChange={onChange}
      />
      <Field
        label={t('auth.name')}
        name="name"
        type="text"
        required
        minLength={2}
        value={form.name}
        onChange={onChange}
      />
      <Field
        label={t('auth.phone')}
        name="phone"
        type="tel"
        required
        minLength={6}
        pattern="[0-9]+"
        inputMode="numeric"
        title={t('auth.phone')}
        value={form.phone}
        onChange={onChange}
      />
      <Field
        label="Ville"
        name="city"
        type="text"
        required
        minLength={2}
        value={form.city}
        onChange={onChange}
      />
      <div className="sm:col-span-2">
        <Field
          label={t('account.addresses.address_line')}
          name="address"
          type="text"
          required
          minLength={3}
          value={form.address}
          onChange={onChange}
        />
      </div>
      <Field
        label={t('account.addresses.wilaya')}
        name="wilaya"
        type="text"
        value={form.wilaya}
        onChange={onChange}
      />
      <label className="sm:col-span-2 inline-flex items-center gap-2 text-sm pt-2">
        <input
          type="checkbox"
          name="isDefault"
          checked={form.isDefault}
          onChange={onChange}
          className="accent-ink w-4 h-4"
        />
        <span>{t('account.addresses.make_default')}</span>
      </label>

      {error && (
        <p className="sm:col-span-2 text-sm text-signal border-s-2 border-signal ps-3">{error}</p>
      )}

      <div className="sm:col-span-2 flex items-center gap-3 pt-2">
        <button type="submit" disabled={isPending} className="btn-primary inline-flex items-center gap-2">
          {isPending && <Loader2 size={14} className="animate-spin" />}
          {t('account.addresses.save_address')}
        </button>
        <button type="button" onClick={onCancel} className="btn-ghost text-sm">
          {t('account.cancel')}
        </button>
      </div>
    </form>
  );
}

export default function AccountAddresses() {
  const { t } = useTranslation();
  const { data: addresses = [], isLoading, isError, error, refetch } = useAddresses();
  const addAddr = useAddAddress();
  const updateAddr = useUpdateAddress();
  const deleteAddr = useDeleteAddress();

  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);

  return (
    <div>
      <SectionHeader
        title={t('account.addresses.title')}
        sub={t('account.addresses.sub')}
        action={
          !adding && !editingId ? (
            <button onClick={() => setAdding(true)} className="btn-outline text-sm">
              <Plus size={14} strokeWidth={1.6} />
              {t('account.addresses.add')}
            </button>
          ) : null
        }
      />

      {isError && (
        <div className="border border-line p-6 text-center text-sm mb-6">
          <p className="text-signal mb-3">{getApiErrorMessage(error, t('common.error'))}</p>
          <button onClick={() => refetch()} className="btn-outline text-sm">
            {t('common.retry')}
          </button>
        </div>
      )}

      {isLoading && (
        <div className="grid place-items-center py-8 text-ink-muted">
          <Loader2 size={22} className="animate-spin" />
        </div>
      )}

      {adding && (
        <div className="mb-8">
          <AddressForm
            onCancel={() => {
              setAdding(false);
              addAddr.reset();
            }}
            onSubmit={(values) =>
              addAddr.mutate(values, {
                onSuccess: () => setAdding(false),
              })
            }
            isPending={addAddr.isPending}
            error={addAddr.isError ? getApiErrorMessage(addAddr.error) : null}
          />
        </div>
      )}

      {!isLoading && !isError && addresses.length === 0 && !adding && (
        <div className="border border-line p-12 text-center">
          <MapPin size={28} strokeWidth={1.4} className="mx-auto text-ink-muted mb-3" />
          <p className="text-ink-muted text-sm">{t('account.addresses.empty')}</p>
        </div>
      )}

      {addresses.length > 0 && (
        <ul className="grid sm:grid-cols-2 gap-px bg-line border border-line">
          {addresses.map((addr) => (
            <li key={addr._id} className="bg-paper p-6 flex flex-col gap-3 min-h-[180px]">
              {editingId === addr._id ? (
                <AddressForm
                  initial={addr}
                  onCancel={() => {
                    setEditingId(null);
                    updateAddr.reset();
                  }}
                  onSubmit={(values) =>
                    updateAddr.mutate(
                      { id: addr._id, ...values },
                      { onSuccess: () => setEditingId(null) }
                    )
                  }
                  isPending={updateAddr.isPending}
                  error={updateAddr.isError ? getApiErrorMessage(updateAddr.error) : null}
                />
              ) : (
                <>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      {addr.label && (
                        <p className="text-[11px] uppercase tracking-wider-2 text-ink-muted">
                          {addr.label}
                        </p>
                      )}
                      <p className="font-medium mt-0.5">{addr.name}</p>
                    </div>
                    {addr.isDefault && (
                      <span className="tag bg-ink text-paper inline-flex items-center gap-1">
                        <Star size={10} strokeWidth={2} className="fill-paper" />
                        {t('account.addresses.default_tag')}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-ink-muted leading-relaxed">
                    <p>{addr.address}</p>
                    <p>
                      {addr.city}
                      {addr.wilaya ? ` · ${addr.wilaya}` : ''}
                    </p>
                    <p className="num mt-1">{addr.phone}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-auto pt-2 border-t border-line">
                    {!addr.isDefault && (
                      <button
                        onClick={() =>
                          updateAddr.mutate({ id: addr._id, isDefault: true })
                        }
                        className="text-xs text-ink-muted hover:text-ink link-underline"
                      >
                        {t('account.addresses.make_default')}
                      </button>
                    )}
                    <span className="ms-auto flex items-center gap-1">
                      <button
                        onClick={() => setEditingId(addr._id)}
                        className="p-2 text-ink-muted hover:text-ink rounded-full hover:bg-ink/5"
                        aria-label={t('account.edit')}
                      >
                        <Pencil size={14} strokeWidth={1.5} />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(t('account.addresses.confirm_delete'))) {
                            deleteAddr.mutate(addr._id);
                          }
                        }}
                        className="p-2 text-ink-muted hover:text-signal rounded-full hover:bg-signal/5"
                        aria-label={t('account.delete')}
                      >
                        <Trash2 size={14} strokeWidth={1.5} />
                      </button>
                    </span>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
