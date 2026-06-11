import { useEffect, useState } from 'react';
import { X, Edit2, MessageSquare, Clock, AlertCircle, User, Activity, Save, Ban, GitBranch } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './Button';

interface Ticket {
  id: string;
  title: string;
  estimation: number;
  storyPoints?: number;
  assignee: string;
  assignedToId?: string | null;
  status: 'Backlog' | 'In Progress' | 'Review' | 'Done' | 'Blocked' | 'Cancelled';
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  sprintId?: string;
  parentTicketId?: string | null;
  subTickets?: string[];
  description?: string;
  estimatedHours?: number | null;
  actualHours?: number | null;
  startDate?: string | null;
  dueDate?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  githubBranch?: string | null;
  githubPrNumber?: number | null;
  githubPrUrl?: string | null;
  githubPrStatus?: string | null;
}

interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: string;
}

interface ProjectMember {
  id: string;
  name: string;
}

interface TicketDetailModalProps {
  ticket: Ticket;
  projectName: string;
  onClose: () => void;
  onUpdate: (updatedTicket: Partial<Ticket>) => void;
  canEdit?: boolean;
  userRole?: 'ADMIN' | 'PM' | 'DEVELOPER' | 'VIEWER';
  onDivideTicket?: (ticket: Ticket) => void;
  projectMembers?: ProjectMember[];
}

const formatDate = (value?: string | null) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return date.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const toInputDate = (value?: string | null) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0];
};

export function TicketDetailModal({
  ticket,
  projectName,
  onClose,
  onUpdate,
  canEdit = true,
  userRole = 'PM',
  onDivideTicket,
  projectMembers = [],
}: TicketDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(ticket.title);
  const [description, setDescription] = useState(ticket.description || '');
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [selectedStatus, setSelectedStatus] = useState(ticket.status);
  const [selectedPriority, setSelectedPriority] = useState(ticket.priority);
  const [timeSpent, setTimeSpent] = useState(
    ticket.actualHours !== null && ticket.actualHours !== undefined
      ? String(ticket.actualHours)
      : ''
  );
  const [startDate, setStartDate] = useState(toInputDate(ticket.startDate));
  const [dueDate, setDueDate] = useState(toInputDate(ticket.dueDate));
  const [estimatedHours, setEstimatedHours] = useState(
    ticket.estimatedHours !== null && ticket.estimatedHours !== undefined
      ? String(ticket.estimatedHours)
      : ''
  );
  const [selectedAssigneeId, setSelectedAssigneeId] = useState<string | null>(ticket.assignedToId ?? null);
  const [blockReason, setBlockReason] = useState('');
  const [showBlockModal, setShowBlockModal] = useState(false);

  const canEditFullTicket = userRole === 'PM' || userRole === 'ADMIN';
  const canEditStatus = canEdit && userRole !== 'VIEWER';
  const canEditTime = canEdit && selectedStatus === 'Done' && userRole !== 'VIEWER';
  const displayedEstimatedHours =
    ticket.estimatedHours !== null && ticket.estimatedHours !== undefined
      ? ticket.estimatedHours
      : estimatedHours
      ? Number(estimatedHours)
      : 0;

  useEffect(() => {
    if (selectedStatus !== 'Done') {
      setTimeSpent('');
    } else if (
      ticket.actualHours !== null &&
      ticket.actualHours !== undefined &&
      timeSpent === ''
    ) {
      setTimeSpent(String(ticket.actualHours));
    }
  }, [selectedStatus, ticket.actualHours]);

  const handleSave = () => {
    if (dueDate && startDate && new Date(dueDate) < new Date(startDate)) {
      alert('La fecha límite no puede ser anterior a la fecha de inicio.');
      return;
    }

    if (selectedStatus === 'Done' && (!timeSpent || Number(timeSpent) <= 0)) {
      alert('Para marcar el ticket como Done debes capturar el tiempo usado.');
      return;
    }

    onUpdate({
      title: editedTitle,
      description,
      status: selectedStatus,
      priority: selectedPriority,
      estimation: ticket.estimation,
      estimatedHours: estimatedHours ? Number(estimatedHours) : null,
      actualHours: selectedStatus === 'Done' ? Number(timeSpent) : null,
      startDate: startDate || null,
      dueDate: dueDate || null,
      assignedToId: selectedAssigneeId,
    } as any);

    setIsEditing(false);
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment: Comment = {
        id: Date.now().toString(),
        author: 'Usuario',
        text: newComment,
        timestamp:
          new Date().toISOString().split('T')[0] +
          ' ' +
          new Date().toTimeString().split(' ')[0].slice(0, 5),
      };
      setComments([...comments, comment]);
      setNewComment('');
    }
  };

  const handleBlockTicket = () => {
    if (blockReason.trim()) {
      setSelectedStatus('Blocked');
      const comment: Comment = {
        id: Date.now().toString(),
        author: 'Usuario',
        text: `🚫 BLOQUEADO: ${blockReason}`,
        timestamp:
          new Date().toISOString().split('T')[0] +
          ' ' +
          new Date().toTimeString().split(' ')[0].slice(0, 5),
      };
      setComments([...comments, comment]);
      onUpdate({
        status: 'Blocked',
        actualHours: null,
      } as any);
      setShowBlockModal(false);
      setBlockReason('');
    }
  };

  const statusColors: Record<string, string> = {
    Backlog: 'bg-gray-500/10 text-gray-500',
    'In Progress': 'bg-blue-500/10 text-blue-500',
    Review: 'bg-purple-500/10 text-purple-400',
    Done: 'bg-green-500/10 text-green-500',
    Blocked: 'bg-[#FF3B30]/10 text-[#FF3B30]',
    Cancelled: 'bg-zinc-500/10 text-zinc-400',
  };

  const priorityColors: Record<string, string> = {
    Critical: 'bg-[#FF3B30]/20 text-[#FF3B30]',
    High: 'bg-[#FF3B30]/10 text-[#FF3B30]',
    Medium: 'bg-yellow-500/10 text-yellow-500',
    Low: 'bg-green-500/10 text-green-500',
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-[#1C1C1E] border border-white/10 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        >
          <div className="p-6 border-b border-white/10 flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-mono text-[#8E8E93] bg-[#0F0F0F] px-2 py-1 rounded">
                  {ticket.id}
                </span>
                <span className="text-xs text-[#8E8E93]">{projectName}</span>
              </div>
              {isEditing && canEditFullTicket ? (
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="w-full text-xl font-semibold text-white bg-[#0F0F0F] border border-white/10 rounded-lg px-3 py-2"
                />
              ) : (
                <h2 className="text-xl font-semibold text-white">{ticket.title}</h2>
              )}
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <X className="w-5 h-5 text-[#8E8E93]" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {userRole === 'DEVELOPER' && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 flex items-start gap-3">
                <Activity className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-500 mb-1">Permisos de Developer</p>
                  <p className="text-xs text-[#8E8E93]">
                    Puedes cambiar el estado y capturar el tiempo usado cuando el ticket quede en Done.
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-[#8E8E93] mb-2 block">Estado</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as any)}
                  className={`w-full px-3 py-2 rounded-lg text-sm font-medium ${statusColors[selectedStatus]} border border-white/10 bg-[#0F0F0F]`}
                  disabled={!canEditStatus}
                >
                  <option value="Backlog">Backlog</option>
                  <option value="In Progress">In Progress</option>
                  {userRole !== 'DEVELOPER' && <option value="Review">Review</option>}
                  {userRole !== 'DEVELOPER' && <option value="Done">Done</option>}
                  <option value="Blocked">Blocked</option>
                  {userRole !== 'DEVELOPER' && <option value="Cancelled">Cancelled</option>}
                </select>
              </div>

              <div>
                <label className="text-xs text-[#8E8E93] mb-2 block">Prioridad</label>
                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value as any)}
                  className={`w-full px-3 py-2 rounded-lg text-sm font-medium ${priorityColors[selectedPriority]} border border-white/10 bg-[#0F0F0F]`}
                  disabled={!canEditFullTicket}
                >
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-[#8E8E93] mb-2 block">Asignado a</label>
                {isEditing && canEditFullTicket && projectMembers.length > 0 ? (
                  <select
                    value={selectedAssigneeId ?? ''}
                    onChange={(e) => setSelectedAssigneeId(e.target.value || null)}
                    className="w-full px-3 py-2 bg-[#0F0F0F] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[#FF3B30]/50 transition-colors"
                  >
                    <option value="" className="bg-[#1C1C1E] text-[#8E8E93]">Sin asignar</option>
                    {projectMembers.map((m) => (
                      <option key={m.id} value={m.id} className="bg-[#1C1C1E] text-white">{m.name}</option>
                    ))}
                  </select>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-2 bg-[#0F0F0F] rounded-lg border border-white/10">
                    <User className="w-4 h-4 text-[#8E8E93]" />
                    <span className="text-sm text-white">{ticket.assignee}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs text-[#8E8E93] mb-2 block">Story Points</label>
                <div className="flex items-center gap-2 px-3 py-2 bg-[#0F0F0F] rounded-lg border border-white/10">
                  <Activity className="w-4 h-4 text-[#8E8E93]" />
                  <span className="text-sm text-white">{ticket.estimation} pts</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-[#8E8E93] mb-2 block">Fecha de inicio</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  disabled={!canEditFullTicket}
                  className="w-full px-3 py-2 bg-[#0F0F0F] border border-white/10 rounded-lg text-sm text-white disabled:opacity-60"
                />
              </div>
              <div>
                <label className="text-xs text-[#8E8E93] mb-2 block">Fecha límite</label>
                <input
                  type="date"
                  value={dueDate}
                  min={startDate || undefined}
                  onChange={(e) => setDueDate(e.target.value)}
                  disabled={!canEditFullTicket}
                  className="w-full px-3 py-2 bg-[#0F0F0F] border border-white/10 rounded-lg text-sm text-white disabled:opacity-60"
                />
              </div>
            </div>

            <div className="bg-[#0F0F0F] rounded-lg p-4 border border-white/10">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-[#8E8E93]" />
                <span className="text-sm font-medium text-white">Time Tracking</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-[#8E8E93] mb-1 block">Estimado</label>
                  {canEditFullTicket ? (
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={estimatedHours}
                      onChange={(e) => setEstimatedHours(e.target.value)}
                      className="w-full px-2 py-1 bg-[#1C1C1E] border border-white/10 rounded text-sm text-white"
                      placeholder="Ej: 8"
                    />
                  ) : (
                    <span className="text-sm text-white">{displayedEstimatedHours || 0}h</span>
                  )}
                </div>
                <div>
                  <label className="text-xs text-[#8E8E93] mb-1 block">Tiempo usado</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={timeSpent}
                    onChange={(e) => setTimeSpent(e.target.value)}
                    className="w-full px-2 py-1 bg-[#1C1C1E] border border-white/10 rounded text-sm text-white disabled:opacity-50"
                    placeholder={selectedStatus === 'Done' ? 'Ej: 12' : 'Se captura al marcar Done'}
                    disabled={!canEditTime}
                  />
                  <p className="text-[11px] text-[#8E8E93] mt-1">
                    El tiempo usado se registra cuando el ticket se marca como Done.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-[#8E8E93]">
              <div className="bg-[#0F0F0F] border border-white/10 rounded-lg p-3">
                <p className="mb-1">Inicio real</p>
                <p className="text-white">{formatDate(ticket.startedAt)}</p>
              </div>
              <div className="bg-[#0F0F0F] border border-white/10 rounded-lg p-3">
                <p className="mb-1">Completado</p>
                <p className="text-white">{formatDate(ticket.completedAt)}</p>
              </div>
            </div>

            {(ticket.githubBranch || ticket.githubPrUrl) && (
              <div className="bg-[#0F0F0F] border border-white/10 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-[#8E8E93]" />
                  <span className="text-sm font-medium text-white">GitHub</span>
                  {ticket.githubPrStatus === 'open' && (
                    <span className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                      En revisión
                    </span>
                  )}
                  {ticket.githubPrStatus === 'merged' && (
                    <span className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
                      Mergeado
                    </span>
                  )}
                  {ticket.githubPrStatus === 'closed' && (
                    <span className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                      Cerrado
                    </span>
                  )}
                </div>

                {ticket.githubBranch && (
                  <div className="flex items-center gap-2 bg-[#1C1C1E] rounded px-3 py-2">
                    <GitBranch className="w-3 h-3 text-[#8E8E93] shrink-0" />
                    <span className="text-xs font-mono text-[#8E8E93] truncate">{ticket.githubBranch}</span>
                  </div>
                )}

                {ticket.githubPrUrl && ticket.githubPrNumber && (
                  <a
                    href={ticket.githubPrUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center justify-between w-full px-3 py-2 rounded border text-xs font-medium transition-colors ${
                      ticket.githubPrStatus === 'merged'
                        ? 'bg-purple-500/10 border-purple-500/30 text-purple-400 hover:bg-purple-500/20'
                        : ticket.githubPrStatus === 'closed'
                        ? 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
                        : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20'
                    }`}
                  >
                    <span>Pull Request #{ticket.githubPrNumber}</span>
                    <span className="text-[10px] opacity-70">Ver en GitHub →</span>
                  </a>
                )}
              </div>
            )}

            <div>
              <label className="text-xs text-[#8E8E93] mb-2 block">Descripción</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 bg-[#0F0F0F] border border-white/10 rounded-lg text-sm text-white resize-none"
                placeholder="Describe el ticket..."
                disabled={!canEditFullTicket}
              />
            </div>

            {canEdit && (
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setShowBlockModal(true)}
                  className="flex items-center gap-2 px-3 py-2 bg-[#FF3B30]/10 hover:bg-[#FF3B30]/20 border border-[#FF3B30]/20 rounded-lg text-sm text-[#FF3B30] transition-colors"
                >
                  <Ban className="w-4 h-4" />
                  Marcar como Bloqueado
                </button>
                {canEditFullTicket && !ticket.parentTicketId && !ticket.subTickets?.length && onDivideTicket && (
                  <button
                    onClick={() => onDivideTicket(ticket)}
                    className="flex items-center gap-2 px-3 py-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 rounded-lg text-sm text-purple-400 transition-colors"
                  >
                    <GitBranch className="w-4 h-4" />
                    Dividir en Subtickets
                  </button>
                )}
                {canEditFullTicket && (
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-white transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                    {isEditing ? 'Cancelar edición' : 'Editar título'}
                  </button>
                )}
              </div>
            )}

            <div>
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="w-4 h-4 text-[#8E8E93]" />
                <span className="text-sm font-medium text-white">Comentarios</span>
              </div>
              <div className="space-y-3 mb-4">
                {comments.length === 0 && <p className="text-xs text-[#8E8E93]">Sin comentarios todavía.</p>}
                {comments.map((comment) => (
                  <div key={comment.id} className="bg-[#0F0F0F] rounded-lg p-3 border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-white">{comment.author}</span>
                      <span className="text-xs text-[#8E8E93]">{comment.timestamp}</span>
                    </div>
                    <p className="text-sm text-[#8E8E93]">{comment.text}</p>
                  </div>
                ))}
              </div>
              {canEdit && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                    placeholder="Añadir un comentario..."
                    className="flex-1 px-3 py-2 bg-[#0F0F0F] border border-white/10 rounded-lg text-sm text-white"
                  />
                  <button
                    onClick={handleAddComment}
                    className="px-4 py-2 bg-[#FF3B30] hover:bg-[#FF3B30]/80 rounded-lg text-sm text-white font-medium transition-colors"
                  >
                    Enviar
                  </button>
                </div>
              )}
            </div>
          </div>

          {canEdit && (
            <div className="p-6 border-t border-white/10 flex justify-end gap-3">
              <Button variant="secondary" onClick={onClose}>
                Cancelar
              </Button>
              <Button onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Guardar Cambios
              </Button>
            </div>
          )}
        </motion.div>

        {showBlockModal && (
          <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#1C1C1E] border border-white/10 rounded-xl max-w-md w-full p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-[#FF3B30]/10 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-[#FF3B30]" />
                </div>
                <h3 className="text-lg font-semibold text-white">Marcar como Bloqueado</h3>
              </div>
              <p className="text-sm text-[#8E8E93] mb-4">
                Explica por qué este ticket está bloqueado:
              </p>
              <textarea
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-[#0F0F0F] border border-white/10 rounded-lg text-sm text-white resize-none mb-4"
                placeholder="ej: Esperando respuesta del cliente sobre los requerimientos..."
              />
              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setShowBlockModal(false)} className="flex-1">
                  Cancelar
                </Button>
                <Button onClick={handleBlockTicket} className="flex-1 bg-[#FF3B30] hover:bg-[#FF3B30]/80">
                  Bloquear Ticket
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </AnimatePresence>
  );
}
