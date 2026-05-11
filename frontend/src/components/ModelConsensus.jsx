import { useEffect, useRef } from "react";

function ConfidenceBar({ label, value, color, subLabel }) {
  return (
    <div style={{ marginBottom: "10px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px", fontSize: "12px" }}>
        <span style={{ color: "var(--text-secondary)" }}>{label}</span>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {subLabel && <span style={{ color, fontSize: "11px", fontWeight: 600 }}>{subLabel}</span>}
          <span style={{ color, fontWeight: 700 }}>{value}%</span>
        </div>
      </div>
      <div style={{ height: "8px", background: "rgba(255,255,255,0.05)", borderRadius: "4px", overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${value}%`,
          background: `linear-gradient(90deg, ${color}88, ${color})`,
          borderRadius: "4px",
          transition: "width 1.2s cubic-bezier(0.4, 0, 0.2, 1)",
          boxShadow: `0 0 8px ${color}66`
        }} />
      </div>
    </div>
  );
}

export default function ModelConsensus({ data }) {
  if (!data) return null;

  const { zones, agreement_percent, overall_trust, recommendation, satellite_model, sensor_model: sensorModelStr } = data;

  const trustColor = overall_trust === "HIGH"
    ? "var(--green)"
    : overall_trust === "MEDIUM"
    ? "var(--yellow)"
    : "var(--red)";

  const trustIcon = overall_trust === "HIGH" ? "✅" : overall_trust === "MEDIUM" ? "⚠️" : "🚨";

  return (
    <div className="glass-card" style={{ padding: "20px" }}>
      <div className="section-title">🤖 Dual-Model Fusion Consensus</div>
      <p style={{ color: "var(--text-muted)", fontSize: "12px", marginBottom: "16px", lineHeight: 1.6 }}>
        Runs both AI models independently on the same data. High agreement = high reliability.
      </p>

      {/* Big agreement gauge */}
      <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "20px", padding: "16px", background: "rgba(0,0,0,0.2)", borderRadius: "12px", border: `1px solid ${trustColor}33` }}>
        <div style={{
          width: "80px", height: "80px", borderRadius: "50%", flexShrink: 0,
          background: `conic-gradient(${trustColor} ${agreement_percent * 3.6}deg, rgba(255,255,255,0.05) 0deg)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: `0 0 20px ${trustColor}44`,
          position: "relative"
        }}>
          <div style={{
            width: "62px", height: "62px", borderRadius: "50%",
            background: "var(--bg-card)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexDirection: "column"
          }}>
            <span style={{ fontSize: "18px", fontWeight: 900, color: trustColor }}>{agreement_percent}%</span>
            <span style={{ fontSize: "8px", color: "var(--text-muted)", letterSpacing: "0.5px" }}>AGREE</span>
          </div>
        </div>
        <div>
          <div style={{ fontSize: "14px", fontWeight: 700, color: trustColor, marginBottom: "4px" }}>
            {trustIcon} Trust Level: {overall_trust}
          </div>
          <div style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.5 }}>{recommendation}</div>
        </div>
      </div>

      {/* Per-zone breakdown */}
      <div style={{ marginBottom: "16px" }}>
        <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "10px" }}>
          Zone-by-Zone Comparison
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
          {zones.map(z => {
            const agrees = z.agreement;
            const satColor = z.satellite.verdict === "Severe" ? "var(--red)" : z.satellite.verdict === "Moderate" ? "var(--yellow)" : "var(--green)";
            const senColor = z.sensor.verdict === "Unsafe" ? "var(--red)" : z.sensor.verdict === "Safe" ? "var(--green)" : "var(--text-muted)";
            return (
              <div key={z.zone} style={{
                padding: "10px 12px", borderRadius: "8px",
                background: agrees ? "rgba(0,217,163,0.04)" : "rgba(255,59,59,0.06)",
                border: `1px solid ${agrees ? "rgba(0,217,163,0.2)" : "rgba(255,59,59,0.25)"}`,
              }}>
                <div style={{ fontSize: "11px", fontWeight: 600, marginBottom: "6px", display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-primary)" }}>{z.zone}</span>
                  <span style={{ fontSize: "12px" }}>{agrees ? "✅" : "⚠️"}</span>
                </div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", display: "flex", flexDirection: "column", gap: "2px" }}>
                  <span>🛰️ <span style={{ color: satColor, fontWeight: 600 }}>{z.satellite.verdict}</span> <span style={{ opacity: 0.6 }}>({z.satellite.confidence}%)</span></span>
                  <span>🧪 <span style={{ color: senColor, fontWeight: 600 }}>{z.sensor.verdict}</span> {z.sensor.confidence > 0 && <span style={{ opacity: 0.6 }}>({z.sensor.confidence}%)</span>}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Model info */}
      <ConfidenceBar label="🛰️ Satellite Model Accuracy" value={92.85} color="var(--cyan)" subLabel="RF" />
      <ConfidenceBar label="🧪 Sensor Model Accuracy" value={97.14} color="var(--green)" subLabel="RF" />

      <div style={{ marginTop: "12px", padding: "8px 12px", borderRadius: "6px", background: "rgba(0,212,255,0.04)", border: "1px solid var(--border)", fontSize: "10px", color: "var(--text-muted)", lineHeight: 1.6 }}>
        <strong style={{ color: "var(--cyan)" }}>Fusion Method:</strong> {data.fusion_method}
      </div>
    </div>
  );
}
