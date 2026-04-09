import { useState } from 'react';
import { Header } from '../components/Header';
import { CheckCircle2, AlertTriangle, Trophy, Sparkles, Clock, User, Check } from 'lucide-react';
interface Notification {
  id: string;
  type: 'ticket_completed' | 'blocker_added' | 'achievement' | 'ai_alert' | 'deadline';
  title: string;
  description: string;
  user: string;
  timestamp: string;
  read: boolean;
  projectName?: string;
}
const mockNotifications: Notification[] = [{
  id: '1',
  type: 'ticket_completed',
  title: 'Ticket completado',
  description: 'Carlos Mendoza completó el ticket "Implement payment gateway"',
  user: 'Carlos Mendoza',
  timestamp: 'Hace 5 minutos',
  read: false,
  projectName: 'E-commerce Platform'
}, {
  id: '2',
  type: 'ticket_completed',
  title: 'Ticket completado',
  description: 'Ana Rodríguez completó el ticket "Design product catalog"',
  user: 'Ana Rodríguez',
  timestamp: 'Hace 15 minutos',
  read: false,
  projectName: 'E-commerce Platform'
}, {
  id: '3',
  type: 'blocker_added',
  title: 'Nuevo bloqueador',
  description: 'Luis Fernández reportó un bloqueador en "Fix checkout bug"',
  user: 'Luis Fernández',
  timestamp: 'Hace 30 minutos',
  read: false,
  projectName: 'E-commerce Platform'
}, {
  id: '4',
  type: 'achievement',
  title: 'Nuevo logro desbloqueado',
  description: 'El equipo alcanzó el badge "Sprint Master" en el proyecto Mobile App',
  user: 'Sistema',
  timestamp: 'Hace 1 hora',
  read: true,
  projectName: 'Mobile App Development'
}, {
  id: '5',
  type: 'ai_alert',
  title: 'Alerta de IA',
  description: 'El proyecto "CRM Integration" tiene alto riesgo de retraso',
  user: 'TaskHub IA',
  timestamp: 'Hace 2 horas',
  read: true,
  projectName: 'CRM Integration System'
}, {
  id: '6',
  type: 'deadline',
  title: 'Deadline próximo',
  description: 'El sprint "Sprint 12" termina en 2 días',
  user: 'Sistema',
  timestamp: 'Hace 3 horas',
  read: true,
  projectName: 'E-commerce Platform'
}, {
  id: '7',
  type: 'ticket_completed',
  title: 'Ticket completado',
  description: 'Patricia Torres completó el ticket "User authentication flow"',
  user: 'Patricia Torres',
  timestamp: 'Hace 4 horas',
  read: true,
  projectName: 'Mobile App Development'
}, {
  id: '8',
  type: 'achievement',
  title: 'Nuevo logro desbloqueado',
  description: 'Diego Martínez ganó el badge "Bug Hunter"',
  user: 'Sistema',
  timestamp: 'Hace 5 horas',
  read: true,
  projectName: 'E-commerce Platform'
}];
export function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const unreadCount = notifications.filter(n => !n.read).length;
  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? {
      ...n,
      read: true
    } : n));
  };
  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({
      ...n,
      read: true
    })));
  };
  const filteredNotifications = filter === 'unread' ? notifications.filter(n => !n.read) : notifications;
  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'ticket_completed':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'blocker_added':
        return <AlertTriangle className="w-5 h-5 text-[#FF3B30]" />;
      case 'achievement':
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 'ai_alert':
        return <Sparkles className="w-5 h-5 text-purple-500" />;
      case 'deadline':
        return <Clock className="w-5 h-5 text-orange-500" />;
      default:
        return <User className="w-5 h-5 text-blue-500" />;
    }
  };
  const getNotificationBgColor = (type: Notification['type']) => {
    switch (type) {
      case 'ticket_completed':
        return 'bg-green-500/10';
      case 'blocker_added':
        return 'bg-[#FF3B30]/10';
      case 'achievement':
        return 'bg-yellow-500/10';
      case 'ai_alert':
        return 'bg-purple-500/10';
      case 'deadline':
        return 'bg-orange-500/10';
      default:
        return 'bg-blue-500/10';
    }
  };
  return <div className="min-h-screen bg-[#0F0F0F]">
      <Header title="Notificaciones" subtitle="Mantente al día con las actualizaciones de tus proyectos" />

      <div className="p-6 md:p-8 max-w-4xl mx-auto">
        {}
        <div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'all' ? 'bg-[#FF3B30] text-white' : 'bg-[#0F0F0F] text-[#8E8E93] hover:text-white'}`}>
                Todas ({notifications.length})
              </button>
              <button onClick={() => setFilter('unread')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'unread' ? 'bg-[#FF3B30] text-white' : 'bg-[#0F0F0F] text-[#8E8E93] hover:text-white'}`}>
                No leídas ({unreadCount})
              </button>
            </div>

            {unreadCount > 0 && <button onClick={markAllAsRead} className="flex items-center gap-2 px-4 py-2 bg-[#0F0F0F] border border-white/10 rounded-lg text-sm font-medium text-white hover:bg-white/5 transition-all">
                <Check className="w-4 h-4" />
                Marcar todas como leídas
              </button>}
          </div>
        </div>

        {}
        {filteredNotifications.length > 0 ? <div className="space-y-3">
            {filteredNotifications.map(notification => <div key={notification.id} className={`bg-[#1C1C1E] border rounded-xl p-4 transition-all hover:border-white/20 cursor-pointer ${notification.read ? 'border-white/10' : 'border-[#FF3B30]/30 bg-[#FF3B30]/5'}`} onClick={() => !notification.read && markAsRead(notification.id)}>
                <div className="flex gap-4">
                  {}
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getNotificationBgColor(notification.type)}`}>
                    {getNotificationIcon(notification.type)}
                  </div>

                  {}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <h3 className={`text-sm font-semibold ${notification.read ? 'text-white' : 'text-white'}`}>
                        {notification.title}
                      </h3>
                      {!notification.read && <div className="w-2 h-2 bg-[#FF3B30] rounded-full flex-shrink-0 mt-1.5"></div>}
                    </div>
                    <p className="text-sm text-[#8E8E93] mb-2">{notification.description}</p>
                    <div className="flex items-center gap-3 text-xs text-[#8E8E93]">
                      <span>{notification.user}</span>
                      <span>•</span>
                      <span>{notification.timestamp}</span>
                      {notification.projectName && <>
                          <span>•</span>
                          <span className="text-[#FF3B30]">{notification.projectName}</span>
                        </>}
                    </div>
                  </div>
                </div>
              </div>)}
          </div> : <div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-12 text-center">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-[#8E8E93]" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No hay notificaciones</h3>
            <p className="text-sm text-[#8E8E93]">
              {filter === 'unread' ? 'Has leído todas tus notificaciones' : 'No tienes notificaciones en este momento'}
            </p>
          </div>}
      </div>
    </div>;
}