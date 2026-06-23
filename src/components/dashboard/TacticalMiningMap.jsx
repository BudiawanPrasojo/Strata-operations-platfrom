/**
 * TacticalMiningMap.jsx — Enhanced
 * Hero operational intelligence section with premium tactical overlays,
 * congestion visualization, animated indicators, and glassmorphism polish.
 */

import { Map, Maximize2, ExternalLink, Radio, Layers, AlertTriangle, Activity } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import TacticalMapCore from './TacticalMap';

// Live zone status data
const ZONE_STATUS = [
  { id: 'EXT-A', label: 'Extraction A', status: 'ACTIVE',     color: 'var(--orange)', pct: 82 },
  { id: 'HAUL-B', label: 'Haul Route B', status: 'CONGESTED', color: '#ef4444', pct: 91 },
  { id: 'PROC-C', label: 'Processing C',  status: 'ACTIVE',    color: '#3b82f6', pct: 65 },
  { id: 'MNT-D',  label: 'Maintenance D', status: 'IDLE',      color: '#f59e0b', pct: 34 },
  { id: 'BLZ-E',  label: 'Blast Zone E',  status: 'RESTRICTED',color: '#ef4444', pct: 10 },
];

const TACTICAL_ALERTS = [
  { id: 1, icon: AlertTriangle, msg: 'Collision risk — DT-09 & BD-11 proximity', severity: 'high' },
  { id: 2, icon: Activity,      msg: 'Fuel anomaly in Sector B +23% baseline',    severity: 'medium' },
];

function StatusDot({ color, pulse = false }) {
  return (
    <div className="relative flex items-center justify-center">
      {pulse && (
        <div
          className="absolute w-3 h-3 rounded-full opacity-60"
          style={{
            background: color,
            animation: 'ping 2s cubic-bezier(0,0,0.2,1) infinite',
          }}
        />
      )}
      <div
        className="w-2 h-2 rounded-full"
        style={{ background: color, boxShadow: `0 0 6px ${color}90` }}
      />
    </div>
  );
}

function ZoneMiniBar({ zone }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(zone.pct), 500);
    return () => clearTimeout(t);
  }, [zone.pct]);

  return (
    <div className="flex items-center gap-2 group">
      <StatusDot color={zone.color} pulse={zone.status === 'CONGESTED'} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-[10px] font-mono text-graphite-400 tracking-wider truncate">{zone.id}</span>
          <span className="text-[10px] font-bold ml-1" style={{ color: zone.color }}>{zone.pct}%</span>
        </div>
        <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <div
            className="h-full rounded-full"
            style={{
              width: `${width}%`,
              background: `linear-gradient(90deg, ${zone.color}80, ${zone.color})`,
              boxShadow: `0 0 6px ${zone.color}50`,
              transition: 'width 1.4s cubic-bezier(0.16,1,0.3,1)',
            }}
          />
        </div>
      </div>
    </div>
  );
}

function AlertTicker({ alerts }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIdx(i => (i + 1) % alerts.length), 3500);
    return () => clearInterval(id);
  }, [alerts.length]);

  const alert = alerts[idx];
  const Icon = alert.icon;
  const color = alert.severity === 'high' ? '#ef4444' : '#f59e0b';

  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg overflow-hidden"
      style={{
        background: `${color}10`,
        border: `1px solid ${color}25`,
        minWidth: 0,
      }}
    >
      <Icon size={11} style={{ color, flexShrink: 0 }} />
      <span
        key={idx}
        className="text-[10px] font-mono tracking-wide truncate"
        style={{
          color: '#adb5bd',
          animation: 'fadeInSlide 0.4s ease',
        }}
      >
        {alert.msg}
      </span>
    </div>
  );
}

export default function TacticalMiningMap() {
  const [time, setTime] = useState(new Date());
  const [dataFresh, setDataFresh] = useState(true);

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Simulate brief "refreshing" flicker every 15s
  useEffect(() => {
    const id = setInterval(() => {
      setDataFresh(false);
      setTimeout(() => setDataFresh(true), 400);
    }, 15000);
    return () => clearInterval(id);
  }, []);

  const hh = time.getHours().toString().padStart(2, '0');
  const mm = time.getMinutes().toString().padStart(2, '0');
  const ss = time.getSeconds().toString().padStart(2, '0');

  return (
    <section
      aria-label="Tactical Mining Operations Map"
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(20,23,25,0.97) 0%, rgba(13,15,17,0.99) 100%)',
        border: '1px solid rgba(232,96,10,0.22)',
        boxShadow: '0 0 60px rgba(232,96,10,0.07), 0 4px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.03)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* ── Header bar ── */}
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{
          background: 'linear-gradient(90deg, rgba(232,96,10,0.10) 0%, rgba(13,15,17,0) 70%)',
          borderBottom: '1px solid rgba(52,58,64,0.45)',
        }}
      >
        {/* Left: icon + title + alerts */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div
            className="flex items-center justify-center w-9 h-9 rounded-xl flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, rgba(232,96,10,0.25), rgba(232,96,10,0.08))',
              border: '1px solid rgba(232,96,10,0.40)',
              boxShadow: '0 0 12px rgba(232,96,10,0.15)',
            }}
          >
            <Map size={16} color="var(--orange)" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2
                className="text-sm font-bold tracking-widest whitespace-nowrap"
                style={{
                  background: 'linear-gradient(135deg, var(--ink-primary), #adb5bd)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                TACTICAL MINING MAP
              </h2>
              {/* Operational overlays badge */}
              <div
                className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-md"
                style={{
                  background: 'rgba(6,182,212,0.10)',
                  border: '1px solid rgba(6,182,212,0.20)',
                }}
              >
                <Layers size={9} color="var(--cyan)" />
                <span className="text-[9px] font-bold tracking-widest font-mono" style={{ color: 'var(--cyan)' }}>OVERLAYS ON</span>
              </div>
            </div>
            <p className="text-[10px] tracking-widest" style={{ color: 'var(--ink-secondary)', fontFamily: 'var(--font-mono)' }}>
              OPERATIONAL INTELLIGENCE CENTER · SECTOR 4
            </p>
          </div>

          {/* Scrolling alert ticker */}
          <div className="hidden md:block flex-1 max-w-xs ml-3">
            <AlertTicker alerts={TACTICAL_ALERTS} />
          </div>
        </div>

        {/* Right: data freshness + clock + expand */}
        <div className="flex items-center gap-2 flex-shrink-0 ml-3">
          {/* Data freshness */}
          <div
            className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-lg"
            style={{
              background: 'rgba(13,15,17,0.7)',
              border: '1px solid rgba(52,58,64,0.4)',
            }}
          >
            <Radio size={10} color={dataFresh ? '#22c55e' : '#f59e0b'} />
            <span className="text-[10px] font-mono tracking-wide" style={{ color: dataFresh ? '#22c55e' : '#f59e0b' }}>
              {dataFresh ? 'LIVE' : 'SYNC'}
            </span>
          </div>

          {/* Clock */}
          <div
            className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg"
            style={{
              background: 'rgba(13,15,17,0.7)',
              border: '1px solid rgba(52,58,64,0.4)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: '#22c55e', boxShadow: '0 0 6px rgba(34,197,94,0.8)', animation: 'pulse 2s infinite' }}
            />
            <span className="text-xs text-graphite-300 tracking-widest">{hh}:{mm}:{ss}</span>
          </div>

          {/* Expand button */}
          <Link
            to="/tactical-map"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200"
            style={{
              background: 'rgba(232,96,10,0.12)',
              border: '1px solid rgba(232,96,10,0.30)',
              color: 'var(--orange)',
              letterSpacing: '0.04em',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(232,96,10,0.22)';
              e.currentTarget.style.boxShadow = '0 0 16px rgba(232,96,10,0.25)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(232,96,10,0.12)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <Maximize2 size={12} />
            <span className="hidden sm:inline">Full Map</span>
            <ExternalLink size={10} className="hidden sm:inline" />
          </Link>
        </div>
      </div>

      {/* ── Zone density strip ── */}
      <div
        className="px-5 py-2.5 grid grid-cols-5 gap-4"
        style={{ borderBottom: '1px solid rgba(52,58,64,0.30)', background: 'rgba(13,15,17,0.40)' }}
      >
        {ZONE_STATUS.map(zone => (
          <ZoneMiniBar key={zone.id} zone={zone} />
        ))}
      </div>

      {/* ── Map body ── */}
      <div className="p-4 lg:p-5">
        <TacticalMapCore />
      </div>

      {/* ── Footer bar ── */}
      <div
        className="flex items-center justify-between px-5 py-2"
        style={{
          background: 'rgba(13,15,17,0.55)',
          borderTop: '1px solid rgba(52,58,64,0.35)',
          fontFamily: 'var(--font-mono)',
        }}
      >
        <div className="flex items-center gap-4">
          <span className="text-[10px] tracking-wider" style={{ color: 'var(--ink-muted)' }}>STRATA · REAL-TIME DATA FEED</span>
          <div className="hidden sm:flex items-center gap-3">
            {[
              { label: 'UNITS', val: '6', color: 'var(--orange)' },
              { label: 'ALERTS', val: '4', color: '#ef4444' },
              { label: 'ROUTES', val: '4', color: '#3b82f6' },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-1">
                <span className="text-[9px] tracking-widest" style={{ color: 'var(--ink-muted)' }}>{s.label}</span>
                <span className="text-[10px] font-bold" style={{ color: s.color }}>{s.val}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#22c55e', boxShadow: '0 0 5px rgba(34,197,94,0.7)' }} />
          <span className="text-[10px] tracking-wider" style={{ color: 'var(--ink-secondary)' }}>CONNECTED</span>
        </div>
      </div>

      <style>{`
        @keyframes ping {
          75%, 100% { transform: scale(2.2); opacity: 0; }
        }
        @keyframes fadeInSlide {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}
