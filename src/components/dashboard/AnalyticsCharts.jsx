
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { TrendingUp, BarChart3, PieChart, Zap } from 'lucide-react';
import Card, { CardHeader } from '../common/Card';
import { useAnalytics } from '../../hooks/useAnalytics';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Filler,
  Tooltip,
  Legend
);

const DONUT_COLORS = [
  'rgba(232,96,10,0.8)',
  'rgba(59, 130, 246, 0.8)',
  'rgba(245, 158, 11, 0.8)',
  'rgba(100, 116, 139, 0.8)',
  'rgba(34, 197, 94, 0.8)',
  'rgba(148, 163, 184, 0.6)',
];

const DONUT_COLORS_SOLID = [
  'var(--orange)', '#3b82f6', '#f59e0b', '#64748b', '#22c55e', '#94a3b8',
];

const chartDefaults = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: 'rgba(14, 16, 18, 0.97)',
      borderColor: 'rgba(232,96,10,0.25)',
      borderWidth: 1,
      titleColor: 'var(--ink-primary)',
      bodyColor: '#adb5bd',
      padding: 14,
      cornerRadius: 10,
      titleFont: { size: 13, weight: '700' },
      bodyFont: { size: 12 },
    },
  },
  scales: {
    x: {
      grid: { color: 'rgba(52, 58, 64, 0.15)', drawBorder: false },
      ticks: { color: 'var(--ink-secondary)', font: { size: 11 } },
      border: { display: false },
    },
    y: {
      grid: { color: 'rgba(52, 58, 64, 0.15)', drawBorder: false },
      ticks: { color: 'var(--ink-secondary)', font: { size: 11 } },
      border: { display: false },
    },
  },
};

export default function AnalyticsCharts() {
  // Semua data dari useAnalytics — Supabase dengan fallback independen per dataset
  const { productionTrend, fuelUsage, equipmentUtilization, efficiencyTrend } = useAnalytics();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Production Trend — data dari useAnalytics (Supabase / mock fallback) */}
      <Card>
        <CardHeader title="Production Trend" subtitle="Weekly output (tons)" icon={TrendingUp} />
        <div className="h-56">
          <Line
            data={{
              labels: productionTrend.labels,
              datasets: [
                {
                  data: productionTrend.values,
                  borderColor: 'var(--orange)',
                  backgroundColor: 'rgba(232,96,10,0.08)',
                  borderWidth: 2,
                  pointBackgroundColor: 'var(--orange)',
                  pointBorderColor: '#141719',
                  pointBorderWidth: 2,
                  pointRadius: 4,
                  pointHoverRadius: 6,
                  fill: true,
                  tension: 0.4,
                },
              ],
            }}
            options={chartDefaults}
          />
        </div>
      </Card>

      {/* Fuel Usage — data dari useAnalytics (Supabase / mock fallback) */}
      <Card>
        <CardHeader title="Fuel Usage" subtitle="Daily consumption (liters)" icon={BarChart3} />
        <div className="h-56">
          <Bar
            data={{
              labels: fuelUsage.labels,
              datasets: [
                {
                  data: fuelUsage.values,
                  backgroundColor: fuelUsage.values.map((v) =>
                    v > 8000 ? 'rgba(245, 158, 11, 0.7)' : 'rgba(100, 116, 139, 0.5)'
                  ),
                  borderColor: fuelUsage.values.map((v) =>
                    v > 8000 ? 'rgba(245, 158, 11, 0.9)' : 'rgba(100, 116, 139, 0.7)'
                  ),
                  borderWidth: 1,
                  borderRadius: 4,
                },
              ],
            }}
            options={chartDefaults}
          />
        </div>
      </Card>

      {/* Equipment Utilization — data dari useAnalytics (Supabase / mock fallback) */}
      <Card>
        <CardHeader title="Equipment Utilization" subtitle="By category (%)" icon={PieChart} />
        <div className="h-56 flex items-center justify-center">
          <div className="w-48 h-48">
            <Doughnut
              data={{
                labels: equipmentUtilization.labels,
                datasets: [
                  {
                    data: equipmentUtilization.values,
                    backgroundColor: DONUT_COLORS,
                    borderColor: '#141719',
                    borderWidth: 2,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                cutout: '65%',
                plugins: {
                  legend: { display: false },
                  tooltip: chartDefaults.plugins.tooltip,
                },
              }}
            />
          </div>
          <div className="ml-4 space-y-2">
            {equipmentUtilization.labels.map((label, i) => (
              <div key={label} className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-sm"
                  style={{ backgroundColor: DONUT_COLORS_SOLID[i % DONUT_COLORS_SOLID.length] }}
                />
                <span className="text-[10px] text-graphite-400">{label}</span>
                <span className="text-[10px] font-medium text-graphite-300 ml-auto">
                  {equipmentUtilization.values[i]}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Efficiency Analytics — data dari useAnalytics (avg fuel_efficiency / Supabase + fallback) */}
      <Card>
        <CardHeader title="Efficiency Analytics" subtitle="Daily fuel efficiency trend (%)" icon={Zap} />
        <div className="h-56">
          <Line
            data={{
              labels: efficiencyTrend.labels,
              datasets: [
                {
                  data: efficiencyTrend.values,
                  borderColor: '#22c55e',
                  backgroundColor: 'rgba(34, 197, 94, 0.08)',
                  borderWidth: 2,
                  pointBackgroundColor: '#22c55e',
                  pointBorderColor: '#141719',
                  pointBorderWidth: 2,
                  pointRadius: 4,
                  fill: true,
                  tension: 0.3,
                },
              ],
            }}
            options={chartDefaults}
          />
        </div>
      </Card>
    </div>
  );
}
