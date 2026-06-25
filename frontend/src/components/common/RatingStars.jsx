import { Star } from 'lucide-react';

export default function RatingStars({ value = 0, size = 14, className = '' }) {
  const full = Math.floor(value);
  const hasHalf = value - full >= 0.5;
  return (
    <span className={`inline-flex items-center gap-0.5 ${className}`} aria-label={`Rating ${value}`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < full || (i === full && hasHalf);
        return (
          <Star
            key={i}
            size={size}
            className={filled ? 'fill-amber-400 text-amber-400' : 'text-line'}
          />
        );
      })}
    </span>
  );
}
