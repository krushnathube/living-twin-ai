// Device Simulator console. Presents the fleet as a grid of IoT devices, each emitting a
// full telemetry frame every tick. Operators can force health states, pin fields with
// sliders, inject faults, schedule/randomize failures, trigger the AI council, and heal.
import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLive } from '../contexts/LiveContext.jsx';

const FAULTS = [
  ['BATTERY', 'Battery thermal'], ['MOTOR', 'Motor overtemp'], ['CONNECT', 'Connectivity loss'],
  ['SENSOR', 'Sensor dropout'], ['BRAKE', 'Brake anomaly'], ['TIRE', 'Tyre pressure'],
];
const HEALTH_COL = { healthy: '#2fe08a', warning: '#ffb020', critical: '#ff4a5e', healing: '#3ad6ff', offline: '#4d6076' };

export default function Simulator() {
  const { latest, fleet, api, connected } = useLive();
  const [selected, setSelected] = useState(null);
  const [randomOn, setRandomOn] = useState(true);
  const [schedFault, setSchedFault] = useState('');
  const [schedDelay, setSchedDelay] = useState(5);

  // Merge live telemetry with fleet health into a device list.
  const healthById = useMemo(() => Object.fromEntries((fleet.vehicles || []).map((v) => [v.id, v.health])), [fleet]);
  const devices = useMemo(() =>
    Object.values(latest).map((t) => ({ ...t, health: t.health || healthById[t.vehicleId] || 'healthy' }))
      .sort((a, b) => a.vehicleId.localeCompare(b.vehicleId)), [latest, healthById]);

  const sel = devices.find((d) => d.vehicleId === selected) || null;
  const counts = fleet.counts || {};

  const toggleRandom = () => { const v = !randomOn; setRandomOn(v); api.random(v); };
  const doSchedule = () => api.schedule({ delayMs: schedDelay * 1000, faultKey: schedFault || undefined, kind: 'incident' });

  return (
    <div className="sim-page">
      <div className="sim-head">
        <div className="sim-brand">
          <img src="/favicon.svg" alt="" className="brand-mark" />
          <span>Living Twin · Device Simulator</span>
        </div>
        <Link to="/" className="sim-back">← Command Center</Link>
        <div className={`nav-live ${connected ? '' : 'off'}`}><span className="pulse" />{connected ? 'connected' : 'offline'}</div>
      </div>
    <div className="sim">
      {/* left: global controls */}
      <aside className="sim-side">
        <div className="panel-h"><span className="sq" />Simulator controls</div>
        <div className="side-body">
          <div className="stat-row">
            <Stat label="Devices" value={fleet.total || 0} />
            <Stat label="Healthy" value={counts.healthy || 0} col="#2fe08a" />
            <Stat label="Warning" value={counts.warning || 0} col="#ffb020" />
            <Stat label="Critical" value={counts.critical || 0} col="#ff4a5e" />
            <Stat label="Offline" value={counts.offline || 0} col="#4d6076" />
          </div>

          <div className="ctl-block">
            <div className="ctl-label">Random failures</div>
            <button className={`toggle ${randomOn ? 'on' : ''}`} onClick={toggleRandom}>
              <span className="knob" />{randomOn ? 'ON — auto-injecting' : 'OFF'}
            </button>
            <p className="hint-sm">When on, the fleet develops incidents on its own and the AI council heals them.</p>
          </div>

          <div className="ctl-block">
            <div className="ctl-label">Manual injection</div>
            <button className="btn-sim" onClick={() => api.inject()}>⚡ Inject random incident</button>
          </div>

          <div className="ctl-block">
            <div className="ctl-label">Scheduled failure</div>
            <select className="sim-input" value={schedFault} onChange={(e) => setSchedFault(e.target.value)}>
              <option value="">Random fault</option>
              {FAULTS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </select>
            <div className="sched-row">
              <input className="sim-input" type="number" min="1" max="120" value={schedDelay} onChange={(e) => setSchedDelay(+e.target.value)} />
              <span className="hint-sm">sec delay</span>
              <button className="btn-sim ghost" onClick={doSchedule}>Schedule</button>
            </div>
          </div>
        </div>
      </aside>

      {/* center: device grid */}
      <main className="sim-main">
        <div className="panel-h"><span className="sq" />Connected devices · live telemetry</div>
        <div className="dev-grid">
          {devices.map((d) => (
            <button key={d.vehicleId} className={`dev-card ${selected === d.vehicleId ? 'sel' : ''}`} onClick={() => setSelected(d.vehicleId)}>
              <div className="dev-top">
                <span className="dev-dot" style={{ background: HEALTH_COL[d.health] }} />
                <span className="dev-id">{d.vehicleId}</span>
                <span className="dev-model">{d.model || ''}</span>
              </div>
              <div className="dev-grid2">
                <Mini k="SoC" v={`${d.batterySoc ?? '--'}%`} />
                <Mini k="Pack" v={`${d.packTemp ?? '--'}°`} warn={d.packTemp >= 48} bad={d.packTemp >= 60} />
                <Mini k="Motor" v={`${d.motorTemp ?? '--'}°`} warn={d.motorTemp >= 92} bad={d.motorTemp >= 112} />
                <Mini k="Signal" v={`${d.signalStrength ?? '--'}%`} warn={d.signalStrength <= 25} />
                <Mini k="Speed" v={`${d.speed ?? '--'}`} />
                <Mini k="Trip" v={d.tripStatus || '--'} />
              </div>
              {d.faultCodes?.length > 0 && <div className="dev-fault">{d.faultCodes.join(' · ')}</div>}
            </button>
          ))}
        </div>
      </main>

      {/* right: device detail + controls */}
      <aside className="sim-detail">
        <div className="panel-h"><span className="sq" />{sel ? sel.vehicleId : 'Select a device'}</div>
        {!sel && <div className="empty">Pick a device from the grid to inspect its telemetry and drive its state.</div>}
        {sel && <DevicePanel d={sel} api={api} />}
      </aside>
    </div>
    </div>
  );
}

function DevicePanel({ d, api }) {
  const dev = api.device(d.vehicleId);
  const [msg, setMsg] = useState('');
  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(''), 1500); };
  const slide = (field, value) => { dev.override(field, value); };

  return (
    <div className="detail-body">
      <div className="mode-row">
        {['healthy', 'warning', 'critical', 'offline'].map((m) => (
          <button key={m} className="mode-btn" style={{ borderColor: HEALTH_COL[m], color: HEALTH_COL[m] }}
            onClick={() => { dev.mode(m); flash(`mode → ${m}`); }}>{m}</button>
        ))}
        <button className="mode-btn" onClick={() => { dev.mode('auto'); dev.clearOverrides(); flash('auto'); }}>auto</button>
      </div>

      <Group title="Energy">
        <Read k="Battery SoC" v={`${d.batterySoc}%`} />
        <Read k="Voltage" v={`${d.batteryVoltage} V`} />
        <Read k="Current" v={`${d.batteryCurrent} A`} />
        <Read k="Pack temp" v={`${d.packTemp} °C`} />
        <Read k="Charging" v={d.chargingState} />
        <Read k="Power draw" v={`${d.powerConsumptionKw} kW`} />
      </Group>
      <Group title="Drivetrain & motion">
        <Read k="Motor temp" v={`${d.motorTemp} °C`} />
        <Read k="Cabin temp" v={`${d.cabinTemp} °C`} />
        <Read k="Speed" v={`${d.speed} km/h`} />
        <Read k="Acceleration" v={`${d.acceleration} m/s²`} />
        <Read k="Tyre" v={`${d.tyrePsi} psi`} />
        <Read k="Trip" v={d.tripStatus} />
      </Group>
      <Group title="Connectivity & compute">
        <Read k="Link" v={`${d.connectivity} (${d.network})`} />
        <Read k="Signal" v={`${d.signalStrength}%`} />
        <Read k="Packet loss" v={`${d.packetLoss}%`} />
        <Read k="CPU" v={`${d.cpu}%`} />
        <Read k="Memory" v={`${d.memory}%`} />
        <Read k="GPS" v={`${d.lat}, ${d.lng}`} />
      </Group>
      <Group title="Status & environment">
        <Read k="Sensors" v={d.sensorStatus} />
        <Read k="Door" v={d.doorStatus} />
        <Read k="Weather" v={d.weatherImpact} />
        <Read k="Road" v={d.roadCondition} />
        <Read k="Health score" v={d.healthScore} />
        <Read k="Fault codes" v={d.faultCodes?.join(', ') || 'none'} />
      </Group>

      <div className="slider-block">
        <div className="ctl-label">Pin telemetry (drag to fault)</div>
        <Slider label="Pack temp" min={20} max={85} def={d.packTemp} onChange={(v) => slide('packTemp', v)} unit="°C" />
        <Slider label="Motor temp" min={40} max={150} def={d.motorTemp} onChange={(v) => slide('motorTemp', v)} unit="°C" />
        <Slider label="Battery voltage" min={260} max={410} def={d.batteryVoltage} onChange={(v) => slide('batteryVoltage', v)} unit="V" />
        <Slider label="Signal" min={0} max={100} def={d.signalStrength} onChange={(v) => slide('signalStrength', v)} unit="%" />
        <Slider label="Tyre psi" min={18} max={38} def={d.tyrePsi} onChange={(v) => slide('tyrePsi', v)} unit="psi" />
        <button className="btn-sim ghost small" onClick={() => { dev.clearOverrides(); flash('pins cleared'); }}>Clear pins</button>
      </div>

      <div className="fault-block">
        <div className="ctl-label">Failure injection</div>
        <select className="sim-input" defaultValue="" onChange={(e) => { if (e.target.value) { dev.fault(e.target.value); flash('device fault set'); } }}>
          <option value="">Set device fault (drift only)…</option>
          {FAULTS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
        </select>
        <div className="act-row">
          <button className="btn-sim danger" onClick={() => { dev.incident(); flash('AI council triggered'); }}>🤖 Trigger AI Council</button>
          <button className="btn-sim ok" onClick={() => { dev.recover(); flash('recovery sent'); }}>✓ Force recovery</button>
        </div>
      </div>

      {msg && <div className="flash">{msg}</div>}
    </div>
  );
}

const Stat = ({ label, value, col }) => (
  <div className="stat"><span className="sv" style={col ? { color: col } : {}}>{value}</span><span className="sl">{label}</span></div>
);
const Mini = ({ k, v, warn, bad }) => (
  <div className={`mini ${bad ? 'bad' : warn ? 'warn' : ''}`}><span className="mk">{k}</span><span className="mv">{v}</span></div>
);
const Group = ({ title, children }) => (
  <div className="rgroup"><div className="rgroup-h">{title}</div><div className="rgroup-body">{children}</div></div>
);
const Read = ({ k, v }) => (<div className="read"><span className="rk">{k}</span><span className="rv">{v}</span></div>);

function Slider({ label, min, max, def, onChange, unit }) {
  const [val, setVal] = useState(def ?? min);
  return (
    <div className="slider">
      <div className="slider-top"><span>{label}</span><span className="slider-val">{val}{unit}</span></div>
      <input type="range" min={min} max={max} value={val}
        onChange={(e) => { const v = +e.target.value; setVal(v); onChange(v); }} />
    </div>
  );
}
