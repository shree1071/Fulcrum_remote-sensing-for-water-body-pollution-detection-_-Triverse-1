import { useState, useEffect } from "react";
import axios from "axios";

const API = "http://localhost:8000";

const ALERT_ICONS = {
  CRITICAL: "🚨",
  HIGH:     "⚠️",
  MODERATE: "🟡",
  LOW:      "✅",
};

export default function LakeSelector({ selectedLake, onSelect }) {
  const [lakes, setLakes]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/lakes`)
      .then(r => { setLakes(r.data.lakes || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return null;

  return (
    <div style={{
      marginBottom: "20px",
      padding: "16px 20px",
      borderRadius: "14px",
      background: "rgba(0,0,0,0.25)",
      border: "1px solid var(--border)",
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: "10px",
        marginBottom: "14px",
        fontSize: "12px", fontWeight: 700,
        color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase"
      }}>
        <span>🗺️</span>
        <span>Select Lake</span>
        <span style={{
          marginLeft: "auto", fontSize: "10px", fontWeight: 500,
          color: "var(--cyan)", background: "rgba(0,212,255,0.08)",
          border: "1px solid rgba(0,212,255,0.2)", borderRadius: "10px", padding: "2px 8px"
        }}>
          {lakes.length} lakes monitored
        </span>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "10px"
      }}>
        {lakes.map(lake => {
          const isActive = selectedLake === lake.id;
          return (
            <button
              key={lake.id}
              onClick={() => onSelect(lake.id)}
              style={{
                cursor: "pointer",
                textAlign: "left",
                borderRadius: "12px",
                padding: "12px 14px",
                fontFamily: "Inter, sans-serif",
                transition: "all 0.25s ease",
                background: isActive
                  ? `linear-gradient(135deg, ${lake.grade_color}22, ${lake.grade_color}10)`
                  : "rgba(255,255,255,0.03)",
                border: isActive
                  ? `1.5px solid ${lake.grade_color}66`
                  : "1.5px solid rgba(255,255,255,0.07)",
                boxShadow: isActive
                  ? `0 0 16px ${lake.grade_color}22`
                  : "none",
                transform: isActive ? "translateY(-1px)" : "none",
              }}
            >
              {/* Top row: name + grade badge */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                <div style={{ fontSize: "13px", fontWeight: 700, color: isActive ? lake.grade_color : "var(--text-primary)", lineHeight: 1.3 }}>
                  {ALERT_ICONS[lake.alert_level] || "📍"} {lake.name}
                </div>
                <div style={{
                  minWidth: "28px", height: "28px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  borderRadius: "8px",
                  background: `${lake.grade_color}22`,
                  border: `1px solid ${lake.grade_color}44`,
                  fontSize: "14px", fontWeight: 900, color: lake.grade_color,
                  flexShrink: 0, marginLeft: "8px"
                }}>
                  {lake.grade}
                </div>
              </div>

              {/* City */}
              <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "8px" }}>
                📍 {lake.city}
              </div>

              {/* Mini pollution bar */}
              <div style={{ display: "flex", gap: "3px", height: "4px", borderRadius: "2px", overflow: "hidden" }}>
                <div style={{ flex: 100 - lake.severe_percent - (100 - lake.severe_percent) * 0.6, background: "#00d9a3", borderRadius: "2px" }} />
                <div style={{ flex: (100 - lake.severe_percent) * 0.6, background: "#ffb800", borderRadius: "2px" }} />
                <div style={{ flex: lake.severe_percent, background: "#ff3b3b", borderRadius: "2px" }} />
              </div>

              {/* Severe % label */}
              <div style={{ marginTop: "5px", fontSize: "10px", color: "#ff3b3b", fontWeight: 600 }}>
                {lake.severe_percent}% severe · {lake.area_km2} km²
              </div>

              {/* Alert badge */}
              <div style={{
                marginTop: "8px",
                display: "inline-flex", alignItems: "center", gap: "4px",
                fontSize: "10px", fontWeight: 700,
                padding: "2px 7px", borderRadius: "8px",
                background: lake.alert_level === "CRITICAL" ? "rgba(255,59,59,0.15)"
                  : lake.alert_level === "HIGH"     ? "rgba(255,107,53,0.15)"
                  : lake.alert_level === "MODERATE" ? "rgba(255,184,0,0.12)"
                  : "rgba(0,217,163,0.12)",
                color: lake.grade_color,
                border: `1px solid ${lake.grade_color}44`
              }}>
                {lake.alert_level}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
