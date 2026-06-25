import clsx from 'clsx';

export default function Badge({ tone = 'ink', className = '', children }) {
  const tones = {
    ink: 'bg-ink text-paper',
    paper: 'bg-paper text-ink shadow-line',
    primary: 'bg-primary text-paper',
    accent: 'bg-accent text-ink',
    signal: 'bg-signal text-paper',
    muted: 'bg-line text-ink-muted',
    soft: 'bg-ink/5 text-ink',
  };
  return <span className={clsx('tag', tones[tone] ?? tones.ink, className)}>{children}</span>;
}
