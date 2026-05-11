import { useState } from "react";

const GRADE_BG = {
  A: "rgba(0, 217, 163, 0.08)",
  B: "rgba(74, 222, 128, 0.08)",
  C: "rgba(255, 184, 0, 0.08)",
  D: "rgba(255, 107, 53, 0.08)",
  F: "rgba(255, 59, 59, 0.1)",
};

const GRADE_LABELS = {
  A: "Excellent",
  B: "Good",
  C: "Fair — Monitor Closely",
  D: "Poor — Action Required",
  F: "Critical — Immediate Intervention",
};

export default function RiskReport({ data }) {
  const [expanded, setExpanded] = useState(false);
  if (!data) return null;

  const { grade, grade_color, primary_causes, action_items, days_to_critical,
          satellite_status, satellite_confidence, sensor_status, sensor_confidence, generated_at } = data;

  return (
    <div className="glass-card" style={{ padding: "20px", position: "relative", overflow: "hidden" }}>
      {/* Background grade glow */}
      <div style={{
        position: "absolute", top: 0, right: 0, width: "180px", height: "180px",
        background: `radial-gradient(circle, ${grade_color}18 0%, transparent 70%)`,
        pointerEvents: "none"
      }} />

      <div className="section-title">🏛️ Water Risk Report Card</div>

      {/* Grade + Sub-models row */}
      <div style={{ display: "flex", gap: "20px", alignItems: "center", marginBottom: "20px", flexWrap: "wrap" }}>
        {/* The Grade */}
        <div style={{
          width: "96px", height: "96px", borderRadius: "16px",
          background: GRADE_BG[grade],
          border: `3px solid ${grade_color}`,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          boxShadow: `0 0 30px ${grade_color}44`,
          flexShrink: 0
        }}>
          <div style={{ fontSize: "52px", fontWeight: 900, color: grade_color, lineHeight: 1 }}>{grade}</div>
          <div style={{ fontSize: "9px", color: grade_color, fontWeight: 600, letterSpacing: "0.5px", marginTop: "2px" }}>RISK GRADE</div>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: "15px", color: grade_color, marginBottom: "6px" }}>
            {GRADE_LABELS[grade]}
          </div>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {/* Satellite model badge */}
            <div style={{
              padding: "6px 12px", borderRadius: "8px",
              background: "rgba(0,212,255,0.06)", border: "1px solid rgba(0,212,255,0.2)",
              fontSize: "12px"
            }}>
              <span style={{ color: "var(--text-muted)" }}>🛰️ Satellite: </span>
              <span style={{
                color: satellite_status === "Severe" ? "var(--red)" : satellite_status === "Moderate" ? "var(--yellow)" : "var(--green)",
                fontWeight: 700
              }}>{satellite_status}</span>
              <span style={{ color: "var(--text-muted)", marginLeft: "4px" }}>{satellite_confidence}%</span>
            </div>
            {/* Sensor model badge */}
            <div style={{
              padding: "6px 12px", borderRadius: "8px",
              background: "rgba(0,212,255,0.06)", border: "1px solid rgba(0,212,255,0.2)",
              fontSize: "12px"
            }}>
              <span style={{ color: "var(--text-muted)" }}>🧪 Sensor: </span>
              <span style={{
                color: sensor_status === "Unsafe" ? "var(--red)" : "var(--green)",
                fontWeight: 700
              }}>{sensor_status}</span>
              <span style={{ color: "var(--text-muted)", marginLeft: "4px" }}>{sensor_confidence}%</span>
            </div>
          </div>
          <div style={{ marginTop: "6px", fontSize: "11px", color: "var(--text-muted)" }}>
            ⏱ Days to critical: <span style={{ color: days_to_critical.startsWith("CRITICAL") ? "var(--red)" : "var(--yellow)", fontWeight: 600 }}>{days_to_critical}</span>
          </div>
        </div>
      </div>

      {/* Primary Causes */}
      <div style={{ marginBottom: "16px" }}>
        <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "8px" }}>
          🔍 Identified Causes
        </div>
        {primary_causes.map((cause, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "flex-start", gap: "8px",
            padding: "6px 10px", marginBottom: "4px",
            background: "rgba(255,107,53,0.06)", borderRadius: "6px",
            border: "1px solid rgba(255,107,53,0.15)", fontSize: "12px"
          }}>
            <span style={{ color: "var(--orange)", marginTop: "1px" }}>▶</span>
            <span style={{ color: "var(--text-secondary)" }}>{cause}</span>
          </div>
        ))}
      </div>

      {/* Action Items */}
      <div>
        <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "8px" }}>
          📋 Prioritised Action Items
        </div>
        {action_items.map((item) => (
          <div key={item.priority} style={{
            display: "flex", gap: "12px", alignItems: "flex-start",
            padding: "10px 12px", marginBottom: "6px",
            background: "rgba(0,0,0,0.2)", borderRadius: "8px",
            border: "1px solid var(--border)"
          }}>
            <div style={{
              width: "22px", height: "22px", borderRadius: "50%", flexShrink: 0,
              background: item.priority === 1 ? "rgba(255,59,59,0.2)" : item.priority === 2 ? "rgba(255,184,0,0.2)" : "rgba(0,212,255,0.1)",
              border: `1px solid ${item.priority === 1 ? "var(--red)" : item.priority === 2 ? "var(--yellow)" : "var(--cyan)"}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "11px", fontWeight: 700,
              color: item.priority === 1 ? "var(--red)" : item.priority === 2 ? "var(--yellow)" : "var(--cyan)"
            }}>
              {item.priority}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "12px", color: "var(--text-primary)", lineHeight: 1.4, marginBottom: "4px" }}>{item.action}</div>
              <div style={{ display: "flex", gap: "8px", fontSize: "10px" }}>
                <span style={{ color: "var(--cyan)" }}>🏢 {item.dept}</span>
                <span style={{ color: "var(--text-muted)" }}>⏱ {item.deadline}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: "12px", fontSize: "10px", color: "var(--text-muted)", textAlign: "right" }}>
        Generated {generated_at} · AquaSentinel Intelligence Engine v2.0
      </div>
    </div>
  );
}
