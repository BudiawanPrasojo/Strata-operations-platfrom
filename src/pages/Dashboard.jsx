import KPICards from '../components/dashboard/KPICards';
import LiveOperationalFeed from '../components/dashboard/LiveOperationalFeed';
import AnalyticsCharts from '../components/dashboard/AnalyticsCharts';
import EquipmentStatusPanel from '../components/dashboard/EquipmentStatusPanel';
import TacticalMiningMap from '../components/dashboard/TacticalMiningMap';
import AIInsightsPanel from '../components/dashboard/AIInsightsPanel';
import CommandCenterStatusBar from '../components/dashboard/CommandCenterStatusBar';
import RealtimeOperationalSummary from '../components/dashboard/RealtimeOperationalSummary';
import TacticalAlertCenter from '../components/dashboard/TacticalAlertCenter';
import OperationalDecisionImpactSimulator from '../components/dashboard/OperationalDecisionImpactSimulator';
import OperationalDominoEffectEngine from '../components/dashboard/OperationalDominoEffectEngine';
import KPIThresholdAlertPanel from '../components/dashboard/KPIThresholdAlertPanel';

function SectionLabel({ label, accent = 'var(--cyan)' }) {
  return (
    <div className="section-label">
      <div className="section-label__bar" style={{ background: accent }} />
      <span className="section-label__text">{label}</span>
      <div className="section-label__line" />
    </div>
  );
}

export default function Dashboard() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

      {/* ── Page header ── */}
      <div className="page-header">
        <div>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.6rem',
            fontWeight: 600,
            letterSpacing: '0.14em',
            color: 'var(--amber)',
            marginBottom: '4px',
          }}>
            SMART MINING OPERATIONS PLATFORM
          </div>
          <h1 style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '1.35rem',
            fontWeight: 700,
            color: 'var(--ink-primary)',
            letterSpacing: '-0.02em',
            lineHeight: 1,
            margin: 0,
          }}>
            Operations Dashboard
          </h1>
          <p style={{
            fontSize: '0.78rem',
            color: 'var(--ink-muted)',
            marginTop: '4px',
          }}>
            Kalimantan Site — Shift B — All systems nominal
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span className="badge badge-ok">
            <div className="live-dot" style={{ width: '5px', height: '5px' }} />
            LIVE
          </span>
          <span className="badge badge-amber">SHIFT B ACTIVE</span>
        </div>
      </div>

      {/* ── Command Center Status Bar ── */}
      <section>
        <CommandCenterStatusBar />
      </section>

      {/* ── KPI Cards ── */}
      <section>
        <SectionLabel label="KEY PERFORMANCE INDICATORS" accent="var(--amber)" />
        <KPICards />
      </section>

      {/* ── KPI Threshold Alerts ── */}
      <section>
        <SectionLabel label="KPI THRESHOLD ALERTS" accent="var(--alert)" />
        <KPIThresholdAlertPanel />
      </section>

      {/* ── Tactical Map ── */}
      <section>
        <SectionLabel label="TACTICAL OPERATIONS MAP" />
        <TacticalMiningMap />
      </section>

      {/* ── Live Ops Grid ── */}
      <section>
        <SectionLabel label="LIVE COMMAND OPERATIONS" />
        <div className="responsive-grid-sidebar">
          <LiveOperationalFeed />
          <TacticalAlertCenter />
        </div>
      </section>

      {/* ── Operational Monitoring ── */}
      <section>
        <SectionLabel label="OPERATIONAL MONITORING" accent="var(--amber)" />
        <div className="responsive-grid-2col">
          <RealtimeOperationalSummary />
          <EquipmentStatusPanel />
        </div>
      </section>

      {/* ── Operational Intelligence ── */}
      <section>
        <AIInsightsPanel />
      </section>

      {/* ── Decision Support ── */}
      <section>
        <SectionLabel label="DECISION SUPPORT" accent="var(--amber)" />
        <div className="responsive-grid-2col">
          <OperationalDecisionImpactSimulator />
          <OperationalDominoEffectEngine />
        </div>
      </section>

      {/* ── Analytics ── */}
      <section>
        <SectionLabel label="OPERATIONAL ANALYTICS" />
        <AnalyticsCharts />
      </section>
    </div>
  );
}
