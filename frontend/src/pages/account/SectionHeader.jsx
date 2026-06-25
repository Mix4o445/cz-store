export default function SectionHeader({ title, sub, action = null }) {
  return (
    <header className="flex items-end justify-between gap-4 border-b border-line pb-5 mb-8">
      <div>
        <h2 className="font-display text-2xl md:text-3xl font-medium leading-tight">{title}</h2>
        {sub && <p className="text-ink-muted text-sm mt-1">{sub}</p>}
      </div>
      {action}
    </header>
  );
}
