import HeroBanner from '@/components/home/HeroBanner';
import PromoStrip from '@/components/home/PromoStrip';
import CategoryGrid from '@/components/home/CategoryGrid';
import PopularProducts from '@/components/home/PopularProducts';
import Manifesto from '@/components/home/Manifesto';
import WhyUs from '@/components/home/WhyUs';
import BrandsCarousel from '@/components/home/BrandsCarousel';

export default function HomePage() {
  return (
    <>
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
