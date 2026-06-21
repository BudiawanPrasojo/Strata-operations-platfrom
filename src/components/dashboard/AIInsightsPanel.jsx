import { useState, useEffect } from 'react';
import { Brain, Wrench, AlertTriangle, TrendingUp, ChevronRight, RefreshCw } from 'lucide-react';

// Rule-based insights — derived from equipment and operational data
// Label jujur: "Operational Intelligence" bukan "Live AI"
const insights = [
  {
    id: 1,
    title: 'Fuel Anomaly Detected',
    severity: 'alert',
    tag: 'ANOMALY',
    description: 'Abnormal fuel consumption on Sector B haul trucks — 23% above baseline. Triggered by deviation threshold rule.',
    confidence: 94,
    basis: 'Based on 7-day rolling baseline. Threshold: >15% deviation.',
    recommendation: 'Reduce truck density on Haul Route B. Inspect DT-09 fuel system.',
    icon: AlertTriangle,
    color: 'var(--alert)',
  },
  {
    id: 2,
    title: 'Maintenance Window',
    severity: 'warn',
    tag: 'PREDICTIVE',
    description: 'EX-14 approaching scheduled service interval based on operational hours accumulation.',
    confidence: 87,
    basis: 'Hours-based trigger: 450h threshold reached at current rate in ~36h.',
    recommendation: 'Schedule maintenance during night shift to minimize disruption.',
    icon: Wrench,
    color: 'var(--warn)',
  },
  {
    id: 3,
    title: 'Route Bottleneck',
    severity: 'warn',
    tag: 'TRAFFIC',
    description: 'Route C junction congestion detected — 6 units queued, efficiency at 61%.',
    confidence: 91,
    basis: 'Queue length > 4 units for >15 min triggers congestion flag.',
    recommendation: 'Redirect DT-09 via Sector D alternate route.',
    icon: TrendingUp,
    color: 'var(--cyan)',
  },
];

const severityMap = {
  alert: { badge: 'badge-alert', bar: 'var(--alert)' },
  warn:  { badge: 'badge-warn',  bar: 'var(--warn)'  },
  ok:    { badge: 'badge-ok',    bar: 'var(--ok)'    },
};

function ConfBar({ pct, color }) {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(pct), 400); return () => clearTimeout(t); }, [pct]);
  return (
    <div style={{ height: '3px', background: 'var(--border-hard)', borderRadius: '1px', overflow: 'hidden' }}>
      <div style={{
        height: '100%',
        width: `${w}%`,
        background: color,
        borderRadius: '1px',
        transition: 'width 1s cubic-bezier(0.16,1,0.3,1)',
      }} />
    </div>
  );
}

export default function AIInsightsPanel() {
  return (
    <div>
      {/* Header */}
      <div className="section-label">
        <div className="section-label__bar" style={{ background: 'var(--cyan)' }} />
        <span className="section-label__text">Operational Intelligence Engine</span>
        <div className="section-label__line" />
        <span className="badge badge-ghost" style={{ fontSize: '0.58rem' }}>RULE-BASED</span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '12px',
      }}>
        {insights.map((item, idx) => {
          const Icon = item.icon;
          const sev = severityMap[item.severity] || severityMap.warn;

          return (
            <div
              key={item.id}
              className="panel animate-fade-up"
              style={{
                borderRadius: '4px',
                borderLeft: `2px solid ${item.color}`,
                overflow: 'hidden',
                animationDelay: `${idx * 80}ms`,
              }}
            >
              {/* Card header */}
              <div style={{
                padding: '12px 14px',
                borderBottom: '1px solid var(--border-soft)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'var(--bg-elevated)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Icon size={14} color={item.color} />
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.65rem',
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    color: item.color,
                  }}>
                    {item.tag}
                  </span>
                </div>
                <span className={`badge ${sev.badge}`} style={{ fontSize: '0.58rem' }}>
                  {item.severity.toUpperCase()}
                </span>
              </div>

              {/* Body */}
              <div style={{ padding: '14px' }}>
                <div style={{
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: 'var(--ink-primary)',
                  marginBottom: '6px',
                }}>
                  {item.title}
                </div>

                <p style={{
                  fontSize: '0.75rem',
                  color: 'var(--ink-secondary)',
                  lineHeight: 1.5,
                  marginBottom: '10px',
                }}>
                  {item.description}
                </p>

                {/* Confidence */}
                <div style={{ marginBottom: '10px' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '4px',
                  }}>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.58rem',
                      color: 'var(--ink-muted)',
                      letterSpacing: '0.08em',
                    }}>
                      CONFIDENCE
                    </span>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.65rem',
                      fontWeight: 600,
                      color: item.color,
                    }}>
                      {item.confidence}%
                    </span>
                  </div>
                  <ConfBar pct={item.confidence} color={item.color} />
                </div>

                {/* Basis — ini yang membedakan dari "AI palsu" */}
                <div style={{
                  padding: '8px 10px',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-hard)',
                  borderRadius: '4px',
                  marginBottom: '8px',
                }}>
                  <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.57rem',
                    color: 'var(--ink-muted)',
                    letterSpacing: '0.08em',
                    marginBottom: '3px',
                  }}>
                    DETECTION BASIS
                  </div>
                  <p style={{ fontSize: '0.72rem', color: 'var(--ink-muted)', lineHeight: 1.4 }}>
                    {item.basis}
                  </p>
                </div>

                {/* Recommendation */}
                <div style={{
                  padding: '8px 10px',
                  background: `${item.color}08`,
                  border: `1px solid ${item.color}20`,
                  borderRadius: '4px',
                }}>
                  <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.57rem',
                    color: `${item.color}99`,
                    letterSpacing: '0.08em',
                    marginBottom: '3px',
                  }}>
                    RECOMMENDED ACTION
                  </div>
                  <p style={{ fontSize: '0.72rem', color: 'var(--ink-secondary)', lineHeight: 1.4 }}>
                    {item.recommendation}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
