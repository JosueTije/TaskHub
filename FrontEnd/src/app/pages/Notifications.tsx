import { useState } from 'react';
import { Header } from '../components/Header';
import { useNotifications } from '../contexts/NotificationsContext';
import { CheckCircle2, AlertTriangle, Trophy, Sparkles, Clock, Bell, Check, Trash2, Loader2 } from 'lucide-react';

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Ahora';
  if (mins < 60) return `Hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Hace ${hrs} h`;
  return `Hace ${Math.floor(hrs / 24)} días`;
}

function notifIcon(type: string) {
  switch (type) {
    case 'ticket_completed': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    case 'blocker_added':    return <AlertTriangle className="w-5 h-5 text-[#FF3B30]" />;
    case 'achievement':      return <Trophy className="w-5 h-5 text-yellow-500" />;
    case 'ai_alert':         return <Sparkles className="w-5 h-5 text-purple-500" />;
    case 'deadline':         return <Clock className="w-5 h-5 text-orange-500" />;
    case 'ticket_assigned':  return <CheckCircle2 className="w-5 h-5 text-blue-500" />;
    case 'sprint_started':   return <Clock className="w-5 h-5 text-orange-500" />;
    default:                 return <Bell className="w-5 h-5 text-[#8E8E93]" />;
  }
}

function notifBg(type: string) {
  switch (type) {
    case 'ticket_completed': return 'bg-green-500/10';
    case 'blocker_added':    return 'bg-[#FF3B30]/10';
    case 'achievement':      return 'bg-yellow-500/10';
    case 'ai_alert':         return 'bg-purple-500/10';
    case 'deadline':         return 'bg-orange-500/10';
    case 'ticket_assigned':  return 'bg-blue-500/10';
    case 'sprint_started':   return 'bg-orange-500/10';
    default:                 return 'bg-white/10';
  }
}

export function Notifications() {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead, remove } = useNotifications();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filtered = filter === 'unread' ? notifications.filter((n) => !n.read) : notifications;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#FF3B30]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0F0F]">
      <Header title="Notificaciones" subtitle="Mantente al día con las actualizaciones de tus proyectos" />

      <div className="p-6 md:p-8 max-w-4xl mx-auto">
        {/* Filter bar */}
        <div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'all' ? 'bg-[#FF3B30] text-white' : 'bg-[#0F0F0F] text-[#8E8E93] hover:text-white'}`}
              >
                Todas ({notifications.length})
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'unread' ? 'bg-[#FF3B30] text-white' : 'bg-[#0F0F0F] text-[#8E8E93] hover:text-white'}`}
              >
                No leídas ({unreadCount})
              </button>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-2 px-4 py-2 bg-[#0F0F0F] border border-white/10 rounded-lg text-sm font-medium text-white hover:bg-white/5 transition-all"
              >
                <Check className="w-4 h-4" />
                Marcar todas como leídas
              </button>
            )}
          </div>
        </div>

        {/* List */}
        {filtered.length > 0 ? (
          <div className="space-y-3">
            {filtered.map((n) => (
              <div
                key={n.id}
                className={`bg-[#1C1C1E] border rounded-xl p-4 transition-all hover:border-white/20 ${n.read ? 'border-white/10' : 'border-[#FF3B30]/30 bg-[#FF3B30]/5'}`}
              >
                <div className="flex gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${notifBg(n.type)}`}>
                    {notifIcon(n.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <h3 className="text-sm font-semibold text-white">{n.title}</h3>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {!n.read && <div className="w-2 h-2 bg-[#FF3B30] rounded-full" />}
                      </div>
                    </div>
                    <p className="text-sm text-[#8E8E93] mb-2">{n.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-[#8E8E93]">
                        <span>{relativeTime(n.createdAt)}</span>
                        {n.projectName && (
                          <>
                            <span>•</span>
                            <span className="text-[#FF3B30]">{n.projectName}</span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {!n.read && (
                          <button
                            onClick={() => markAsRead(n.id)}
                            className="text-xs text-[#8E8E93] hover:text-white transition-colors flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" />
                            Leída
                          </button>
                        )}
                        <button
                          onClick={() => remove(n.id)}
                          className="text-xs text-[#8E8E93] hover:text-[#FF3B30] transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-12 text-center">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-[#8E8E93]" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No hay notificaciones</h3>
            <p className="text-sm text-[#8E8E93]">
              {filter === 'unread' ? 'Has leído todas tus notificaciones' : 'No tienes notificaciones en este momento'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
