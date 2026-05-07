import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  color?: 'blue' | 'cyan' | 'gold' | 'green' | 'red' | 'purple'
  delay?: number
}

const colorMap = {
  blue:   'stat-card-blue',
  cyan:   'stat-card-cyan',
  gold:   'stat-card-gold',
  green:  'stat-card-green',
  red:    'stat-card-red',
  purple: 'stat-card-purple',
}

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'blue', delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className={`${colorMap[color]} rounded-2xl p-5 shadow-lg cursor-default select-none relative overflow-hidden`}
    >
      <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/10" />
      <div className="absolute -right-2 -bottom-6 w-32 h-32 rounded-full bg-white/5" />
      <div className="relative z-10 flex items-start justify-between">
        <div>
          <p className="text-white/70 text-xs font-medium uppercase tracking-wider">{title}</p>
          <motion.p
            className="text-white text-3xl font-bold mt-1"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: delay + 0.2 }}
          >
            {value}
          </motion.p>
          {subtitle && <p className="text-white/60 text-xs mt-1">{subtitle}</p>}
        </div>
        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
          <Icon size={22} className="text-white" />
        </div>
      </div>
    </motion.div>
  )
}
