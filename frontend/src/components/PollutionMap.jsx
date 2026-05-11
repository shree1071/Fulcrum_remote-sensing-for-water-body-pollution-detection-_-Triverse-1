import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Circle, Popup, Rectangle, Tooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Component to update map center when coordinates change
function MapUpdater({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

// Pollution zones derived from rule-based GEE pixel analysis
const ZONES = [
  {
    bounds:  [[12.920, 77.645], [12.932, 77.658]],
    color:   "#ff3b3b",
    fill:    "rgba(255,59,59,0.22)",
    label:   "Severe — SW Inlet Zone",
    detail:  "Koramangala drain discharge. NDWI: 0.05"
  },
  {
    bounds:  [[12.945, 77.675], [12.958, 77.690]],
    color:   "#ff6b35",
    fill:    "rgba(255,107,53,0.22)",
    label:   "High — NE Industrial Zone",
    detail:  "Industrial effluent runoff. NDVI: 0.22"
  },
  {
    bounds:  [[12.932, 77.658], [12.945, 77.675]],
    color:   "#ffb800",
    fill:    "rgba(255,184,0,0.18)",
    label:   "Moderate — Central Lake",
    detail:  "Mixed zone. Turbidity: 1.1x threshold"
  },
  {
    bounds:  [[12.952, 77.645], [12.960, 77.660]],
    color:   "#00d9a3",
    fill:    "rgba(0,217,163,0.15)",
    label:   "Clean — NW Open Water",
    detail:  "Cleanest section. NDWI: 0.32"
  },
];

export default function PollutionMap({ hotspots, lakeId = "bellandur", coordinates = { lat: 12.937, lon: 77.668 }, lakeName = "Bellandur Lake" }) {
  const [geeTiles, setGeeTiles] = useState(null);
  const [activeLayer, setActiveLayer] = useState("live_2026"); // default to live 2026
  const [loadingGee, setLoadingGee] = useState(true);

  // Fetch GEE tiles whenever lake changes
  useEffect(() => {
    setLoadingGee(true);
    fetch(`http://localhost:8000/gee/tiles?lake=${lakeId}`)
      .then(res => res.json())
      .then(data => {
        console.log(`GEE tiles response for ${lakeId}:`, data);
        if (data.status === "success") {
          setGeeTiles(data);
          setActiveLayer("live_2026"); // Always default to live 2026
        } else {
          console.error(`GEE tiles failed for ${lakeId}:`, data.error || data);
          setGeeTiles(null);
          setActiveLayer("static");
        }
      })
      .catch(err => {
        console.error(`GEE error for ${lakeId}:`, err);
        setGeeTiles(null);
        setActiveLayer("static");
      })
      .finally(() => setLoadingGee(false));
  }, [lakeId]); // Re-fetch when lake changes

  // Show live 2026 by default when GEE tiles are available
  useEffect(() => {
    if (geeTiles) {
      setActiveLayer("live_2026");
    } else {
      setActiveLayer("static");
    }
  }, [geeTiles]);

  const getCurrentTileUrl = () => {
    if (activeLayer === "static" || !geeTiles) {
      return "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
    }
    // Fallback to static if the requested layer doesn't exist
    if (!geeTiles[activeLayer]) {
      console.warn(`Layer ${activeLayer} not found in GEE tiles, falling back to static`);
      return "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
    }
    return geeTiles[activeLayer];
  };

  // RGB layers don't need a dark base underneath
  const isRgbLayer = activeLayer === "critical_rgb" || activeLayer === "live_2026_rgb";

  return (
    <div className="glass-card" style={{ padding: "20px" }}>

      {/* ── Row 1: Title + LIVE badge ── */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
        <span className="section-title" style={{ margin: 0 }}>
          🗺️ Live Pollution Map — {lakeName}
        </span>
        {(activeLayer === "live_2026" || activeLayer === "live_2026_rgb") && geeTiles && (
          <span style={{
            display: "inline-flex", alignItems: "center", gap: "4px",
            padding: "2px 8px", borderRadius: "10px", fontSize: "10px", fontWeight: 700,
            background: "rgba(0,217,163,0.15)", border: "1px solid rgba(0,217,163,0.4)",
            color: "#00d9a3", flexShrink: 0,
          }}>
            <span style={{
              width: "6px", height: "6px", borderRadius: "50%", background: "#00d9a3",
              boxShadow: "0 0 6px #00d9a3", animation: "pulse-ring 1.4s ease-out infinite",
              display: "inline-block",
            }} />
            LIVE · 2026
          </span>
        )}
      </div>

      {/* ── Row 2: Buttons — single scrollable row, story order ── */}
      {geeTiles && (
        <div style={{
          display: "flex", alignItems: "center", gap: "5px",
          marginBottom: "14px", overflowX: "auto", paddingBottom: "2px",
        }}>
          {loadingGee ? (
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Connecting to GEE...</span>
          ) : (
            <>
              {/* Pollution index layers — chronological story */}
              {[
                { key: "baseline",  label: "✅ 2016 Baseline" },
                { key: "warning",   label: "⚠️ 2017 Warning"  },
                { key: "critical",  label: "🔥 2018 Fire"     },
                { key: "live_2026", label: "🟢 Live 2026",  live: true },
              ].map(btn => {
                const isActive = activeLayer === btn.key;
                return (
                  <button key={btn.key} className="predict-btn" onClick={() => setActiveLayer(btn.key)}
                    style={{
                      padding: "4px 11px", fontSize: "11px", marginTop: 0,
                      flexShrink: 0, whiteSpace: "nowrap",
                      opacity: isActive ? 1 : 0.5,
                      ...(isActive && btn.live ? {
                        border: "1px solid rgba(0,217,163,0.6)",
                        background: "rgba(0,217,163,0.08)",
                        color: "#00d9a3", fontWeight: 700,
                      } : {}),
                    }}
                  >{btn.label}</button>
                );
              })}

              {/* Visual separator */}
              <div style={{ width: "1px", height: "20px", background: "rgba(255,255,255,0.15)", flexShrink: 0, margin: "0 3px" }} />

              {/* RGB / overlay views */}
              {[
                { key: "critical_rgb",  label: "📷 RGB 2018" },
                { key: "live_2026_rgb", label: "📷 RGB 2026" },
                { key: "static",        label: "🗺️ Zones"    },
              ].map(btn => (
                <button key={btn.key} className="predict-btn" onClick={() => setActiveLayer(btn.key)}
                  style={{
                    padding: "4px 11px", fontSize: "11px", marginTop: 0,
                    flexShrink: 0, whiteSpace: "nowrap",
                    opacity: activeLayer === btn.key ? 1 : 0.5,
                  }}
                >{btn.label}</button>
              ))}
            </>
          )}
        </div>
      )}

      <MapContainer
        key={lakeId}
        center={[coordinates.lat, coordinates.lon]}
        zoom={14}
        style={{ height: "340px", borderRadius: "10px" }}
        zoomControl={true}
      >
        <MapUpdater center={[coordinates.lat, coordinates.lon]} zoom={14} />
        {/* Always show base map */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          maxZoom={19}
        />

        {/* GEE overlay layer (if available and not RGB/static) */}
        {geeTiles && activeLayer !== "static" && geeTiles[activeLayer] && (
          <TileLayer
            key={activeLayer}
            url={geeTiles[activeLayer]}
            attribution='&copy; Google Earth Engine'
            maxZoom={19}
            opacity={isRgbLayer ? 1 : 0.85}
          />
        )}

        {/* Pollution classification zones (Static Mode Only - Bellandur specific) */}
        {activeLayer === "static" && lakeId === "bellandur" && ZONES.map((zone) => (
          <Rectangle
            key={zone.label}
            bounds={zone.bounds}
            pathOptions={{
              color:       zone.color,
              fillColor:   zone.color,
              fillOpacity: 0.25,
              weight:      1.5,
              dashArray:   zone.color === "#00d9a3" ? "5 5" : null
            }}
          >
            <Tooltip sticky>
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: "12px" }}>
                <strong>{zone.label}</strong><br />
                <span style={{ color: "#aaa" }}>{zone.detail}</span>
              </div>
            </Tooltip>
            <Popup>
              <div style={{ fontFamily: "Inter, sans-serif" }}>
                <strong>{zone.label}</strong><br />
                {zone.detail}
              </div>
            </Popup>
          </Rectangle>
        ))}

        {/* Sewage inlet hotspot circles */}
        {hotspots?.map((h) => (
          <Circle
            key={h.id}
            center={[h.lat, h.lon]}
            radius={250}
            pathOptions={{
              color:       h.color,
              fillColor:   h.color,
              fillOpacity: 0.75,
              weight:      2
            }}
          >
            <Tooltip>
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: "12px" }}>
                <strong>{h.name}</strong><br />
                Status: <span style={{ color: h.color }}>{h.status}</span><br />
                Flow: {h.daily_flow_mgd} MGD
              </div>
            </Tooltip>
            <Popup>
              <div style={{ fontFamily: "Inter, sans-serif" }}>
                <strong>{h.name}</strong><br />
                Status: {h.status}<br />
                NDWI: {h.ndwi_reading}<br />
                Daily flow: {h.daily_flow_mgd} million gallons<br />
                <em style={{ color: "#888", fontSize: "11px" }}>{h.description}</em>
              </div>
            </Popup>
          </Circle>
        ))}
      </MapContainer>

      {/* Legend */}
      <div style={{
        display: "flex", gap: "16px", marginTop: "12px",
        flexWrap: "wrap", fontSize: "11px", color: "var(--text-muted)"
      }}>
        {activeLayer === "static" || lakeId !== "bellandur" ? (
          [
            { color: "#ff3b3b", label: "Severe zones" },
            { color: "#ffb800", label: "Moderate zones" },
            { color: "#00d9a3", label: "Clean zones" },
            { color: "#ff3b3b", label: "Sewage inlets (circles)" },
          ].map(({ color, label }) => (
            <span key={label} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <span style={{
                width: "10px", height: "10px", borderRadius: "2px",
                background: color, display: "inline-block"
              }} />
              {label}
            </span>
          ))
        ) : (
          <>
            <strong style={{ color: "#fff" }}>Pollution Index:</strong>
            {[
              { color: "#0000ff", label: "Clean water" },
              { color: "#00ffff", label: "Low organic load" },
              { color: "#88ff00", label: "Moderate pollution" },
              { color: "#ffff00", label: "High algae bloom" },
              { color: "#ff8800", label: "Severe — foam zones" },
              { color: "#ff0000", label: "Critical — fire risk" },
            ].map(({ color, label }) => (
              <span key={label} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <span style={{
                  width: "10px", height: "10px", borderRadius: "2px",
                  background: color, display: "inline-block"
                }} />
                {label}
              </span>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
