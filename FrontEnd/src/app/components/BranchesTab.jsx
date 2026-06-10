import { useEffect, useRef, useState, useCallback } from "react";
import { GitBranch, RefreshCw, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { useBranchesData } from "../../hooks/useBranchesData";

// ── Colores por estado ────────────────────────────────────────────────────────
const COLORS = {
  main:           "#888780",
  merged:         "#639922",
  active:         "#378ADD",
  closed:         "#E24B4A",
  pending_review: "#EF9F27",
  in_progress:    "#378ADD",
  blocked:        "#E24B4A",
  not_started:    "#B4B2A9",
  upcoming:       "#888780",
};

function nodeColor(node) {
  if (node.type === "main") return COLORS.main;
  if (node.type === "sprint") return COLORS[node.status] ?? COLORS.upcoming;
  return COLORS[node.status] ?? COLORS.not_started;
}

// ── Helpers de fecha ──────────────────────────────────────────────────────────
function relativeTime(iso) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 2) return "ahora";
  if (mins < 60) return `hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `hace ${days} día${days !== 1 ? "s" : ""}`;
}

function truncate(str, max) {
  if (!str) return "";
  return str.length > max ? str.slice(0, max) + "…" : str;
}

// ── LEYENDA ───────────────────────────────────────────────────────────────────
function Legend() {
  const items = [
    { color: COLORS.merged,         label: "Mergeado" },
    { color: COLORS.in_progress,    label: "En progreso" },
    { color: COLORS.pending_review, label: "En revisión" },
    { color: COLORS.blocked,        label: "Bloqueado / Cerrado" },
    { color: COLORS.not_started,    label: "Sin iniciar" },
  ];
  return (
    <div className="flex flex-wrap gap-4 px-1 py-3 border-t border-white/10 mt-2">
      {items.map(({ color, label }) => (
        <div key={label} className="flex items-center gap-1.5">
          <svg width="12" height="12">
            <circle cx="6" cy="6" r="5" fill={color} />
          </svg>
          <span className="text-[11px] text-[#8E8E93]">{label}</span>
        </div>
      ))}
    </div>
  );
}

// ── SVG GIT GRAPH ─────────────────────────────────────────────────────────────
const LANE_H    = 52;
const NODE_R    = 7;
const PAD_LEFT  = 200;
const PAD_RIGHT = 40;
const PAD_TOP   = 30;
const COMMIT_W  = 60;
const TOGGLE_R  = 7; // radius of the +/- toggle circle

function buildLanes(tree, collapsed) {
  const lanes = [];
  for (const node of tree) {
    if (node.type === "main") {
      lanes.push({ ...node, lane: 0 });
    } else if (node.type === "sprint") {
      const sprintLane = lanes.length;
      const isCollapsed = collapsed.has(node.id);
      const childCount = (node.children || []).length;
      lanes.push({ ...node, lane: sprintLane, children: undefined, isCollapsed, childCount });
      if (!isCollapsed) {
        for (const child of node.children || []) {
          lanes.push({ ...child, lane: lanes.length, parentLane: sprintLane, sprintId: node.id });
        }
      }
    }
  }
  return lanes;
}

function GitGraph({ tree, onNodeClick, highlightId }) {
  const [tooltip, setTooltip]   = useState(null);
  const [collapsed, setCollapsed] = useState(new Set());
  const svgRef = useRef(null);

  const toggleSprint = useCallback((sprintId) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      next.has(sprintId) ? next.delete(sprintId) : next.add(sprintId);
      return next;
    });
  }, []);

  const lanes = buildLanes(tree, collapsed);
  const maxCommits = Math.max(...lanes.map((l) => (l.commits?.length || 0)), 1);
  const svgW = PAD_LEFT + maxCommits * COMMIT_W + PAD_RIGHT;
  const svgH = lanes.length * LANE_H + PAD_TOP + 20;

  const laneY = (i) => PAD_TOP + i * LANE_H + NODE_R;

  const commitX = (laneCommits, idx) => {
    const total = laneCommits?.length || 0;
    const fromRight = total - 1 - idx;
    return PAD_LEFT + (maxCommits - 1 - fromRight) * COMMIT_W;
  };

  const firstX = (laneCommits) => commitX(laneCommits, 0);
  const lastX  = (laneCommits) => commitX(laneCommits, (laneCommits?.length || 1) - 1);

  return (
    <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#0A0A0A] p-2 relative">
      <svg ref={svgRef} width={svgW} height={svgH} style={{ display: "block" }}>

        {/* Lane lines */}
        {lanes.map((lane, li) => {
          const y   = laneY(li);
          const x0  = PAD_LEFT - 8;
          const x1  = lastX(lane.commits);
          const col = nodeColor(lane);
          const isMerged = lane.status === "merged" || (lane.type === "sprint" && lane.mergedToMain);
          return (
            <line
              key={`line-${li}`}
              x1={x0} y1={y} x2={x1} y2={y}
              stroke={col} strokeWidth={2}
              strokeDasharray={isMerged ? "none" : "6 3"}
              opacity={0.5}
            />
          );
        })}

        {/* Merge curves: ticket → sprint */}
        {lanes.map((lane, li) => {
          if (lane.type !== "ticket" || lane.parentLane === undefined) return null;
          if (lane.status !== "merged" && lane.status !== "pending_review") return null;
          const childY     = laneY(li);
          const parentY    = laneY(lane.parentLane);
          const x1         = lastX(lane.commits);
          const parentLane = lanes[lane.parentLane];
          const x2         = firstX(parentLane?.commits);
          const col        = nodeColor(lane);
          return (
            <path key={`merge-ticket-${li}`}
              d={`M ${x1} ${childY} C ${x1+20} ${childY}, ${x2+20} ${parentY}, ${x2} ${parentY}`}
              fill="none" stroke={col} strokeWidth={1.5} opacity={0.6} />
          );
        })}

        {/* Merge curves: sprint → main */}
        {lanes.map((lane, li) => {
          if (lane.type !== "sprint" || !lane.mergedToMain) return null;
          const sprintY  = laneY(li);
          const mainY    = laneY(0);
          const x1       = lastX(lane.commits);
          const x2       = lastX(lanes[0]?.commits);
          return (
            <path key={`merge-sprint-${li}`}
              d={`M ${x1} ${sprintY} C ${x1+30} ${sprintY}, ${x2+30} ${mainY}, ${x2} ${mainY}`}
              fill="none" stroke={COLORS.merged} strokeWidth={2} opacity={0.7} />
          );
        })}

        {/* Commit nodes */}
        {lanes.map((lane, li) => {
          const y   = laneY(li);
          const col = nodeColor(lane);
          const isHighlighted = lane.id === highlightId;
          const commits = lane.commits?.length ? lane.commits : [null];

          return commits.map((commit, ci) => {
            const x      = commitX(lane.commits, ci);
            const isLast = ci === commits.length - 1;
            const isEmpty = !commit;
            return (
              <g key={`node-${li}-${ci}`}>
                <circle
                  cx={x} cy={y} r={NODE_R}
                  fill={isEmpty ? "none" : col}
                  stroke={col}
                  strokeWidth={isLast && lane.status !== "merged" ? 2.5 : 0}
                  opacity={isHighlighted ? 1 : 0.85}
                  style={{ cursor: "pointer", filter: isHighlighted ? `drop-shadow(0 0 6px ${col})` : "none" }}
                  onMouseEnter={(e) => {
                    if (!commit) return;
                    const rect = svgRef.current?.getBoundingClientRect();
                    setTooltip({
                      x: e.clientX - (rect?.left || 0),
                      y: e.clientY - (rect?.top || 0),
                      name: lane.name, message: commit.message,
                      author: commit.author, date: commit.date,
                    });
                  }}
                  onMouseLeave={() => setTooltip(null)}
                  onClick={() => onNodeClick(lane.id)}
                />
              </g>
            );
          });
        })}

        {/* Lane labels + toggle buttons */}
        {lanes.map((lane, li) => {
          const y     = laneY(li);
          const col   = nodeColor(lane);
          const label = truncate(lane.name, 26);
          const isActive    = lane.status === "active" && lane.type === "sprint";
          const isSprint    = lane.type === "sprint";
          const isCollapsed = lane.isCollapsed;
          // toggle button sits just to the left of the label
          const toggleX = 8;

          return (
            <g key={`label-${li}`}>
              {/* Sprint toggle button */}
              {isSprint && lane.childCount > 0 && (
                <g
                  style={{ cursor: "pointer" }}
                  onClick={() => toggleSprint(lane.id)}
                >
                  <circle cx={toggleX + TOGGLE_R} cy={y} r={TOGGLE_R} fill="#1C1C1E" stroke={col} strokeWidth={1.5} />
                  {/* + or - sign */}
                  <line
                    x1={toggleX + TOGGLE_R - 3.5} y1={y}
                    x2={toggleX + TOGGLE_R + 3.5} y2={y}
                    stroke={col} strokeWidth={1.5} strokeLinecap="round"
                  />
                  {isCollapsed && (
                    <line
                      x1={toggleX + TOGGLE_R} y1={y - 3.5}
                      x2={toggleX + TOGGLE_R} y2={y + 3.5}
                      stroke={col} strokeWidth={1.5} strokeLinecap="round"
                    />
                  )}
                  {/* Invisible larger hit area */}
                  <circle cx={toggleX + TOGGLE_R} cy={y} r={14} fill="transparent" />
                </g>
              )}

              {/* Collapsed ticket count badge */}
              {isSprint && isCollapsed && lane.childCount > 0 && (
                <text
                  x={toggleX + TOGGLE_R * 2 + 6} y={y + 4}
                  fontSize={9} fill={col} fontFamily="monospace" opacity={0.7}
                >
                  +{lane.childCount} tickets
                </text>
              )}

              {/* Branch name label */}
              <text
                x={PAD_LEFT - 14}
                y={y + 4}
                textAnchor="end"
                fontSize={10}
                fill={col}
                fontFamily="monospace"
              >
                {label}
              </text>

              {/* ACTIVO badge */}
              {isActive && (
                <>
                  <rect x={PAD_LEFT - 58} y={y - 8} width={40} height={14} rx={3} fill="#378ADD22" stroke="#378ADD44" strokeWidth={0.5} />
                  <text x={PAD_LEFT - 52} y={y + 3} fontSize={7.5} fill="#378ADD" fontWeight="bold" fontFamily="sans-serif">
                    ACTIVO
                  </text>
                </>
              )}
            </g>
          );
        })}
      </svg>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="absolute z-50 pointer-events-none bg-[#1C1C1E] border border-white/10 rounded-lg p-3 shadow-xl text-xs max-w-[240px]"
          style={{ left: Math.min(tooltip.x + 12, svgW - 260), top: Math.max(tooltip.y - 80, 4) }}
        >
          <p className="font-mono text-[#8E8E93] mb-1 truncate">{tooltip.name}</p>
          <p className="text-white font-medium mb-1 leading-snug">{tooltip.message}</p>
          <p className="text-[#8E8E93]">{tooltip.author} · {relativeTime(tooltip.date)}</p>
        </div>
      )}
    </div>
  );
}

// ── SKELETON ──────────────────────────────────────────────────────────────────
function BranchSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-48 bg-white/5 rounded-xl" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-[#1C1C1E] border border-white/10 rounded-xl p-5 space-y-3">
          <div className="h-4 bg-white/10 rounded w-1/3" />
          <div className="h-2 bg-white/5 rounded w-full" />
          <div className="h-2 bg-white/5 rounded w-2/3" />
        </div>
      ))}
    </div>
  );
}

// ── COMMIT LIST ───────────────────────────────────────────────────────────────
function CommitList({ commits, max = 3 }) {
  if (!commits?.length) return <p className="text-xs text-[#8E8E93] italic">Sin commits</p>;
  return (
    <div className="space-y-1 mt-2">
      {commits.slice(0, max).map((c, i) => (
        <div key={i} className="flex items-start gap-2 text-xs">
          <span className="font-mono text-[#8E8E93] shrink-0 mt-0.5">{c.sha}</span>
          <span className="text-white/70 truncate flex-1">{c.message}</span>
          <span className="text-[#8E8E93] shrink-0 whitespace-nowrap">{relativeTime(c.date)}</span>
        </div>
      ))}
    </div>
  );
}

// ── PRIORITY COLORS ───────────────────────────────────────────────────────────
const PRIORITY_BG = {
  critical: "bg-red-500/20 text-red-400",
  high:     "bg-orange-500/20 text-orange-400",
  medium:   "bg-blue-500/20 text-blue-400",
  low:      "bg-[#8E8E93]/20 text-[#8E8E93]",
};

const STATUS_LABEL = {
  merged:         { text: "Mergeado",    cls: "bg-green-500/20 text-green-400 border-green-500/30" },
  active:         { text: "Activo",      cls: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  closed:         { text: "Cerrado",     cls: "bg-red-500/20 text-red-400 border-red-500/30" },
  upcoming:       { text: "Próximo",     cls: "bg-[#888780]/20 text-[#888780] border-[#888780]/30" },
  in_progress:    { text: "En progreso", cls: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  pending_review: { text: "En revisión", cls: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  blocked:        { text: "Bloqueado",   cls: "bg-red-500/20 text-red-400 border-red-500/30" },
  not_started:    { text: "Sin iniciar", cls: "bg-[#888780]/20 text-[#888780] border-[#888780]/30" },
};

// ── TICKET CARD ───────────────────────────────────────────────────────────────
function TicketCard({ ticket, highlighted }) {
  const borderColor = COLORS[ticket.status] ?? COLORS.not_started;
  const badge = STATUS_LABEL[ticket.status];
  const prioBg = PRIORITY_BG[ticket.priority] ?? PRIORITY_BG.medium;

  return (
    <div
      id={`branch-card-${ticket.id}`}
      className={`ml-6 rounded-lg p-4 border-l-2 border border-white/5 bg-[#0F0F0F] transition-all ${
        highlighted ? "ring-1 ring-offset-1 ring-offset-[#0F0F0F]" : ""
      }`}
      style={{ borderLeftColor: borderColor, ...(highlighted ? { "--tw-ring-color": borderColor } : {}) }}
    >
      <div className="flex items-start gap-3 mb-2">
        {ticket.assignee && (
          <span className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${prioBg}`}>
            {ticket.assignee.initials}
          </span>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-medium text-white truncate">{ticket.ticketTitle}</p>
            {badge && (
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badge.cls}`}>
                {badge.text}
              </span>
            )}
            {ticket.prNumber && (
              <a
                href={ticket.prUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/30 hover:bg-purple-500/20 transition-colors"
              >
                PR #{ticket.prNumber} <ExternalLink className="w-2.5 h-2.5" />
              </a>
            )}
          </div>
          <p className="text-[10px] font-mono text-[#8E8E93] mt-0.5 truncate">{ticket.name}</p>
        </div>
      </div>

      {ticket.status === "pending_review" && (
        <p className="text-xs text-yellow-400 mb-2">Esperando aprobación del PM</p>
      )}
      {ticket.status === "blocked" && (
        <p className="text-xs text-red-400 mb-2">Bloqueado — requiere atención</p>
      )}

      <CommitList commits={ticket.commits} max={2} />
    </div>
  );
}

// ── SPRINT CARD ───────────────────────────────────────────────────────────────
function SprintCard({ sprint, highlighted, childHighlightId }) {
  const [expanded, setExpanded] = useState(true);
  const borderColor = COLORS[sprint.status] ?? COLORS.upcoming;
  const badge = STATUS_LABEL[sprint.status];
  const progress = sprint.progress ?? 0;

  return (
    <div
      id={`branch-card-${sprint.id}`}
      className={`rounded-xl border border-white/10 bg-[#1C1C1E] transition-all ${
        highlighted ? "ring-1 ring-offset-2 ring-offset-[#0F0F0F]" : ""
      }`}
      style={{ borderLeftWidth: 3, borderLeftColor: borderColor, ...(highlighted ? { "--tw-ring-color": borderColor } : {}) }}
    >
      {/* Header */}
      <div className="p-5">
        <div className="flex items-start gap-3 mb-3">
          <GitBranch className="w-4 h-4 shrink-0 mt-0.5" style={{ color: borderColor }} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-semibold text-white">{sprint.sprintName}</p>
              {badge && (
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badge.cls}`}>
                  {badge.text}
                </span>
              )}
              <span className="ml-auto text-xs font-semibold" style={{ color: borderColor }}>{progress}%</span>
            </div>
            <p className="text-[10px] font-mono text-[#8E8E93] mt-0.5 truncate">{sprint.name}</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-3">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${progress}%`, backgroundColor: borderColor }}
          />
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-[#8E8E93]">
          <span>{sprint.completedTickets} / {sprint.totalTickets} tickets completados</span>
          {sprint.commits?.[0]?.date && (
            <span>Última actividad {relativeTime(sprint.commits[0].date)}</span>
          )}
        </div>

        <CommitList commits={sprint.commits} max={3} />
      </div>

      {/* Tickets toggle */}
      {sprint.children?.length > 0 && (
        <>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="w-full flex items-center justify-between px-5 py-2.5 border-t border-white/10 text-xs text-[#8E8E93] hover:text-white hover:bg-white/5 transition-all"
          >
            <span>{sprint.children.length} ticket{sprint.children.length !== 1 ? "s" : ""}</span>
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {expanded && (
            <div className="px-5 pb-5 space-y-2">
              {sprint.children.map((ticket) => (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  highlighted={ticket.id === childHighlightId}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export function BranchesTab({ projectId, hasGithubRepo }) {
  const { data, loading, error, lastFetched, load, refetch } = useBranchesData(projectId);
  const [loaded, setLoaded] = useState(false);
  const [highlightId, setHighlightId] = useState(null);
  const [graphVisible, setGraphVisible] = useState(true);
  const highlightTimer = useRef(null);

  // Lazy load on first render of this tab
  useEffect(() => {
    if (!loaded) {
      setLoaded(true);
      load();
    }
  }, [loaded, load]);

  const handleNodeClick = useCallback((id) => {
    setHighlightId(id);
    clearTimeout(highlightTimer.current);
    highlightTimer.current = setTimeout(() => setHighlightId(null), 2000);

    const el = document.getElementById(`branch-card-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, []);

  // No GitHub repo
  if (!hasGithubRepo && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <GitBranch className="w-12 h-12 text-[#8E8E93] mb-4" />
        <p className="text-white font-semibold text-lg mb-2">Sin repositorio de GitHub</p>
        <p className="text-sm text-[#8E8E93] max-w-sm">
          Este proyecto no tiene un repositorio de GitHub configurado. Conéctalo desde el encabezado del proyecto.
        </p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-red-400 font-semibold mb-2">Error al cargar las ramas</p>
        <button onClick={refetch} className="text-sm text-[#8E8E93] underline hover:text-white">
          Reintentar
        </button>
      </div>
    );
  }

  // No repo configured (from API)
  if (data?.error === "no_github_repo") {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <GitBranch className="w-12 h-12 text-[#8E8E93] mb-4" />
        <p className="text-white font-semibold text-lg mb-2">Sin repositorio de GitHub</p>
        <p className="text-sm text-[#8E8E93] max-w-sm">
          Conecta el proyecto a GitHub desde el encabezado del proyecto.
        </p>
      </div>
    );
  }

  const tree = data?.tree ?? [];
  const sprintNodes = tree.filter((n) => n.type === "sprint");

  return (
    <div className="space-y-6">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-[#FF3B30]" />
            Branches
          </h2>
          {lastFetched && (
            <p className="text-xs text-[#8E8E93] mt-0.5">
              Actualizado {relativeTime(lastFetched.toISOString())}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refetch}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 text-[#8E8E93] hover:text-white hover:border-white/20 text-sm transition-all disabled:opacity-40"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Actualizar
          </button>
        </div>
      </div>

      {loading ? (
        <BranchSkeleton />
      ) : (
        <>
          {/* Section A: SVG git graph — collapsible */}
          {tree.length > 0 && (
            <div className="rounded-xl border border-white/10 overflow-hidden">
              <button
                onClick={() => setGraphVisible((v) => !v)}
                className="w-full flex items-center justify-between px-4 py-3 bg-[#0F0F0F] hover:bg-white/5 transition-colors"
              >
                <span className="text-sm font-medium text-white flex items-center gap-2">
                  <GitBranch className="w-3.5 h-3.5 text-[#8E8E93]" />
                  Vista de árbol git
                </span>
                {graphVisible
                  ? <ChevronUp className="w-4 h-4 text-[#8E8E93]" />
                  : <ChevronDown className="w-4 h-4 text-[#8E8E93]" />}
              </button>
              {graphVisible && (
                <div className="border-t border-white/10">
                  <GitGraph
                    tree={tree}
                    onNodeClick={handleNodeClick}
                    highlightId={highlightId}
                  />
                </div>
              )}
            </div>
          )}

          {/* Legend */}
          <Legend />

          {/* Section B: Sprint + ticket cards */}
          <div className="space-y-4">
            {sprintNodes.length === 0 && (
              <p className="text-sm text-[#8E8E93] text-center py-8">
                No hay sprints con ramas en GitHub todavía.
              </p>
            )}
            {sprintNodes.map((sprint) => {
              const isHighlighted = sprint.id === highlightId;
              const childHighlightId = sprint.children?.find((c) => c.id === highlightId)?.id ?? null;
              return (
                <SprintCard
                  key={sprint.id}
                  sprint={sprint}
                  highlighted={isHighlighted}
                  childHighlightId={childHighlightId}
                />
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
