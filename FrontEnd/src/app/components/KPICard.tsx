import { LucideIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getThemeColors } from '../utils/themeColors';
import { motion } from 'motion/react';
interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  variant?: 'default' | 'danger';
}
export function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default'
}: KPICardProps) {
  const {
    theme
  } = useAuth();
  const colors = getThemeColors(theme);
  return <motion.div className={`${colors.bgSecondary} border ${colors.border} rounded-xl p-6 backdrop-blur-xl transition-all duration-300 shadow-lg cursor-pointer group overflow-hidden relative`} whileHover={{
    scale: 1.03,
    y: -8,
    boxShadow: theme === 'dark' ? '0 20px 40px rgba(0, 0, 0, 0.5)' : '0 20px 40px rgba(74, 69, 61, 0.2)',
    transition: {
      duration: 0.3
    }
  }} whileTap={{
    scale: 0.98
  }} initial={{
    opacity: 0,
    y: 20
  }} animate={{
    opacity: 1,
    y: 0
  }} transition={{
    duration: 0.5
  }}>
      {}
      <motion.div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} style={{
      background: variant === 'danger' ? theme === 'dark' ? 'radial-gradient(circle at top right, rgba(227, 24, 55, 0.1), transparent 70%)' : 'radial-gradient(circle at top right, rgba(95, 2, 41, 0.1), transparent 70%)' : 'radial-gradient(circle at top right, rgba(255, 255, 255, 0.05), transparent 70%)'
    }} />

      <div className="flex items-start justify-between mb-4 relative z-10">
        <motion.div className={`p-2 ${theme === 'dark' ? 'bg-white/5' : 'bg-[#4A453D]/5'} rounded-lg`} whileHover={{
        rotate: [0, -10, 10, -10, 0],
        scale: 1.1
      }} transition={{
        duration: 0.5
      }}>
          <Icon className={`w-5 h-5 ${variant === 'danger' ? theme === 'dark' ? 'text-[#E31837]' : 'text-[#5F0229]' : colors.textPrimary}`} />
        </motion.div>
        {trend && <motion.span className={`text-xs px-2 py-1 rounded-full ${trend === 'up' ? 'bg-green-500/10 text-green-500' : trend === 'down' ? theme === 'dark' ? 'bg-red-500/10 text-[#E31837]' : 'bg-red-500/10 text-[#5F0229]' : 'bg-gray-500/10 text-gray-400'}`} whileHover={{
        scale: 1.2,
        rotate: trend === 'up' ? -5 : 5
      }} transition={{
        duration: 0.3
      }}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '–'}
          </motion.span>}
      </div>
      
      <div className="space-y-1 relative z-10">
        <p className={`${colors.textSecondary} text-sm`}>{title}</p>
        <motion.p className={`text-3xl font-semibold ${variant === 'danger' ? theme === 'dark' ? 'text-[#E31837]' : 'text-[#5F0229]' : colors.textPrimary}`} initial={{
        scale: 0.5,
        opacity: 0
      }} animate={{
        scale: 1,
        opacity: 1
      }} transition={{
        duration: 0.5,
        delay: 0.2,
        type: "spring",
        stiffness: 200
      }}>
          {value}
        </motion.p>
        {subtitle && <p className={`${colors.textSecondary} text-xs mt-2`}>{subtitle}</p>}
      </div>

      {}
      <motion.div className={`absolute inset-0 rounded-xl pointer-events-none`} initial={{
      opacity: 0
    }} whileHover={{
      opacity: 1,
      boxShadow: variant === 'danger' ? theme === 'dark' ? '0 0 0 2px rgba(227, 24, 55, 0.3)' : '0 0 0 2px rgba(95, 2, 41, 0.3)' : theme === 'dark' ? '0 0 0 2px rgba(255, 255, 255, 0.1)' : '0 0 0 2px rgba(74, 69, 61, 0.2)',
      transition: {
        duration: 0.3
      }
    }} />
    </motion.div>;
}