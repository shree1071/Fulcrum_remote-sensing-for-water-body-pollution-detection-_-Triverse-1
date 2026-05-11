export default function StatsCards({ summary }) {
  const cards = [
    {
      label: "Clean Water",
      value: summary.clean_percent + "%",
      color: "var(--green)",
      bg:    "rgba(0, 217, 163, 0.07)",
      border:"rgba(0, 217, 163, 0.25)",
      glow:  "var(--glow-green)",
      icon:  "💧",
      desc:  "NDWI > 0.3, NDVI < 0.05",
      trend: "▲ 2% from last month",
      trendColor: "var(--green)"
    },
    {
      label: "Moderate Pollution",
      value: summary.moderate_percent + "%",
      color: "var(--yellow)",
      bg:    "rgba(255, 184, 0, 0.07)",
      border:"rgba(255, 184, 0, 0.25)",
      glow:  "0 0 20px rgba(255,184,0,0.15)",
      icon:  "⚡",
      desc:  "NDWI 0.1–0.3, Turbidity moderate",
      trend: "▼ 1% from last month",
      trendColor: "var(--green)"
    },
    {
      label: "Severe Pollution",
      value: summary.severe_percent + "%",
      color: "var(--red)",
      bg:    "rgba(255, 59, 59, 0.07)",
      border:"rgba(255, 59, 59, 0.25)",
      glow:  "var(--glow-red)",
      icon:  "🔴",
      desc:  "NDWI < 0.1 or NDVI > 0.2",
      trend: "● Inlet zones critical",
      trendColor: "var(--red)"
    },
  ];

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: "16px",
      marginTop: "16px"
    }}>
      {cards.map((card, i) => (
        <div
          key={card.label}
          className="glass-card"
          style={{
            background: card.bg,
            border: `1px solid ${card.border}`,
            padding: "22px 24px",
            cursor: "default",
            animationDelay: `${i * 0.08}s`,
          }}
        >
          {/* Top row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
            <span style={{ fontSize: "22px" }}>{card.icon}</span>
            <span style={{
              fontSize: "11px", color: "var(--text-muted)",
              fontFamily: "monospace", padding: "2px 8px",
              background: "rgba(255,255,255,0.04)", borderRadius: "4px"
            }}>
              {card.desc}
            </span>
          </div>

          {/* Value */}
          <div style={{
            fontSize: "52px",
            fontWeight: 800,
            color: card.color,
            lineHeight: 1,
            textShadow: card.glow.replace("20px", "30px"),
            letterSpacing: "-2px"
          }}>
            {card.value}
          </div>

          {/* Label */}
          <div style={{ color: "var(--text-secondary)", fontSize: "13px", fontWeight: 500, marginTop: "8px" }}>
            {card.label}
          </div>

          {/* Progress bar */}
          <div style={{
            height: "3px", background: "rgba(255,255,255,0.05)",
            borderRadius: "2px", marginTop: "12px"
          }}>
            <div style={{
              height: "100%",
              width: card.value,
              background: `linear-gradient(90deg, ${card.color}88, ${card.color})`,
              borderRadius: "2px",
              transition: "width 1s ease",
              boxShadow: `0 0 8px ${card.color}60`
            }} />
          </div>

          {/* Trend */}
          <div style={{ color: card.trendColor, fontSize: "11px", marginTop: "8px" }}>
            {card.trend}
          </div>
        </div>
      ))}

      {/* Pixel count note */}
      <div style={{
        gridColumn: "1 / -1",
        textAlign: "right",
        color: "var(--text-muted)",
        fontSize: "11px",
        marginTop: "4px"
      }}>
        Based on {summary.total_pixels_analyzed} satellite pixels · Sentinel-2 L2A
      </div>
    </div>
  );
}
