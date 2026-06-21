import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Map, Layers, AlertTriangle, Truck, Radio, ZoomIn, ZoomOut,
  Maximize, Activity, Cpu, Shield, Zap, Navigation, Eye,
  ChevronRight, X, TrendingUp, Clock
} from 'lucide-react';

/* ─────────────── STATIC ZONE DATA ─────────────── */
const ZONES = [
  { id: 'zone-a', name: 'Extraction Zone A', short: 'EXT-A', type: 'extraction',
    x: 80, y: 80, w: 220, h: 150, status: 'active', density: 82, color: 'var(--orange)' },
  { id: 'zone-b', name: 'Haul Route B', short: 'HAUL-B', type: 'route',
    x: 340, y: 120, w: 300, h: 60, status: 'congested', density: 91, color: '#ef4444' },
  { id: 'zone-c', name: 'Processing Area', short: 'PROC-C', type: 'processing',
    x: 680, y: 80, w: 180, h: 200, status: 'active', density: 65, color: '#3b82f6' },
  { id: 'zone-d', name: 'Maintenance Yard', short: 'MNT-D', type: 'maintenance',
    x: 80, y: 320, w: 160, h: 140, status: 'idle', density: 34, color: '#f59e0b' },
  { id: 'zone-e', name: 'Restricted Blast Zone', short: 'BLZ-E', type: 'restricted',
    x: 580, y: 360, w: 200, h: 160, status: 'restricted', density: 10, color: '#ef4444' },
];

const ROUTES = [
  { id: 'r1', points: 'M300,155 C380,140 420,130 340,150', color: '#3b82f6', speed: 2 },
  { id: 'r2', points: 'M300,155 L640,155', color: '#ef4444', speed: 1.2 },
  { id: 'r3', points: 'M640,155 L680,180', color: 'var(--orange)', speed: 2.5 },
  { id: 'r4', points: 'M240,320 L240,260 L640,155', color: '#f59e0b', speed: 3 },
];

/* ─────────────── EQUIPMENT INITIAL STATE ─────────────── */
const INIT_EQUIPMENT = [
  { id: 'DT-09', type: 'Dump Truck',     color: 'var(--orange)', status: 'moving',  x: 200, y: 155, vx: 1.2,  vy: 0,    route: 'r2', progress: 0.1 },
  { id: 'EX-14', type: 'Excavator',      color: '#f59e0b', status: 'active',  x: 130, y: 130, vx: 0,    vy: 0,    route: null, progress: 0 },
  { id: 'DR-03', type: 'Drill Unit',     color: '#94a3b8', status: 'warning', x: 100, y: 390, vx: 0,    vy: 0,    route: null, progress: 0 },
  { id: 'BD-11', type: 'Bulldozer',      color: '#22c55e', status: 'moving',  x: 420, y: 155, vx: 1.5,  vy: 0,    route: 'r2', progress: 0.5 },
  { id: 'TR-22', type: 'Transport',      color: '#3b82f6', status: 'moving',  x: 580, y: 140, vx: 0.8,  vy: 0.6,  route: 'r3', progress: 0.3 },
  { id: 'CR-07', type: 'Crane',          color: '#a78bfa', status: 'active',  x: 730, y: 160, vx: 0,    vy: 0,    route: null, progress: 0 },
];

const ALERTS = [
  { id: 'a1', type: 'danger',  icon: '⚠', title: 'Collision Risk',           msg: 'DT-09 & BD-11 proximity alert — Route B',    time: '00:42' },
  { id: 'a2', type: 'warning', icon: '⛽', title: 'Fuel Anomaly',             msg: 'EX-14 fuel 23% above baseline consumption',   time: '02:18' },
  { id: 'a3', type: 'danger',  icon: '🚫', title: 'Restricted Zone Warning',  msg: 'Unauthorized movement near Blast Zone E',    time: '04:05' },
  { id: 'a4', type: 'warning', icon: '🔧', title: 'Maintenance Alert',        msg: 'DR-03 approaching critical service interval', time: '08:31' },
];

const AI_INSIGHTS = [
  { id: 'i1', msg: 'AI predicts congestion increase in Route B within 18 minutes.', conf: 87, icon: TrendingUp },
  { id: 'i2', msg: 'Operational efficiency drop detected in Extraction Zone A.', conf: 74, icon: Activity },
  { id: 'i3', msg: 'Collision probability increased 34% near DT-09 and BD-11.', conf: 91, icon: Shield },
  { id: 'i4', msg: 'Recommend rerouting TR-22 to reduce processing bottleneck.', conf: 79, icon: Navigation },
];

const HEAT_ZONES = [
  { cx: 490, cy: 155, r: 50, color: '#ef4444', label: 'HIGH CONGESTION', intensity: 0.35 },
  { cx: 250, cy: 145, r: 35, color: '#f59e0b', label: 'WARNING',         intensity: 0.25 },
  { cx: 720, cy: 160, r: 30, color: '#22c55e', label: 'NORMAL',          intensity: 0.2 },
];

/* ─────────────── HELPERS ─────────────── */
function lerp(a, b, t) { return a + (b - a) * t; }

const ROUTE_WAYPOINTS = {
  r2: [{ x: 340, y: 155 }, { x: 640, y: 155 }],
  r3: [{ x: 640, y: 155 }, { x: 680, y: 180 }],
  r4: [{ x: 240, y: 390 }, { x: 240, y: 260 }, { x: 640, y: 155 }],
};

/* ─────────────── SUB-COMPONENTS ─────────────── */
function GridOverlay() {
  return (
    <defs>
      <pattern id="sm-grid" width="25" height="25" patternUnits="userSpaceOnUse">
        <path d="M25 0L0 0 0 25" fill="none" stroke="rgba(100,116,139,0.08)" strokeWidth="0.5"/>
      </pattern>
      <pattern id="lg-grid" width="100" height="100" patternUnits="userSpaceOnUse">
        <path d="M100 0L0 0 0 100" fill="none" stroke="rgba(100,116,139,0.14)" strokeWidth="0.5"/>
      </pattern>
      <filter id="glow-soft">
        <feGaussianBlur stdDeviation="4" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
      <filter id="glow-hard">
        <feGaussianBlur stdDeviation="2" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
      <filter id="glow-heat">
        <feGaussianBlur stdDeviation="18" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
      <radialGradient id="bg-vignette" cx="50%" cy="50%" r="70%">
        <stop offset="0%" stopColor="#0d1117" stopOpacity="0"/>
        <stop offset="100%" stopColor="#0d1117" stopOpacity="0.6"/>
      </radialGradient>
      {/* Animated dash filter */}
      <marker id="arrow-blue" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
        <path d="M0,0 L0,6 L6,3 z" fill="#3b82f6" opacity="0.7"/>
      </marker>
    </defs>
  );
}

function ZoneShape({ zone, selected, onClick, tick }) {
  const { x, y, w, h, color, name, short, type, status, density } = zone;
  const isRestricted = type === 'restricted';
  const isActive = status === 'active';
  const isCongested = status === 'congested';

  const pulse = isActive || isCongested;
  const glowOpacity = pulse ? 0.12 + 0.06 * Math.sin(tick * 0.04) : 0.08;

  return (
    <g className="cursor-pointer" onClick={() => onClick(zone)} style={{ filter: selected ? `drop-shadow(0 0 8px ${color}60)` : 'none' }}>
      {/* Heat glow fill */}
      <rect x={x} y={y} width={w} height={h} rx="6"
        fill={color} opacity={glowOpacity} filter="url(#glow-heat)"/>

      {/* Main border */}
      <rect x={x} y={y} width={w} height={h} rx="6"
        fill={`${color}08`}
        stroke={color}
        strokeWidth={selected ? 2 : isRestricted ? 1 : 1}
        strokeDasharray={isRestricted ? '8 4' : type === 'route' ? 'none' : 'none'}
        opacity={selected ? 1 : 0.75}/>

      {/* Corner accents */}
      <line x1={x} y1={y+12} x2={x} y2={y} stroke={color} strokeWidth="2" opacity="0.9"/>
      <line x1={x} y1={y} x2={x+12} y2={y} stroke={color} strokeWidth="2" opacity="0.9"/>
      <line x1={x+w-12} y1={y} x2={x+w} y2={y} stroke={color} strokeWidth="2" opacity="0.9"/>
      <line x1={x+w} y1={y} x2={x+w} y2={y+12} stroke={color} strokeWidth="2" opacity="0.9"/>
      <line x1={x} y1={y+h-12} x2={x} y2={y+h} stroke={color} strokeWidth="2" opacity="0.9"/>
      <line x1={x} y1={y+h} x2={x+12} y2={y+h} stroke={color} strokeWidth="2" opacity="0.9"/>
      <line x1={x+w-12} y1={y+h} x2={x+w} y2={y+h} stroke={color} strokeWidth="2" opacity="0.9"/>
      <line x1={x+w} y1={y+h-12} x2={x+w} y2={y+h} stroke={color} strokeWidth="2" opacity="0.9"/>

      {/* Status dot + pulse */}
      {pulse && (
        <circle cx={x+w-16} cy={y+16} r={5 + 3 * Math.abs(Math.sin(tick * 0.06))} fill={color} opacity={0.15}/>
      )}
      <circle cx={x+w-16} cy={y+16} r="5" fill={color} opacity={isCongested ? 0.9 : 0.7}/>

      {/* Zone label background pill */}
      <rect x={x+7} y={y+10} width={short.length * 7 + 10} height="16" rx="3"
        fill="rgba(10,12,14,0.75)" stroke={color} strokeWidth="0.5" strokeOpacity="0.5"/>
      <text x={x+12} y={y+22} fill={color} fontSize="10" fontWeight="800"
        fontFamily="'JetBrains Mono', 'Courier New', monospace" letterSpacing="0.05em" opacity="1">
        {short}
      </text>
      <text x={x+10} y={y+38} fill="rgba(173,181,189,0.8)" fontSize="9"
        fontFamily="'JetBrains Mono', 'Courier New', monospace" fontWeight="500">
        {name.toUpperCase()}
      </text>

      {/* Density bar — improved height and glow */}
      {type !== 'route' && (
        <>
          <rect x={x+8} y={y+h-16} width={w-16} height="5" rx="3"
            fill="rgba(30,34,38,0.8)" stroke="rgba(52,58,64,0.4)" strokeWidth="0.5"/>
          <rect x={x+8} y={y+h-16} width={(w-16)*(density/100)} height="5" rx="3"
            fill={color} opacity={isCongested ? 1 : 0.85}
            filter={isCongested ? "url(#glow-hard)" : "none"}/>
          <text x={x+w-8} y={y+h-19} textAnchor="end"
            fill={color} fontSize="8" fontFamily="'JetBrains Mono', 'Courier New', monospace"
            fontWeight="700" opacity="0.85">
            {density}%
          </text>
        </>
      )}

      {/* Restricted diagonal lines */}
      {isRestricted && [0,1,2,3,4,5].map(i => (
        <line key={i}
          x1={x + i*40} y1={y}
          x2={x} y2={y + i*40}
          stroke={color} strokeWidth="0.5" opacity="0.12"/>
      ))}
    </g>
  );
}

function HeatZone({ cx, cy, r, color, label, intensity, tick }) {
  const pulse = 0.8 + 0.2 * Math.sin(tick * 0.05);
  const isCritical = intensity > 0.3;
  return (
    <g>
      {/* Outer diffuse glow */}
      <circle cx={cx} cy={cy} r={r * 2 * pulse} fill={color}
        opacity={intensity * 0.18} filter="url(#glow-heat)"/>
      {/* Mid ring */}
      <circle cx={cx} cy={cy} r={r * 1.4 * pulse} fill={color}
        opacity={intensity * 0.28}/>
      {/* Inner core */}
      <circle cx={cx} cy={cy} r={r * 0.55} fill={color}
        opacity={intensity * 0.7 + (isCritical ? 0.15 * Math.abs(Math.sin(tick * 0.12)) : 0)}/>
      {/* Crosshair for critical zones */}
      {isCritical && (
        <>
          <line x1={cx - r * 0.35} y1={cy} x2={cx + r * 0.35} y2={cy}
            stroke={color} strokeWidth="1" opacity="0.6"/>
          <line x1={cx} y1={cy - r * 0.35} x2={cx} y2={cy + r * 0.35}
            stroke={color} strokeWidth="1" opacity="0.6"/>
        </>
      )}
      {/* Label */}
      <rect
        x={cx - label.length * 3.5 - 4} y={cy - r * 1.85 - 10}
        width={label.length * 7 + 8} height="14" rx="3"
        fill="rgba(10,12,14,0.85)" stroke={color} strokeWidth="0.6" strokeOpacity="0.6"
      />
      <text x={cx} y={cy - r * 1.82} textAnchor="middle"
        fill={color} fontSize="9"
        fontFamily="'JetBrains Mono', 'Courier New', monospace" fontWeight="700"
        letterSpacing="0.06em" opacity="0.95">
        {label}
      </text>
    </g>
  );
}

function EquipmentMarker({ eq, selected, tick }) {
  const { x, y, id, color, status } = eq;
  const isMoving = status === 'moving';
  const isWarning = status === 'warning';
  const isActive = status === 'active';

  // Animated outer ring radius for moving/active units
  const outerR = isMoving
    ? 14 + 3 * Math.abs(Math.sin(tick * 0.09))
    : isActive ? 12 : 10;

  // Warning blink
  const warnOpacity = isWarning ? (Math.sin(tick * 0.18) > 0 ? 1 : 0.35) : 1;

  return (
    <g filter="url(#glow-soft)" opacity={warnOpacity}>
      {/* Outermost pulse ring — only moving/active */}
      {(isMoving || isActive) && (
        <circle cx={x} cy={y} r={outerR + 4} fill={color} opacity={0.06}/>
      )}

      {/* Animated outer ring */}
      <circle cx={x} cy={y} r={outerR} fill={color} opacity={isMoving ? 0.12 : 0.08}
        stroke={color} strokeWidth="0.5" strokeOpacity="0.3"/>

      {/* Main body */}
      <circle cx={x} cy={y} r="8" fill="rgba(10,12,14,0.95)"
        stroke={color} strokeWidth={selected ? 2.5 : isWarning ? 2 : 1.8}/>

      {/* Center dot */}
      <circle cx={x} cy={y} r="3.5" fill={color} opacity={isMoving ? 1 : 0.85}/>

      {/* Warning X cross */}
      {isWarning && (
        <>
          <line x1={x-3} y1={y-3} x2={x+3} y2={y+3} stroke={color} strokeWidth="1.5"/>
          <line x1={x+3} y1={y-3} x2={x-3} y2={y+3} stroke={color} strokeWidth="1.5"/>
        </>
      )}

      {/* Selection ring */}
      {selected && (
        <circle cx={x} cy={y} r="14" fill="none"
          stroke={color} strokeWidth="1" strokeDasharray="3 3" opacity="0.7"/>
      )}

      {/* ID label background + text */}
      <rect
        x={x + 11} y={y - 10}
        width={id.length * 6 + 8} height="16" rx="3"
        fill="rgba(10,12,14,0.92)"
        stroke={color} strokeWidth="0.8" strokeOpacity="0.7"
      />
      <text
        x={x + 15} y={y + 3}
        fill={color} fontSize="9"
        fontFamily="'JetBrains Mono', 'Courier New', monospace" fontWeight="800"
        letterSpacing="0.04em"
      >
        {id}
      </text>

      {/* Status micro-dot bottom-right of label */}
      <circle
        cx={x + 11 + id.length * 6 + 8 - 5} cy={y + 6}
        r="2.5" fill={isMoving ? '#22c55e' : isWarning ? '#f59e0b' : color}
        opacity="0.9"
      />
    </g>
  );
}

function RouteFlow({ tick }) {
  const offset = -(tick * 0.6) % 24;
  const congestionPulse = 0.7 + 0.3 * Math.abs(Math.sin(tick * 0.07));
  return (
    <g>
      {/* Route B – congested (red, thicker glow) */}
      <path d="M300,155 L640,155" stroke="#ef4444" strokeWidth="8" fill="none" opacity={0.06 * congestionPulse}/>
      <path d="M300,155 L640,155" stroke="#ef4444" strokeWidth="3" fill="none" opacity={0.5 * congestionPulse}
        strokeDasharray="14 6" strokeDashoffset={offset}/>
      <path d="M300,155 L640,155" stroke="#ef4444" strokeWidth="1" fill="none" opacity={0.9}
        strokeDasharray="14 6" strokeDashoffset={offset}/>

      {/* EXT-A → Haul-B entry lane */}
      <path d="M300,155 C280,155 260,155 240,155" stroke="var(--orange)" strokeWidth="4" fill="none" opacity={0.05}/>
      <path d="M300,155 C280,155 260,155 240,155" stroke="var(--orange)" strokeWidth="1.5" fill="none"
        strokeDasharray="8 4" strokeDashoffset={offset * 0.8} opacity="0.75"/>

      {/* Haul-B → Processing */}
      <path d="M640,155 L680,180" stroke="#3b82f6" strokeWidth="4" fill="none" opacity={0.05}/>
      <path d="M640,155 L680,180" stroke="#3b82f6" strokeWidth="2" fill="none"
        strokeDasharray="8 4" strokeDashoffset={offset * 1.2} opacity="0.8"/>

      {/* Maintenance loop */}
      <path d="M160,390 L160,260 C160,155 240,155 300,155" stroke="#f59e0b" strokeWidth="3" fill="none" opacity={0.05}/>
      <path d="M160,390 L160,260 C160,155 240,155 300,155" stroke="#f59e0b" strokeWidth="1.5" fill="none"
        strokeDasharray="6 5" strokeDashoffset={offset * 0.6} opacity="0.6"/>

      {/* Congestion warning markers on Route B */}
      {[380, 490, 580].map((cx) => (
        <circle key={cx} cx={cx} cy={155} r={3 + Math.abs(Math.sin(tick * 0.1 + cx * 0.01))}
          fill="#ef4444" opacity={0.5 * congestionPulse}/>
      ))}
    </g>
  );
}

function Compass({ x, y }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <circle cx="0" cy="0" r="24" fill="rgba(13,15,17,0.85)" stroke="rgba(100,116,139,0.4)" strokeWidth="1"/>
      <circle cx="0" cy="0" r="20" fill="none" stroke="rgba(100,116,139,0.2)" strokeWidth="0.5"/>
      <line x1="0" y1="-14" x2="0" y2="14" stroke="rgba(100,116,139,0.3)" strokeWidth="0.5"/>
      <line x1="-14" y1="0" x2="14" y2="0" stroke="rgba(100,116,139,0.3)" strokeWidth="0.5"/>
      <polygon points="0,-16 3,-4 0,-8 -3,-4" fill="var(--orange)"/>
      <polygon points="0,16 3,4 0,8 -3,4" fill="rgba(100,116,139,0.5)"/>
      <text x="0" y="-18" textAnchor="middle" fill="var(--orange)" fontSize="8" fontWeight="700" fontFamily="'JetBrains Mono', 'Courier New', monospace">N</text>
      <text x="0" y="25" textAnchor="middle" fill="rgba(100,116,139,0.6)" fontSize="7" fontFamily="'JetBrains Mono', 'Courier New', monospace">S</text>
      <text x="19" y="3" textAnchor="middle" fill="rgba(100,116,139,0.6)" fontSize="7" fontFamily="'JetBrains Mono', 'Courier New', monospace">E</text>
      <text x="-19" y="3" textAnchor="middle" fill="rgba(100,116,139,0.6)" fontSize="7" fontFamily="'JetBrains Mono', 'Courier New', monospace">W</text>
    </g>
  );
}

function CoordGrid({ w, h }) {
  const cols = ['A','B','C','D','E','F','G','H'];
  const rows = ['1','2','3','4','5'];
  const cw = w / cols.length;
  const rh = h / rows.length;
  return (
    <g opacity="0.4">
      {cols.map((c,i) => (
        <text key={c} x={i*cw + cw/2} y={12} textAnchor="middle"
          fill="rgba(100,116,139,0.5)" fontSize="8" fontFamily="'JetBrains Mono', 'Courier New', monospace">{c}</text>
      ))}
      {rows.map((r,i) => (
        <text key={r} x={6} y={i*rh + rh/2 + 20} textAnchor="middle"
          fill="rgba(100,116,139,0.5)" fontSize="8" fontFamily="'JetBrains Mono', 'Courier New', monospace">{r}</text>
      ))}
    </g>
  );
}

/* ─────────────── ALERT BADGE ─────────────── */
function AlertBadge({ alert, tick }) {
  const colors = { danger: '#ef4444', warning: '#f59e0b', info: '#3b82f6' };
  const color = colors[alert.type] || '#94a3b8';
  const blink = alert.type === 'danger' ? (Math.sin(tick * 0.15) > 0 ? 1 : 0.5) : 1;

  return (
    <div style={{
      background: `linear-gradient(135deg, rgba(13,15,17,0.97), rgba(24,27,30,0.95))`,
      border: `1px solid ${color}35`,
      borderLeft: `3px solid ${color}`,
      boxShadow: `0 0 16px ${color}12, inset 0 0 30px ${color}04`,
      borderRadius: '7px',
      padding: '9px 11px',
      marginBottom: '6px',
      opacity: blink,
      transition: 'opacity 0.1s',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '4px' }}>
        <span style={{ fontSize: '12px' }}>{alert.icon}</span>
        <span style={{
          color, fontSize: '11px', fontWeight: '800',
          fontFamily: 'var(--font-mono)', letterSpacing: '0.04em',
        }}>
          {alert.title}
        </span>
        <span style={{
          marginLeft: 'auto', color: 'rgba(73,80,87,0.9)', fontSize: '9px',
          fontFamily: 'var(--font-mono)',
          background: 'rgba(52,58,64,0.3)', padding: '1px 5px', borderRadius: '3px',
        }}>
          T+{alert.time}
        </span>
      </div>
      <p style={{
        color: 'rgba(173,181,189,0.8)', fontSize: '11px',
        lineHeight: '1.5', margin: 0,
      }}>
        {alert.msg}
      </p>
    </div>
  );
}

/* ─────────────── AI INSIGHT CARD ─────────────── */
function AICard({ insight, visible }) {
  const Icon = insight.icon;
  const confColor = insight.conf > 85 ? '#ef4444' : insight.conf > 75 ? '#f59e0b' : '#3b82f6';
  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(59,130,246,0.07), rgba(139,92,246,0.04))',
      border: '1px solid rgba(59,130,246,0.18)',
      borderLeft: '2px solid rgba(59,130,246,0.5)',
      borderRadius: '8px',
      padding: '10px 12px',
      marginBottom: '7px',
      backdropFilter: 'blur(12px)',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateX(0)' : 'translateX(16px)',
      transition: 'opacity 0.4s ease, transform 0.4s ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
        <div style={{
          width: '28px', height: '28px', borderRadius: '7px',
          background: 'rgba(59,130,246,0.14)', border: '1px solid rgba(59,130,246,0.28)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Icon size={13} color="#3b82f6"/>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            color: 'rgba(222,226,230,0.9)', fontSize: '11px',
            lineHeight: '1.55', margin: '0 0 7px',
          }}>
            {insight.msg}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
            <span style={{
              color: 'rgba(73,80,87,0.9)', fontSize: '9px',
              fontFamily: 'var(--font-mono)', fontWeight: '600', letterSpacing: '0.06em',
            }}>
              CONF
            </span>
            <div style={{
              flex: 1, height: '4px', background: 'rgba(52,58,64,0.6)',
              borderRadius: '2px', overflow: 'hidden',
            }}>
              <div style={{
                width: `${insight.conf}%`, height: '100%', borderRadius: '2px',
                background: `linear-gradient(90deg, ${confColor}80, ${confColor})`,
                boxShadow: `0 0 6px ${confColor}50`,
              }}/>
            </div>
            <span style={{
              color: confColor, fontSize: '10px',
              fontFamily: 'var(--font-mono)', fontWeight: '800',
            }}>
              {insight.conf}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────── STATUS STRIP ─────────────── */
function StatusStrip({ equipment }) {
  const colors = {
    moving:  '#22c55e',
    active:  'var(--orange)',
    warning: '#f59e0b',
    idle:    '#64748b',
  };
  const labels = {
    moving: 'MVG', active: 'ACT', warning: 'WRN', idle: 'IDL',
  };
  return (
    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
      {equipment.map(eq => {
        const c = colors[eq.status] || '#94a3b8';
        const isMoving = eq.status === 'moving';
        return (
          <div key={eq.id} style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'rgba(14,16,18,0.9)',
            border: `1px solid ${c}35`,
            borderLeft: `2px solid ${c}`,
            borderRadius: '5px',
            padding: '4px 8px',
          }}>
            <div style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: c,
              boxShadow: `0 0 ${isMoving ? '5' : '3'}px ${c}80`,
            }}/>
            <span style={{
              color: 'var(--ink-primary)', fontSize: '11px',
              fontFamily: 'var(--font-mono)', fontWeight: '700',
            }}>
              {eq.id}
            </span>
            <span style={{
              color: c, fontSize: '9px',
              fontFamily: 'var(--font-mono)', fontWeight: '600',
              opacity: 0.8,
            }}>
              {labels[eq.status] || '—'}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────── MAIN COMPONENT ─────────────── */
export default function TacticalMap() {
  const [tick, setTick] = useState(0);
  const [equipment, setEquipment] = useState(INIT_EQUIPMENT);
  const [selectedZone, setSelectedZone] = useState(null);
  const [selectedEq, setSelectedEq] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [aiVisible, setAiVisible] = useState([false, false, false, false]);
  const [activeLayer, setActiveLayer] = useState('all');
  const rafRef = useRef(null);
  const lastRef = useRef(0);

  // Animation loop
  useEffect(() => {
    let t = 0;
    const loop = (now) => {
      if (now - lastRef.current > 16) {
        t++;
        lastRef.current = now;
        setTick(t);

        // Move equipment along routes
        setEquipment(prev => prev.map(eq => {
          if (eq.status !== 'moving' || !ROUTE_WAYPOINTS[eq.route]) return eq;
          const waypoints = ROUTE_WAYPOINTS[eq.route];
          const totalLen = waypoints.length - 1;
          const newProgress = (eq.progress + 0.002) % 1;
          const segIdx = Math.floor(newProgress * totalLen);
          const segT = (newProgress * totalLen) - segIdx;
          const from = waypoints[Math.min(segIdx, totalLen - 1)];
          const to = waypoints[Math.min(segIdx + 1, totalLen)];
          return { ...eq, progress: newProgress, x: lerp(from.x, to.x, segT), y: lerp(from.y, to.y, segT) };
        }));
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // Staggered AI insight reveal
  useEffect(() => {
    AI_INSIGHTS.forEach((_, i) => {
      setTimeout(() => {
        setAiVisible(prev => { const n = [...prev]; n[i] = true; return n; });
      }, i * 600 + 400);
    });
  }, []);

  const handleZoneClick = useCallback((zone) => {
    setSelectedZone(prev => prev?.id === zone.id ? null : zone);
    setSelectedEq(null);
  }, []);

  const LAYERS = ['all', 'zones', 'heat', 'routes', 'equipment'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontFamily: 'system-ui, sans-serif' }}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '8px',
              background: 'linear-gradient(135deg, rgba(232,96,10,0.2), rgba(232,96,10,0.05))',
              border: '1px solid rgba(232,96,10,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Map size={18} color="var(--orange)"/>
            </div>
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: '800', background: 'linear-gradient(135deg, var(--ink-primary), #adb5bd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
                Tactical Mining Map
              </h1>
              <p style={{ color: 'rgba(100,116,139,0.8)', fontSize: '11px', margin: 0, fontFamily: 'var(--font-mono)' }}>
                OPERATIONAL INTELLIGENCE CENTER · SECTOR 4
              </p>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Live indicator */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
            borderRadius: '20px', padding: '4px 10px',
          }}>
            <div style={{
              width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e',
              boxShadow: `0 0 ${6 + 3*Math.abs(Math.sin(tick*0.08))}px rgba(34,197,94,0.6)`,
            }}/>
            <span style={{ color: '#22c55e', fontSize: '11px', fontWeight: '700', fontFamily: 'var(--font-mono)' }}>LIVE</span>
          </div>
          {/* Zoom controls */}
          {[{ icon: ZoomIn, fn: () => setZoom(z => Math.min(z+0.15, 2)) },
            { icon: ZoomOut, fn: () => setZoom(z => Math.max(z-0.15, 0.6)) },
            { icon: Maximize, fn: () => setZoom(1) }].map(({ icon: Icon, fn }, i) => (
            <button key={i} onClick={fn} style={{
              width: '32px', height: '32px', borderRadius: '6px',
              background: 'rgba(28,32,35,0.8)', border: '1px solid rgba(52,58,64,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              color: 'rgba(173,181,189,0.7)',
            }}>
              <Icon size={14}/>
            </button>
          ))}
        </div>
      </div>

      {/* ── Layer toggles ── */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {LAYERS.map(l => (
          <button key={l} onClick={() => setActiveLayer(l)} style={{
            padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '10px',
            fontFamily: 'var(--font-mono)', fontWeight: '700', letterSpacing: '0.05em',
            background: activeLayer === l ? 'rgba(232,96,10,0.2)' : 'rgba(28,32,35,0.6)',
            border: `1px solid ${activeLayer === l ? 'rgba(232,96,10,0.5)' : 'rgba(52,58,64,0.4)'}`,
            color: activeLayer === l ? 'var(--orange)' : 'rgba(100,116,139,0.8)',
            transition: 'all 0.2s',
          }}>
            {l.toUpperCase()}
          </button>
        ))}
      </div>

      {/* ── Main grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '14px' }}>

        {/* MAP CANVAS */}
        <div style={{
          background: 'linear-gradient(145deg, #0a0c0e, #0d1117)',
          border: '1px solid rgba(52,58,64,0.5)',
          borderRadius: '10px', overflow: 'hidden',
          boxShadow: '0 0 40px rgba(0,0,0,0.6), inset 0 0 60px rgba(0,0,0,0.3)',
        }}>
          {/* Map header bar */}
          <div style={{
            padding: '10px 14px', borderBottom: '1px solid rgba(52,58,64,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'rgba(13,15,17,0.6)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Navigation size={14} color="var(--orange)"/>
              <span style={{ color: 'rgba(173,181,189,0.9)', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
                MINING SITE ALPHA · REAL-TIME TACTICAL VIEW
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ color: 'rgba(100,116,139,0.6)', fontSize: '10px', fontFamily: 'var(--font-mono)' }}>
                ZOOM {Math.round(zoom * 100)}%
              </span>
              <span style={{ color: 'rgba(100,116,139,0.6)', fontSize: '10px', fontFamily: 'var(--font-mono)' }}>
                {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>

          {/* SVG MAP */}
          <div style={{ position: 'relative', overflow: 'hidden', height: '520px' }}>
            <svg
              viewBox="0 0 900 560"
              style={{
                width: '100%', height: '100%',
                transform: `scale(${zoom})`, transformOrigin: 'center',
                transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              <GridOverlay/>

              {/* Background fills */}
              <rect width="900" height="560" fill="#0d1117"/>
              <rect width="900" height="560" fill="url(#sm-grid)"/>
              <rect width="900" height="560" fill="url(#lg-grid)"/>
              <rect width="900" height="560" fill="url(#bg-vignette)"/>

              {/* Coordinate grid labels */}
              <CoordGrid w={900} h={540}/>

              {/* Tactical scan line */}
              <line
                x1="0" y1={((tick * 2) % 560)}
                x2="900" y2={((tick * 2) % 560)}
                stroke="rgba(232,96,10,0.03)" strokeWidth="60"
              />

              {/* Heat zones */}
              {(activeLayer === 'all' || activeLayer === 'heat') &&
                HEAT_ZONES.map(hz => <HeatZone key={hz.label} {...hz} tick={tick}/>)}

              {/* Route flows */}
              {(activeLayer === 'all' || activeLayer === 'routes') &&
                <RouteFlow tick={tick}/>}

              {/* Zones */}
              {(activeLayer === 'all' || activeLayer === 'zones') &&
                ZONES.map(z => (
                  <ZoneShape key={z.id} zone={z}
                    selected={selectedZone?.id === z.id}
                    onClick={handleZoneClick} tick={tick}/>
                ))}

              {/* Equipment */}
              {(activeLayer === 'all' || activeLayer === 'equipment') &&
                equipment.map(eq => (
                  <EquipmentMarker key={eq.id} eq={eq}
                    selected={selectedEq === eq.id} tick={tick}/>
                ))}

              {/* Compass */}
              <Compass x={860} y={50}/>

              {/* Scale bar */}
              <g transform="translate(20,540)">
                <line x1="0" y1="0" x2="90" y2="0" stroke="rgba(100,116,139,0.5)" strokeWidth="1"/>
                <line x1="0" y1="-4" x2="0" y2="4" stroke="rgba(100,116,139,0.5)" strokeWidth="1"/>
                <line x1="90" y1="-4" x2="90" y2="4" stroke="rgba(100,116,139,0.5)" strokeWidth="1"/>
                <line x1="45" y1="-2" x2="45" y2="2" stroke="rgba(100,116,139,0.5)" strokeWidth="1"/>
                <text x="45" y="-8" textAnchor="middle" fill="rgba(100,116,139,0.6)" fontSize="8"
                  fontFamily="'JetBrains Mono', 'Courier New', monospace">500m</text>
              </g>

              {/* Crosshair coordinates display */}
              <text x="900" y="555" textAnchor="end" fill="rgba(100,116,139,0.4)" fontSize="8"
                fontFamily="'JetBrains Mono', 'Courier New', monospace">
                LAT -23.4521° LON 151.8834°
              </text>
            </svg>

            {/* Scan overlay effect */}
            <div style={{
              position: 'absolute', inset: 0, pointerEvents: 'none',
              background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)',
            }}/>
          </div>

          {/* Map legend */}
          <div style={{
            padding: '8px 14px', borderTop: '1px solid rgba(52,58,64,0.4)',
            background: 'rgba(13,15,17,0.6)', display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center',
          }}>
            {ZONES.map(z => (
              <div key={z.id} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: z.color, opacity: 0.8 }}/>
                <span style={{ color: 'rgba(100,116,139,0.7)', fontSize: '9px', fontFamily: 'var(--font-mono)' }}>
                  {z.short}
                </span>
              </div>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginLeft: 'auto' }}>
              <Truck size={10} color="rgba(100,116,139,0.6)"/>
              <span style={{ color: 'rgba(100,116,139,0.6)', fontSize: '9px', fontFamily: 'var(--font-mono)' }}>
                {equipment.filter(e => e.status === 'moving').length} IN MOTION
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {/* Equipment Status */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(28,32,35,0.9), rgba(20,23,25,0.95))',
            border: '1px solid rgba(52,58,64,0.5)', borderRadius: '8px', padding: '12px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <Truck size={14} color="var(--orange)"/>
              <span style={{ color: 'rgba(241,243,245,0.9)', fontSize: '12px', fontWeight: '600', fontFamily: 'var(--font-mono)' }}>
                FIELD UNITS
              </span>
              <span style={{
                marginLeft: 'auto', background: 'rgba(232,96,10,0.15)', border: '1px solid rgba(232,96,10,0.3)',
                borderRadius: '10px', padding: '1px 7px', color: 'var(--orange)', fontSize: '10px', fontFamily: 'var(--font-mono)',
              }}>
                {equipment.length} TOTAL
              </span>
            </div>
            <StatusStrip equipment={equipment}/>
            <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
              {equipment.map(eq => {
                const statusColors = { moving: '#22c55e', active: 'var(--orange)', warning: '#f59e0b', idle: '#64748b' };
                const c = statusColors[eq.status];
                return (
                  <div key={eq.id} style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '5px 8px', borderRadius: '5px',
                    background: 'rgba(13,15,17,0.5)', border: `1px solid ${c}20`,
                  }}>
                    <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: c, flexShrink: 0 }}/>
                    <span style={{ color: c, fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: '700', width: '42px' }}>
                      {eq.id}
                    </span>
                    <span style={{ color: 'rgba(100,116,139,0.7)', fontSize: '10px', flex: 1 }}>{eq.type}</span>
                    <span style={{ color: c, fontSize: '9px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                      {eq.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live Alerts */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(28,32,35,0.9), rgba(20,23,25,0.95))',
            border: '1px solid rgba(52,58,64,0.5)', borderRadius: '8px', padding: '12px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <AlertTriangle size={14} color="#ef4444"/>
              <span style={{ color: 'rgba(241,243,245,0.9)', fontSize: '12px', fontWeight: '600', fontFamily: 'var(--font-mono)' }}>
                LIVE ALERTS
              </span>
              <span style={{
                marginLeft: 'auto', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: '10px', padding: '1px 7px', color: '#ef4444', fontSize: '10px', fontFamily: 'var(--font-mono)',
              }}>
                {ALERTS.length} ACTIVE
              </span>
            </div>
            {ALERTS.map(a => <AlertBadge key={a.id} alert={a} tick={tick}/>)}
          </div>

          {/* Selected Zone Info */}
          {selectedZone && (
            <div style={{
              background: `linear-gradient(135deg, rgba(28,32,35,0.9), rgba(20,23,25,0.95))`,
              border: `1px solid ${selectedZone.color}30`,
              borderTop: `2px solid ${selectedZone.color}`,
              borderRadius: '8px', padding: '12px',
              boxShadow: `0 0 20px ${selectedZone.color}10`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                <Layers size={14} color={selectedZone.color}/>
                <span style={{ color: 'rgba(241,243,245,0.9)', fontSize: '12px', fontWeight: '600', marginLeft: '8px', fontFamily: 'var(--font-mono)' }}>
                  ZONE DETAIL
                </span>
                <button onClick={() => setSelectedZone(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(100,116,139,0.6)' }}>
                  <X size={14}/>
                </button>
              </div>
              <div style={{ color: selectedZone.color, fontSize: '14px', fontWeight: '700', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>
                {selectedZone.short}
              </div>
              <div style={{ color: 'rgba(173,181,189,0.8)', fontSize: '11px', marginBottom: '10px' }}>
                {selectedZone.name}
              </div>
              {[
                { label: 'TYPE', value: selectedZone.type.toUpperCase() },
                { label: 'STATUS', value: selectedZone.status.toUpperCase() },
                { label: 'DENSITY', value: `${selectedZone.density}%` },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span style={{ color: 'rgba(100,116,139,0.7)', fontSize: '10px', fontFamily: 'var(--font-mono)' }}>{row.label}</span>
                  <span style={{ color: 'rgba(173,181,189,0.9)', fontSize: '10px', fontFamily: 'var(--font-mono)' }}>{row.value}</span>
                </div>
              ))}
              <div style={{ marginTop: '8px' }}>
                <div style={{ height: '4px', background: 'rgba(52,58,64,0.5)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${selectedZone.density}%`, height: '100%', borderRadius: '2px',
                    background: selectedZone.density > 80 ? '#ef4444' : selectedZone.density > 60 ? '#f59e0b' : '#22c55e',
                    transition: 'width 0.5s ease',
                  }}/>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── AI Tactical Insights ── */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(28,32,35,0.9), rgba(20,23,25,0.95))',
        border: '1px solid rgba(59,130,246,0.2)', borderRadius: '10px', padding: '14px',
        boxShadow: '0 0 30px rgba(59,130,246,0.05)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <div style={{
            width: '30px', height: '30px', borderRadius: '6px',
            background: 'linear-gradient(135deg, rgba(59,130,246,0.25), rgba(139,92,246,0.15))',
            border: '1px solid rgba(59,130,246,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Cpu size={14} color="#3b82f6"/>
          </div>
          <div>
            <span style={{ color: 'rgba(241,243,245,0.9)', fontSize: '13px', fontWeight: '700', fontFamily: 'var(--font-mono)' }}>
              AI TACTICAL INTELLIGENCE
            </span>
            <div style={{ color: 'rgba(100,116,139,0.7)', fontSize: '10px', fontFamily: 'var(--font-mono)' }}>
              PREDICTIVE OPERATIONS ENGINE · MODEL v4.2
            </div>
          </div>
          <div style={{
            marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '5px',
            background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)',
            borderRadius: '4px', padding: '3px 8px',
          }}>
            <Activity size={10} color="#3b82f6"/>
            <span style={{ color: '#3b82f6', fontSize: '10px', fontFamily: 'var(--font-mono)' }}>PROCESSING</span>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0' }}>
          {AI_INSIGHTS.map((ins, i) => (
            <AICard key={ins.id} insight={ins} visible={aiVisible[i]}/>
          ))}
        </div>
      </div>

    </div>
  );
}
