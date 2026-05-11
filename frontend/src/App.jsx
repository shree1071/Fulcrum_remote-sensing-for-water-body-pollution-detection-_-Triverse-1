import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import AlertBanner from "./components/AlertBanner";
import StatsCards from "./components/StatsCards";
import PollutionMap from "./components/PollutionMap";
import TimeSeriesChart from "./components/TimeSeriesChart";
import FestivalMarkers from "./components/FestivalMarkers";
import PredictPanel from "./components/PredictPanel";
import RiskReport from "./components/RiskReport";
import ModelConsensus from "./components/ModelConsensus";
import EconomicImpact from "./components/EconomicImpact";
import ScenarioSimulator from "./components/ScenarioSimulator";
import LakeSelector from "./components/LakeSelector";
import LiveReading from "./components/LiveReading";

const API = "http://localhost:8000";

export default function App() {
  const [selectedLake, setSelectedLake]   = useState("bellandur");
  const [waterData, setWaterData]         = useState(null);
  const [timeseries, setTimeseries]       = useState(null);
  const [festivals, setFestivals]         = useState([]);
  const [hotspots, setHotspots]           = useState([]);
  const [riskReport, setRiskReport]       = useState(null);
  const [consensus, setConsensus]         = useState(null);
  const [econImpact, setEconImpact]       = useState(null);
  const [aiAnalysis, setAiAnalysis]       = useState(null);
  const [loading, setLoading]             = useState(true);
  const [lakeLoading, setLakeLoading]     = useState(false);
  const [error, setError]                 = useState(null);
  const [activeTab, setActiveTab]         = useState("overview");

  const safe = (promise, fallback = null) =>
    promise.then(r => r.data).catch(() => fallback);

  // ── Initial load (Bellandur + global data) ─────────────────────────────────
  useEffect(() => {
    Promise.all([
      safe(axios.get(`${API}/lake-data?lake=bellandur`),   null),
      safe(axios.get(`${API}/festivals`),                  { events: [] }),
      safe(axios.get(`${API}/risk-report`),                {}),
      safe(axios.get(`${API}/model-consensus`),            {}),
      safe(axios.get(`${API}/economic-impact`),            {}),
    ]).then(([lakeBundle, fest, risk, con, econ]) => {
      if (!lakeBundle) {
        setError("Cannot connect to AquaSentinel API at localhost:8000. Make sure the backend is running.");
        setLoading(false);
        return;
      }
      applyLakeBundle(lakeBundle);
      setFestivals(fest.events || []);
      setRiskReport(risk);
      setConsensus(con);
      setEconImpact(econ);
      setLoading(false);
    });

    // GEE timeseries — slow, non-blocking, only for Bellandur
    axios.get(`${API}/timeseries`, { timeout: 60000 })
      .then(r => { if (selectedLake === "bellandur") setTimeseries(r.data); })
      .catch(() => {});
  }, []);

  // ── Apply a /lake-data bundle to all state ────────────────────────────────
  const applyLakeBundle = useCallback((bundle) => {
    setWaterData({
      lake:             bundle.lake,
      city:             bundle.city,
      area_km2:         bundle.area_km2,
      last_updated:     bundle.last_updated,
      satellite:        bundle.satellite,
      resolution:       bundle.resolution,
      pollution_summary: bundle.pollution_summary,
      alert:            bundle.alert,
      coordinates:      bundle.coordinates,
    });
    setHotspots(bundle.hotspots || []);
    setTimeseries(bundle.timeseries || null);
    setAiAnalysis(bundle.ai_analysis || null);
    if (bundle.risk_report) setRiskReport(bundle.risk_report);
  }, []);

  // ── Lake switch handler ───────────────────────────────────────────────────
  const handleLakeSelect = useCallback(async (lakeId) => {
    if (lakeId === selectedLake) return;
    setSelectedLake(lakeId);
    setLakeLoading(true);
    setActiveTab("overview");

    try {
      const bundle = await axios.get(`${API}/lake-data?lake=${lakeId}`).then(r => r.data);
      applyLakeBundle(bundle);
    } catch {
      // keep existing data
    } finally {
      setLakeLoading(false);
    }
  }, [selectedLake, applyLakeBundle]);

  // ── Loading / Error screens ───────────────────────────────────────────────
  if (loading) {
    return (
      <div className="loading-screen">
        <div style={{ position: "relative" }}>
          <div className="loading-orbit" />
          <div style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%, -50%)", fontSize: "24px"
          }}>🛰️</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ color: "var(--cyan)", fontWeight: 600, fontSize: "18px" }}>AquaSentinel</div>
          <div style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "6px" }}>Loading satellite intelligence...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="loading-screen">
        <div style={{ fontSize: "48px" }}>🔌</div>
        <div style={{ textAlign: "center", maxWidth: "460px" }}>
          <div style={{ color: "var(--red)", fontWeight: 600, fontSize: "18px" }}>API Connection Failed</div>
          <div style={{ color: "var(--text-secondary)", fontSize: "13px", marginTop: "10px", lineHeight: 1.8 }}>{error}</div>
          <code style={{
            display: "block", marginTop: "16px", padding: "10px 16px",
            background: "rgba(0,0,0,0.3)", borderRadius: "8px",
            color: "var(--cyan)", fontSize: "12px"
          }}>cd backend &amp;&amp; uvicorn main:app --reload --port 8000</code>
        </div>
      </div>
    );
  }

  const TABS = [
    { id: "overview",     label: "📊 Overview",        desc: "Live dashboard" },
    { id: "risk",         label: "🏛️ Risk Report",      desc: "A–F grade + actions" },
    { id: "intelligence", label: "🤖 AI Intelligence",  desc: "Model consensus" },
    { id: "economic",     label: "💰 Economic Impact",  desc: "₹ cost analysis" },
    { id: "simulate",     label: "🧪 Scenario Sim",     desc: "Policy what-if" },
  ];

  const isBellandur = selectedLake === "bellandur";

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "24px 20px" }}>

      {/* ── Header ───────────────────────────────────────────── */}
      <header className="fade-in" style={{ marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h1 style={{ fontSize: "32px", fontWeight: 800, display: "flex", alignItems: "center", gap: "10px" }}>
              <span>🛰️</span>
              <span style={{
                background: "linear-gradient(135deg, var(--cyan), #00a8d4, var(--green))",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
              }}>AquaSentinel</span>
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "13px", marginTop: "4px" }}>
              Dual-Model AI Water Intelligence · {waterData.lake} · {waterData.city}
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {riskReport && (
              <div style={{
                padding: "6px 14px", borderRadius: "20px",
                background: `${riskReport.grade_color}18`,
                border: `1px solid ${riskReport.grade_color}44`,
                display: "flex", alignItems: "center", gap: "6px"
              }}>
                <span style={{ color: riskReport.grade_color, fontWeight: 900, fontSize: "16px" }}>{riskReport.grade}</span>
                <span style={{ color: riskReport.grade_color, fontSize: "11px", fontWeight: 600 }}>WATER GRADE</span>
              </div>
            )}
            <div style={{
              display: "flex", alignItems: "center", gap: "8px",
              background: "rgba(0, 217, 163, 0.08)",
              border: "1px solid rgba(0, 217, 163, 0.25)",
              borderRadius: "20px", padding: "6px 14px"
            }}>
              <div style={{ position: "relative", width: "8px", height: "8px" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: lakeLoading ? "var(--yellow)" : "var(--green)", position: "absolute" }} />
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: lakeLoading ? "var(--yellow)" : "var(--green)", position: "absolute", animation: "pulse-ring 1.5s ease-out infinite" }} />
              </div>
              <span style={{ color: lakeLoading ? "var(--yellow)" : "var(--green)", fontSize: "12px", fontWeight: 600 }}>
                {lakeLoading ? "LOADING" : "LIVE"}
              </span>
              <span style={{ color: "var(--text-muted)", fontSize: "11px" }}>{waterData.last_updated}</span>
            </div>
          </div>
        </div>

        {/* Meta bar */}
        <div style={{
          display: "flex", gap: "20px", marginTop: "14px",
          padding: "10px 16px", borderRadius: "10px",
          background: "rgba(0,212,255,0.04)", border: "1px solid var(--border)",
          flexWrap: "wrap"
        }}>
          {[
            ["🛰️ Satellite", waterData.satellite],
            ["📐 Resolution", waterData.resolution],
            ["🤖 Satellite Model", "RF · 92.85%"],
            ["🧪 Sensor Model", "RF · 97.14%"],
            ["🏞️ Lake Area", waterData.area_km2 + " km²"],
            ...(econImpact && isBellandur ? [["💰 Annual Damage", `₹${econImpact.total_annual_damage_crore.toFixed(0)} Cr`]] : []),
          ].map(([k, v]) => (
            <div key={k} style={{ display: "flex", gap: "6px", fontSize: "12px" }}>
              <span style={{ color: "var(--text-muted)" }}>{k}:</span>
              <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{v}</span>
            </div>
          ))}
        </div>
      </header>

      {/* ── Lake Selector ─────────────────────────────────────── */}
      <div className="fade-in-delay-1">
        <LakeSelector selectedLake={selectedLake} onSelect={handleLakeSelect} />
      </div>

      {/* ── Tab Navigation ───────────────────────────────────── */}
      <div className="fade-in-delay-1" style={{
        display: "flex", gap: "6px", marginBottom: "20px",
        padding: "6px", borderRadius: "12px",
        background: "rgba(0,0,0,0.3)", border: "1px solid var(--border)",
        overflowX: "auto"
      }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: "none", padding: "8px 16px", borderRadius: "8px",
              cursor: "pointer", fontFamily: "Inter, sans-serif",
              fontSize: "13px", fontWeight: 600, whiteSpace: "nowrap",
              transition: "all 0.2s ease",
              ...(activeTab === tab.id
                ? {
                    background: "linear-gradient(135deg, rgba(0,212,255,0.2), rgba(0,212,255,0.08))",
                    color: "var(--cyan)",
                    border: "1px solid rgba(0,212,255,0.3)",
                    boxShadow: "0 0 12px rgba(0,212,255,0.15)",
                  }
                : {
                    background: "transparent",
                    color: "var(--text-muted)",
                    border: "1px solid transparent",
                    boxShadow: "none",
                  }),
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Alert (always visible) ───────────────────────────── */}
      {waterData.alert?.active && (
        <div className="fade-in-delay-1">
          <AlertBanner alert={waterData.alert} />
        </div>
      )}

      {/* ── Lake switching overlay ───────────────────────────── */}
      {lakeLoading && (
        <div style={{
          display: "flex", alignItems: "center", gap: "12px",
          padding: "14px 20px", borderRadius: "12px", marginBottom: "16px",
          background: "rgba(0,212,255,0.06)", border: "1px solid rgba(0,212,255,0.2)",
          animation: "pulse-ring 1s ease infinite"
        }}>
          <span style={{ fontSize: "20px" }}>🛰️</span>
          <span style={{ color: "var(--cyan)", fontWeight: 600, fontSize: "13px" }}>
            Fetching satellite intelligence for selected lake...
          </span>
        </div>
      )}

      {/* ══════ TAB: OVERVIEW ══════ */}
      {activeTab === "overview" && (
        <>
          <div className="fade-in-delay-2">
            <StatsCards summary={waterData.pollution_summary} />
          </div>

          {/* AI Analysis Card (all lakes) */}
          {aiAnalysis && (
            <div className="fade-in-delay-2 glass-card" style={{ padding: "20px", marginTop: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
                <div className="section-title" style={{ margin: 0 }}>AI INTELLIGENCE ANALYSIS</div>
                <div style={{
                  marginLeft: "auto", fontSize: "10px", fontWeight: 600,
                  padding: "3px 9px", borderRadius: "10px",
                  background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.25)",
                  color: "var(--cyan)"
                }}>AquaSentinel v3</div>
              </div>
              <p style={{
                color: "var(--text-secondary)", fontSize: "13px", lineHeight: 1.85,
                padding: "14px 18px", borderRadius: "10px",
                background: "rgba(0,0,0,0.2)", border: "1px solid var(--border)",
                whiteSpace: "pre-wrap"
              }}>
                {aiAnalysis}
              </p>
            </div>
          )}

          <div className="fade-in-delay-3" style={{
            display: "grid", gridTemplateColumns: "1fr 1fr",
            gap: "20px", marginTop: "20px"
          }}>
            <PollutionMap 
              hotspots={hotspots}
              lakeId={selectedLake}
              coordinates={waterData.coordinates}
              lakeName={waterData.lake}
            />
            <TimeSeriesChart
              data={timeseries?.data || []}
              festivals={isBellandur ? festivals : []}
              thresholds={timeseries || {}}
            />
          </div>

          {isBellandur && (
            <div className="fade-in-delay-4" style={{
              display: "grid", gridTemplateColumns: "1fr 1fr",
              gap: "20px", marginTop: "20px"
            }}>
              <LiveReading />
              <FestivalMarkers festivals={festivals} />
            </div>
          )}

          {isBellandur && (
            <div className="fade-in-delay-4" style={{
              display: "grid", gridTemplateColumns: "1fr 1.5fr",
              gap: "20px", marginTop: "20px"
            }}>
              <PredictPanel />
              <div /> {/* spacer */}
            </div>
          )}
        </>
      )}

      {/* ══════ TAB: RISK REPORT ══════ */}
      {activeTab === "risk" && (
        <div className="fade-in">
          <RiskReport data={riskReport} />
        </div>
      )}

      {/* ══════ TAB: AI INTELLIGENCE ══════ */}
      {activeTab === "intelligence" && (
        <div className="fade-in" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          <ModelConsensus data={consensus} />
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {[
              { name: "Satellite Random Forest", accuracy: "92.85%", features: "6 Sentinel-2 spectral bands", output: "Clean / Moderate / Severe", icon: "🛰️", color: "var(--cyan)" },
              { name: "Sensor Random Forest (HydroWatch)", accuracy: "97.14%", features: "20 chemical parameters", output: "Safe / Unsafe", icon: "🧪", color: "var(--green)" },
            ].map(m => (
              <div key={m.name} className="glass-card" style={{ padding: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: m.color }}>{m.icon} {m.name}</div>
                  <div style={{
                    fontSize: "22px", fontWeight: 900, color: m.color,
                    padding: "2px 12px", borderRadius: "8px",
                    background: `${m.color}18`, border: `1px solid ${m.color}44`
                  }}>{m.accuracy}</div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  {[["Algorithm", "Random Forest Classifier"], ["Input Features", m.features], ["Output Classes", m.output], ["Framework", "scikit-learn"]].map(([k, v]) => (
                    <div key={k} style={{ padding: "6px 10px", borderRadius: "6px", background: "rgba(0,0,0,0.2)", fontSize: "11px" }}>
                      <div style={{ color: "var(--text-muted)", marginBottom: "2px" }}>{k}</div>
                      <div style={{ color: "var(--text-primary)", fontWeight: 500 }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════ TAB: ECONOMIC IMPACT ══════ */}
      {activeTab === "economic" && (
        <div className="fade-in" style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "20px" }}>
          <EconomicImpact data={econImpact} />
          <div className="glass-card" style={{ padding: "20px" }}>
            <div className="section-title">📢 Executive Brief</div>
            <p style={{ color: "var(--text-secondary)", fontSize: "13px", lineHeight: 1.8, marginBottom: "16px" }}>
              Bellandur Lake is the most polluted urban lake in India's IT capital. The cost of inaction
              compounds annually as property values decline, healthcare burden grows, and tourism potential remains zero.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {[
                { stat: "70M gallons", label: "of raw sewage enters daily", icon: "🚨" },
                { stat: "2.4 Lakh", label: "residents at health risk", icon: "👥" },
                { stat: "₹2 Lakh", label: "AquaSentinel annual cost", icon: "✅" },
                { stat: "5 days", label: "vs 90-day CPCB reports", icon: "⚡" },
                { stat: "Zero", label: "hardware sensors required", icon: "🛰️" },
                { stat: "Any lake", label: "Scalable: change 4 GPS coordinates", icon: "🗺️" },
              ].map(item => (
                <div key={item.stat} style={{
                  display: "flex", gap: "14px", alignItems: "center",
                  padding: "10px 14px", borderRadius: "8px",
                  background: "rgba(0,0,0,0.2)", border: "1px solid var(--border)"
                }}>
                  <span style={{ fontSize: "20px" }}>{item.icon}</span>
                  <div>
                    <div style={{ fontWeight: 700, color: "var(--cyan)", fontSize: "16px" }}>{item.stat}</div>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{item.label}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{
              marginTop: "16px", padding: "14px", borderRadius: "10px",
              background: "rgba(0,217,163,0.06)", border: "1px solid rgba(0,217,163,0.3)",
              fontSize: "13px", color: "var(--green)", fontStyle: "italic", lineHeight: 1.7, textAlign: "center"
            }}>
              "In 2018 nobody was watching.<br />In 2026, AquaSentinel is."
            </div>
          </div>
        </div>
      )}

      {/* ══════ TAB: SCENARIO SIMULATOR ══════ */}
      {activeTab === "simulate" && (
        <div className="fade-in" style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: "20px" }}>
          <ScenarioSimulator />
          <div className="glass-card" style={{ padding: "20px" }}>
            <div className="section-title">📚 How It Works</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.7 }}>
              <p>The simulator models how each policy intervention changes the spectral signature of the lake as seen from the Sentinel-2 satellite.</p>
              {[
                { color: "var(--cyan)", title: "🚰 Reduce STP Discharge", desc: "Less sewage → higher NDWI (more open water), lower turbidity ratio → AI predicts cleaner water." },
                { color: "var(--yellow)", title: "🪔 Idol Immersion Policy", desc: "Fewer chemical pigments → lower NDVI (less floating algae from phosphate bloom) → AI predicts less severe classification." },
                { color: "var(--green)", title: "💨 Deploy Aerators", desc: "Oxygen injection breaks down organic matter → suppresses algae → reduces both NDVI and turbidity." },
              ].map(item => (
                <div key={item.title} style={{ padding: "10px 14px", borderRadius: "8px", background: "rgba(0,0,0,0.2)", border: "1px solid var(--border)", fontSize: "12px" }}>
                  <div style={{ color: item.color, fontWeight: 600, marginBottom: "6px" }}>{item.title}</div>
                  {item.desc}
                </div>
              ))}
              <p style={{ color: "var(--text-muted)", fontSize: "12px" }}>
                The live AI model (Random Forest, 92.85% accuracy) produces the prediction — not hardcoded rules. Each slider change sends a real API call.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer style={{
        marginTop: "32px", padding: "20px",
        borderTop: "1px solid var(--border)",
        display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "8px",
        fontSize: "11px", color: "var(--text-muted)"
      }}>
        <span>AquaSentinel v3.0 · Dual-Model RF Intelligence · {waterData.lake}, {waterData.city}</span>
        <span>Satellite RF (92.85%) + Sensor RF (97.14%) · Powered by Sentinel-2 &amp; GEE</span>
      </footer>
    </div>
  );
}
