import { BarChart3, TrendingUp, PieChart, Calendar, Download, Database } from 'lucide-react';
import { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, ArcElement, Filler, Tooltip, Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import Card, { CardHeader } from '../components/common/Card';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import ErrorState from '../components/common/ErrorState';
import { useAnalytics } from '../hooks/useAnalytics';
import { exportToCSV } from '../utils/exportCSV';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Filler, Tooltip, Legend);

const chartTooltip = {
  backgroundColor: 'rgba(20, 23, 25, 0.95)',
  borderColor: 'rgba(52, 58, 64, 0.5)',
  borderWidth: 1,
  titleColor: 'var(--ink-primary)',
  bodyColor: '#adb5bd',
  padding: 12,
  cornerRadius: 8,
};

const axisConfig = {
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
};

const DATE_RANGES = [
  { label: 'Last 7 Days',  days: 7  },
  { label: 'Last 30 Days', days: 30 },
  { label: 'Last 90 Days', days: 90 },
];

export default function Analytics() {
  const [selectedDays, setSelectedDays] = useState(7);

  const {
    productionTrend, fuelUsage, safetyIncidents,
    equipmentUtilization, kpiSummary,
    loading, error, source, refetch,
  } = useAnalytics(selectedDays);

  const handleRangeChange = (days) => {
    setSelectedDays(days);
  };

  const handleExport = () => {
    const rows = [
      ...productionTrend.labels.map((label, i) => ({
        Metric: 'Production Output (tons)', Period: label, Value: productionTrend.values[i],
      })),
      ...fuelUsage.labels.map((label, i) => ({
        Metric: 'Fuel Consumption (liters)', Period: label, Value: fuelUsage.values[i],
      })),
      ...safetyIncidents.labels.map((label, i) => ({
        Metric: 'Safety Incidents (count)', Period: label, Value: safetyIncidents.values[i],
      })),
      ...equipmentUtilization.labels.map((label, i) => ({
        Metric: 'Equipment Utilization (%)', Period: label, Value: equipmentUtilization.values[i],
      })),
    ];
    exportToCSV(rows, `smop-analytics-${selectedDays}d`);
  };

  const currentRange = DATE_RANGES.find(r => r.days === selectedDays);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl lg:text-2xl font-bold text-gradient">Analytics Center</h1>
            {source === 'supabase' ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Database size={11} color="#22c55e" />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: '#22c55e', fontWeight: 600, letterSpacing: '0.08em' }}>
                  SUPABASE
                </span>
              </div>
            ) : (
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.6rem',
                color: 'var(--color-text-secondary, #8A9BB0)',
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '3px', padding: '1px 6px',
              }}>
                OFFLINE
              </span>
            )}
          </div>
          <p className="text-sm text-graphite-400 mt-1">Comprehensive operational analytics and performance metrics</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Date Range Filter — functional */}
          <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-elevated)', border: '1px solid var(--border-hard)', borderRadius: '6px', padding: '3px' }}>
            {DATE_RANGES.map(range => (
              <button
                key={range.days}
                onClick={() => handleRangeChange(range.days)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '5px',
                  padding: '4px 10px', borderRadius: '4px',
                  border: 'none', cursor: 'pointer',
                  fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
                  fontWeight: selectedDays === range.days ? 600 : 400,
                  letterSpacing: '0.04em',
                  background: selectedDays === range.days ? 'var(--orange)' : 'transparent',
                  color: selectedDays === range.days ? '#fff' : 'var(--ink-secondary)',
                  transition: 'all 0.15s',
                }}
              >
                {range.days === 7 && <Calendar size={11} />}
                {range.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-industrial-500/15 border border-industrial-500/20 text-xs text-industrial-400 hover:bg-industrial-500/25 transition-colors"
          >
            <Download size={14} />
            Export
          </button>
        </div>
      </div>

      {/* Active range label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--ink-ghost)', letterSpacing: '0.06em' }}>
          SHOWING DATA FOR
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--orange)', fontWeight: 600, letterSpacing: '0.08em' }}>
          {currentRange?.label?.toUpperCase()}
        </span>
        {loading && (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--ink-ghost)', letterSpacing: '0.06em' }}>
            — LOADING…
          </span>
        )}
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Production', ...kpiSummary.totalProduction  },
          { label: 'Avg Efficiency',   ...kpiSummary.avgEfficiency    },
          { label: 'Fuel Consumed',    ...kpiSummary.fuelConsumed     },
          { label: 'Safety Incidents', ...kpiSummary.safetyIncidents  },
        ].map(m => (
          <Card key={m.label} hover>
            <p className="text-xs text-graphite-400 mb-1">{m.label}</p>
            {loading
              ? <div style={{ height: '28px', background: 'var(--bg-elevated)', borderRadius: '3px', marginBottom: '4px' }} />
              : <p className="text-xl font-bold text-graphite-100">{m.value}</p>
            }
            {m.change && (
              <span className={`text-xs font-medium ${m.positive ? 'text-success' : 'text-danger'}`}>
                {m.change}
              </span>
            )}
          </Card>
        ))}
      </div>

      {/* Production & Fuel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Production Output" subtitle={`Daily extraction trend — ${currentRange?.label}`} icon={TrendingUp} />
          {loading && <div style={{ padding: '12px 0' }}><LoadingSkeleton rows={5} height={40} /></div>}
          {!loading && error && <div style={{ padding: '8px 0' }}><ErrorState message={`Gagal memuat data: ${error}`} onRetry={refetch} /></div>}
          {!loading && !error && (
            <div className="h-64">
              <Line
                data={{
                  labels: productionTrend.labels,
                  datasets: [
                    {
                      label: 'Production', data: productionTrend.values,
                      borderColor: 'var(--orange)', backgroundColor: 'rgba(232,96,10,0.1)',
                      borderWidth: 2, fill: true, tension: 0.4,
                      pointRadius: selectedDays > 30 ? 2 : 4,
                      pointBackgroundColor: 'var(--orange)', pointBorderColor: '#141719', pointBorderWidth: 2,
                    },
                    {
                      label: 'Target',
                      data: Array(productionTrend.labels.length).fill(12000),
                      borderColor: '#64748b', borderWidth: 1, borderDash: [6, 4],
                      pointRadius: 0, fill: false,
                    },
                  ],
                }}
                options={{
                  responsive: true, maintainAspectRatio: false,
                  plugins: { tooltip: chartTooltip, legend: { display: true, position: 'top', align: 'end', labels: { color: 'var(--ink-secondary)', font: { size: 10 }, usePointStyle: true, padding: 16 } } },
                  scales: axisConfig,
                }}
              />
            </div>
          )}
        </Card>

        <Card>
          <CardHeader title="Fuel Consumption" subtitle={`Daily usage — ${currentRange?.label}`} icon={BarChart3} />
          {loading && <div style={{ padding: '12px 0' }}><LoadingSkeleton rows={5} height={40} /></div>}
          {!loading && error && <div style={{ padding: '8px 0' }}><ErrorState message={`Gagal memuat data: ${error}`} onRetry={refetch} /></div>}
          {!loading && !error && (
            <div className="h-64">
              <Bar
                data={{
                  labels: fuelUsage.labels,
                  datasets: [{
                    label: 'Consumption', data: fuelUsage.values,
                    backgroundColor: fuelUsage.values.map(v => v > 8000 ? 'rgba(245,158,11,0.7)' : 'rgba(100,116,139,0.5)'),
                    borderRadius: 4, borderSkipped: false,
                  }],
                }}
                options={{
                  responsive: true, maintainAspectRatio: false,
                  plugins: { tooltip: chartTooltip, legend: { display: false } },
                  scales: axisConfig,
                }}
              />
            </div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Safety Incidents */}
        <Card>
          <CardHeader title="Safety Incidents" subtitle={`Trend — ${currentRange?.label}`} icon={PieChart} />
          {loading && <div style={{ padding: '12px 0' }}><LoadingSkeleton rows={4} height={36} /></div>}
          {!loading && error && <div style={{ padding: '8px 0' }}><ErrorState message={`Gagal memuat data: ${error}`} onRetry={refetch} /></div>}
          {!loading && !error && (
            <div className="h-56">
              <Bar
                data={{
                  labels: safetyIncidents.labels,
                  datasets: [{
                    data: safetyIncidents.values,
                    backgroundColor: safetyIncidents.values.map(v =>
                      v === 0 ? 'rgba(34,197,94,0.5)' : v >= 2 ? 'rgba(239,68,68,0.6)' : 'rgba(245,158,11,0.6)'
                    ),
                    borderRadius: 4,
                  }],
                }}
                options={{
                  responsive: true, maintainAspectRatio: false,
                  plugins: { tooltip: chartTooltip, legend: { display: false } },
                  scales: { ...axisConfig, y: { ...axisConfig.y, ticks: { ...axisConfig.y.ticks, stepSize: 1 } } },
                }}
              />
            </div>
          )}
        </Card>

        {/* Equipment Utilization */}
        <Card className="lg:col-span-2">
          <CardHeader title="Equipment Utilization" subtitle="Fleet performance by category" icon={BarChart3} />
          {loading && <div style={{ padding: '12px 0' }}><LoadingSkeleton rows={4} height={36} /></div>}
          {!loading && error && <div style={{ padding: '8px 0' }}><ErrorState message={`Gagal memuat data: ${error}`} onRetry={refetch} /></div>}
          {!loading && !error && (
            <div className="h-56">
              <Bar
                data={{
                  labels: equipmentUtilization.labels,
                  datasets: [{
                    label: 'Utilization %', data: equipmentUtilization.values,
                    backgroundColor: equipmentUtilization.values.map(v =>
                      v >= 80 ? 'rgba(232,96,10,0.7)' : v >= 60 ? 'rgba(59,130,246,0.6)' : 'rgba(100,116,139,0.5)'
                    ),
                    borderRadius: 4, borderSkipped: false,
                  }],
                }}
                options={{
                  responsive: true, maintainAspectRatio: false, indexAxis: 'y',
                  plugins: { tooltip: chartTooltip, legend: { display: false } },
                  scales: { x: { ...axisConfig.x, max: 100 }, y: axisConfig.y },
                }}
              />
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
