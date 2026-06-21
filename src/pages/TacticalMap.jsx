import { Map, Layers, AlertTriangle, Truck, Radio, ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import { useState } from 'react';
import Card, { CardHeader } from '../components/common/Card';
import StatusBadge from '../components/common/StatusBadge';
import { tacticalMapZones, haulRoutes, equipmentData } from '../data/mockData';

const zoneColors = {
  extraction: { fill: 'rgba(232,96,10,0.15)', stroke: 'var(--orange)', text: 'text-industrial-400' },
  preparation: { fill: 'rgba(100, 116, 139, 0.15)', stroke: '#64748b', text: 'text-steel-400' },
  maintenance: { fill: 'rgba(245, 158, 11, 0.15)', stroke: '#f59e0b', text: 'text-amber-400' },
  logistics: { fill: 'rgba(59, 130, 246, 0.15)', stroke: '#3b82f6', text: 'text-info' },
};

const statusIndicator = {
  active: '#22c55e',
  congested: '#ef4444',
  idle: '#64748b',
};

function EquipmentDot({ x, y, type, id, status }) {
  const color = status === 'Active' ? 'var(--orange)' : status === 'Idle' ? '#64748b' : '#f59e0b';
  return (
    <g>
      <circle cx={x} cy={y} r="6" fill={color} opacity="0.3">
        {status === 'Active' && (
          <animate attributeName="r" values="6;10;6" dur="2s" repeatCount="indefinite" />
        )}
      </circle>
      <circle cx={x} cy={y} r="3" fill={color} />
      <title>{id} — {type} ({status})</title>
    </g>
  );
}

export default function TacticalMap() {
  const [selectedZone, setSelectedZone] = useState(null);
  const [zoom, setZoom] = useState(1);

  const equipmentPositions = [
    { ...equipmentData[0], x: 200, y: 180 },
    { ...equipmentData[1], x: 480, y: 150 },
    { ...equipmentData[2], x: 560, y: 480 },
    { ...equipmentData[3], x: 250, y: 430 },
    { ...equipmentData[4], x: 520, y: 170 },
    { ...equipmentData[5], x: 720, y: 230 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gradient">Tactical Mining Map</h1>
          <p className="text-sm text-graphite-400 mt-1">Interactive operational visualization center</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom((z) => Math.min(z + 0.1, 1.5))}
            className="p-2 rounded-lg bg-graphite-800/60 border border-graphite-700/40 text-graphite-400 hover:text-graphite-200 transition-colors"
          >
            <ZoomIn size={16} />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(z - 0.1, 0.7))}
            className="p-2 rounded-lg bg-graphite-800/60 border border-graphite-700/40 text-graphite-400 hover:text-graphite-200 transition-colors"
          >
            <ZoomOut size={16} />
          </button>
          <button className="p-2 rounded-lg bg-graphite-800/60 border border-graphite-700/40 text-graphite-400 hover:text-graphite-200 transition-colors">
            <Maximize size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
        {/* Map Visualization */}
        <div className="xl:col-span-3">
          <Card className="p-0 overflow-hidden">
            <div className="p-4 border-b border-graphite-700/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-graphite-700/50">
                  <Map size={18} className="text-industrial-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-graphite-100">Mining Site Overview</h3>
                  <p className="text-xs text-graphite-400">Real-time tactical view</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                <span className="text-xs text-success font-medium">Live</span>
              </div>
            </div>

            <div className="relative bg-graphite-950 overflow-hidden" style={{ minHeight: 520 }}>
              {/* Grid Background */}
              <svg
                viewBox="0 0 900 600"
                className="w-full h-full"
                style={{ transform: `scale(${zoom})`, transformOrigin: 'center', transition: 'transform 0.3s' }}
              >
                <defs>
                  <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                    <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(52,58,64,0.2)" strokeWidth="0.5" />
                  </pattern>
                  <pattern id="grid-lg" width="150" height="150" patternUnits="userSpaceOnUse">
                    <path d="M 150 0 L 0 0 0 150" fill="none" stroke="rgba(52,58,64,0.35)" strokeWidth="0.5" />
                  </pattern>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                <rect width="900" height="600" fill="url(#grid)" />
                <rect width="900" height="600" fill="url(#grid-lg)" />

                {/* Haul Routes */}
                <path d="M 200 200 C 300 180, 350 160, 480 150" stroke="#3b82f6" strokeWidth="2" fill="none" opacity="0.4" strokeDasharray="8 4">
                  <animate attributeName="stroke-dashoffset" values="0;-24" dur="2s" repeatCount="indefinite" />
                </path>
                <path d="M 480 150 C 550 200, 600 250, 720 230" stroke="#ef4444" strokeWidth="2" fill="none" opacity="0.5" strokeDasharray="8 4">
                  <animate attributeName="stroke-dashoffset" values="0;-24" dur="1.5s" repeatCount="indefinite" />
                </path>
                <path d="M 200 200 L 250 430" stroke="#64748b" strokeWidth="1.5" fill="none" opacity="0.3" strokeDasharray="6 4" />
                <path d="M 480 150 L 560 480" stroke="#f59e0b" strokeWidth="1.5" fill="none" opacity="0.3" strokeDasharray="6 4" />

                {/* Mining Zones */}
                {tacticalMapZones.map((zone) => {
                  const colors = zoneColors[zone.type];
                  const x = (zone.x / 100) * 900;
                  const y = (zone.y / 100) * 600;
                  const w = (zone.w / 100) * 900;
                  const h = (zone.h / 100) * 600;

                  return (
                    <g
                      key={zone.id}
                      onClick={() => setSelectedZone(zone)}
                      className="cursor-pointer"
                    >
                      <rect
                        x={x}
                        y={y}
                        width={w}
                        height={h}
                        rx="8"
                        fill={colors.fill}
                        stroke={colors.stroke}
                        strokeWidth={selectedZone?.id === zone.id ? 2 : 1}
                        opacity={selectedZone?.id === zone.id ? 1 : 0.7}
                      />
                      {/* Zone Label */}
                      <text x={x + w / 2} y={y + 20} textAnchor="middle" fill={colors.stroke} fontSize="11" fontWeight="600">
                        {zone.name}
                      </text>
                      <text x={x + w / 2} y={y + 35} textAnchor="middle" fill="var(--ink-secondary)" fontSize="9">
                        {zone.type.toUpperCase()}
                      </text>

                      {/* Density indicator */}
                      <circle cx={x + w - 14} cy={y + 14} r="5" fill={statusIndicator[zone.status]} opacity="0.8">
                        {zone.status === 'congested' && (
                          <animate attributeName="opacity" values="0.8;0.3;0.8" dur="1s" repeatCount="indefinite" />
                        )}
                      </circle>

                      {/* Density bar */}
                      <rect x={x + 8} y={y + h - 16} width={w - 16} height="4" rx="2" fill="rgba(52,58,64,0.4)" />
                      <rect x={x + 8} y={y + h - 16} width={(w - 16) * (zone.density / 100)} height="4" rx="2" fill={colors.stroke} opacity="0.7" />
                    </g>
                  );
                })}

                {/* Equipment Positions */}
                {equipmentPositions.map((eq) => (
                  <EquipmentDot key={eq.id} x={eq.x} y={eq.y} type={eq.type} id={eq.id} status={eq.status} />
                ))}

                {/* Danger Zone Overlay */}
                <rect x={630} y={200} width={162} height={120} rx="8" fill="rgba(239,68,68,0.06)" stroke="#ef4444" strokeWidth="1" strokeDasharray="4 4" opacity="0.6" />
                <text x={711} y={275} textAnchor="middle" fill="#ef4444" fontSize="9" fontWeight="500" opacity="0.7">CONGESTION ZONE</text>

                {/* Compass */}
                <g transform="translate(850, 50)">
                  <circle cx="0" cy="0" r="18" fill="rgba(28,32,35,0.8)" stroke="rgba(52,58,64,0.5)" strokeWidth="1" />
                  <text x="0" y="-6" textAnchor="middle" fill="var(--orange)" fontSize="9" fontWeight="700">N</text>
                  <text x="0" y="12" textAnchor="middle" fill="var(--ink-secondary)" fontSize="7">S</text>
                </g>

                {/* Scale */}
                <g transform="translate(30, 570)">
                  <line x1="0" y1="0" x2="80" y2="0" stroke="var(--ink-secondary)" strokeWidth="1" />
                  <line x1="0" y1="-4" x2="0" y2="4" stroke="var(--ink-secondary)" strokeWidth="1" />
                  <line x1="80" y1="-4" x2="80" y2="4" stroke="var(--ink-secondary)" strokeWidth="1" />
                  <text x="40" y="-8" textAnchor="middle" fill="var(--ink-secondary)" fontSize="8">500m</text>
                </g>
              </svg>
            </div>

            {/* Legend */}
            <div className="p-3 border-t border-graphite-700/50 flex flex-wrap gap-4">
              {Object.entries(zoneColors).map(([type, colors]) => (
                <div key={type} className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: colors.stroke, opacity: 0.7 }} />
                  <span className="text-[10px] text-graphite-400 capitalize">{type}</span>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-industrial-500" />
                <span className="text-[10px] text-graphite-400">Equipment</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-0.5 border-t border-dashed border-info" />
                <span className="text-[10px] text-graphite-400">Haul Route</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Side Panel */}
        <div className="space-y-4">
          {/* Selected Zone Info */}
          <Card>
            <CardHeader title="Zone Details" icon={Layers} />
            {selectedZone ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-graphite-200">{selectedZone.name}</span>
                  <StatusBadge status={selectedZone.status} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-graphite-400">Type</span>
                    <span className="text-graphite-300 capitalize">{selectedZone.type}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-graphite-400">Operational Density</span>
                    <span className="text-graphite-300">{selectedZone.density}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-graphite-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${selectedZone.density > 80 ? 'bg-danger' : selectedZone.density > 50 ? 'bg-warning' : 'bg-success'}`}
                      style={{ width: `${selectedZone.density}%` }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-graphite-500">Select a zone on the map to view details</p>
            )}
          </Card>

          {/* Haul Routes */}
          <Card>
            <CardHeader title="Haul Routes" icon={Truck} />
            <div className="space-y-2">
              {haulRoutes.map((route) => (
                <div
                  key={route.id}
                  className="p-2.5 rounded-lg bg-graphite-800/20 border border-graphite-700/20"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-graphite-200">{route.name}</span>
                    <StatusBadge status={route.status} />
                  </div>
                  <p className="text-[10px] text-graphite-500">{route.from} → {route.to}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Radio size={10} className={
                      route.traffic === 'critical' ? 'text-danger' :
                      route.traffic === 'heavy' ? 'text-warning' :
                      route.traffic === 'normal' ? 'text-success' : 'text-graphite-500'
                    } />
                    <span className="text-[10px] text-graphite-400 capitalize">{route.traffic} traffic</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Alerts */}
          <Card>
            <CardHeader title="Zone Alerts" icon={AlertTriangle} />
            <div className="space-y-2">
              <div className="p-2.5 rounded-lg bg-danger/5 border border-danger/10">
                <div className="flex items-start gap-2">
                  <AlertTriangle size={14} className="text-danger mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-danger">Congestion — Sector C</p>
                    <p className="text-[10px] text-graphite-400 mt-0.5">Route Gamma bottleneck detected. 3 trucks queued.</p>
                  </div>
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-warning/5 border border-warning/10">
                <div className="flex items-start gap-2">
                  <AlertTriangle size={14} className="text-warning mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-warning">Blast Zone Active</p>
                    <p className="text-[10px] text-graphite-400 mt-0.5">Sector A blast scheduled at 14:00. 300m exclusion zone.</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
