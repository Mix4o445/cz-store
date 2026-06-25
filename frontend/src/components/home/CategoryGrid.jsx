import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Wind,
  Layers,
  SquareDashed,
  Workflow,
  Archive,
  Settings2,
  Box,
  Snowflake,
  Thermometer,
  Cog,
  Package,
  ArrowUpRight,
} from 'lucide-react';
import { useCategories } from '@/hooks/useCategories';
import { useLocalized } from '@/hooks/useLocalized';
import Reveal from '@/components/common/Reveal';

const ICONS = {
  Wind,
  Layers,
  SquareDashed,
  Workflow,
  Archive,
  Settings2,
  Box,
  Snowflake,
  Thermometer,
  Cog,
  Package,
};

export default function CategoryGrid() {
  const { t } = useTranslation();
  const local = useLocalized();
  const { data: categories = [], isLoading } = useCategories();

  if (isLoading || categories.length === 0) return null;

  const PREVIEW_COUNT = 6;
  const visible = categories.slice(0, PREVIEW_COUNT);
  const hasMore = categories.length > PREVIEW_COUNT;

  return (
    <section className="section">
      <div className="container-app">
        <div className="grid md:grid-cols-12 gap-6 md:gap-8 mb-12 md:mb-16 items-end">
          <Reveal className="md:col-span-5">
            <p className="eyebrow mb-4">{t('home.categories_eyebrow')}</p>
            <h2 className="font-display font-medium text-display-md">
              {t('home.categories_title')}
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="md:col-span-5 md:col-start-7">
            <p className="text-base text-ink-muted leading-relaxed">
              {t('home.categories_sub')}
            </p>
          </Reveal>
        </div>

        <ul className="grid grid-cols-1 md:grid-cols-6 gap-px bg-line">
          {visible.map((cat, idx) => {
            const Icon = ICONS[cat.icon] ?? Package;
            const hasImage = Boolean(cat.image);
            const span =
              idx === 0
                ? 'md:col-span-3 md:row-span-2'
                : idx === 1
                ? 'md:col-span-3'
                : 'md:col-span-2';
            return (
              <Reveal as="li" key={cat._id} delay={idx * 0.07} y={20} className={span}>
                <Link
                  to={`/shop?category=${cat.slug}`}
                  className={`group relative overflow-hidden h-full flex flex-col justify-between min-h-[180px] md:min-h-[220px] transition-colors ${
                    hasImage ? 'bg-paper' : 'bg-paper hover:bg-chrome'
                  }`}
                >
                  {/* Animated hover image */}
                  {hasImage && (
                    <>
                      <img
                        src={cat.image}
                        alt=""
                        aria-hidden="true"
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover opacity-0 scale-110 transition-all duration-700 ease-out group-hover:opacity-100 group-hover:scale-100 motion-reduce:transition-none"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/40 to-ink/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                    </>
                  )}

                  {/* Content */}
                  <div className="relative z-10 p-6 md:p-8 flex items-start justify-between">
                    <Icon
                      size={28}
                      strokeWidth={1.4}
                      className={`text-ink transition-all duration-500 group-hover:rotate-12 ${
                        hasImage ? 'group-hover:text-white' : ''
                      }`}
                    />
                    <span
                      className={`num text-[11px] text-ink-muted transition-colors duration-500 ${
                        hasImage ? 'group-hover:text-white/70' : ''
                      }`}
                    >
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <div className="relative z-10 p-6 md:p-8 pt-0">
                    <h3
                      className={`font-display text-2xl md:text-3xl font-medium leading-tight transition-colors duration-500 ${
                        hasImage ? 'group-hover:text-white' : ''
                      }`}
                    >
                      {local(cat.name)}
                    </h3>
                    <span
                      className={`mt-4 inline-flex items-center gap-1 text-sm font-medium transition-colors ${
                        hasImage
                          ? 'text-ink group-hover:text-white'
                          : 'text-ink group-hover:text-primary'
                      }`}
                    >
                      {t('common.explore')}
                      <ArrowUpRight
                        size={14}
                        className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      />
                    </span>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </ul>

        {hasMore && (
          <div className="mt-10 md:mt-12 flex justify-center">
            <Link
              to="/shop"
              className="group inline-flex items-center gap-2 border border-ink/20 rounded-full px-6 py-3 text-sm font-medium text-ink hover:border-ink hover:bg-ink hover:text-paper transition-colors"
            >
              {t('home.categories_more')}
              <ArrowUpRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
