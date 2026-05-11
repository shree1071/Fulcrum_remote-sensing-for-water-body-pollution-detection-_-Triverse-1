import { useState, useCallback } from "react";
import axios from "axios";

const API = "http://localhost:8000";

const SCENARIOS = [
  {
    id: "stp_reduction",
    label: "Reduce STP Discharge",
    icon: "🚰",
    description: "Simulate reducing the Koramangala STP raw sewage inflow into the lake",
    param: "ndwi",
    baseline: 0.05,
    target: 0.32,
    unit: "% reduction",
    dept: "BWSSB",
    sliderLabel: "Discharge reduction",
  },
  {
    id: "idol_ban",
    label: "Idol Immersion Policy",
    icon: "🪔",
    description: "Simulate banning chemical-painted idol immersions (festival pollution spike control)",
    param: "ndvi",
    baseline: 0.28,
    target: 0.08,
    unit: "% festivals regulated",
    dept: "BBMP / State Govt",
    sliderLabel: "Festivals regulated",
  },
  {
    id: "aerator",
    label: "Deploy Lake Aerators",
    icon: "💨",
    description: "Simulate adding aerators at 2 inlet points to increase dissolved oxygen & reduce algae",
    param: "ndvi",
    baseline: 0.28,
    target: 0.12,
    unit: "aerators deployed",
    maxVal: 5,
    dept: "KSPCB Field Team",
    sliderLabel: "Aerators (units)",
  },
];

function lerp(a, b, t) {
  return a + (b - a) * t;
}

export default function ScenarioSimulator() {
  const [sliders, setSliders] = useState({ stp_reduction: 0, idol_ban: 0, aerator: 0 });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const runSimulation = useCallback(async () => {
    setLoading(true);

    // Compute adjusted spectral parameters from slider positions
    const stpT = sliders.stp_reduction / 100;
    const idolT = sliders.idol_ban / 100;
    const aeroT = (sliders.aerator / 5);  // max 5 aerators

    // Base (worst case) → improved
    const ndwi = lerp(0.05, 0.32, Math.max(stpT, aeroT * 0.4));
    const ndvi = lerp(0.28, 0.06, Math.max(idolT, aeroT * 0.5));
    const b2 = lerp(0.03, 0.09, stpT);
    const b3 = lerp(0.07, 0.12, stpT);
    const b4 = lerp(0.08, 0.05, idolT * 0.6 + stpT * 0.4);
    const b8 = lerp(0.09, 0.04, stpT * 0.5 + aeroT * 0.5);

    try {
      const [before, after] = await Promise.all([
        axios.get(`${API}/predict`, { params: { ndwi: 0.05, ndvi: 0.28, b2: 0.03, b3: 0.07, b4: 0.08, b8: 0.09 } }),
        axios.get(`${API}/predict`, { params: { ndwi: ndwi.toFixed(3), ndvi: ndvi.toFixed(3), b2: b2.toFixed(3), b3: b3.toFixed(3), b4: b4.toFixed(3), b8: b8.toFixed(3) } }),
      ]);
      setResult({ before: before.data, after: after.data });
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, [sliders]);

  const statusColor = s => s === "Severe" ? "var(--red)" : s === "Moderate" ? "var(--yellow)" : "var(--green)";

  const totalActions = Object.values(sliders).reduce((a, b) => a + b, 0);

  return (
    <div className="glass-card" style={{ padding: "20px" }}>
      <div className="section-title">🧪 Policy "What If" Simulator</div>
      <p style={{ color: "var(--text-muted)", fontSize: "12px", marginBottom: "16px", lineHeight: 1.6 }}>
        Move the policy sliders to simulate remediation scenarios. The AI model will re-predict water quality based on your interventions.
      </p>

      {/* Sliders */}
      <div style={{ display: "flex", flexDirection: "column", gap: "18px", marginBottom: "20px" }}>
        {SCENARIOS.map(sc => (
          <div key={sc.id}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "12px" }}>
              <span style={{ color: "var(--text-secondary)", display: "flex", gap: "6px", alignItems: "center" }}>
                <span>{sc.icon}</span>
                <span style={{ fontWeight: 600 }}>{sc.label}</span>
                <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>— {sc.dept}</span>
              </span>
              <span style={{ color: "var(--cyan)", fontWeight: 700 }}>
                {sliders[sc.id]}{sc.id === "aerator" ? " units" : "%"}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={sc.id === "aerator" ? 5 : 100}
              step={sc.id === "aerator" ? 1 : 5}
              value={sliders[sc.id]}
              onChange={e => setSliders(s => ({ ...s, [sc.id]: Number(e.target.value) }))}
              style={{
                width: "100%", height: "6px", borderRadius: "3px",
                accentColor: "var(--cyan)", cursor: "pointer"
              }}
            />
            <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "4px" }}>{sc.description}</div>
          </div>
        ))}
      </div>

      {/* Simulate Button */}
      <button
        className="btn-primary"
        onClick={runSimulation}
        disabled={loading || totalActions === 0}
        style={{ width: "100%", padding: "12px", fontSize: "14px", opacity: totalActions === 0 ? 0.5 : 1 }}
      >
        {loading ? "⏳ Running simulation..." : totalActions === 0 ? "↑ Adjust sliders above" : "🔬 Run AI Simulation"}
      </button>

      {/* Before / After result */}
      {result && (
        <div style={{ marginTop: "16px" }}>
          <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "10px" }}>
            Simulation Results
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: "12px", alignItems: "center" }}>
            {/* Before */}
            <div style={{
              padding: "14px", borderRadius: "10px", textAlign: "center",
              background: `${statusColor(result.before.status)}10`,
              border: `1px solid ${statusColor(result.before.status)}44`
            }}>
              <div style={{ fontSize: "10px", color: "var(--text-muted)", marginBottom: "4px" }}>CURRENT STATUS</div>
              <div style={{ fontSize: "22px", fontWeight: 800, color: statusColor(result.before.status) }}>{result.before.status}</div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{result.before.confidence}% confidence</div>
            </div>

            {/* Arrow */}
            <div style={{ fontSize: "20px", color: "var(--text-muted)" }}>→</div>

            {/* After */}
            <div style={{
              padding: "14px", borderRadius: "10px", textAlign: "center",
              background: `${statusColor(result.after.status)}10`,
              border: `1px solid ${statusColor(result.after.status)}44`
            }}>
              <div style={{ fontSize: "10px", color: "var(--text-muted)", marginBottom: "4px" }}>WITH POLICY</div>
              <div style={{ fontSize: "22px", fontWeight: 800, color: statusColor(result.after.status) }}>{result.after.status}</div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{result.after.confidence}% confidence</div>
            </div>
          </div>

          {/* Improvement summary */}
          {result.before.status !== result.after.status && (
            <div style={{
              marginTop: "10px", padding: "10px 14px", borderRadius: "8px",
              background: "rgba(0,217,163,0.06)", border: "1px solid rgba(0,217,163,0.3)",
              fontSize: "12px", color: "var(--green)", textAlign: "center", fontWeight: 600
            }}>
              ✅ Policy simulation shows improvement from <strong>{result.before.status}</strong> → <strong>{result.after.status}</strong>
            </div>
          )}
          {result.before.status === result.after.status && (
            <div style={{
              marginTop: "10px", padding: "10px 14px", borderRadius: "8px",
              background: "rgba(255,184,0,0.06)", border: "1px solid rgba(255,184,0,0.3)",
              fontSize: "12px", color: "var(--yellow)", textAlign: "center"
            }}>
              ⚠️ More aggressive policy changes required to shift water quality class.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
