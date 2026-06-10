import { useRef, useState } from "react";
import { X, FileText, Upload, CheckCircle2, AlertCircle, Trash2, ChevronDown } from "lucide-react";
import { useSrsImport } from "../../hooks/useSrsImport";

const PRIORITY_OPTIONS = [
  { value: "HIGH", label: "Alta" },
  { value: "MEDIUM", label: "Media" },
  { value: "LOW", label: "Baja" },
];

const PRIORITY_COLORS = {
  HIGH: "text-orange-400",
  MEDIUM: "text-yellow-400",
  LOW: "text-blue-400",
  CRITICAL: "text-red-400",
};

export function SrsImportModal({ sprintId, onClose, onSuccess }) {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragging, setDragging] = useState(false);

  const { step, loading, error, tickets, developers, createdCount, analyze, confirm, updateTicket, removeTicket, reset } =
    useSrsImport({
      sprintId,
      onSuccess,
    });

  function handleFile(file) {
    if (!file) return;
    if (file.type !== "application/pdf") {
      return;
    }
    setSelectedFile(file);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  }

  function handleClose() {
    reset();
    setSelectedFile(null);
    onClose();
  }

  // ── Step 1: Upload ──────────────────────────────────────────────────────────
  if (step === 1) {
    return (
      <Overlay>
        <div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-6 max-w-lg w-full">
          <ModalHeader title="Importar SRS" icon={<FileText className="w-5 h-5 text-[#FF3B30]" />} onClose={handleClose} />

          <p className="text-sm text-[#8E8E93] mb-5">
            Sube un documento SRS en PDF. La IA extraerá los requerimientos funcionales y los convertirá en tickets de desarrollo.
          </p>

          {/* Drop zone */}
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors mb-4 ${
              dragging
                ? "border-[#FF3B30] bg-[#FF3B30]/5"
                : selectedFile
                ? "border-green-500/50 bg-green-500/5"
                : "border-white/20 hover:border-white/40"
            }`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
          >
            {selectedFile ? (
              <div className="flex flex-col items-center gap-2">
                <FileText className="w-10 h-10 text-green-500" />
                <p className="text-sm font-medium text-white">{selectedFile.name}</p>
                <p className="text-xs text-[#8E8E93]">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-10 h-10 text-[#8E8E93]" />
                <p className="text-sm text-white font-medium">Arrastra un PDF aquí o haz clic para seleccionar</p>
                <p className="text-xs text-[#8E8E93]">Solo PDF · Máximo 10 MB</p>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />

          {error && <ErrorBanner message={error} />}

          <div className="flex gap-3 mt-5">
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-2.5 border border-white/20 rounded-lg text-white text-sm font-medium hover:bg-white/5 transition-all"
            >
              Cancelar
            </button>
            <button
              disabled={!selectedFile || loading}
              onClick={() => analyze(selectedFile)}
              className="flex-1 px-4 py-2.5 bg-[#FF3B30] hover:bg-[#E0352B] disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-white text-sm font-medium transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Spinner /> : null}
              {loading ? "Analizando…" : "Analizar PDF"}
            </button>
          </div>
        </div>
      </Overlay>
    );
  }

  // ── Step 2: Review ──────────────────────────────────────────────────────────
  if (step === 2) {
    return (
      <Overlay>
        <div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] flex flex-col">
          <ModalHeader title="Revisar tickets sugeridos" icon={<FileText className="w-5 h-5 text-[#FF3B30]" />} onClose={handleClose} />

          <p className="text-sm text-[#8E8E93] mb-3">
            La IA identificó <span className="text-white font-medium">{tickets.length} requerimientos</span> y los asignó según la carga de trabajo del equipo. Puedes editar cualquier campo antes de confirmar.
          </p>

          {/* Developer workload summary */}
          {developers.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {developers.map((d) => (
                <div key={d.id} className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-xs">
                  <span className="text-white font-medium">{d.name.split(" ")[0]}</span>
                  <span className="text-[#8E8E93]">{d.ticketsActivos} activos · {d.horasComprometidas}h</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-0">
            {tickets.map((ticket, i) => (
              <div key={i} className="bg-[#0F0F0F] border border-white/10 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-1 space-y-3">
                    {/* Title */}
                    <input
                      type="text"
                      value={ticket.title}
                      onChange={(e) => updateTicket(i, "title", e.target.value)}
                      maxLength={80}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-[#8E8E93] focus:outline-none focus:border-[#FF3B30]/50 transition-colors"
                      placeholder="Título del ticket"
                    />

                    {/* Description */}
                    <textarea
                      value={ticket.description}
                      onChange={(e) => updateTicket(i, "description", e.target.value)}
                      rows={2}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-[#8E8E93] focus:outline-none focus:border-[#FF3B30]/50 transition-colors resize-none"
                      placeholder="Descripción"
                    />

                    {/* Priority + Story Points + Hours */}
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="relative min-w-[110px] flex-1">
                        <select
                          value={ticket.priority}
                          onChange={(e) => updateTicket(i, "priority", e.target.value)}
                          className="w-full appearance-none bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FF3B30]/50 transition-colors pr-8"
                          style={{ color: PRIORITY_COLORS[ticket.priority] || "#fff" }}
                        >
                          {PRIORITY_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value} className="bg-[#1C1C1E] text-white">
                              {o.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8E8E93] pointer-events-none" />
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[#8E8E93] whitespace-nowrap">SP</span>
                        <input
                          type="number"
                          min={1}
                          max={13}
                          value={ticket.storyPoints}
                          onChange={(e) => updateTicket(i, "storyPoints", Number(e.target.value))}
                          className="w-14 bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-sm text-white text-center focus:outline-none focus:border-[#FF3B30]/50 transition-colors"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[#8E8E93] whitespace-nowrap">Horas est.</span>
                        <input
                          type="number"
                          min={0.5}
                          max={160}
                          step={0.5}
                          value={ticket.estimatedHours ?? ""}
                          onChange={(e) => updateTicket(i, "estimatedHours", e.target.value === "" ? null : Number(e.target.value))}
                          className="w-16 bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-sm text-white text-center focus:outline-none focus:border-[#FF3B30]/50 transition-colors"
                          placeholder="—"
                        />
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex items-center gap-2 flex-1 min-w-[160px]">
                        <span className="text-xs text-[#8E8E93] whitespace-nowrap">Inicio</span>
                        <input
                          type="date"
                          value={ticket.startDate ?? ""}
                          onChange={(e) => updateTicket(i, "startDate", e.target.value || null)}
                          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FF3B30]/50 transition-colors"
                        />
                      </div>
                      <div className="flex items-center gap-2 flex-1 min-w-[160px]">
                        <span className="text-xs text-[#8E8E93] whitespace-nowrap">Límite</span>
                        <input
                          type="date"
                          value={ticket.dueDate ?? ""}
                          onChange={(e) => updateTicket(i, "dueDate", e.target.value || null)}
                          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FF3B30]/50 transition-colors"
                        />
                      </div>
                    </div>

                    {/* Assignee */}
                    {developers.length > 0 && (
                      <div className="relative">
                        <select
                          value={ticket.assignedToId ?? ""}
                          onChange={(e) => updateTicket(i, "assignedToId", e.target.value || null)}
                          className="w-full appearance-none bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FF3B30]/50 transition-colors pr-8"
                        >
                          <option value="" className="bg-[#1C1C1E] text-[#8E8E93]">Sin asignar</option>
                          {developers.map((d) => (
                            <option key={d.id} value={d.id} className="bg-[#1C1C1E] text-white">
                              {d.name} — {d.ticketsActivos} activos · {d.horasComprometidas}h
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8E8E93] pointer-events-none" />
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => removeTicket(i)}
                    className="p-1.5 rounded-lg text-[#8E8E93] hover:text-red-400 hover:bg-red-500/10 transition-all flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {tickets.length === 0 && (
              <p className="text-center text-sm text-[#8E8E93] py-8">Eliminaste todos los tickets. Vuelve atrás para reanalizar.</p>
            )}
          </div>

          {error && <ErrorBanner message={error} />}

          <div className="flex gap-3 mt-5 pt-4 border-t border-white/10">
            <button
              onClick={() => { reset(); setSelectedFile(null); }}
              className="px-4 py-2.5 border border-white/20 rounded-lg text-white text-sm font-medium hover:bg-white/5 transition-all flex-shrink-0"
            >
              ← Volver
            </button>
            <button
              disabled={tickets.length === 0 || loading}
              onClick={confirm}
              className="flex-1 px-4 py-2.5 bg-[#FF3B30] hover:bg-[#E0352B] disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-white text-sm font-medium transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Spinner /> : null}
              {loading ? "Creando…" : `Crear ${tickets.length} ticket${tickets.length !== 1 ? "s" : ""}`}
            </button>
          </div>
        </div>
      </Overlay>
    );
  }

  // ── Step 3: Success ─────────────────────────────────────────────────────────
  return (
    <Overlay>
      <div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-6 max-w-sm w-full text-center">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-green-500/10 rounded-full">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">¡Tickets creados!</h3>
        <p className="text-sm text-[#8E8E93] mb-6">
          Se crearon <span className="text-white font-medium">{createdCount} tickets</span> exitosamente en el sprint activo.
        </p>
        <button
          onClick={handleClose}
          className="w-full px-4 py-2.5 bg-[#FF3B30] hover:bg-[#E0352B] rounded-lg text-white text-sm font-medium transition-all"
        >
          Cerrar
        </button>
      </div>
    </Overlay>
  );
}

// ── Shared sub-components ───────────────────────────────────────────────────

function Overlay({ children }) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      {children}
    </div>
  );
}

function ModalHeader({ title, icon, onClose }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>
      <button onClick={onClose} className="p-1.5 rounded-lg text-[#8E8E93] hover:text-white hover:bg-white/5 transition-all">
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}

function ErrorBanner({ message }) {
  return (
    <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg mt-3">
      <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
      <p className="text-sm text-red-400">{message}</p>
    </div>
  );
}

function Spinner() {
  return (
    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
  );
}
