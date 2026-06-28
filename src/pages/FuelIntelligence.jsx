import { useState } from 'react';
import { TrendingDown, AlertTriangle, Route, Search, Gauge, BarChart3, Droplets, Database } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import Card, { CardHeader } from '../components/common/Card';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import ErrorState from '../components/common/ErrorState';
import { fuelIntelligence } from '../data/mockData';
import { useFuel } from '../hooks/useFuel';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip);

function ScoreRing({ value, label, size = 80 }) {
  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (value / 100) * circumference;
  const color = value >= 80 ? '#22c55e' : value >= 60 ? '#f59e0b' : '#ef4444';

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#272c30" strokeWidth="5" />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="5"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-graphite-100">{value}</span>
        </div>
      </div>
      <span className="text-xs text-graphite-400 mt-2">{label}</span>
    </div>
  );
}

export default function FuelIntelligence() {
  const { fuelMetrics, loading, error, source, refetch } = useFuel();
  const [searchQuery, setSearchQuery] = useState('');

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        backgroundColor: 'rgba(20, 23, 25, 0.95)',
        borderColor: 'rgba(52, 58, 64, 0.5)',
        borderWidth: 1,
        titleColor: 'var(--ink-primary)',
        bodyColor: '#adb5bd',
        padding: 12,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(52, 58, 64, 0.2)', drawBorder: false },
        ticks: { color: 'var(--ink-secondary)', font: { size: 10 } },
        border: { display: false },
      },
      y: {
        grid: { color: 'rgba(52, 58, 64, 0.2)', drawBorder: false },
        ticks: { color: 'var(--ink-secondary)', font: { size: 10 } },
        border: { display: false },
      },
    },
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-xl lg:text-2xl font-bold text-gradient">Fuel Intelligence</h1>
          {/* Source badge — konsisten dengan SafetyCenter dan Equipment */}
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
        <p className="text-sm text-graphite-400 mt-1">Smart fuel analytics and anomaly detection</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Efficiency Score', value: fuelIntelligence.efficiencyScore + '%', icon: Gauge, color: 'text-industrial-400' },
          { label: 'Total Consumption', value: fuelIntelligence.totalConsumption.toLocaleString() + 'L', icon: Droplets, color: 'text-info' },
          { label: 'Anomalies Detected', value: fuelIntelligence.anomalies, icon: AlertTriangle, color: 'text-warning' },
          { label: 'Optimization Potential', value: fuelIntelligence.optimizationPotential + '%', icon: TrendingDown, color: 'text-success' },
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

      {/* Fuel Efficiency Score */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader title="Fuel Efficiency" subtitle="Overall score breakdown" icon={Gauge} />
          <div className="flex items-center justify-around py-4">
            <ScoreRing value={76} label="Overall" size={90} />
            <ScoreRing value={82} label="Route Opt." size={70} />
            <ScoreRing value={68} label="Engine Eff." size={70} />
          </div>
        </Card>

        {/* Fuel Trend Chart */}
        <Card className="lg:col-span-2">
          <CardHeader title="Fuel Usage Trend" subtitle="Actual vs Expected (liters)" icon={BarChart3} />
          <div className="h-52">
            <Line
              data={{
                labels: fuelIntelligence.trends.labels,
                datasets: [
                  {
                    label: 'Actual',
                    data: fuelIntelligence.trends.actual,
                    borderColor: 'var(--orange)',
                    backgroundColor: 'rgba(232,96,10,0.08)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 3,
                    pointBackgroundColor: 'var(--orange)',
                  },
                  {
                    label: 'Expected',
                    data: fuelIntelligence.trends.expected,
                    borderColor: '#64748b',
                    borderWidth: 1.5,
                    borderDash: [5, 5],
                    fill: false,
                    tension: 0.4,
                    pointRadius: 0,
                  },
                ],
              }}
              options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  legend: {
                    display: true,
                    position: 'top',
                    align: 'end',
                    labels: {
                      color: 'var(--ink-secondary)',
                      font: { size: 10 },
                      usePointStyle: true,
                      pointStyle: 'circle',
                      padding: 16,
                    },
                  },
                },
              }}
            />
          </div>
        </Card>
      </div>

      {/* Anomaly Detection */}
      <Card>
        {/* Header + search bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <CardHeader title="Fuel Anomaly Detection" subtitle="Suspicious fuel loss monitoring" icon={Search} />
          <div className="flex items-center gap-2 px-3 py-1.5 rounded border border-graphite-700/50 bg-graphite-800/20 min-w-[180px]">
            <Search size={12} className="text-graphite-500 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search location..."
              className="bg-transparent text-xs text-graphite-200 placeholder-graphite-500 outline-none w-full font-mono"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-graphite-500 hover:text-graphite-300 transition-colors text-xs leading-none"
              >
                ✕
              </button>
            )}
          </div>
        </div>

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
              message={`Gagal memuat data fuel anomaly: ${error}`}
              onRetry={refetch}
            />
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && fuelMetrics.length === 0 && (
          <div className="py-8 text-center">
            <p className="text-sm text-graphite-500">No fuel anomaly records found.</p>
          </div>
        )}

        {/* Anomaly table — dengan search filter */}
        {!loading && !error && fuelMetrics.length > 0 && (() => {
          const q = searchQuery.toLowerCase().trim();
          const filtered = q
            ? fuelMetrics.filter(item =>
                item.location?.toLowerCase().includes(q) ||
                item.status?.toLowerCase().includes(q) ||
                item.amount?.toLowerCase().includes(q)
              )
            : fuelMetrics;

          return filtered.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-graphite-500">No results for "{searchQuery}".</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-graphite-700/50">
                    {['Location', 'Amount', 'Time', 'Status'].map(h => (
                      <th key={h} className="text-left py-3 px-4 text-xs font-medium text-graphite-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item, i) => (
                    <tr key={item.id ?? i} className="border-b border-graphite-800/30 hover:bg-graphite-800/20 transition-colors">
                      <td className="py-3 px-4 font-medium text-graphite-200">{item.location}</td>
                      <td className="py-3 px-4 text-danger font-mono">{item.amount}</td>
                      <td className="py-3 px-4 text-graphite-400 font-mono text-xs">{item.time}</td>
                      <td className="py-3 px-4">
                        <span className={`text-xs font-medium ${item.status === 'Investigating' ? 'text-warning' : 'text-success'}`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })()}
      </Card>

      {/* Route Fuel Optimization */}
      <Card>
        <CardHeader title="Route Fuel Optimization" subtitle="Threshold-based route efficiency analysis" icon={Route} />
        <div className="space-y-3">
          {[
            { route: 'Route Alpha', current: '42L/trip', optimized: '37L/trip', saving: '12%', status: 'Recommended' },
            { route: 'Route Beta', current: '55L/trip', optimized: '49L/trip', saving: '11%', status: 'Under Review' },
            { route: 'Route Gamma', current: '48L/trip', optimized: '38L/trip', saving: '21%', status: 'Critical' },
          ].map((opt) => (
            <div key={opt.route} className="flex items-center justify-between p-4 rounded-lg bg-graphite-800/20 border border-graphite-700/20">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-graphite-700/50">
                  <Route size={16} className="text-industrial-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-graphite-200">{opt.route}</p>
                  <p className="text-xs text-graphite-400">{opt.current} → {opt.optimized}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-success">-{opt.saving}</span>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                  opt.status === 'Critical' ? 'bg-danger/15 text-danger' :
                  opt.status === 'Recommended' ? 'bg-success/15 text-success' : 'bg-warning/15 text-warning'
                }`}>
                  {opt.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
