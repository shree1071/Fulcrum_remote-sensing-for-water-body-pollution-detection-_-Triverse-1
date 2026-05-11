import { useState } from "react";

function CostBar({ label, value, max, color, icon }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div style={{ marginBottom: "14px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px", fontSize: "12px" }}>
        <span style={{ color: "var(--text-secondary)" }}>{icon} {label}</span>
        <span style={{ color, fontWeight: 700, fontFamily: "monospace" }}>₹{value} Cr</span>
      </div>
      <div style={{ height: "6px", background: "rgba(255,255,255,0.05)", borderRadius: "3px", overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${pct}%`,
          background: `linear-gradient(90deg, ${color}66, ${color})`,
          borderRadius: "3px",
          boxShadow: `0 0 6px ${color}55`
        }} />
      </div>
    </div>
  );
}

export default function EconomicImpact({ data }) {
  const [showSources, setShowSources] = useState(false);
  if (!data) return null;

  const { costs, total_annual_damage_crore, roi_multiple, headline, affected_population,
          severity_ratio, data_sources, aquasentinel_annual_cost_crore } = data;

  const maxCost = Math.max(...Object.values(costs));

  return (
    <div className="glass-card" style={{ padding: "20px", position: "relative", overflow: "hidden" }}>
      {/* BG glow */}
      <div style={{
        position: "absolute", top: -40, right: -40, width: "200px", height: "200px",
        background: "radial-gradient(circle, rgba(255,107,53,0.08) 0%, transparent 70%)",
        pointerEvents: "none"
      }} />

      <div className="section-title">💰 Economic Impact Dashboard</div>

      {/* Headline number */}
      <div style={{
        padding: "18px", borderRadius: "12px", marginBottom: "20px",
        background: "rgba(255,59,59,0.06)", border: "1px solid rgba(255,59,59,0.2)",
        textAlign: "center"
      }}>
        <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "6px" }}>
          Estimated Annual Economic Damage
        </div>
        <div style={{
          fontSize: "42px", fontWeight: 900, lineHeight: 1,
          background: "linear-gradient(135deg, #ff6b35, #ff3b3b)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
        }}>
          ₹{total_annual_damage_crore.toFixed(0)} Crore
        </div>
        <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "6px" }}>
          {affected_population.toLocaleString("en-IN")} residents affected · {severity_ratio}% lake surface severely polluted
        </div>
      </div>

      {/* Cost breakdown bars */}
      <div style={{ marginBottom: "16px" }}>
        <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "12px" }}>
          Cost Breakdown
        </div>
        <CostBar label="Healthcare (illness burden)" value={costs.healthcare_crore} max={maxCost} color="#ff3b3b" icon="🏥" />
        <CostBar label="Property value loss" value={costs.property_depreciation_crore} max={maxCost} color="#ff6b35" icon="🏠" />
        <CostBar label="Groundwater treatment" value={costs.groundwater_treatment_crore} max={maxCost} color="#ffb800" icon="💧" />
        <CostBar label="Tourism revenue lost" value={costs.tourism_lost_crore} max={maxCost} color="#a78bfa" icon="🚶" />
        <CostBar label="Lake restoration (BBMP DPR)" value={costs.restoration_project_crore} max={maxCost} color="#64748b" icon="🔧" />
      </div>

      {/* ROI comparison — the killer slide */}
      <div style={{
        padding: "14px 16px", borderRadius: "10px",
        background: "rgba(0,217,163,0.06)", border: "1px solid rgba(0,217,163,0.25)"
      }}>
        <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "8px" }}>
          💡 Return on Investment
        </div>
        <div style={{ display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "28px", fontWeight: 900, color: "var(--red)" }}>₹{total_annual_damage_crore.toFixed(0)} Cr</div>
            <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>Annual Damage</div>
          </div>
          <div style={{ fontSize: "24px", color: "var(--text-muted)" }}>vs</div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "28px", fontWeight: 900, color: "var(--green)" }}>₹{(aquasentinel_annual_cost_crore * 100).toFixed(0)}L</div>
            <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>AquaSentinel/yr</div>
          </div>
          <div style={{ flex: 1, textAlign: "right" }}>
            <div style={{ fontSize: "22px", fontWeight: 900, color: "var(--green)" }}>{roi_multiple.toLocaleString("en-IN")}x</div>
            <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>ROI multiple</div>
          </div>
        </div>
      </div>

      {/* Data sources toggle */}
      <button
        onClick={() => setShowSources(s => !s)}
        style={{
          marginTop: "12px", background: "none", border: "none", cursor: "pointer",
          fontSize: "10px", color: "var(--text-muted)", fontFamily: "Inter, sans-serif",
          display: "flex", alignItems: "center", gap: "4px", padding: 0
        }}
      >
        {showSources ? "▲" : "▼"} Data sources ({data_sources.length} references)
      </button>
      {showSources && (
        <div style={{ marginTop: "8px", padding: "10px", borderRadius: "6px", background: "rgba(0,0,0,0.2)", border: "1px solid var(--border)" }}>
          {data_sources.map((s, i) => (
            <div key={i} style={{ fontSize: "10px", color: "var(--text-muted)", marginBottom: "3px" }}>
              [{i + 1}] {s}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
