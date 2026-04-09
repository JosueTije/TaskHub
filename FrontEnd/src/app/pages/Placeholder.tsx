import { Header } from '../components/Header';
import { useLocation } from 'react-router';
import { Construction } from 'lucide-react';
export function Placeholder() {
  const location = useLocation();
  const pageName = location.pathname.replace('/', '').replace('-', ' ') || 'dashboard';
  const pageTitle = pageName.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  return <div className="min-h-screen bg-[#0F0F0F]">
      <Header title={pageTitle} subtitle="Próximamente disponible" />
      
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-[#1C1C1E] rounded-full flex items-center justify-center">
            <Construction className="w-10 h-10 text-[#FF3B30]" />
          </div>
          <h2 className="text-2xl font-semibold text-white mb-2">En Construcción</h2>
          <p className="text-[#8E8E93]">Esta sección estará disponible próximamente</p>
        </div>
      </div>
    </div>;
}