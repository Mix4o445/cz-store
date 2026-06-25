import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Send, ArrowUpRight } from 'lucide-react';
import Logo from '../common/Logo';
import LanguageSwitcher from '../common/LanguageSwitcher';

export default function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="section-dark mt-20 grain relative">
      <div className="container-app pt-20 pb-10">
        {/* Newsletter */}
        <div className="grid md:grid-cols-12 gap-8 pb-16 md:pb-20 border-b border-paper/15">
          <div className="md:col-span-7">
            <h3 className="font-display font-medium text-display-sm md:text-display-md leading-[1.05]">
              {t('footer.newsletter_title')}
            </h3>
            <p className="text-paper/60 mt-4 max-w-md text-base">{t('footer.newsletter_sub')}</p>
          </div>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="md:col-span-5 md:col-start-8 self-end w-full"
          >
            <div className="flex items-center gap-3 border-b border-paper/30 focus-within:border-paper transition-colors py-3">
              <input
                type="email"
                required
                placeholder={t('footer.your_email')}
                className="flex-1 bg-transparent text-paper placeholder:text-paper/40 outline-none text-base"
              />
              <button
                type="submit"
                className="text-paper hover:text-accent transition-colors"
                aria-label={t('footer.subscribe')}
              >
                <Send size={18} strokeWidth={1.6} />
              </button>
            </div>
            <p className="text-[11px] uppercase tracking-wider-2 text-paper/40 mt-3">
              {t('footer.subscribe')}
            </p>
          </form>
        </div>

        {/* Link columns */}
        <div className="grid md:grid-cols-12 gap-10 py-16">
          <div className="md:col-span-4">
            <Link to="/" className="inline-flex items-center">
              <Logo className="h-10 brightness-0 invert" />
            </Link>
            <p className="text-sm text-paper/60 max-w-xs mt-4 leading-relaxed">
              {t('footer.tagline')}
            </p>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-[11px] uppercase tracking-wider-2 text-paper/40 mb-4">
              {t('footer.shop')}
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/shop" className="link-underline text-paper/80 hover:text-paper">{t('nav.shop')}</Link></li>
              <li><Link to="/shop?promo=1" className="link-underline text-paper/80 hover:text-paper">Promotions</Link></li>
              <li><Link to="/shop?featured=1" className="link-underline text-paper/80 hover:text-paper">{t('home.featured_title')}</Link></li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-[11px] uppercase tracking-wider-2 text-paper/40 mb-4">
              {t('footer.company')}
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/about" className="link-underline text-paper/80 hover:text-paper">{t('nav.about')}</Link></li>
              <li><Link to="/contact" className="link-underline text-paper/80 hover:text-paper">{t('nav.contact')}</Link></li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-[11px] uppercase tracking-wider-2 text-paper/40 mb-4">
              {t('footer.support')}
            </h4>
            <ul className="space-y-2.5 text-sm text-paper/80">
              <li>+212 600 000 000</li>
              <li>contact@coolzone.ma</li>
              <li>Casablanca, Maroc</li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-[11px] uppercase tracking-wider-2 text-paper/40 mb-4">
              {t('footer.follow')}
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="#" className="link-underline text-paper/80 hover:text-paper inline-flex items-center gap-1">
                  Instagram <ArrowUpRight size={12} />
                </a>
              </li>
              <li>
                <a href="#" className="link-underline text-paper/80 hover:text-paper inline-flex items-center gap-1">
                  Facebook <ArrowUpRight size={12} />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Ghost logo line */}
        <div className="py-12 md:py-20 flex justify-center">
          <Logo className="w-full max-w-[1100px] h-auto opacity-[0.08] brightness-0 invert select-none pointer-events-none" />
        </div>

        {/* Bottom strip */}
        <div className="pt-6 border-t border-paper/15 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] uppercase tracking-wider-2 text-paper/40">
          <p>© {year} CoolZone. {t('footer.rights')}</p>
          <div className="flex items-center gap-6">
            <Link to="#" className="hover:text-paper">{t('footer.legal')}</Link>
            <LanguageSwitcher tone="dark" />
          </div>
        </div>
      </div>
    </footer>
  );
}
