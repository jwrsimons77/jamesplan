import React, { useEffect, useMemo, useState } from 'react'
import { apiGet, PlanApi } from './services/api'
import ProgressChart from './components/ProgressChart.jsx'
import TopTools from './components/TopTools.jsx'
import DayCard from './components/DayCard.jsx'
import WorkoutSheet from './components/WorkoutSheet.jsx'

export default function App() {
  const [plan, setPlan] = useState(null);
  const [days, setDays] = useState([]);
  const [rearrange, setRearrange] = useState(false);
  const [activeLogByDayId, setActiveLogByDayId] = useState({});
  const [sheetForDay, setSheetForDay] = useState(null);
  const [metricsByDayId, setMetricsByDayId] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [weekOffset, setWeekOffset] = useState(0); // 0=this week, +1 next, -1 prev
  const [hasExercisesByDayId, setHasExercisesByDayId] = useState({});
  const [completedByDayId, setCompletedByDayId] = useState({});

  useEffect(() => {
    async function run() {
      try {
        const data = await apiGet('/api/plan');
        const planData = data.plan;
        let ordered = data.days || [];
        const local = readWeekOrder();
        if (local && sameIds(local, ordered)) {
          const map = new Map(ordered.map(d => [d.id, d]));
          ordered = local.map(id => map.get(id)).filter(Boolean);
        }
        setPlan(planData);
        setDays(ordered);
        if (planData?.id) refreshMetrics(planData.id);
        // Prefetch exercise counts for Open button visibility
        Promise.all((ordered||[]).map(d => apiGet(`/api/plan-days/${d.id}/exercises`).then(exs => [d.id, Array.isArray(exs) && exs.length>0]).catch(()=>[d.id,false])))
          .then(entries => {
            const map = {}; entries.forEach(([id, has]) => { map[id] = !!has; });
            setHasExercisesByDayId(map);
          });
      } catch (e) {
        setError('Could not load plan. Set API URL in services/api.js');
      } finally {
        setLoading(false);
      }
    }
    run();
  }, []);

  function sameIds(ids, arr){
    const set = new Set((arr||[]).map(d => d.id));
    return Array.isArray(ids) && ids.length === set.size && ids.every(id => set.has(id));
  }
  function readWeekOrder(){ try { return JSON.parse(localStorage.getItem('weekOrder')||'null'); } catch { return null } }
  function writeWeekOrder(ids){ localStorage.setItem('weekOrder', JSON.stringify(ids)); }

  async function refreshMetrics(planId){
    try { const m = await PlanApi.getLogsSummary(planId); setMetricsByDayId(m || {}); } catch {}
  }

  async function onDropReorder(e, toIndex){
    e.preventDefault();
    const fromIndex = Number(e.dataTransfer.getData('text/plain'));
    if (Number.isNaN(fromIndex)) return;
    const arr = [...days];
    const [m] = arr.splice(fromIndex, 1);
    arr.splice(toIndex, 0, m);
    const ids = arr.map(d => d.id);
    try {
      const resp = await PlanApi.putOrder(ids);
      const map = new Map((resp?.days||arr).map(d => [d.id, d]));
      setDays(ids.map(id => map.get(id)).filter(Boolean));
      localStorage.removeItem('weekOrder');
    } catch {
      setDays(arr);
      writeWeekOrder(ids);
    }
  }

  function dragProps(i){
    return {
      containerProps: rearrange ? {
        draggable: true,
        onDragStart: (e) => e.dataTransfer.setData('text/plain', String(i)),
        onDragOver: (e) => e.preventDefault(),
        onDrop: (e) => onDropReorder(e, i),
        style: { cursor:'grab' }
      } : {},
      handleProps: { draggable: true, onDragStart: (e) => e.dataTransfer.setData('text/plain', String(i)) }
    }
  }

  function dateForWeekDay(index){
    // Monday index 0 .. Sunday index 6
    const now = new Date();
    const monday = new Date(now);
    const diff = (now.getDay() + 6) % 7; // days since Monday
    monday.setDate(monday.getDate() - diff + weekOffset * 7);
    const d = new Date(monday);
    d.setDate(monday.getDate() + index);
    return d.toISOString().slice(0,10);
  }

  function weekLabel(offset){
    const now = new Date();
    const monday = new Date(now);
    const diff = (now.getDay() + 6) % 7;
    monday.setDate(monday.getDate() - diff + offset * 7);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    if (offset === 0) return 'This week';
    const fmt = (d) => d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    return `${fmt(monday)}–${fmt(sunday)}`;
  }

  function weekMondayDate(offset){
    const now = new Date();
    const monday = new Date(now);
    const diff = (now.getDay() + 6) % 7;
    monday.setHours(0,0,0,0);
    monday.setDate(monday.getDate() - diff + offset * 7);
    return monday;
  }
  function currentWeekKey(){
    const d = weekMondayDate(weekOffset);
    return 'completed:' + d.toISOString().slice(0,10);
  }

  useEffect(() => {
    // Load completed marks for this week from localStorage
    try {
      const raw = localStorage.getItem(currentWeekKey());
      setCompletedByDayId(raw ? JSON.parse(raw) || {} : {});
    } catch { setCompletedByDayId({}); }
  }, [weekOffset, days.length]);

  function toggleCompleted(dayId){
    setCompletedByDayId(prev => {
      const next = { ...prev, [dayId]: !prev[dayId] };
      try { localStorage.setItem(currentWeekKey(), JSON.stringify(next)); } catch {}
      return next;
    });
  }

  // Start log button removed; logs will be ensured inside WorkoutSheet when saving first set
  function onOpen(day){ setSheetForDay(day); }

  if (loading) return <div className="wrap">Loading…</div>;
  if (error) return <div className="wrap" style={{color:'#b91c1c'}}>{error}</div>;

  const planDayIds = days.map(d => d.id);

  return (
    <div className="wrap">
      <div className="row" style={{justifyContent:'space-between', alignItems:'flex-start', gap:12, margin:'12px 0'}}>
        <div>
          <div style={{fontWeight:800, letterSpacing:'0.02em'}}>J Faye 247</div>
          <div className="muted" style={{fontStyle:'italic', fontSize:12, marginTop:2}}>Your Body Is an Instrument, Not an Ornament.</div>
        </div>
        <div className="row" style={{gap:8, alignItems:'center'}}>
          <button className="btn" aria-label="Previous week" onClick={()=>setWeekOffset(o=>o-1)} style={{minWidth:44, minHeight:32}}>‹</button>
          <span className="pill" style={{padding:'4px 8px', fontSize:12}}>{weekLabel(weekOffset)}</span>
          <button className="btn" aria-label="Next week" onClick={()=>setWeekOffset(o=>o+1)} style={{minWidth:44, minHeight:32}}>›</button>
          {weekOffset !== 0 && (
            <button className="btn" aria-label="Go to today" onClick={()=>setWeekOffset(0)} style={{minHeight:32}}>Today</button>
          )}
        </div>
      </div>

      <TopTools rearrange={rearrange} setRearrange={setRearrange} />

      <div style={{marginTop:12, display:'grid', gap:12}}>
        {(() => {
          const enriched = days.map((d, i) => ({ day: d, weekIndex: i }));
          const todayIdx = isTodayIndex();
          const display = (rearrange || weekOffset !== 0)
            ? enriched
            : [...enriched.slice(todayIdx), ...enriched.slice(0, todayIdx)];
          return display.map(({ day, weekIndex }) => (
            <DayCard
              key={day.id}
              day={day}
              index={weekIndex}
              rearrange={rearrange}
              onStartLog={undefined}
              onOpen={onOpen}
              metrics={metricsByDayId?.[day.id]}
              draggableProps={dragProps(weekIndex)}
              isToday={weekOffset === 0 && isTodayIndex() === weekIndex}
              hasExercises={!!hasExercisesByDayId[day.id]}
              completed={Boolean(completedByDayId[day.id] || (metricsByDayId?.[day.id]?.sets > 0))}
              onToggleComplete={() => toggleCompleted(day.id)}
            />
          ));
        })()}
      </div>

      <div style={{marginTop:24}}>
        <ProgressChart exercise={null} />
      </div>

      {sheetForDay && (
        <WorkoutSheet
          day={sheetForDay}
          logId={activeLogByDayId[sheetForDay.id]}
          onClose={()=>setSheetForDay(null)}
          onEnsureLog={async ()=>{
            // Use the selected week and the index of the open day
            const i = days.findIndex(d => d.id === sheetForDay.id);
            const dateISO = dateForWeekDay(Math.max(0, i));
            const log = await PlanApi.startLog(sheetForDay.id, dateISO);
            setActiveLogByDayId(prev => ({ ...prev, [sheetForDay.id]: log.id }));
            return log.id;
          }}
          onSetAdded={()=>{ plan?.id && refreshMetrics(plan.id); }}
        />
      )}
    </div>
  );
}

function isTodayIndex(){
  const d = new Date();
  return (d.getDay() + 6) % 7; // Monday=0
}
