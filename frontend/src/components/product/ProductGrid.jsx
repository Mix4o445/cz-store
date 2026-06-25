import ProductCard from './ProductCard';

export default function ProductGrid({ products = [] }) {
  if (!products.length) return null;
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-12">
      {products.map((p) => (
        <ProductCard key={p._id ?? p.slug} product={p} />
      ))}
    </div>
  );
}
