export function getThemeColors(theme: 'dark' | 'light') {
  if (theme === 'dark') {
    return {
      // Backgrounds
      bg: 'bg-[#0F0F0F]',
      bgSecondary: 'bg-[#1C1C1E]',
      bgTertiary: 'bg-[#2C2C2E]',
      
      // Borders
      border: 'border-white/10',
      
      // Text
      textPrimary: 'text-white',
      textSecondary: 'text-[#8E8E93]',
      textMuted: 'text-[#636366]',
      
      // Hover states
      hover: 'hover:bg-white/5',
      hoverBorder: 'hover:border-white/20',
      
      // Accent (Mahindra Red remains the same)
      accent: 'bg-[#E31837]',
      accentText: 'text-[#E31837]',
      accentBorder: 'border-[#E31837]',
      accentHover: 'hover:bg-[#C41530]',
      
      // Chart colors
      chartGrid: 'rgba(255,255,255,0.1)',
      chartAxis: '#8E8E93',
      chartTooltipBg: '#1C1C1E',
      chartTooltipBorder: 'rgba(255,255,255,0.1)',
    };
  } else {
    return {
      // Backgrounds (Tech Mahindra Light Palette)
      bg: 'bg-[#F6F2EA]', // Clarity Gray 1
      bgSecondary: 'bg-[#E5DFD3]', // Clarity Gray 2
      bgTertiary: 'bg-white',
      
      // Borders
      border: 'border-[#4A453D]/10',
      
      // Text
      textPrimary: 'text-[#29251D]', // Anchor Gray 2
      textSecondary: 'text-[#4A453D]', // Anchor Gray 1
      textMuted: 'text-[#8E8E93]',
      
      // Hover states
      hover: 'hover:bg-[#4A453D]/10',
      hoverBorder: 'hover:border-[#4A453D]/20',
      
      // Accent (Mahindra Red remains the same)
      accent: 'bg-[#E31837]',
      accentText: 'text-[#E31837]',
      accentBorder: 'border-[#E31837]',
      accentHover: 'hover:bg-[#C41530]',
      
      // Chart colors
      chartGrid: 'rgba(74,69,61,0.1)',
      chartAxis: '#4A453D',
      chartTooltipBg: '#FFFFFF',
      chartTooltipBorder: 'rgba(74,69,61,0.2)',
    };
  }
}
