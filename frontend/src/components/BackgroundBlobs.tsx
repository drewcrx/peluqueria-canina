import { motion } from 'framer-motion'

export function BackgroundBlobs() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <motion.div
        className="absolute -left-16 top-10 h-72 w-72 rounded-full bg-sage-light/70 blur-3xl"
        animate={{ scale: [1, 1.15, 1], x: [0, 20, 0], y: [0, -10, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute right-0 top-32 h-80 w-80 rounded-full bg-clay-light/50 blur-3xl"
        animate={{ scale: [1, 1.2, 1], x: [0, -24, 0], y: [0, 18, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />
      <motion.div
        className="absolute left-1/3 bottom-0 h-64 w-64 rounded-full bg-gold/30 blur-3xl"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />
    </div>
  )
}
