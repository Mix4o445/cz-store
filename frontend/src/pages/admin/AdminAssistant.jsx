import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Bot,
  SendHorizonal,
  Loader2,
  User as UserIcon,
  Sparkles,
  Trash2,
  Plus,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useAgentChat } from '@/hooks/useAgent';
import { getApiErrorMessage } from '@/hooks/useAuth';

const STORAGE_KEY = 'cz_admin_assistant_chats_v1';

const SUGGESTIONS = [
  'Combien de commandes en attente ?',
  'Liste les produits en rupture de stock',
  "Passe la dernière commande en 'expédiée'",
  'Mets le stock du Midea Mural à 10',
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
  save_memory: 'Mémorisé',
  delete_memory: 'Mémoire supprimée',
};

const uid = () => Math.random().toString(36).slice(2, 10);
const newConversation = () => ({
  id: uid(),
  title: 'Nouvelle conversation',
  messages: [],
  updatedAt: Date.now(),
});

function loadChats() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.conversations) && parsed.conversations.length) {
        return {
          conversations: parsed.conversations,
          currentId: parsed.currentId ?? parsed.conversations[0].id,
        };
      }
    }
  } catch {
    /* ignore corrupt storage */
  }
  const conv = newConversation();
  return { conversations: [conv], currentId: conv.id };
}

export default function AdminAssistant() {
  const { t } = useTranslation();
  const chat = useAgentChat();
  const [{ conversations, currentId }, setState] = useState(loadChats);
  const [input, setInput] = useState('');
  const scrollRef = useRef(null);

  const current = useMemo(
    () => conversations.find((c) => c.id === currentId) ?? conversations[0],
    [conversations, currentId]
  );
  const messages = current?.messages ?? [];

  // Persist to localStorage whenever conversations change.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ conversations, currentId }));
    } catch {
      /* storage full / unavailable */
    }
  }, [conversations, currentId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, chat.isPending]);

  const patchCurrent = (updater) =>
    setState((s) => ({
      ...s,
      conversations: s.conversations.map((c) =>
        c.id === s.currentId ? { ...c, ...updater(c), updatedAt: Date.now() } : c
      ),
    }));

  const startNew = () =>
    setState((s) => {
      // Reuse an existing empty conversation instead of stacking blanks.
      const empty = s.conversations.find((c) => c.messages.length === 0);
      if (empty) return { ...s, currentId: empty.id };
      const conv = newConversation();
      return { conversations: [conv, ...s.conversations], currentId: conv.id };
    });

  const selectConversation = (id) => setState((s) => ({ ...s, currentId: id }));

  const deleteConversation = (id) =>
    setState((s) => {
      const remaining = s.conversations.filter((c) => c.id !== id);
      if (remaining.length === 0) {
        const conv = newConversation();
        return { conversations: [conv], currentId: conv.id };
      }
      const nextId = s.currentId === id ? remaining[0].id : s.currentId;
      return { conversations: remaining, currentId: nextId };
    });

  const send = async (text) => {
    const content = (text ?? input).trim();
    if (!content || chat.isPending) return;
    setInput('');

    const history = [...messages, { role: 'user', content }];
    patchCurrent((c) => ({
      messages: history,
      title: c.messages.length === 0 ? content.slice(0, 48) : c.title,
    }));

    try {
      const payload = history.map(({ role, content }) => ({ role, content }));
      const res = await chat.mutateAsync(payload);
      const { reply, actions } = res.data ?? {};
      patchCurrent((c) => ({
        messages: [...c.messages, { role: 'assistant', content: reply || '…', actions: actions ?? [] }],
      }));
    } catch (e) {
      patchCurrent((c) => ({
        messages: [
          ...c.messages,
          { role: 'assistant', content: getApiErrorMessage(e), error: true, actions: [] },
        ],
      }));
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="grid lg:grid-cols-[230px_1fr] gap-6 h-[calc(100vh-15rem)] min-h-[500px]">
      {/* History sidebar */}
      <aside className="hidden lg:flex flex-col border-e border-line pe-5">
        <button
          onClick={startNew}
          className="btn-outline w-full inline-flex items-center justify-center gap-2 text-sm mb-4"
        >
          <Plus size={14} strokeWidth={1.8} /> Nouvelle conversation
        </button>
        <p className="text-[10px] uppercase tracking-wider-2 text-ink-muted mb-2">Historique</p>
        <ul className="flex-1 overflow-y-auto space-y-1 -me-2 pe-2">
          {conversations.map((c) => (
            <li key={c.id}>
              <div
                className={`group flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer transition-colors ${
                  c.id === currentId ? 'bg-ink text-paper' : 'text-ink-muted hover:bg-ink/5'
                }`}
                onClick={() => selectConversation(c.id)}
              >
                <MessageSquare size={13} strokeWidth={1.6} className="shrink-0" />
                <span className="flex-1 truncate text-xs">{c.title}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteConversation(c.id);
                  }}
                  className={`opacity-0 group-hover:opacity-100 transition-opacity ${
                    c.id === currentId ? 'text-paper/70 hover:text-paper' : 'text-ink-muted hover:text-signal'
                  }`}
                  title="Supprimer"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </aside>

      {/* Chat column */}
      <div className="flex flex-col min-w-0">
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
          {/* Mobile conversation controls */}
          <div className="flex items-center gap-2 lg:hidden">
            <select
              value={currentId}
              onChange={(e) => selectConversation(e.target.value)}
              className="text-xs border border-line rounded-lg px-2 py-1.5 max-w-[140px] bg-paper"
            >
              {conversations.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
            <button onClick={startNew} className="btn-outline !p-2" title="Nouvelle conversation">
              <Plus size={15} />
            </button>
          </div>
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
                    Gérez produits, variantes, commandes, catégories, marques et utilisateurs en langage
                    naturel. Je me souviens de vos préférences.
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
            L'assistant peut modifier des données réelles et se souvient entre les conversations.
          </p>
        </div>
      </div>
    </div>
  );
}
