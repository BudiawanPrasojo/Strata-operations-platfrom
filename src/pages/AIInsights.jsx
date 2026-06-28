import { BrainCircuit, Fuel, Wrench, AlertTriangle, BarChart3, ShieldCheck, Route, Sparkles, ArrowRight, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/common/Card';
import { aiInsights } from '../data/mockData';

const typeConfig = {
  fuel: { icon: Fuel, color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20' },
  maintenance: { icon: Wrench, color: 'text-industrial-400', bg: 'bg-industrial-500/10', border: 'border-industrial-500/20' },
  congestion: { icon: AlertTriangle, color: 'text-danger', bg: 'bg-danger/10', border: 'border-danger/20' },
  bottleneck: { icon: BarChart3, color: 'text-info', bg: 'bg-info/10', border: 'border-info/20' },
  safety: { icon: ShieldCheck, color: 'text-success', bg: 'bg-success/10', border: 'border-success/20' },
  optimization: { icon: Route, color: 'text-steel-400', bg: 'bg-steel-400/10', border: 'border-steel-400/20' },
};

// Mapping: insight type → route path
const insightRouteMap = {
  fuel:         '/fuel-intelligence',
  maintenance:  '/equipment',
  congestion:   '/safety-center',
  bottleneck:   '/',
  safety:       '/safety-center',
  optimization: '/',
};

const severityColor = {
  high: 'bg-danger',
  medium: 'bg-warning',
  low: 'bg-success',
};

export default function AIInsights() {
  const navigate = useNavigate();
  const highPriority = aiInsights.filter((i) => i.severity === 'high');
  const otherInsights = aiInsights.filter((i) => i.severity !== 'high');

  const handleTakeAction = (type) => {
    const route = insightRouteMap[type] || '/';
    navigate(route);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gradient">Operational Intelligence</h1>
          <p className="text-sm text-graphite-400 mt-1">Machine learning-powered operational intelligence</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-industrial-500/10 border border-industrial-500/20">
          <Sparkles size={14} className="text-industrial-400" />
          <span className="text-xs font-medium text-industrial-400">AI Engine Active</span>
        </div>
      </div>

      {/* AI Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Insights', value: aiInsights.length, icon: BrainCircuit, color: 'text-industrial-400' },
          { label: 'High Priority', value: highPriority.length, icon: AlertTriangle, color: 'text-danger' },
          { label: 'Actionable', value: aiInsights.filter((i) => i.actionable).length, icon: TrendingUp, color: 'text-success' },
          { label: 'Avg Confidence', value: `${Math.round(aiInsights.reduce((a, b) => a + b.confidence, 0) / aiInsights.length)}%`, icon: Sparkles, color: 'text-info' },
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

      {/* Priority Alerts */}
      {highPriority.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-danger mb-3 flex items-center gap-2">
            <AlertTriangle size={14} />
            High Priority Insights
          </h2>
          <div className="space-y-3">
            {highPriority.map((insight) => {
              const config = typeConfig[insight.type];
              const Icon = config.icon;

              return (
                <Card key={insight.id} glow className={`border ${config.border}`}>
                  <div className="flex items-start gap-4">
                    <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${config.bg} flex-shrink-0`}>
                      <Icon size={22} className={config.color} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-sm font-semibold text-graphite-100">{insight.title}</h3>
                          <p className="text-xs text-graphite-400 mt-1 leading-relaxed">{insight.description}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${severityColor[insight.severity]} text-white`}>
                            {insight.severity}
                          </span>
                          <span className="text-[10px] text-graphite-500">{insight.timestamp}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-graphite-700/30">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5">
                            <BrainCircuit size={12} className="text-graphite-500" />
                            <span className="text-[10px] text-graphite-400">Confidence: {insight.confidence}%</span>
                          </div>
                          <div className="w-16 h-1 bg-graphite-800 rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-industrial-500" style={{ width: `${insight.confidence}%` }} />
                          </div>
                        </div>
                        {insight.actionable && (
                          <button
                            onClick={() => handleTakeAction(insight.type)}
                            className="flex items-center gap-1.5 text-xs font-medium text-industrial-400 hover:text-industrial-300 transition-colors"
                          >
                            Take Action <ArrowRight size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Other Insights */}
      <div>
        <h2 className="text-sm font-semibold text-graphite-300 mb-3">All Insights</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {otherInsights.map((insight) => {
            const config = typeConfig[insight.type];
            const Icon = config.icon;

            return (
              <Card key={insight.id} hover>
                <div className="flex items-start gap-3">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${config.bg} flex-shrink-0`}>
                    <Icon size={18} className={config.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-semibold text-graphite-200">{insight.title}</h3>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${severityColor[insight.severity]} text-white flex-shrink-0`}>
                        {insight.severity}
                      </span>
                    </div>
                    <p className="text-xs text-graphite-400 mt-1 leading-relaxed line-clamp-2">{insight.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1.5">
                        <BrainCircuit size={10} className="text-graphite-500" />
                        <span className="text-[10px] text-graphite-400">{insight.confidence}% confidence</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-graphite-500">{insight.timestamp}</span>
                        {insight.actionable && (
                          <button
                            onClick={() => handleTakeAction(insight.type)}
                            className="flex items-center gap-1 text-[10px] font-medium text-industrial-400 hover:text-industrial-300 transition-colors"
                          >
                            Take Action <ArrowRight size={10} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
