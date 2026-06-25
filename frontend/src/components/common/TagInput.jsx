import { useState } from 'react';
import { X } from 'lucide-react';

export default function TagInput({ value = [], onChange, suggestions = [], placeholder = '' }) {
  const [draft, setDraft] = useState('');

  const add = (raw) => {
    const tag = raw.trim().toLowerCase();
    if (!tag || value.includes(tag)) return;
    onChange([...value, tag]);
    setDraft('');
  };

  const remove = (tag) => onChange(value.filter((t) => t !== tag));

  const onKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      add(draft);
    } else if (e.key === 'Backspace' && !draft && value.length) {
      remove(value[value.length - 1]);
    }
  };

  const filteredSuggestions = suggestions.filter(
    (s) => !value.includes(s) && (!draft || s.includes(draft.toLowerCase()))
  );

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 border-b border-ink/20 focus-within:border-ink py-2">
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1.5 px-2 py-1 bg-ink/5 text-xs rounded-full"
          >
            {tag}
            <button
              type="button"
              onClick={() => remove(tag)}
              className="text-ink-muted hover:text-signal"
              aria-label={`Remove ${tag}`}
            >
              <X size={11} strokeWidth={2} />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={() => draft && add(draft)}
          placeholder={placeholder}
          className="flex-1 min-w-[120px] bg-transparent outline-none text-sm py-1"
        />
      </div>
      {filteredSuggestions.length > 0 && draft && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {filteredSuggestions.slice(0, 8).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => add(s)}
              className="text-xs px-2 py-1 border border-line rounded-full text-ink-muted hover:text-ink hover:border-ink/40"
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
