import { useEffect, useRef } from "react";

export default function AlertBanner({ alert }) {
  const barRef = useRef(null);

  useEffect(() => {
    // Animate the progress bar
    if (barRef.current) {
      barRef.current.style.width = "0%";
      setTimeout(() => {
        if (barRef.current) barRef.current.style.width = "78%";
      }, 100);
    }
  }, []);

  const levelColors = {
    HIGH:     { bg: "rgba(255, 107, 53, 0.12)", border: "rgba(255, 107, 53, 0.45)", text: "#ff6b35", badge: "badge-high" },
    CRITICAL: { bg: "rgba(255, 59, 59, 0.12)",  border: "rgba(255, 59, 59, 0.45)",  text: "#ff3b3b", badge: "badge-critical" },
    MEDIUM:   { bg: "rgba(255, 184, 0, 0.10)",  border: "rgba(255, 184, 0, 0.40)",  text: "#ffb800", badge: "badge-medium" },
  };
  const c = levelColors[alert.level] || levelColors.HIGH;

  return (
    <div style={{
      background: c.bg,
      border: `1px solid ${c.border}`,
      borderRadius: "var(--radius-md)",
      padding: "16px 20px",
      marginBottom: "20px",
      position: "relative",
      overflow: "hidden"
    }}>
      {/* Left accent bar */}
      <div style={{
        position: "absolute", left: 0, top: 0, bottom: 0,
        width: "4px", background: c.text,
        boxShadow: `0 0 12px ${c.text}`
      }} />

      <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", paddingLeft: "8px" }}>
        {/* Pulsing icon */}
        <div style={{ position: "relative", flexShrink: 0, marginTop: "2px" }}>
          <span style={{ fontSize: "22px" }}>⚠️</span>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <span className={`badge ${c.badge}`}>{alert.level} ALERT</span>
            <span style={{ fontWeight: 700, color: c.text, fontSize: "15px" }}>
              Bellandur Lake — Active Pollution Event
            </span>
          </div>
          <p style={{ color: "var(--text-primary)", fontSize: "13px", marginTop: "6px" }}>
            {alert.message}
          </p>
          <p style={{ color: "var(--text-muted)", fontSize: "11px", marginTop: "4px", fontFamily: "monospace" }}>
            Threshold: {alert.threshold_crossed}
          </p>
        </div>

        {/* Timestamp */}
        <div style={{
          flexShrink: 0, textAlign: "right",
          color: "var(--text-muted)", fontSize: "11px"
        }}>
          <div style={{ color: c.text, fontWeight: 600, fontSize: "12px", animation: "blink 2s ease infinite" }}>
            ● ACTIVE
          </div>
          <div style={{ marginTop: "2px" }}>{alert.triggered_at?.slice(0, 10)}</div>
        </div>
      </div>
    </div>
  );
}
