import { useTranslation } from 'react-i18next';
import { useBrands } from '@/hooks/useBrands';
import Reveal from '@/components/common/Reveal';

const BRAND_TINT = '#1d283a';

export default function BrandsCarousel() {
  const { t } = useTranslation();
  const { data: brands = [], isLoading } = useBrands();

  if (isLoading || brands.length === 0) return null;

  // Duplicate so translateX(-50%) lands exactly on a copy boundary -> seamless loop.
  // Add extra copies when the catalog is small so the track is wider than the
  // viewport on big screens.
  const reps = brands.length < 4 ? 6 : brands.length < 8 ? 4 : 2;
  const loop = Array.from({ length: reps }).flatMap(() => brands);

  // ~3 seconds per logo, minimum 20s. Track length scales with reps.
  const duration = Math.max(20, brands.length * reps * 3);

  return (
    <section className="section-tight section-chrome relative overflow-hidden">
      <div className="container-app">
        <div className="grid md:grid-cols-12 gap-6 items-end mb-10 md:mb-14">
          <Reveal className="md:col-span-6">
            <p className="eyebrow mb-4">{t('home.brands_eyebrow')}</p>
            <h2 className="font-display font-medium text-display-sm md:text-display-md">
              {t('home.brands_title')}
            </h2>
          </Reveal>
        </div>

        <div className="hairline mb-0" />

        {/* dir="ltr" forces marquee logic to behave the same in AR (RTL) mode */}
        <Reveal delay={0.1} className="overflow-hidden -mx-5 sm:-mx-8 lg:-mx-12" dir="ltr">
          <div
            className="flex items-center"
            style={{
              width: 'max-content',
              animation: `marquee ${duration}s linear infinite`,
            }}
          >
            {loop.map((b, i) => (
              <div
                key={`${b._id ?? b.name}-${i}`}
                className="px-10 md:px-14 py-10 md:py-14 flex items-center justify-center min-w-[180px] shrink-0"
                title={b.name}
              >
                {b.logo ? (
                  <span
                    role="img"
                    aria-label={b.name}
                    className="block h-9 md:h-12 w-[160px] opacity-80 hover:opacity-100 transition-opacity"
                    style={{
                      backgroundColor: BRAND_TINT,
                      WebkitMaskImage: `url("${b.logo}")`,
                      maskImage: `url("${b.logo}")`,
                      WebkitMaskRepeat: 'no-repeat',
                      maskRepeat: 'no-repeat',
                      WebkitMaskPosition: 'center',
                      maskPosition: 'center',
                      WebkitMaskSize: 'contain',
                      maskSize: 'contain',
                    }}
                  />
                ) : (
                  <span
                    className="font-display text-3xl md:text-5xl font-medium hover:opacity-100 opacity-80 transition-opacity whitespace-nowrap tracking-tight"
                    style={{ color: BRAND_TINT }}
                  >
                    {b.name}
                  </span>
                )}
              </div>
            ))}
          </div>
        </Reveal>

        <div className="hairline" />
      </div>
    </section>
  );
}
