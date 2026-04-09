import { useAuth } from '../contexts/AuthContext';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'danger' | 'warning' | 'info' | 'default';
  className?: string;
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const { theme } = useAuth();
  
  const variants = {
    success: 'bg-green-500/10 text-green-500',
    danger: theme === 'dark' ? 'bg-[#E31837]/10 text-[#E31837]' : 'bg-[#5F0229]/10 text-[#5F0229]',
    warning: 'bg-yellow-500/10 text-yellow-500',
    info: 'bg-blue-500/10 text-blue-500',
    default: 'bg-[#8E8E93]/10 text-[#8E8E93]',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}