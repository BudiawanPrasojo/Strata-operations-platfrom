import { ShieldCheck, AlertTriangle, Users, Clock, MapPin, FileText, Activity, Database } from 'lucide-react';
import Card, { CardHeader } from '../components/common/Card';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import ErrorState from '../components/common/ErrorState';
import { safetyData } from '../data/mockData';
import { useSafety } from '../hooks/useSafety';

function MetricRing({ value, max = 100, label, color }) {
  const safeValue = Number(value) || 0;
  const pct = (safeValue / max) * 100;
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-20 h-20">
        <svg width="80" height="80" className="-rotate-90">
          <circle cx="40" cy="40" r="32" fill="none" stroke="#272c30" strokeWidth="5" />
          <circle
            cx="40"
            cy="40"
            r="32"
            fill="none"
            stroke={color}
            strokeWidth="5"
            strokeDasharray={2 * Math.PI * 32}
            strokeDashoffset={2 * Math.PI * 32 * (1 - pct / 100)}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-graphite-100">{safeValue}</span>
        </div>
      </div>
      <span className="text-xs text-graphite-400 mt-2">{label}</span>
    </div>
  );
}

const fatigueColors = {
  High:   { text: 'text-danger',  bg: 'bg-danger/15'  },
  Medium: { text: 'text-warning', bg: 'bg-warning/15' },
  Low:    { text: 'text-success', bg: 'bg-success/15' },
};

export default function SafetyCenter() {
  const { incidents, loading, error, source, refetch } = useSafety();

  return (
    <div className="space-y-6">

      {/* Page header */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-xl lg:text-2xl font-bold text-gradient">
            Safety Center
          </h1>
          {/* Source badge — konsisten dengan Equipment dan LiveFeed */}
          {source === 'supabase' ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Database size={11} color="#22c55e" />
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6rem',
                color: '#22c55e',
                fontWeight: 600,
                letterSpacing: '0.08em',
              }}>
                SUPABASE
              </span>
            </div>
          ) : (
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6rem',
              color: 'var(--color-text-secondary, #8A9BB0)',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '3px',
              padding: '1px 6px',
            }}>
              OFFLINE
            </span>
          )}
        </div>
        <p className="text-sm text-graphite-400 mt-1">
          Worker safety monitoring and compliance dashboard
        </p>
      </div>

      {/* Safety Overview — dari safetyData (static, tidak ada tabel Supabase) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Compliance Score', value: safetyData.complianceScore + '%', icon: ShieldCheck, color: 'text-success' },
          { label: 'Active Alerts',    value: safetyData.activeAlerts,           icon: AlertTriangle, color: 'text-danger'  },
          { label: 'Fatigue Risks',    value: safetyData.fatigueRisks,           icon: Activity,      color: 'text-warning' },
          { label: 'Unsafe Zones',     value: safetyData.unsafeZones,            icon: MapPin,        color: 'text-danger'  },
        ].map((stat) => (
          <Card key={stat.label} hover>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-graphite-700/50">
                <stat.icon size={18} className={stat.color} />
              </div>
              <div>
                <p className="text-xl font-bold text-graphite-100">{stat.value}</p>
                <p className="text-xs text-graphite-400">{stat.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Safety Score Ring */}
        <Card>
          <CardHeader title="Safety Metrics" subtitle="Current shift overview" icon={ShieldCheck} />
          <div className="flex items-center justify-around py-4">
            <MetricRing value={94.7} label="Compliance" color="#22c55e" />
            <MetricRing value={87}   label="Awareness"  color="#3b82f6" />
            <MetricRing value={72}   label="Response"   color="#f59e0b" />
          </div>
        </Card>

        {/* Worker Fatigue — dari safetyData (static, tidak ada tabel Supabase) */}
        <Card className="xl:col-span-2">
          <CardHeader title="Worker Fatigue Monitor" subtitle="Real-time operator status" icon={Users} />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-graphite-700/50">
                  {['Worker', 'Role', 'Shift Hours', 'Fatigue Risk', 'Status'].map(h => (
                    <th key={h} className="text-left py-2 px-3 text-xs font-medium text-graphite-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {safetyData.workers.map((worker) => {
                  const fColor = fatigueColors[worker.fatigueRisk] || fatigueColors.Low;
                  return (
                    <tr key={worker.name} className="border-b border-graphite-800/30 hover:bg-graphite-800/20 transition-colors">
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-graphite-700/50 flex items-center justify-center text-[10px] font-bold text-graphite-300">
                            {worker.name.split(' ').map((n) => n[0]).join('')}
                          </div>
                          <span className="text-sm font-medium text-graphite-200">{worker.name}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-graphite-400 text-xs">{worker.role}</td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <Clock size={12} className="text-graphite-500" />
                          <span className={`text-sm font-mono ${worker.shiftHours > 9 ? 'text-danger' : 'text-graphite-300'}`}>
                            {worker.shiftHours}h
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${fColor.bg} ${fColor.text}`}>
                          {worker.fatigueRisk}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <StatusBadge status={worker.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Safety Alerts — static, tidak ada tabel Supabase */}
      <Card>
        <CardHeader title="Active Safety Alerts" subtitle="Requiring immediate attention" icon={AlertTriangle} />
        <div className="space-y-3">
          {[
            {
              title: 'Worker Fatigue — J. Wilson',
              description: 'Operator approaching maximum shift hour limit (10.5h). Mandatory rest break required.',
              severity: 'High',
              time: '5 min ago',
            },
            {
              title: 'Unsafe Zone — Sector C Blast Area',
              description: 'Controlled blast zone active. 300m exclusion radius enforced.',
              severity: 'Medium',
              time: '1 hour ago',
            },
          ].map((alert, i) => (
            <div
              key={i}
              className={`p-4 rounded-lg border ${alert.severity === 'High'
                ? 'bg-danger/5 border-danger/15'
                : 'bg-warning/5 border-warning/15'
              }`}
            >
              <div className="flex items-start gap-3">
                <AlertTriangle
                  size={18}
                  className={alert.severity === 'High' ? 'text-danger' : 'text-warning'}
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-graphite-200">{alert.title}</h4>
                    <span className="text-[10px] text-graphite-500">{alert.time}</span>
                  </div>
                  <p className="text-xs text-graphite-400 mt-1">{alert.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Incident History — dari useSafety hook (Supabase + fallback mock) */}
      <Card>
        <CardHeader title="Recent Incidents" subtitle="Last 30 days" icon={FileText} />

        {/* Loading state */}
        {loading && (
          <div style={{ padding: '12px 0' }}>
            <LoadingSkeleton rows={5} height={40} />
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div style={{ padding: '8px 0' }}>
            <ErrorState
              message={`Gagal memuat incidents dari Supabase: ${error}`}
              onRetry={refetch}
            />
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && incidents.length === 0 && (
          <div className="py-8 text-center">
            <p className="text-sm text-graphite-500">No incidents recorded in the last 30 days.</p>
          </div>
        )}

        {/* Incident table — render kalau ada data */}
        {!loading && !error && incidents.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-graphite-700/50">
                  {['ID', 'Date', 'Type', 'Severity', 'Location', 'Status'].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-medium text-graphite-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {incidents.map((inc) => (
                  <tr key={inc.id} className="border-b border-graphite-800/30 hover:bg-graphite-800/20 transition-colors">
                    <td className="py-3 px-4 font-mono text-xs text-industrial-400">{inc.id}</td>
                    <td className="py-3 px-4 text-graphite-400 text-xs">{inc.date}</td>
                    <td className="py-3 px-4 text-graphite-300">{inc.type}</td>
                    <td className="py-3 px-4">
                      <span className={`text-xs font-medium ${
                        inc.severity === 'High'   ? 'text-danger'  :
                        inc.severity === 'Medium' ? 'text-warning' : 'text-success'
                      }`}>
                        {inc.severity}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-graphite-400">{inc.location}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={
                        inc.status === 'Resolved' ? 'Active' :
                        inc.status === 'Closed'   ? 'Idle'   : 'Warning'
                      } />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
