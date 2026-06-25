import { useTranslation } from 'react-i18next';

export default function PromoStrip() {
  const { t } = useTranslation();
  const items = [
    t('home.promo_warranty'),
    t('home.promo_install'),
    t('home.promo_payment'),
  ];
  // Duplicate for seamless marquee
  const loop = [...items, ...items, ...items];

  return (
    <section className="bg-ink text-paper border-y border-paper/10 overflow-hidden">
      <div className="flex no-scrollbar overflow-hidden">
        <div className="marquee-track flex">
          {loop.map((it, i) => (
            <span
              key={i}
              className="flex items-center gap-3 px-8 py-3 text-[11px] uppercase tracking-wider-2 whitespace-nowrap text-paper/70"
            >
              <span className="block w-1 h-1 rounded-full bg-accent" />
              <span>{it}</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
