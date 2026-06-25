import { useState } from 'react';
import { Star } from 'lucide-react';
import clsx from 'clsx';

export default function StarInput({ value = 0, onChange, size = 22, disabled }) {
  const [hover, setHover] = useState(0);
  const display = hover || value;

  return (
    <div
      className="inline-flex items-center gap-1"
      role="radiogroup"
      aria-label="Rating"
      onMouseLeave={() => setHover(0)}
    >
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= display;
        return (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            disabled={disabled}
            onMouseEnter={() => setHover(n)}
            onClick={() => onChange?.(n)}
            className={clsx(
              'transition-transform p-0.5',
              !disabled && 'hover:scale-110',
              disabled && 'cursor-not-allowed'
            )}
          >
            <Star
              size={size}
              className={clsx(
                'transition-colors',
                filled ? 'fill-amber-400 text-amber-400' : 'text-line'
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
