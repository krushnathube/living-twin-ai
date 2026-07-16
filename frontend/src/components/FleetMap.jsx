import React, { useEffect, useRef } from 'react';
import { useLive } from '../contexts/LiveContext.jsx';

// Canvas fleet map. Projects vehicle lat/lng into the panel and colors by health.
const COL = { healthy: '#2fe08a', warning: '#ffb020', critical: '#ff4a5e', healing: '#3ad6ff', offline: '#4d6076' };

export default function FleetMap() {
  const ref = useRef(null);
  const { fleet } = useLive();
  const dataRef = useRef(fleet);
  dataRef.current = fleet;
  const sweep = useRef(0);

  useEffect(() => {
    const cv = ref.current, cx = cv.getContext('2d');
    let raf;
    const bounds = { minLat: 18.42, maxLat: 18.62, minLng: 73.75, maxLng: 73.96 };
    const project = (lat, lng, w, h) => ({
      x: ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * w,
      y: (1 - (lat - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * h,
    });
    const render = () => {
      const r = cv.getBoundingClientRect(); const dpr = Math.min(devicePixelRatio || 1, 2);
      if (cv.width !== r.width * dpr) { cv.width = r.width * dpr; cv.height = r.height * dpr; }
      cx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const w = r.width, h = r.height;
      cx.clearRect(0, 0, w, h);
      cx.strokeStyle = 'rgba(38,55,77,.25)';
      for (let x = 0; x < w; x += 46) { cx.beginPath(); cx.moveTo(x, 0); cx.lineTo(x, h); cx.stroke(); }
      for (let y = 0; y < h; y += 46) { cx.beginPath(); cx.moveTo(0, y); cx.lineTo(w, y); cx.stroke(); }
      sweep.current = (sweep.current + 0.004) % 1;
      const cxp = w / 2, cyp = h / 2, rad = Math.hypot(w, h) * 0.6, ang = sweep.current * Math.PI * 2;
      const g = cx.createRadialGradient(cxp, cyp, 0, cxp, cyp, rad);
      g.addColorStop(0, 'rgba(58,214,255,.05)'); g.addColorStop(1, 'rgba(58,214,255,0)');
      cx.save(); cx.translate(cxp, cyp); cx.rotate(ang); cx.beginPath(); cx.moveTo(0, 0); cx.arc(0, 0, rad, -0.28, 0); cx.closePath(); cx.fillStyle = g; cx.fill(); cx.restore();
      const t = performance.now() / 300;
      for (const v of dataRef.current.vehicles || []) {
        const p = project(v.lat, v.lng, w, h); const col = COL[v.health] || COL.healthy;
        const crit = v.health === 'critical' || v.health === 'healing';
        if (crit) { const pr = Math.sin(t) * 0.5 + 0.5; cx.beginPath(); cx.arc(p.x, p.y, 10 + pr * 10, 0, 7); cx.strokeStyle = col; cx.globalAlpha = 0.35 * (1 - pr * 0.6); cx.lineWidth = 2; cx.stroke(); cx.globalAlpha = 1; }
        cx.beginPath(); cx.arc(p.x, p.y, crit ? 5.5 : 3.4, 0, 7); cx.fillStyle = col; cx.shadowColor = col; cx.shadowBlur = crit ? 16 : 6; cx.fill(); cx.shadowBlur = 0;
        if (crit) { cx.fillStyle = col; cx.font = '700 10px ui-monospace,monospace'; cx.fillText(v.id, p.x + 12, p.y - 8); }
      }
      raf = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="map-wrap">
      <canvas ref={ref} className="map" />
      <div className="map-tag">Fleet map · region west · live telemetry</div>
      <div className="map-legend">
        {['healthy', 'warning', 'critical', 'healing'].map((k) => (
          <span key={k}><i style={{ background: COL[k] }} />{k}</span>
        ))}
      </div>
    </div>
  );
}
