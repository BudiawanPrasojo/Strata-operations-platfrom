import { Pickaxe, Users, Clock, Bomb, Target } from 'lucide-react';
import Card, { CardHeader } from '../components/common/Card';
import StatusBadge from '../components/common/StatusBadge';
import { operationsData } from '../data/mockData';

function ProgressBar({ value, color = 'industrial' }) {
  const colorClass = {
    industrial: 'bg-industrial-500',
    success: 'bg-success',
    warning: 'bg-warning',
    danger: 'bg-danger',
  }[color];

  return (
    <div className="w-full h-2 bg-graphite-800 rounded-full overflow-hidden">
      <div className={`h-full rounded-full ${colorClass} transition-all duration-500`} style={{ width: `${value}%` }} />
    </div>
  );
}

export default function Operations() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-gradient">Operations Center</h1>
        <p className="text-sm text-graphite-400 mt-1">Shift management, production tracking, and blasting schedules</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Workers On-Site', value: '115', icon: Users, color: 'text-info' },
          { label: 'Active Sectors', value: '3 of 4', icon: Target, color: 'text-success' },
          { label: 'Hours Remaining', value: '5.5h', icon: Clock, color: 'text-amber-400' },
          { label: 'Blasts Scheduled', value: '2', icon: Bomb, color: 'text-industrial-400' },
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

      {/* Active Shifts */}
      <Card>
        <CardHeader title="Active Shifts" subtitle="Current shift roster" icon={Users} />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-graphite-700/50">
                <th className="text-left py-3 px-4 text-xs font-medium text-graphite-500 uppercase tracking-wider">Shift</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-graphite-500 uppercase tracking-wider">Time</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-graphite-500 uppercase tracking-wider">Workers</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-graphite-500 uppercase tracking-wider">Supervisor</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-graphite-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {operationsData.shifts.map((shift) => (
                <tr key={shift.id} className="border-b border-graphite-800/30 hover:bg-graphite-800/20 transition-colors">
                  <td className="py-3 px-4 font-medium text-graphite-200">{shift.name}</td>
                  <td className="py-3 px-4 text-graphite-400 font-mono text-xs">{shift.time}</td>
                  <td className="py-3 px-4 text-graphite-300">{shift.workers}</td>
                  <td className="py-3 px-4 text-graphite-300">{shift.supervisor}</td>
                  <td className="py-3 px-4"><StatusBadge status={shift.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Sector Production */}
      <Card>
        <CardHeader title="Sector Production" subtitle="Daily extraction targets" icon={Pickaxe} />
        <div className="space-y-4">
          {operationsData.sectorProduction.map((sector) => (
            <div key={sector.sector} className="p-4 rounded-lg bg-graphite-800/20 border border-graphite-700/20">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-graphite-200">{sector.sector}</span>
                  <StatusBadge status={sector.status === 'On Track' ? 'Active' : sector.status === 'Behind' ? 'Warning' : 'Danger'} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-graphite-100">{sector.actual.toLocaleString()}</span>
                  <span className="text-xs text-graphite-500">/ {sector.target.toLocaleString()} tons</span>
                </div>
              </div>
              <ProgressBar
                value={sector.progress}
                color={sector.progress >= 80 ? 'success' : sector.progress >= 65 ? 'warning' : 'danger'}
              />
              <p className="text-[10px] text-graphite-500 mt-1.5 text-right">{sector.progress}% complete</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Blasting Schedule */}
      <Card>
        <CardHeader title="Blasting Schedule" subtitle="Upcoming controlled blasts" icon={Bomb} />
        <div className="space-y-3">
          {operationsData.blastingSchedule.map((blast) => (
            <div
              key={blast.id}
              className="flex items-center justify-between p-4 rounded-lg bg-graphite-800/20 border border-amber-400/10"
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-amber-400/10">
                  <Bomb size={18} className="text-amber-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-graphite-200">{blast.id} — {blast.sector}</p>
                  <p className="text-xs text-graphite-400 mt-0.5">{blast.charge} • Safety radius: {blast.radius}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-mono text-graphite-200">{blast.time}</p>
                <StatusBadge status={blast.status === 'Scheduled' ? 'Active' : 'Warning'} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
