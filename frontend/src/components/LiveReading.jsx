import { useState, useEffect, useRef } from "react";
import axios from "axios";

const API = "http://localhost:8000";

// Animated gauge bar
function SpectralBar({ label, value, min, max, goodDir, threshold, unit = "", color }) {
  const pct = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  const isGood = goodDir === "high" ? value >= threshold : value <= threshold;
  const barColor = isGood ? "#00d9a3" : value > threshold * 1.5 || value < threshold * 0.5 ? "#ff3b3b" : "#ffb800";

  return (
    <div style={{ marginBottom: "10px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "4px" }}>
        <span style={{ color: "var(--text-muted)" }}>{label}</span>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <span style={{ color: "var(--text-muted)", fontSize: "10px" }}>
            safe: {goodDir === "high" ? "≥" : "≤"}{threshold}{unit}
          </span>
          <span style={{ color: barColor, fontWeight: 700, fontFamily: "monospace" }}>
            {value}{unit}
          </span>
        </div>
      </div>
      <div style={{ height: "6px", background: "rgba(255,255,255,0.06)", borderRadius: "3px", overflow: "hidden" }}>
        <div style={{
          height: "100%",
          width: `${pct}%`,
          background: `linear-gradient(90deg, ${barColor}66, ${barColor})`,
          borderRadius: "3px",
          transition: "width 1.4s cubic-bezier(0.4,0,0.2,1)",
          boxShadow: `0 0 6px ${barColor}55`,
        }} />
      </div>
    </div>
  );
}

// Countdown ring
function CountdownRing({ hoursLeft, totalHours = 120 }) {
  const pct = Math.max(0, Math.min(1, hoursLeft / totalHours));
  const r = 22;
  const circ = 2 * Math.PI * r;
  const dash = circ * pct;
  const color = pct > 0.5 ? "#00d9a3" : pct > 0.2 ? "#ffb800" : "#ff3b3b";

  return (
    <svg width="56" height="56" style={{ transform: "rotate(-90deg)" }}>
      <circle cx="28" cy="28" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
      <circle
        cx="28" cy="28" r={r} fill="none"
        stroke={color} strokeWidth="4"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        style={{ transition: "stroke-dasharray 1s ease" }}
      />
    </svg>
  );
}

export default function LiveReading() {
  const [data, setData]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [pulse, setPulse]       = useState(false);
  const intervalRef             = useRef(null);
  const countdownRef            = useRef(null);

  const fetchReading = async () => {
    try {
      const res = await axios.get(`${API}/live-reading`);
      setData(res.data);
      setError(false);
      setPulse(true);
      setTimeout(() => setPulse(false), 800);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
      setCountdown(30);
    }
  };

  useEffect(() => {
    fetchReading();

    // Auto-refresh every 30 seconds
    intervalRef.current = setInterval(fetchReading, 30000);

    // Countdown ticker
    countdownRef.current = setInterval(() => {
      setCountdown(c => (c <= 1 ? 30 : c - 1));
    }, 1000);

    return () => {
      clearInterval(intervalRef.current);
      clearInterval(countdownRef.current);
    };
  }, []);

  const statusColor = s =>
    s === "Severe" ? "#ff3b3b" : s === "Moderate" ? "#ffb800" : "#00d9a3";

  if (loading) {
    return (
      <div className="glass-card" style={{ padding: "20px", display: "flex", alignItems: "center", gap: "14px" }}>
        <div className="loading-orbit" style={{ width: "28px", height: "28px", flexShrink: 0 }} />
        <div>
          <div style={{ color: "var(--cyan)", fontWeight: 600, fontSize: "13px" }}>Acquiring satellite signal…</div>
          <div style={{ color: "var(--text-muted)", fontSize: "11px" }}>Connecting to Sentinel-2 L2A feed</div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="glass-card" style={{ padding: "20px" }}>
        <div style={{ color: "#ff3b3b", fontSize: "12px" }}>⚠️ Live feed unavailable — backend offline</div>
      </div>
    );
  }

  const { spectral, classification, derived, thresholds, scan_display, last_overpass, next_overpass, hours_until_next, minutes_until_next } = data;
  const clsColor = statusColor(classification.status);

  return (
    <div
      className="glass-card"
      style={{
        padding: "20px",
        border: pulse ? `1px solid ${clsColor}88` : "1px solid var(--border)",
        transition: "border-color 0.6s ease",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle glow on refresh */}
      {pulse && (
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: `radial-gradient(ellipse at top left, ${clsColor}0a 0%, transparent 60%)`,
          animation: "fadeOut 0.8s ease forwards",
        }} />
      )}

      {/* ── Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <span style={{ fontSize: "16px" }}>🛰️</span>
            <span style={{ fontWeight: 700, fontSize: "14px", color: "var(--text-primary)" }}>
              Live Satellite Reading
            </span>
            {/* LIVE badge */}
            <div style={{
              display: "flex", alignItems: "center", gap: "5px",
              padding: "2px 8px", borderRadius: "10px",
              background: "rgba(0,217,163,0.12)", border: "1px solid rgba(0,217,163,0.35)",
            }}>
              <div style={{
                width: "6px", height: "6px", borderRadius: "50%",
                background: "#00d9a3",
                boxShadow: "0 0 6px #00d9a3",
                animation: "pulse-ring 1.4s ease-out infinite",
              }} />
              <span style={{ color: "#00d9a3", fontSize: "10px", fontWeight: 700, letterSpacing: "0.5px" }}>
                LIVE · 2026
              </span>
            </div>
          </div>
          <div style={{ color: "var(--text-muted)", fontSize: "11px" }}>
            Sentinel-2 L2A · 10m/pixel · Bellandur Lake, Bengaluru
          </div>
        </div>

        {/* Countdown to next refresh */}
        <div style={{ textAlign: "center", flexShrink: 0 }}>
          <div style={{ fontSize: "10px", color: "var(--text-muted)", marginBottom: "2px" }}>next scan</div>
          <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--cyan)", fontFamily: "monospace" }}>
            {String(countdown).padStart(2, "0")}s
          </div>
        </div>
      </div>

      {/* ── Scan timestamp strip ── */}
      <div style={{
        display: "flex", gap: "16px", flexWrap: "wrap",
        padding: "8px 12px", borderRadius: "8px", marginBottom: "16px",
        background: "rgba(0,212,255,0.04)", border: "1px solid rgba(0,212,255,0.12)",
        fontSize: "11px",
      }}>
        {[
          ["📡 Reading taken", scan_display],
          ["🛰️ Last overpass", last_overpass],
          ["⏭️ Next overpass", `${next_overpass} (${hours_until_next}h ${minutes_until_next}m)`],
        ].map(([k, v]) => (
          <div key={k} style={{ display: "flex", gap: "5px" }}>
            <span style={{ color: "var(--text-muted)" }}>{k}:</span>
            <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{v}</span>
          </div>
        ))}
      </div>

      {/* ── Main content: classification + spectral ── */}
      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "20px", alignItems: "start" }}>

        {/* Classification verdict */}
        <div style={{
          padding: "16px 20px", borderRadius: "12px", textAlign: "center",
          background: `${clsColor}0e`, border: `1px solid ${clsColor}44`,
          minWidth: "110px",
        }}>
          <div style={{ fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "6px" }}>
            ML Verdict
          </div>
          <div style={{ fontSize: "22px", fontWeight: 900, color: clsColor, lineHeight: 1 }}>
            {classification.status}
          </div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
            {classification.confidence.toFixed(1)}% conf.
          </div>
          <div style={{
            marginTop: "10px", padding: "4px 8px", borderRadius: "6px",
            background: `${derived.foam_risk_color}18`, border: `1px solid ${derived.foam_risk_color}44`,
            fontSize: "10px", color: derived.foam_risk_color, fontWeight: 600,
          }}>
            🫧 Foam: {derived.foam_risk}
          </div>
          <div style={{
            marginTop: "6px", padding: "4px 8px", borderRadius: "6px",
            background: "rgba(255,59,59,0.08)", border: "1px solid rgba(255,59,59,0.25)",
            fontSize: "10px", color: "#ff6b35", fontWeight: 600,
          }}>
            💧 {derived.sewage_load_mgd} MGD
          </div>
        </div>

        {/* Spectral gauges */}
        <div>
          <SpectralBar
            label="NDWI — Water Index"
            value={spectral.ndwi}
            min={-0.1} max={0.5}
            goodDir="high" threshold={0.30}
            color="var(--cyan)"
          />
          <SpectralBar
            label="NDVI — Vegetation / Algae"
            value={spectral.ndvi}
            min={0} max={0.5}
            goodDir="low" threshold={0.10}
            color="var(--green)"
          />
          <SpectralBar
            label="Turbidity Ratio (B4/B2)"
            value={spectral.turbidity_ratio}
            min={0.5} max={3.0}
            goodDir="low" threshold={0.90}
            color="var(--yellow)"
          />
          <SpectralBar
            label="Algae Index (Chlorophyll proxy)"
            value={spectral.algae_index}
            min={-0.1} max={0.4}
            goodDir="low" threshold={0.10}
            color="#a78bfa"
          />
        </div>
      </div>

      {/* ── Threshold deficit summary ── */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "14px",
      }}>
        <div style={{
          padding: "8px 12px", borderRadius: "8px",
          background: thresholds.ndwi_deficit > 0 ? "rgba(255,59,59,0.06)" : "rgba(0,217,163,0.06)",
          border: `1px solid ${thresholds.ndwi_deficit > 0 ? "rgba(255,59,59,0.25)" : "rgba(0,217,163,0.25)"}`,
          fontSize: "11px",
        }}>
          <div style={{ color: "var(--text-muted)", marginBottom: "2px" }}>NDWI deficit from healthy</div>
          <div style={{ fontWeight: 700, color: thresholds.ndwi_deficit > 0 ? "#ff6b35" : "#00d9a3", fontFamily: "monospace" }}>
            {thresholds.ndwi_deficit > 0 ? `−${thresholds.ndwi_deficit}` : "✓ Within range"}
          </div>
        </div>
        <div style={{
          padding: "8px 12px", borderRadius: "8px",
          background: thresholds.ndvi_excess > 0 ? "rgba(255,59,59,0.06)" : "rgba(0,217,163,0.06)",
          border: `1px solid ${thresholds.ndvi_excess > 0 ? "rgba(255,59,59,0.25)" : "rgba(0,217,163,0.25)"}`,
          fontSize: "11px",
        }}>
          <div style={{ color: "var(--text-muted)", marginBottom: "2px" }}>NDVI excess (algae bloom)</div>
          <div style={{ fontWeight: 700, color: thresholds.ndvi_excess > 0 ? "#ff6b35" : "#00d9a3", fontFamily: "monospace" }}>
            {thresholds.ndvi_excess > 0 ? `+${thresholds.ndvi_excess}` : "✓ Within range"}
          </div>
        </div>
      </div>

      {/* ── Hyacinth cover ── */}
      <div style={{
        marginTop: "10px", padding: "8px 14px", borderRadius: "8px",
        background: "rgba(0,0,0,0.2)", border: "1px solid var(--border)",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        fontSize: "12px",
      }}>
        <span style={{ color: "var(--text-muted)" }}>🌿 Estimated hyacinth surface cover</span>
        <span style={{ fontWeight: 700, color: derived.hyacinth_cover_pct > 50 ? "#ff3b3b" : "#ffb800", fontFamily: "monospace" }}>
          {derived.hyacinth_cover_pct}%
        </span>
      </div>

      {/* ── Next overpass countdown ring ── */}
      <div style={{
        marginTop: "14px", display: "flex", alignItems: "center", gap: "14px",
        padding: "10px 14px", borderRadius: "8px",
        background: "rgba(0,212,255,0.04)", border: "1px solid rgba(0,212,255,0.12)",
      }}>
        <div style={{ position: "relative", width: "56px", height: "56px", flexShrink: 0 }}>
          <CountdownRing hoursLeft={hours_until_next} totalHours={120} />
          <div style={{
            position: "absolute", inset: 0, display: "flex",
            flexDirection: "column", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontSize: "13px", fontWeight: 800, color: "var(--cyan)", lineHeight: 1 }}>
              {hours_until_next}h
            </span>
            <span style={{ fontSize: "9px", color: "var(--text-muted)" }}>left</span>
          </div>
        </div>
        <div>
          <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)" }}>
            Next Sentinel-2 overpass: {next_overpass}
          </div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
            Satellite revisit cycle: 5 days · Overpass time: ~10:30 IST
          </div>
          <div style={{ fontSize: "10px", color: "var(--cyan)", marginTop: "3px" }}>
            Dashboard refreshes every 30s · Model: {classification.classifier.split("(")[0].trim()}
          </div>
        </div>
      </div>
    </div>
  );
}
