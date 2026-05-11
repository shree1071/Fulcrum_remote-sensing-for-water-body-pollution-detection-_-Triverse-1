import { useState } from "react";

const impactConfig = {
  CRITICAL: { color: "#ff3b3b", badge: "badge-critical", bg: "rgba(255,59,59,0.07)" },
  HIGH:     { color: "#ff6b35", badge: "badge-high",     bg: "rgba(255,107,53,0.07)" },
  MEDIUM:   { color: "#ffb800", badge: "badge-medium",   bg: "rgba(255,184,0,0.06)" },
  POSITIVE: { color: "#00d9a3", badge: "badge-positive", bg: "rgba(0,217,163,0.06)" },
};

export default function FestivalMarkers({ festivals }) {
  const [expanded, setExpanded] = useState(null);

  return (
    <div className="glass-card" style={{ padding: "20px" }}>
      <div className="section-title">
        🎆 Festival Pollution Events
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "400px", overflowY: "auto" }}>
        {festivals.map((f, i) => {
          const cfg = impactConfig[f.impact] || impactConfig.MEDIUM;
          const isOpen = expanded === i;

          return (
            <div
              key={i}
              style={{
                background: cfg.bg,
                border: `1px solid ${cfg.color}33`,
                borderRadius: "10px",
                padding: "12px 14px",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onClick={() => setExpanded(isOpen ? null : i)}
            >
              {/* Header row */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "18px" }}>{f.emoji}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 600, fontSize: "13px" }}>{f.name}</span>
                    <span className={`badge ${cfg.badge}`}>{f.impact}</span>
                    {f.impact !== "POSITIVE" && (
                      <span style={{
                        color: cfg.color, fontSize: "12px", fontWeight: 600,
                        fontFamily: "monospace"
                      }}>
                        +{f.pollution_increase}
                      </span>
                    )}
                    {f.impact === "POSITIVE" && (
                      <span style={{ color: "#00d9a3", fontSize: "12px", fontWeight: 600 }}>
                        {f.pollution_increase} 🌿
                      </span>
                    )}
                  </div>
                  <div style={{ color: "var(--text-muted)", fontSize: "11px", marginTop: "2px", fontFamily: "monospace" }}>
                    {f.date}
                  </div>
                </div>
                <span style={{ color: "var(--text-muted)", fontSize: "12px", flexShrink: 0 }}>
                  {isOpen ? "▲" : "▼"}
                </span>
              </div>

              {/* Expanded detail */}
              {isOpen && (
                <div style={{ marginTop: "10px", paddingTop: "10px", borderTop: `1px solid ${cfg.color}22` }}>
                  <p style={{ color: "var(--text-secondary)", fontSize: "12px", lineHeight: 1.7 }}>
                    {f.description}
                  </p>
                  {f.pollutants?.length > 0 && (
                    <div style={{ marginTop: "8px" }}>
                      <span style={{ color: "var(--text-muted)", fontSize: "11px" }}>Pollutants: </span>
                      <span style={{ color: "var(--text-secondary)", fontSize: "11px" }}>
                        {f.pollutants.join(" · ")}
                      </span>
                    </div>
                  )}
                  <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                      NDWI Δ:{" "}
                      <span style={{ color: f.ndwi_drop > 0 ? "var(--green)" : "var(--red)", fontFamily: "monospace" }}>
                        {f.ndwi_drop > 0 ? "+" : ""}{f.ndwi_drop}
                      </span>
                    </div>
                  </div>
                  {f.media && (
                    <a
                      href={f.media}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      style={{
                        display: "inline-block", marginTop: "8px",
                        color: "var(--cyan)", fontSize: "11px",
                        textDecoration: "none"
                      }}
                    >
                      📰 Read coverage →
                    </a>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p style={{ color: "var(--text-muted)", fontSize: "10px", marginTop: "10px", textAlign: "center" }}>
        Click any event to expand · NDWI Δ shows index change from baseline
      </p>
    </div>
  );
}
