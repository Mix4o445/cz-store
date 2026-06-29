import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bot, SendHorizonal, Loader2, User as UserIcon, Sparkles, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAgentChat } from '@/hooks/useAgent';
import { getApiErrorMessage } from '@/hooks/useAuth';

const SUGGESTIONS = [
  "Combien de commandes en attente ?",
  "Liste les produits en rupture de stock",
  "Passe la dernière commande en 'expédiée'",
  "Mets le stock du Midea Mural à 10",
];

const ACTION_LABELS = {
  create_product: 'Produit créé',
  update_product: 'Produit modifié',
  delete_product: 'Produit supprimé',
  add_variant: 'Variante ajoutée',
  update_variant: 'Variante modifiée',
  delete_variant: 'Variante supprimée',
  update_order_status: 'Statut de commande mis à jour',
  create_category: 'Catégorie créée',
  update_category: 'Catégorie modifiée',
  delete_category: 'Catégorie supprimée',
  create_brand: 'Marque créée',
  update_brand: 'Marque modifiée',
  delete_brand: 'Marque supprimée',
  set_user_role: 'Rôle utilisateur modifié',
  delete_review: 'Avis supprimé',
};

export default function AdminAssistant() {
  const { t } = useTranslation();
  const chat = useAgentChat();
  const [messages, setMessages] = useState([]); // {role, content, actions?}
  const [input, setInput] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, chat.isPending]);

  const send = async (text) => {
    const content = (text ?? input).trim();
    if (!content || chat.isPending) return;
    setInput('');

    const history = [...messages, { role: 'user', content }];
    setMessages(history);

    try {
      const payload = history.map(({ role, content }) => ({ role, content }));
      const res = await chat.mutateAsync(payload);
      const { reply, actions } = res.data ?? {};
      setMessages((m) => [...m, { role: 'assistant', content: reply || '…', actions: actions ?? [] }]);
    } catch (e) {
      setMessages((m) => [
        ...m,
        { role: 'assistant', content: getApiErrorMessage(e), error: true, actions: [] },
      ]);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-16rem)] min-h-[480px]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-line pb-4 mb-4">
        <div className="flex items-center gap-3">
          <span className="grid place-items-center w-9 h-9 rounded-full bg-ink text-paper">
            <Sparkles size={16} strokeWidth={1.8} />
          </span>
          <div>
            <h2 className="font-display text-lg font-medium leading-tight">CoolZone Copilot</h2>
            <p className="text-[11px] text-ink-muted">{t('admin.assistant')} · NVIDIA</p>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={() => setMessages([])}
            className="text-xs text-ink-muted hover:text-signal inline-flex items-center gap-1.5"
          >
            <Trash2 size={13} strokeWidth={1.6} /> Effacer
          </button>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-5 pr-1">
        {messages.length === 0 && (
          <div className="h-full grid place-items-center text-center">
            <div className="max-w-sm space-y-5">
              <span className="mx-auto grid place-items-center w-14 h-14 rounded-full bg-ink/5 text-ink">
                <Bot size={26} strokeWidth={1.4} />
              </span>
              <div>
                <p className="font-medium">Assistant d'administration</p>
                <p className="text-sm text-ink-muted mt-1">
                  Gérez produits, commandes, catégories, marques et utilisateurs en langage naturel.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="text-xs border border-line rounded-full px-3 py-1.5 text-ink-muted hover:text-ink hover:border-ink/40 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <span
              className={`shrink-0 grid place-items-center w-8 h-8 rounded-full ${
                m.role === 'user' ? 'bg-ink/10 text-ink' : 'bg-ink text-paper'
              }`}
            >
              {m.role === 'user' ? <UserIcon size={14} /> : <Sparkles size={14} />}
            </span>
            <div className={`max-w-[80%] ${m.role === 'user' ? 'text-right' : ''}`}>
              <div
                className={`inline-block text-sm leading-relaxed whitespace-pre-wrap px-4 py-2.5 rounded-2xl ${
                  m.role === 'user'
                    ? 'bg-ink text-paper rounded-tr-sm'
                    : m.error
                    ? 'bg-signal/10 text-signal rounded-tl-sm'
                    : 'bg-chrome text-ink rounded-tl-sm'
                }`}
              >
                {m.content}
              </div>
              {m.actions?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {m.actions.map((a, j) => (
                    <span
                      key={j}
                      className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full ${
                        a.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-signal/10 text-signal'
                      }`}
                    >
                      {a.ok ? <CheckCircle2 size={11} /> : <AlertCircle size={11} />}
                      {ACTION_LABELS[a.tool] ?? a.tool}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {chat.isPending && (
          <div className="flex gap-3">
            <span className="shrink-0 grid place-items-center w-8 h-8 rounded-full bg-ink text-paper">
              <Sparkles size={14} />
            </span>
            <div className="bg-chrome rounded-2xl rounded-tl-sm px-4 py-3 inline-flex items-center gap-2 text-ink-muted text-sm">
              <Loader2 size={14} className="animate-spin" /> Réflexion…
            </div>
          </div>
        )}
      </div>

      {/* Composer */}
      <div className="border-t border-line pt-4 mt-4">
        <div className="flex items-end gap-2 bg-chrome rounded-2xl p-2">
          <textarea
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Demandez quelque chose… (ex. « passe la commande #A1B2 en livrée »)"
            className="flex-1 bg-transparent resize-none outline-none text-sm px-3 py-2 max-h-32"
          />
          <button
            onClick={() => send()}
            disabled={chat.isPending || !input.trim()}
            className="btn-primary inline-flex items-center justify-center gap-2 disabled:opacity-40 !px-4 !py-2.5"
          >
            {chat.isPending ? <Loader2 size={15} className="animate-spin" /> : <SendHorizonal size={15} />}
          </button>
        </div>
        <p className="text-[10px] text-ink-muted mt-2 text-center">
          L'assistant peut modifier des données réelles. Vérifiez les actions importantes.
        </p>
      </div>
    </div>
  );
}
