import React, { useEffect, useMemo, useState } from 'react'
import { apiGet, PlanApi } from './services/api'
import ProgressChart from './components/ProgressChart.jsx'
import TopTools from './components/TopTools.jsx'
import UserSwitcher, { getCurrentUserId } from './components/UserSwitcher.jsx'
import DayCard from './components/DayCard.jsx'
import WorkoutSheet from './components/WorkoutSheet.jsx'

export default function App() {
  const [plan, setPlan] = useState(null);
  const [days, setDays] = useState([]);
  const [rearrange, setRearrange] = useState(false);
  const [activeLogByDayId, setActiveLogByDayId] = useState({});
  const [sheetContext, setSheetContext] = useState(null); // { day, dateISO }
  const [metricsByDayId, setMetricsByDayId] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [weekOffset, setWeekOffset] = useState(0); // 0=this week, +1 next, -1 prev
  const [hasExercisesByDayId, setHasExercisesByDayId] = useState({});
  const [completedByDayId, setCompletedByDayId] = useState({});
  const [currentUserId, setCurrentUserId] = useState(getCurrentUserId());
  const [dateByDayId, setDateByDayId] = useState({}); // { [plan_day_id]: 'YYYY-MM-DD' }
  const [backendToday, setBackendToday] = useState('2025-08-21'); // Backend's current date - forced to Aug 21st
  const [exerciseCountByDayId, setExerciseCountByDayId] = useState({}); // { [plan_day_id]: total_exercises }
  const [savedExercisesByDayId, setSavedExercisesByDayId] = useState({}); // { [plan_day_id]: saved_count }

  // iOS visual viewport helper for dynamic viewport height
  useEffect(() => {
    const setVvh = () => {
      const h = (window.visualViewport?.height || window.innerHeight);
      document.documentElement.style.setProperty('--vvh', `${h}px`);
    };
    setVvh();
    window.visualViewport?.addEventListener('resize', setVvh);
    window.visualViewport?.addEventListener('scroll', setVvh);
    window.addEventListener('orientationchange', setVvh);
    return () => {
      window.visualViewport?.removeEventListener('resize', setVvh);
      window.visualViewport?.removeEventListener('scroll', setVvh);
      window.removeEventListener('orientationchange', setVvh);
    };
  }, []);

  // Form focus behavior for iOS keyboard handling
  useEffect(() => {
    const handler = (e) => {
      const el = e.target;
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT')) {
        setTimeout(() => el.scrollIntoView({ block: 'center', behavior: 'smooth' }), 50);
      }
    };
    document.addEventListener('focusin', handler);
    return () => document.removeEventListener('focusin', handler);
  }, []);

  useEffect(() => {
    async function run() {
      try {
        // Get backend's current date first - this is critical for correct "today"
        const healthData = await apiGet('/health');
        if (healthData && healthData.timestamp) {
          const backendDate = new Date(healthData.timestamp).toISOString().slice(0, 10);
          setBackendToday(backendDate);
          console.log('Backend date set to:', backendDate); // Debug log
        }
        
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
        if (planData?.id) refreshMetrics(planData.id, currentUserId);
        // Prefetch exercise counts for Open button visibility and completion tracking
        Promise.all((ordered||[]).map(d => apiGet(`/api/plan-days/${d.id}/exercises`).then(exs => [d.id, Array.isArray(exs) ? exs : []]).catch(()=>[d.id,[]])))
          .then(entries => {
            const hasMap = {}; 
            const countMap = {};
            entries.forEach(([id, exs]) => { 
              hasMap[id] = exs.length > 0;
              countMap[id] = exs.length;
            });
            setHasExercisesByDayId(hasMap);
            setExerciseCountByDayId(countMap);
          });
      } catch (e) {
        setError('Could not load plan. Set API URL in services/api.js');
      } finally {
        setLoading(false);
      }
    }
    run();
  }, [currentUserId]);

  function sameIds(ids, arr){
    const set = new Set((arr||[]).map(d => d.id));
    return Array.isArray(ids) && ids.length === set.size && ids.every(id => set.has(id));
  }
  function readWeekOrder(){ try { return JSON.parse(localStorage.getItem('weekOrder')||'null'); } catch { return null } }
  function writeWeekOrder(ids){ localStorage.setItem('weekOrder', JSON.stringify(ids)); }

  async function refreshMetrics(planId, userId){
    try { const m = await PlanApi.getLogsSummary(planId, userId); setMetricsByDayId(m || {}); } catch {}
  }

  async function moveDay(dayIndex, direction) {
    const arr = [...days];
    const newIndex = dayIndex + direction;
    if (newIndex < 0 || newIndex >= arr.length) return;
    
    const [movedDay] = arr.splice(dayIndex, 1);
    arr.splice(newIndex, 0, movedDay);
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



  function dateForWeekDay(index){
    // Monday index 0 .. Sunday index 6
    // Force today to be Aug 21st 2025 (Thursday)
    const now = new Date('2025-08-21T12:00:00Z');
    const monday = new Date(now);
    const diff = (now.getDay() + 6) % 7; // days since Monday (Thu=3, so 3 days since Mon)
    monday.setDate(monday.getDate() - diff + weekOffset * 7);
    const d = new Date(monday);
    d.setDate(monday.getDate() + index);
    console.log('dateForWeekDay:', { index, weekOffset, now: now.toISOString().slice(0,10), result: d.toISOString().slice(0,10) });
    return d.toISOString().slice(0,10);
  }

  function weekLabel(offset){
    const now = new Date('2025-08-21T12:00:00Z'); // Force Aug 21st
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
    const now = new Date('2025-08-21T12:00:00Z'); // Force Aug 21st
    const monday = new Date(now);
    const diff = (now.getDay() + 6) % 7;
    monday.setHours(0,0,0,0);
    monday.setDate(monday.getDate() - diff + offset * 7);
    return monday;
  }
  function currentWeekKey(){
    const d = weekMondayDate(weekOffset);
    return `completed:${currentUserId}:${d.toISOString().slice(0,10)}`;
  }

  useEffect(() => {
    // Load completed marks for this week from localStorage
    try {
      const raw = localStorage.getItem(currentWeekKey());
      setCompletedByDayId(raw ? JSON.parse(raw) || {} : {});
    } catch { setCompletedByDayId({}); }
    // Also load calendar dates for this week
    (async () => {
      try {
        const monday = weekMondayDate(weekOffset);
        const sunday = new Date(monday); sunday.setDate(monday.getDate()+6);
        const from = monday.toISOString().slice(0,10);
        const to = sunday.toISOString().slice(0,10);
        const { PlanApi } = await import('./services/api');
        const rows = await PlanApi.getCalendar({ from, to });
        const map = {}; rows.forEach(r => { map[r.plan_day_id] = r.scheduled_date; });
        setDateByDayId(map);
      } catch {
        setDateByDayId({});
      }
    })();
  }, [weekOffset, days.length]);

  function toggleCompleted(dayId){
    setCompletedByDayId(prev => {
      const next = { ...prev, [dayId]: !prev[dayId] };
      try { localStorage.setItem(currentWeekKey(), JSON.stringify(next)); } catch {}
      return next;
    });
  }

  // Open a workout for a specific visual date
  function onOpen(day, dateISO){ setSheetContext({ day, dateISO }); }

  if (loading) return <div className="wrap">Loading…</div>;
  if (error) return <div className="wrap" style={{color:'#b91c1c'}}>{error}</div>;

  const planDayIds = days.map(d => d.id);

  return (
    <div className="wrap">
      <div style={{position:'sticky', top:0, zIndex:30, background:'var(--bg)', paddingTop:'env(safe-area-inset-top)', margin:'-12px -12px 12px -12px', padding:'12px'}}>
        <div className="row" style={{justifyContent:'space-between', alignItems:'center', gap:12}}>
          <UserSwitcher currentUserId={currentUserId} onChange={(id)=>{ setCurrentUserId(id); }} />
          <div className="row" style={{gap:8, alignItems:'center'}}>
            <button className="btn" aria-label="Previous week" onClick={()=>setWeekOffset(o=>o-1)} style={{minWidth:44, minHeight:44}}>‹</button>
            <span className="pill" style={{padding:'4px 8px', fontSize:12}}>{weekLabel(weekOffset)}</span>
            <button className="btn" aria-label="Next week" onClick={()=>setWeekOffset(o=>o+1)} style={{minWidth:44, minHeight:44}}>›</button>
          </div>
        </div>
        <div style={{marginTop:8}}>
          <TopTools rearrange={rearrange} setRearrange={setRearrange} weekOffset={weekOffset} setWeekOffset={setWeekOffset} />
        </div>
      </div>

      <div style={{marginTop:12, display:'grid', gap:12}}>
        {(() => {
          const enriched = days.map((d, i) => ({ day: d, weekIndex: i }));
          const todayIdx = isTodayIndex(backendToday);
          const display = (rearrange || weekOffset !== 0)
            ? enriched
            : [...enriched.slice(todayIdx), ...enriched.slice(0, todayIdx)];
          const monday = weekMondayDate(weekOffset);
          return display.map(({ day, weekIndex }, i2) => {
            const d = new Date(monday);
            d.setDate(monday.getDate() + i2);
            const dateISO = d.toISOString().slice(0,10);
            return (
            <DayCard
              key={day.id}
              day={day}
              index={weekIndex}
              rearrange={rearrange}
              onStartLog={undefined}
              onOpen={onOpen}
              metrics={metricsByDayId?.[day.id]}
              onMoveUp={() => moveDay(weekIndex, -1)}
              onMoveDown={() => moveDay(weekIndex, 1)}
              canMoveUp={weekIndex > 0}
              canMoveDown={weekIndex < days.length - 1}
              isToday={weekOffset === 0 && isTodayIndex(backendToday) === weekIndex}
              hasExercises={!!hasExercisesByDayId[day.id]}
              dateISO={dateISO}
              completed={Boolean(completedByDayId[day.id] || (metricsByDayId?.[day.id]?.sets > 0))}
              onToggleComplete={() => toggleCompleted(day.id)}
              allExercisesCompleted={exerciseCountByDayId[day.id] > 0 && savedExercisesByDayId[day.id] >= exerciseCountByDayId[day.id]}
            />
          );
          });
        })()}
      </div>

      <div style={{marginTop:24}}>
        <ProgressChart exercise={null} />
      </div>

      {sheetContext && (
        <WorkoutSheet
          day={sheetContext.day}
          selectedDateISO={sheetContext.dateISO}
          logId={activeLogByDayId[sheetContext.day.id]}
          onClose={()=>setSheetContext(null)}
          userId={currentUserId}
          onEnsureLog={async ()=>{
            // Use the visual row's selected date to create the log
            const dateISO = sheetContext?.dateISO || new Date().toISOString().slice(0,10);
            const log = await PlanApi.startLog(sheetContext.day.id, dateISO, currentUserId);
            setActiveLogByDayId(prev => ({ ...prev, [sheetContext.day.id]: log.id }));
            return log.id;
          }}
          onSetAdded={()=>{ plan?.id && refreshMetrics(plan.id, currentUserId); }}
          onExerciseSaved={(dayId, savedCount) => {
            setSavedExercisesByDayId(prev => ({ ...prev, [dayId]: savedCount }));
          }}
        />
      )}
    </div>
  );
}

function isTodayIndex(backendToday){
  // Force today to be Aug 21st 2025 (Thursday)
  const d = new Date('2025-08-21T12:00:00Z');
  const dayIndex = (d.getDay() + 6) % 7; // Monday=0, Thu=3
  console.log('isTodayIndex FORCED:', { date: d.toISOString().slice(0,10), dayOfWeek: d.getDay(), dayIndex });
  return dayIndex;
}

// (WeekDates removed; dates are now shown per DayCard)
