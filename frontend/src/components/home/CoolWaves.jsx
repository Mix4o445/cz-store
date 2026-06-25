import { motion } from 'framer-motion';

/** Decorative SVG used as the hero visual — concentric rings + cooling beam */
export default function CoolWaves({ className = '' }) {
  return (
    <svg
      viewBox="0 0 600 600"
      className={className}
      aria-hidden="true"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <radialGradient id="cw-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0A4DFF" stopOpacity="0.32" />
          <stop offset="60%" stopColor="#22D3EE" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#22D3EE" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="cw-line" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0A1628" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#0A1628" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Glow */}
      <circle cx="300" cy="300" r="290" fill="url(#cw-glow)" />

      {/* Concentric rings */}
      <g fill="none" stroke="url(#cw-line)" strokeWidth="1">
        {[260, 220, 180, 140, 100, 60].map((r, i) => (
          <motion.circle
            key={r}
            cx="300"
            cy="300"
            r={r}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.06, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          />
        ))}
      </g>

      {/* Inner core */}
      <motion.circle
        cx="300"
        cy="300"
        r="22"
        fill="#0A4DFF"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      />
      <motion.circle
        cx="300"
        cy="300"
        r="14"
        fill="#fff"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      />

      {/* Horizontal cooling beam */}
      <motion.line
        x1="0"
        x2="600"
        y1="300"
        y2="300"
        stroke="#0A1628"
        strokeOpacity="0.08"
        strokeDasharray="3 6"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.3, duration: 1.2 }}
      />

      {/* Floating spec dots */}
      <g fill="#0A4DFF">
        <motion.circle
          cx="160"
          cy="160"
          r="3"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.circle
          cx="450"
          cy="200"
          r="3"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.circle
          cx="490"
          cy="450"
          r="3"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      </g>
    </svg>
  );
}
