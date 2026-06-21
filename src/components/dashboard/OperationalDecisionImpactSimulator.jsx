import React, { useState, useEffect } from "react";
import { Zap, TrendingDown, TrendingUp, AlertTriangle, CheckCircle, ChevronRight, Activity } from "lucide-react";

const scenarios = {
  "EX-14 Unexpected Breakdown": {
    production: "-8%",
    productionVal: -8,
    congestion: "+12%",
    congestionVal: 12,
    fuel: "+5%",
    fuelVal: 5,
    maintenance: "+17%",
    maintenanceVal: 17,
    recommendation: "Deploy backup excavator EX-21 within the next 2 operational hours.",
    // Phase 3.4 — Decision Confidence
    confidence: 91,
    confidenceLabel: "HIGH",
    confidenceColor: "#22c55e",
    confidenceBg: "rgba(34,197,94,0.10)",
    confidenceBorder: "rgba(34,197,94,0.22)",
    confidenceNote: "Based on 14 similar historical breakdowns. Recovery pattern well-established.",
    // Phase 3.5 — Operational Impact Score
    impactScore: 72,
    impactLabel: "SEVERE",
    impactColor: "#ef4444",
    impactBg: "rgba(239,68,68,0.10)",
    impactBorder: "rgba(239,68,68,0.22)",
    impactBreakdown: [
      { label: "Production Loss", score: 8, color: "#ef4444" },
      { label: "Route Disruption", score: 12, color: "#f59e0b" },
      { label: "Maintenance Surge", score: 17, color: "#ef4444" },
      { label: "Fuel Overhead", score: 5, color: "#f59e0b" },
    ],
    // Phase 3.6 — Estimated Operational Loss
    lossPerHour: 4200,
    lossTotal: 33600,
    lossDuration: "8h window",
    lossCategory: "Equipment Failure",
    lossCurrency: "USD",
  },

  "Heavy Rain Protocol Activated": {
    production: "-11%",
    productionVal: -11,
    congestion: "+7%",
    congestionVal: 7,
    fuel: "+6%",
    fuelVal: 6,
    maintenance: "+4%",
    maintenanceVal: 4,
    recommendation: "Reduce hauling speed and activate wet-weather safety procedures.",
    confidence: 84,
    confidenceLabel: "HIGH",
    confidenceColor: "#22c55e",
    confidenceBg: "rgba(34,197,94,0.10)",
    confidenceBorder: "rgba(34,197,94,0.22)",
    confidenceNote: "Weather data cross-referenced with 28 prior rain events. Predictions stable.",
    impactScore: 55,
    impactLabel: "MODERATE",
    impactColor: "#f59e0b",
    impactBg: "rgba(245,158,11,0.10)",
    impactBorder: "rgba(245,158,11,0.22)",
    impactBreakdown: [
      { label: "Production Loss", score: 11, color: "#ef4444" },
      { label: "Route Disruption", score: 7, color: "#f59e0b" },
      { label: "Maintenance Surge", score: 4, color: "#22c55e" },
      { label: "Fuel Overhead", score: 6, color: "#f59e0b" },
    ],
    lossPerHour: 2800,
    lossTotal: 19600,
    lossDuration: "7h window",
    lossCategory: "Weather Event",
    lossCurrency: "USD",
  },

  "Close Route B Temporarily": {
    production: "-6%",
    productionVal: -6,
    congestion: "+21%",
    congestionVal: 21,
    fuel: "+9%",
    fuelVal: 9,
    maintenance: "+3%",
    maintenanceVal: 3,
    recommendation: "Redirect equipment to Route C and monitor congestion levels.",
    confidence: 76,
    confidenceLabel: "MEDIUM",
    confidenceColor: "#f59e0b",
    confidenceBg: "rgba(245,158,11,0.10)",
    confidenceBorder: "rgba(245,158,11,0.22)",
    confidenceNote: "Route C capacity modelling shows 76% confidence. Monitor live congestion.",
    impactScore: 63,
    impactLabel: "ELEVATED",
    impactColor: "#f59e0b",
    impactBg: "rgba(245,158,11,0.10)",
    impactBorder: "rgba(245,158,11,0.22)",
    impactBreakdown: [
      { label: "Production Loss", score: 6, color: "#f59e0b" },
      { label: "Route Disruption", score: 21, color: "#ef4444" },
      { label: "Maintenance Surge", score: 3, color: "#22c55e" },
      { label: "Fuel Overhead", score: 9, color: "#f59e0b" },
    ],
    lossPerHour: 3100,
    lossTotal: 12400,
    lossDuration: "4h window",
    lossCategory: "Route Closure",
    lossCurrency: "USD",
  },

  "Workforce Shortage Event": {
    production: "-7%",
    productionVal: -7,
    congestion: "+4%",
    congestionVal: 4,
    fuel: "+2%",
    fuelVal: 2,
    maintenance: "+6%",
    maintenanceVal: 6,
    recommendation: "Reallocate workforce resources to critical operational zones.",
    confidence: 68,
    confidenceLabel: "MEDIUM",
    confidenceColor: "#f59e0b",
    confidenceBg: "rgba(245,158,11,0.10)",
    confidenceBorder: "rgba(245,158,11,0.22)",
    confidenceNote: "Workforce reallocation outcomes vary. Confidence limited by shift availability data.",
    impactScore: 41,
    impactLabel: "LOW",
    impactColor: "var(--cyan)",
    impactBg: "rgba(6,182,212,0.10)",
    impactBorder: "rgba(6,182,212,0.22)",
    impactBreakdown: [
      { label: "Production Loss", score: 7, color: "#f59e0b" },
      { label: "Route Disruption", score: 4, color: "#22c55e" },
      { label: "Maintenance Surge", score: 6, color: "#f59e0b" },
      { label: "Fuel Overhead", score: 2, color: "#22c55e" },
    ],
    lossPerHour: 1650,
    lossTotal: 9900,
    lossDuration: "6h window",
    lossCategory: "Staffing Constraint",
    lossCurrency: "USD",
  },

  "Activate Sector D Expansion": {
    production: "+18%",
    productionVal: 18,
    congestion: "+8%",
    congestionVal: 8,
    fuel: "+9%",
    fuelVal: 9,
    maintenance: "+2%",
    maintenanceVal: 2,
    recommendation: "Increase monitoring capacity to support expanded operations.",
    confidence: 88,
    confidenceLabel: "HIGH",
    confidenceColor: "#22c55e",
    confidenceBg: "rgba(34,197,94,0.10)",
    confidenceBorder: "rgba(34,197,94,0.22)",
    confidenceNote: "Sector D geology survey data supports expansion forecast with high reliability.",
    impactScore: 22,
    impactLabel: "POSITIVE",
    impactColor: "#22c55e",
    impactBg: "rgba(34,197,94,0.10)",
    impactBorder: "rgba(34,197,94,0.22)",
    impactBreakdown: [
      { label: "Production Gain", score: 18, color: "#22c55e" },
      { label: "Route Load", score: 8, color: "#f59e0b" },
      { label: "Maintenance Risk", score: 2, color: "#22c55e" },
      { label: "Fuel Overhead", score: 9, color: "#f59e0b" },
    ],
    lossPerHour: 0,
    lossTotal: 0,
    lossGain: 51200,
    lossDuration: "12h window",
    lossCategory: "Expansion Opportunity",
    lossCurrency: "USD",
  },
};

function MetricTile({ label, value, color }) {
  return (
    <div
      className="rounded-xl p-4"
      style={{
        background: "linear-gradient(135deg, rgba(22,27,34,0.95), rgba(13,15,17,0.97))",
        border: "1px solid rgba(52,58,64,0.5)",
      }}
    >
      <p className="text-xs tracking-widest uppercase" style={{ color: "var(--ink-secondary)", fontFamily: 'var(--font-mono)' }}>
        {label}
      </p>
      <p className="text-2xl font-extrabold mt-2 tabular-nums" style={{ color }}>
        {value}
      </p>
    </div>
  );
}

function ConfidenceBar({ value, color }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(value), 300);
    return () => clearTimeout(t);
  }, [value]);
  return (
    <div className="mt-3 rounded-full overflow-hidden" style={{ height: "6px", background: "rgba(255,255,255,0.05)" }}>
      <div
        className="h-full rounded-full"
        style={{
          width: `${width}%`,
          background: `linear-gradient(90deg, ${color}80, ${color})`,
          boxShadow: `0 0 8px ${color}60`,
          transition: "width 1.2s cubic-bezier(0.16,1,0.3,1)",
        }}
      />
    </div>
  );
}

function ImpactBar({ score, color, maxScore = 25 }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(Math.min(100, (score / maxScore) * 100)), 400);
    return () => clearTimeout(t);
  }, [score, maxScore]);
  return (
    <div className="flex-1 rounded-full overflow-hidden" style={{ height: "4px", background: "rgba(255,255,255,0.05)" }}>
      <div
        className="h-full rounded-full"
        style={{
          width: `${width}%`,
          background: `linear-gradient(90deg, ${color}70, ${color})`,
          transition: "width 1.0s cubic-bezier(0.16,1,0.3,1)",
        }}
      />
    </div>
  );
}

export default function OperationalDecisionImpactSimulator() {
  const [selectedScenario, setSelectedScenario] = useState("EX-14 Unexpected Breakdown");
  const scenario = scenarios[selectedScenario];
  const isPositiveScenario = selectedScenario === "Activate Sector D Expansion";

  const productionColor = scenario.productionVal >= 0 ? "#22c55e" : "#ef4444";
  const congestionColor = scenario.congestionVal <= 5 ? "#22c55e" : scenario.congestionVal <= 12 ? "#f59e0b" : "#ef4444";
  const fuelColor = scenario.fuelVal <= 4 ? "#22c55e" : "#f59e0b";
  const maintColor = scenario.maintenanceVal <= 5 ? "#22c55e" : scenario.maintenanceVal <= 10 ? "#f59e0b" : "#ef4444";

  const impactScoreColor =
    scenario.impactLabel === "POSITIVE" ? "#22c55e" :
    scenario.impactLabel === "LOW" ? "var(--cyan)" :
    scenario.impactLabel === "MODERATE" || scenario.impactLabel === "ELEVATED" ? "#f59e0b" : "#ef4444";

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "linear-gradient(135deg, rgba(18,21,23,0.98) 0%, rgba(13,15,17,0.99) 100%)",
        border: "1px solid rgba(6,182,212,0.18)",
        boxShadow: "0 0 48px rgba(6,182,212,0.05), 0 4px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.025)",
      }}
    >
      {/* Top accent bar */}
      <div style={{ height: "2px", background: "linear-gradient(90deg, var(--cyan), var(--orange) 50%, #22c55e)", opacity: 0.7 }} />

      {/* Header */}
      <div
        className="flex items-center justify-between px-6 py-4"
        style={{
          background: "linear-gradient(90deg, rgba(6,182,212,0.07) 0%, rgba(13,15,17,0) 60%)",
          borderBottom: "1px solid rgba(52,58,64,0.4)",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center w-10 h-10 rounded-xl flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, rgba(6,182,212,0.2), rgba(6,182,212,0.06))",
              border: "1px solid rgba(6,182,212,0.3)",
              boxShadow: "0 0 12px rgba(6,182,212,0.12)",
            }}
          >
            <Zap size={18} color="var(--cyan)" />
          </div>
          <div>
            <h2
              className="font-extrabold"
              style={{
                fontSize: "1.05rem",
                letterSpacing: "-0.02em",
                background: "linear-gradient(135deg, var(--ink-primary), #adb5bd)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Operational Decision Impact Simulator
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--ink-secondary)", fontFamily: 'var(--font-mono)' }}>
              EVALUATE SCENARIOS BEFORE IMPLEMENTATION · REAL-TIME AI ANALYSIS
            </p>
          </div>
        </div>
        <div
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg"
          style={{ background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.20)" }}
        >
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: "var(--cyan)", boxShadow: "0 0 6px rgba(6,182,212,0.8)", animation: "pulse 2s infinite" }}
          />
          <Activity size={11} color="var(--cyan)" />
          <span className="text-[10px] font-bold tracking-widest font-mono" style={{ color: "var(--cyan)" }}>
            SIM ACTIVE
          </span>
        </div>
      </div>

      <div className="p-6 space-y-6">

        {/* ── Scenario Selector ── */}
        <div
          className="rounded-xl p-5"
          style={{
            background: "linear-gradient(135deg, rgba(22,27,34,0.95), rgba(13,15,17,0.97))",
            border: "1px solid rgba(52,58,64,0.5)",
          }}
        >
          <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: "var(--ink-secondary)", fontFamily: 'var(--font-mono)' }}>
            Scenario Selection
          </p>
          <select
            className="w-full rounded-lg p-3 text-sm font-medium transition-all duration-200 outline-none"
            style={{
              background: "rgba(13,15,17,0.9)",
              border: "1px solid rgba(52,58,64,0.6)",
              color: "var(--ink-primary)",
              fontFamily: 'var(--font-mono)',
              letterSpacing: "0.02em",
            }}
            value={selectedScenario}
            onChange={(e) => setSelectedScenario(e.target.value)}
          >
            {Object.keys(scenarios).map((key) => (
              <option key={key} value={key}>{key}</option>
            ))}
          </select>
        </div>

        {/* ── Operational Metrics Grid ── */}
        <div>
          <p className="text-[10px] font-bold tracking-widest uppercase mb-3" style={{ color: "var(--ink-muted)", fontFamily: 'var(--font-mono)' }}>
            Projected Operational Impact
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <MetricTile label="Production Capacity" value={scenario.production} color={productionColor} />
            <MetricTile label="Route Congestion" value={scenario.congestion} color={congestionColor} />
            <MetricTile label="Fuel Consumption" value={scenario.fuel} color={fuelColor} />
            <MetricTile label="Maintenance Queue" value={scenario.maintenance} color={maintColor} />
          </div>
        </div>

        {/* ── Phase 3.4 / 3.5 / 3.6 — Three Column Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* ── Phase 3.4: Decision Confidence ── */}
          <div
            className="rounded-xl p-5"
            style={{
              background: "linear-gradient(135deg, rgba(22,27,34,0.95), rgba(13,15,17,0.97))",
              border: `1px solid ${scenario.confidenceBorder}`,
              boxShadow: `0 0 20px ${scenario.confidenceBg}`,
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "var(--ink-secondary)", fontFamily: 'var(--font-mono)' }}>
                Decision Confidence
              </p>
              <span
                className="text-[9px] font-bold tracking-widest px-2 py-0.5 rounded-md"
                style={{
                  color: scenario.confidenceColor,
                  background: scenario.confidenceBg,
                  border: `1px solid ${scenario.confidenceBorder}`,
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {scenario.confidenceLabel}
              </span>
            </div>

            <div className="flex items-end gap-2 mt-2">
              <span
                className="font-extrabold tabular-nums leading-none"
                style={{ fontSize: "2.4rem", letterSpacing: "-0.04em", color: scenario.confidenceColor }}
              >
                {scenario.confidence}
              </span>
              <span className="text-lg font-bold mb-1" style={{ color: scenario.confidenceColor, opacity: 0.7 }}>%</span>
            </div>

            <ConfidenceBar value={scenario.confidence} color={scenario.confidenceColor} />

            <p className="text-[11px] mt-3 leading-relaxed" style={{ color: "var(--ink-secondary)" }}>
              {scenario.confidenceNote}
            </p>
          </div>

          {/* ── Phase 3.5: Operational Impact Score ── */}
          <div
            className="rounded-xl p-5"
            style={{
              background: "linear-gradient(135deg, rgba(22,27,34,0.95), rgba(13,15,17,0.97))",
              border: `1px solid ${scenario.impactBorder}`,
              boxShadow: `0 0 20px ${scenario.impactBg}`,
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "var(--ink-secondary)", fontFamily: 'var(--font-mono)' }}>
                Impact Score
              </p>
              <span
                className="text-[9px] font-bold tracking-widest px-2 py-0.5 rounded-md"
                style={{
                  color: scenario.impactColor,
                  background: scenario.impactBg,
                  border: `1px solid ${scenario.impactBorder}`,
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {scenario.impactLabel}
              </span>
            </div>

            <div className="flex items-end gap-2 mt-2">
              <span
                className="font-extrabold tabular-nums leading-none"
                style={{ fontSize: "2.4rem", letterSpacing: "-0.04em", color: impactScoreColor }}
              >
                {scenario.impactScore}
              </span>
              <span className="text-base font-bold mb-1.5" style={{ color: "var(--ink-secondary)" }}>/100</span>
            </div>

            <div className="mt-4 space-y-2">
              {scenario.impactBreakdown.map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <span className="text-[10px] w-28 flex-shrink-0" style={{ color: "var(--ink-secondary)", fontFamily: 'var(--font-mono)' }}>
                    {item.label}
                  </span>
                  <ImpactBar score={item.score} color={item.color} />
                  <span className="text-[10px] font-bold w-6 text-right tabular-nums" style={{ color: item.color }}>
                    {item.score}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Phase 3.6: Estimated Operational Loss ── */}
          <div
            className="rounded-xl p-5"
            style={{
              background: "linear-gradient(135deg, rgba(22,27,34,0.95), rgba(13,15,17,0.97))",
              border: isPositiveScenario ? "1px solid rgba(34,197,94,0.22)" : "1px solid rgba(239,68,68,0.22)",
              boxShadow: isPositiveScenario ? "0 0 20px rgba(34,197,94,0.06)" : "0 0 20px rgba(239,68,68,0.06)",
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "var(--ink-secondary)", fontFamily: 'var(--font-mono)' }}>
                {isPositiveScenario ? "Est. Revenue Gain" : "Est. Operational Loss"}
              </p>
              <span
                className="text-[9px] font-bold tracking-widest px-2 py-0.5 rounded-md"
                style={{
                  color: isPositiveScenario ? "#22c55e" : "#ef4444",
                  background: isPositiveScenario ? "rgba(34,197,94,0.10)" : "rgba(239,68,68,0.10)",
                  border: isPositiveScenario ? "1px solid rgba(34,197,94,0.22)" : "1px solid rgba(239,68,68,0.22)",
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {scenario.lossCategory}
              </span>
            </div>

            {isPositiveScenario ? (
              <div>
                <div className="flex items-end gap-1 mt-2">
                  <span className="text-base font-bold mt-1" style={{ color: "#22c55e", opacity: 0.7 }}>+$</span>
                  <span
                    className="font-extrabold tabular-nums leading-none"
                    style={{ fontSize: "2.1rem", letterSpacing: "-0.04em", color: "#22c55e" }}
                  >
                    {scenario.lossGain.toLocaleString()}
                  </span>
                </div>
                <p className="text-[10px] mt-1 font-mono" style={{ color: "var(--ink-secondary)" }}>
                  Projected gain · {scenario.lossDuration}
                </p>
                <div className="mt-4 flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: "rgba(34,197,94,0.07)", border: "1px solid rgba(34,197,94,0.15)" }}>
                  <TrendingUp size={13} color="#22c55e" />
                  <span className="text-[11px]" style={{ color: "var(--ink-secondary)" }}>
                    Positive expansion scenario. No loss projected.
                  </span>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-end gap-1 mt-2">
                  <span className="text-base font-bold mt-1" style={{ color: "#ef4444", opacity: 0.7 }}>-$</span>
                  <span
                    className="font-extrabold tabular-nums leading-none"
                    style={{ fontSize: "2.1rem", letterSpacing: "-0.04em", color: "#ef4444" }}
                  >
                    {scenario.lossTotal.toLocaleString()}
                  </span>
                </div>
                <p className="text-[10px] mt-1 font-mono" style={{ color: "var(--ink-secondary)" }}>
                  Total est. loss · {scenario.lossDuration}
                </p>
                <div className="mt-3 flex items-center justify-between px-3 py-2 rounded-lg" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.14)" }}>
                  <div className="flex items-center gap-1.5">
                    <TrendingDown size={11} color="#ef4444" />
                    <span className="text-[10px] font-mono" style={{ color: "var(--ink-secondary)" }}>Per hour</span>
                  </div>
                  <span className="text-[11px] font-bold tabular-nums" style={{ color: "#ef4444" }}>
                    -${scenario.lossPerHour.toLocaleString()}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between px-3 py-2 rounded-lg" style={{ background: "rgba(52,58,64,0.25)", border: "1px solid rgba(52,58,64,0.4)" }}>
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle size={11} color="#f59e0b" />
                    <span className="text-[10px] font-mono" style={{ color: "var(--ink-secondary)" }}>Currency</span>
                  </div>
                  <span className="text-[11px] font-bold" style={{ color: "var(--ink-secondary)" }}>
                    {scenario.lossCurrency}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Recommended Action ── */}
        <div
          className="rounded-xl p-5"
          style={{
            background: "linear-gradient(135deg, rgba(22,27,34,0.95), rgba(13,15,17,0.97))",
            border: "1px solid rgba(6,182,212,0.18)",
          }}
        >
          <div className="flex items-start gap-3">
            <div
              className="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0 mt-0.5"
              style={{ background: "rgba(6,182,212,0.12)", border: "1px solid rgba(6,182,212,0.22)" }}
            >
              <CheckCircle size={15} color="var(--cyan)" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold tracking-widest uppercase mb-1.5" style={{ color: "var(--cyan)", fontFamily: 'var(--font-mono)' }}>
                AI Recommended Action
              </p>
              <p className="text-sm leading-relaxed" style={{ color: "var(--ink-primary)" }}>
                {scenario.recommendation}
              </p>
            </div>
            <ChevronRight size={16} color="var(--ink-muted)" className="flex-shrink-0 mt-0.5" />
          </div>
        </div>

      </div>
    </div>
  );
}
