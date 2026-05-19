import { Activity } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { motion } from 'motion/react';

//Datos hardcodeados

//Story Points totales del sprint
export const SPRINT_TOTAL_SP = 45;

//Duración del sprint en días
export const SPRINT_TOTAL_DAYS = 14;

//Dia del sprint
export const SPRINT_CURRENT_DAY = 13;

export const BURNDOWN_LAST_UPDATED = new Date().toLocaleDateString('es-MX', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

//Serie de datos
export const BURNDOWN_DATA = [
  { day: 'Día 1',  ideal: 45, remaining: 45 },
  { day: 'Día 2',  ideal: 42, remaining: 43 },
  { day: 'Día 3',  ideal: 38, remaining: 40 },
  { day: 'Día 4',  ideal: 35, remaining: 38 },
  { day: 'Día 5',  ideal: 32, remaining: 34 },
  { day: 'Día 6',  ideal: 29, remaining: 30 },
  { day: 'Día 7',  ideal: 26, remaining: 28 },
  { day: 'Día 8',  ideal: 22, remaining: 22 },
  { day: 'Día 9',  ideal: 19, remaining: 20 },
  { day: 'Día 10', ideal: 16, remaining: 15 },
  { day: 'Día 11', ideal: 13, remaining: 12 },
  { day: 'Día 12', ideal: 10, remaining: 8  },
  { day: 'Día 13', ideal: 6,  remaining: 5  },
  { day: 'Día 14', ideal: 0,  remaining: null }, 
];

//Componentes
export function BurndownChart() {
  return (
    <motion.div
      className="bg-[#1C1C1E] border border-white/10 rounded-xl p-6 backdrop-blur-xl relative overflow-hidden group"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.75 }}
      whileHover={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-cyan-500/5 opacity-0 group-hover:opacity-100 pointer-events-none"
        initial={{ x: '-100%' }}
        whileHover={{ x: '100%' }}
        transition={{ duration: 0.8 }}
      />

      {/*Actualizacion diaria*/}
      <div className="flex items-start justify-between mb-1 relative z-10">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#007AFF]" />
          Burn Down Chart — Sprint Actual
        </h3>
        <span className="flex items-center gap-1.5 text-[10px] font-normal text-[#8E8E93] bg-[#0F0F0F] border border-white/10 rounded-full px-2.5 py-1 whitespace-nowrap">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
          Actualizado: {BURNDOWN_LAST_UPDATED}
        </span>
      </div>

      {/*Dias vs restantes*/}
      <p className="text-xs text-[#8E8E93] mb-4 relative z-10">
        Días del sprint vs Story Points restantes&nbsp;•&nbsp;
        Día actual:{' '}
        <strong className="text-white">{SPRINT_CURRENT_DAY}</strong>{' '}
        / {SPRINT_TOTAL_DAYS}&nbsp;•&nbsp;
        SP totales:{' '}
        <strong className="text-white">{SPRINT_TOTAL_SP}</strong>
      </p>

      {/*Gráfica*/}
      <ResponsiveContainer width="100%" height={380}>
        <AreaChart
          data={BURNDOWN_DATA}
          margin={{ top: 8, right: 16, left: 8, bottom: 28 }}
        >
          <defs>
            <linearGradient id="burnGradIdeal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#8E8E93" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#8E8E93" stopOpacity={0}    />
            </linearGradient>
            <linearGradient id="burnGradReal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#007AFF" stopOpacity={0.28} />
              <stop offset="95%" stopColor="#007AFF" stopOpacity={0.02} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />

          <XAxis
            dataKey="day"
            stroke="#8E8E93"
            tick={{ fill: '#8E8E93', fontSize: 10 }}
            label={{
              value: 'Días del Sprint',
              position: 'insideBottom',
              offset: -14,
              fill: '#636366',
              fontSize: 11,
            }}
          />
          <YAxis
            stroke="#8E8E93"
            tick={{ fill: '#8E8E93', fontSize: 10 }}
            domain={[0, SPRINT_TOTAL_SP]}
            label={{
              value: 'SP Restantes',
              angle: -90,
              position: 'insideLeft',
              offset: 14,
              fill: '#636366',
              fontSize: 11,
            }}
          />

          <Tooltip
            contentStyle={{
              backgroundColor: '#0F0F0F',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              fontSize: '12px',
            }}
            formatter={(value: number, name: string) => [`${value} SP`, name]}
            labelFormatter={(label: string) => `📅 ${label}`}
          />

          {/*Linea ideal*/}
          <Area
            type="monotone"
            dataKey="ideal"
            stroke="#8E8E93"
            fill="url(#burnGradIdeal)"
            strokeWidth={2}
            strokeDasharray="6 4"
            name="Ideal"
            dot={false}
            connectNulls
          />

          {/*Linea real*/}
          <Area
            type="monotone"
            dataKey="remaining"
            stroke="#007AFF"
            fill="url(#burnGradReal)"
            strokeWidth={3}
            name="Real"
            dot={{ fill: '#007AFF', r: 3, strokeWidth: 0 }}
            connectNulls
          />
        </AreaChart>
      </ResponsiveContainer>

      {/*Leyenda idealvs real*/}
      <div className="flex items-center justify-center gap-8 mt-3">
        <div className="flex items-center gap-2">
          <svg width="28" height="12" viewBox="0 0 28 12">
            <line
              x1="0" y1="6" x2="28" y2="6"
              stroke="#8E8E93" strokeWidth="2" strokeDasharray="6 4"
            />
          </svg>
          <span className="text-xs font-semibold text-[#8E8E93]">Ideal</span>
          <span className="text-xs text-[#48484A]">línea objetivo</span>
        </div>
        <div className="flex items-center gap-2">
          <svg width="28" height="12" viewBox="0 0 28 12">
            <line x1="0" y1="6" x2="28" y2="6" stroke="#007AFF" strokeWidth="3" />
            <circle cx="14" cy="6" r="3" fill="#007AFF" />
          </svg>
          <span className="text-xs font-semibold text-white">Real</span>
          <span className="text-xs text-[#48484A]">progreso actual</span>
        </div>
      </div>
    </motion.div>
  );
}
