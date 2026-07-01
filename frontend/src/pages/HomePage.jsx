import HeroBanner from '@/components/home/HeroBanner';
import PromoStrip from '@/components/home/PromoStrip';
import CategoryGrid from '@/components/home/CategoryGrid';
import PopularProducts from '@/components/home/PopularProducts';
import Manifesto from '@/components/home/Manifesto';
import WhyUs from '@/components/home/WhyUs';
import BrandsCarousel from '@/components/home/BrandsCarousel';
import SEO from '@/components/common/SEO';

export default function HomePage() {
  return (
    <>
      <SEO
        title="Climatiseurs premium au Maroc"
        description="CoolZone : climatiseurs premium au Maroc. Split, multi-split, gainable et cassette des plus grandes marques (Daikin, Gree, Midea, Carrier, CIAT, Ingelec, Samsung, LG, Mitsubishi). Prix en MAD, livraison rapide partout au Maroc."
        path="/"
      />
      <HeroBanner />
      <PromoStrip />
      <CategoryGrid />
      <PopularProducts />
      <Manifesto />
      <BrandsCarousel />
      <WhyUs />
    </>
  );
}
