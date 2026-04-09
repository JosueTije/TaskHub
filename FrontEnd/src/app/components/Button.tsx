import { LucideIcon } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  children: React.ReactNode;
}

export function Button({ 
  variant = 'primary', 
  size = 'md',
  icon: Icon, 
  children, 
  className = '',
  ...props 
}: ButtonProps) {
  const baseStyles = "rounded-lg font-medium transition-all duration-200 flex items-center gap-2 justify-center";
  
  const variants = {
    primary: "bg-[#E31837] text-white hover:bg-[#E31837]/90 shadow-lg shadow-[#E31837]/20",
    secondary: "bg-[#29251D] text-white hover:bg-[#29251D]/80 border border-white/10",
    outline: "bg-transparent text-white border border-white/20 hover:border-white/40 hover:bg-white/5"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3 text-base"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </button>
  );
}
