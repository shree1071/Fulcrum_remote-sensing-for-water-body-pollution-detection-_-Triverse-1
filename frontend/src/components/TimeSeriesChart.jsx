import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer, Area, AreaChart, Legend
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="custom-tooltip" style={{
      background: "var(--bg-card)", border: "1px solid var(--border)",
      borderRadius: "8px", padding: "12px 16px", fontSize: "12px"
    }}>
      <div style={{ color: "var(--cyan)", fontWeight: 600, marginBottom: "4px" }}>{label}</div>
      <div style={{ color: "var(--text-primary)" }}>
        Pollution Index: <strong style={{ color: "#38bdf8" }}>{payload[0].value.toFixed(3)}</strong>
      </div>
      <div style={{ color: "var(--text-secondary)" }}>
        NDWI: {d.ndwi}
      </div>
      {d.event && (
        <div style={{
          marginTop: "6px", padding: "4px 8px",
          background: "rgba(255,59,59,0.15)", borderRadius: "4px",
          color: "#ff8585", fontSize: "11px"
        }}>
          📍 {d.event}
        </div>
      )}
    </div>
  );
};

export default function TimeSeriesChart({ data, festivals, thresholds }) {
  // Build set of festival date→name for reference lines
  const festRefs = festivals
    .filter(f => f.impact !== "POSITIVE")
    .map(f => ({
      date:   f.date.substring(0, 7),
      name:   f.name,
      impact: f.impact,
      emoji:  f.emoji
    }));

  const impactColor = {
    CRITICAL: "#ff3b3b",
    HIGH:     "#ff6b35",
    MEDIUM:   "#ffb800",
  };

  return (
    <div className="glass-card" style={{ padding: "20px" }}>
      <div className="section-title">
        📈 Pollution Timeline 2017–2026
      </div>

      <ResponsiveContainer width="100%" height={340}>
        <AreaChart data={data} margin={{ top: 8, right: 16, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="pollutionGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#38bdf8" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.02} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />

          <XAxis
            dataKey="date"
            stroke="var(--text-muted)"
            fontSize={10}
            tick={{ fill: "var(--text-muted)" }}
            tickLine={false}
          />
          <YAxis
            yAxisId="left"
            stroke="var(--text-muted)"
            fontSize={10}
            tick={{ fill: "var(--text-muted)" }}
            tickLine={false}
            domain={[0, 0.40]}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke="#00d9a3"
            fontSize={10}
            tick={{ fill: "#00d9a3" }}
            tickLine={false}
            domain={[-0.2, 0.5]}
          />

          <Tooltip content={<CustomTooltip />} />

          {/* Severe threshold */}
          <ReferenceLine
            yAxisId="left"
            y={thresholds?.threshold_severe || 0.25}
            stroke="var(--red)"
            strokeDasharray="6 3"
            strokeWidth={1.5}
            label={{ value: "Severe", fill: "var(--red)", fontSize: 10, position: "insideTopRight" }}
          />

          {/* Moderate threshold */}
          <ReferenceLine
            yAxisId="left"
            y={thresholds?.threshold_moderate || 0.15}
            stroke="var(--yellow)"
            strokeDasharray="6 3"
            strokeWidth={1.5}
            label={{ value: "Moderate", fill: "var(--yellow)", fontSize: 10, position: "insideTopRight" }}
          />

          {/* Festival reference lines */}
          {festRefs.map(f => (
            <ReferenceLine
              yAxisId="left"
              key={f.date + f.name}
              x={f.date}
              stroke={impactColor[f.impact] || "#ffb800"}
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{
                value: f.emoji || "📍",
                fill: impactColor[f.impact],
                fontSize: 13,
                position: "top"
              }}
            />
          ))}

          <Area
            yAxisId="left"
            type="monotone"
            dataKey="pollution_index"
            stroke="#38bdf8"
            strokeWidth={2.5}
            fill="url(#pollutionGrad)"
            dot={(props) => {
              const { payload, cx, cy } = props;
              if (payload.event) {
                return (
                  <circle
                    key={props.key}
                    cx={cx} cy={cy} r={6}
                    fill="var(--red)"
                    stroke="white"
                    strokeWidth={2}
                  />
                );
              }
              return (
                <circle
                  key={props.key}
                  cx={cx} cy={cy} r={3}
                  fill="#38bdf8"
                  stroke="none"
                />
              );
            }}
            activeDot={{ r: 7, fill: "#38bdf8", stroke: "white", strokeWidth: 2 }}
          />
          
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="ndwi"
            stroke="#00d9a3"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            activeDot={{ r: 4, fill: "#00d9a3", stroke: "none" }}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div style={{
        display: "flex", gap: "16px", marginTop: "10px",
        flexWrap: "wrap", fontSize: "11px", color: "var(--text-muted)"
      }}>
        <span style={{ color: "#38bdf8", fontWeight: 600 }}>▬ Pollution Index (Left Axis)</span>
        <span style={{ color: "#00d9a3", fontWeight: 600 }}>- - Water Health (NDWI) (Right Axis)</span>
        <span>🔴 Red dots = pollution events</span>
        <span style={{ color: "var(--red)" }}>— — Severe threshold</span>
        <span style={{ color: "var(--yellow)" }}>— — Moderate threshold</span>
      </div>
    </div>
  );
}
