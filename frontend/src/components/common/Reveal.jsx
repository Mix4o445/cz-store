import { motion } from 'framer-motion';

const EASE = [0.16, 1, 0.3, 1]; // Smooth out-expo-ish

/**
 * Wraps children in a fade-up animation triggered when they scroll into view.
 * Animates only once per element (subsequent scrolls won't replay).
 */
export default function Reveal({
  as = 'div',
  delay = 0,
  y = 28,
  duration = 0.8,
  margin = '-60px',
  className = '',
  children,
  ...rest
}) {
  const Component = motion[as] ?? motion.div;
  return (
    <Component
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin }}
      transition={{ duration, delay, ease: EASE }}
      className={className}
      {...rest}
    >
      {children}
    </Component>
  );
}
